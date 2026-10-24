import { Router } from "express";
import { and, eq, inArray } from "drizzle-orm";
import { collectionAllocations, collections, customerEntries, deliveries, deliveryLines, invoiceDeliveries, invoiceLines, postingKeys, salesInvoices } from "../../database/schema.js";
import type { Transaction } from "../../database/client.js";
import { audit, identity, type Context } from "../foundation/context.js";
import { assertAllowed, HttpError } from "../foundation/errors.js";
import { hasEffectivePermission } from "../../src/lib/permissions/effectiveAccess.js";
import { businessDate } from "../../src/lib/date.js";
import { lockActor, newId, nextNumber, postingIdentity } from "../operations/common.js";
import { invoiceInput, invoiceUpdate, reversalInput, salesTotals } from "./contracts.js";
import { checkPostingDate, lockOrder, lockPosting } from "./locks.js";
import { checkVersion } from "./records.js";
import { readInvoices } from "./posting-records.js";
import { D } from "./money.js";
import type { User } from "../../src/types/index.js";

async function lockInvoice(tx: Transaction, id: string, user: User) {
  const [reference] = await tx.select({ orderId: salesInvoices.orderId }).from(salesInvoices).where(eq(salesInvoices.id, id));
  if (!reference) throw new HttpError(404, "Invoice not found.");
  const { order, customer } = await lockOrder(tx, reference.orderId, user);
  const [invoice] = await tx.select().from(salesInvoices).where(eq(salesInvoices.id, id)).for("update");
  if (!invoice) throw new HttpError(404, "Invoice not found.");
  return { invoice, order, customer };
}

export function createInvoiceRouter(ctx: Context) {
  const router = Router();
  router.get("/invoices", async (_req, res) => {
    const user = identity(res).user; assertAllowed(user.role !== "Warehouse Manager" && hasEffectivePermission(user, "sales", "view"));
    res.json({ success: true, data: await ctx.db.transaction((tx) => readInvoices(tx, user)), message: "Invoices loaded" });
  });
  router.post("/invoices", async (req, res) => {
    const actor = identity(res); const input = invoiceInput.parse(req.body); const key = postingIdentity(req, `${actor.user.id}:invoice-create`, input);
    const id = await ctx.db.transaction(async (tx) => {
      const user = await lockActor(tx, actor, "sales", "create"); assertAllowed(user.role !== "Warehouse Manager");
      const previous = await lockPosting(tx, key); if (previous) return previous;
      const source = await tx.select().from(deliveries).where(inArray(deliveries.id, input.deliveryIds));
      if (source.length !== input.deliveryIds.length) throw new HttpError(404, "One or more challans were not found.");
      const { order } = await lockOrder(tx, source[0].orderId, user);
      if (order.status === "Cancelled" || (input.orderId && input.orderId !== order.id) || source.some((row) => row.orderId !== order.id || row.customerId !== order.customerId)) throw new HttpError(422, "An invoice must contain challans from one active order/customer.");
      checkPostingDate(input.date, source.map((row) => row.date).sort().at(-1));
      const existing = await tx.select().from(invoiceDeliveries).where(and(inArray(invoiceDeliveries.deliveryId, input.deliveryIds), eq(invoiceDeliveries.active, true)));
      if (existing.length) throw new HttpError(409, "A selected challan already belongs to an active invoice.");
      const lines = await tx.select().from(deliveryLines).where(inArray(deliveryLines.deliveryId, input.deliveryIds)).orderBy(deliveryLines.deliveryId, deliveryLines.position);
      const totals = salesTotals(lines); const id = newId("invoice"); const number = await nextNumber(tx, "INV", input.date);
      await tx.insert(salesInvoices).values({ id, invoiceNumber: number, orderId: order.id, customerId: order.customerId, ownerId: order.ownerId, snapshot: order.snapshot, date: input.date, remarks: input.remarks, ...totals, createdBy: user.id });
      await tx.insert(invoiceDeliveries).values(input.deliveryIds.map((deliveryId) => ({ invoiceId: id, deliveryId })));
      await tx.insert(invoiceLines).values(lines.map((line, position) => ({ id: newId("invoice-line"), position, invoiceId: id, deliveryLineId: line.id, productId: line.productId, productCode: line.productCode, productName: line.productName, quantity: line.quantity, unitPrice: line.unitPrice, discount: line.discount, lineTotal: line.lineTotal })));
      await tx.insert(postingKeys).values({ ...key, resourceId: id }); await audit(tx, user.id, "Invoice drafted", "SalesInvoice", id, { invoiceNumber: number, orderId: order.id }); return id;
    });
    res.status(201).json({ success: true, data: (await ctx.db.transaction((tx) => readInvoices(tx, actor.user, { id })))[0], message: "Draft invoice created from saved delivery values" });
  });
  router.patch("/invoices/:id", async (req, res) => {
    const input = invoiceUpdate.parse(req.body); const actor = identity(res); const id = String(req.params.id);
    await ctx.db.transaction(async (tx) => {
      const user = await lockActor(tx, actor, "sales", "edit"); assertAllowed(user.role !== "Warehouse Manager");
      const { invoice } = await lockInvoice(tx, id, user); checkVersion(invoice.version, input.version);
      if (invoice.status !== "Draft") throw new HttpError(423, "Only draft invoice details can be edited.");
      if (input.date) {
        const source = await tx.select({ date: deliveries.date }).from(invoiceDeliveries).innerJoin(deliveries, eq(invoiceDeliveries.deliveryId, deliveries.id)).where(eq(invoiceDeliveries.invoiceId, id));
        checkPostingDate(input.date, source.map((row) => row.date).sort().at(-1));
      }
      await tx.update(salesInvoices).set({ date: input.date ?? invoice.date, remarks: input.remarks ?? invoice.remarks, version: invoice.version + 1 }).where(eq(salesInvoices.id, id));
      await audit(tx, user.id, "Invoice draft updated", "SalesInvoice", id);
    });
    res.json({ success: true, data: (await ctx.db.transaction((tx) => readInvoices(tx, actor.user, { id })))[0], message: "Draft updated" });
  });
  for (const action of ["approve", "cancel"] as const) {
    router.post(`/invoices/:id/${action}`, async (req, res) => {
      const actor = identity(res); const id = String(req.params.id); const input = action === "cancel" ? reversalInput.parse(req.body) : {};
      const key = postingIdentity(req, `${actor.user.id}:invoice-${action}:${id}`, input);
      await ctx.db.transaction(async (tx) => {
        const user = await lockActor(tx, actor, "sales", "approve"); assertAllowed(user.role !== "Warehouse Manager");
        const previous = await lockPosting(tx, key); if (previous) return;
        const { invoice, order } = await lockInvoice(tx, id, user);
        if (action === "approve") {
          if (invoice.status !== "Draft") throw new HttpError(409, "Only a draft invoice can be approved.");
          if (order.status === "Cancelled") throw new HttpError(409, "A cancelled order cannot be invoiced.");
          if (new D(invoice.total).gt(0)) await tx.insert(customerEntries).values({ id: newId("customer-entry"), customerId: invoice.customerId, orderId: invoice.orderId, invoiceId: id, date: invoice.date, type: "Invoice", sourceId: id, reference: invoice.invoiceNumber, debit: invoice.total, credit: "0", remarks: invoice.remarks, createdBy: user.id });
          await tx.update(salesInvoices).set({ status: "Approved", approvedBy: user.id, approvedAt: new Date(), version: invoice.version + 1 }).where(eq(salesInvoices.id, id));
        } else {
          if (invoice.status === "Cancelled") throw new HttpError(409, "Invoice is already cancelled.");
          const allocated = await tx.select({ id: collectionAllocations.id }).from(collectionAllocations).innerJoin(collections, eq(collectionAllocations.collectionId, collections.id)).innerJoin(customerEntries, eq(collectionAllocations.receivableEntryId, customerEntries.id)).where(and(eq(customerEntries.invoiceId, id), eq(collections.status, "Posted")));
          if (allocated.length) throw new HttpError(409, "Reverse the allocated collections before cancelling this invoice.");
          if (invoice.status === "Approved" && new D(invoice.total).gt(0)) await tx.insert(customerEntries).values({ id: newId("customer-entry"), customerId: invoice.customerId, orderId: invoice.orderId, invoiceId: id, date: businessDate(), type: "Reversal", sourceId: id, reference: invoice.invoiceNumber, debit: "0", credit: invoice.total, remarks: (input as { reason: string }).reason, createdBy: user.id });
          await tx.update(salesInvoices).set({ status: "Cancelled", cancelledBy: user.id, cancelledAt: new Date(), cancellationReason: (input as { reason: string }).reason, version: invoice.version + 1 }).where(eq(salesInvoices.id, id));
          await tx.update(invoiceDeliveries).set({ active: false }).where(eq(invoiceDeliveries.invoiceId, id));
        }
        await tx.insert(postingKeys).values({ ...key, resourceId: id });
        await audit(tx, user.id, action === "approve" ? "Invoice approved" : "Invoice cancelled", "SalesInvoice", id, { invoiceNumber: invoice.invoiceNumber, ...(action === "cancel" ? input : {}) });
      });
      res.json({ success: true, data: (await ctx.db.transaction((tx) => readInvoices(tx, actor.user, { id })))[0], message: action === "approve" ? "Invoice approved; receivable posted once" : "Invoice cancelled with a current-date reversal" });
    });
  }
  return router;
}
