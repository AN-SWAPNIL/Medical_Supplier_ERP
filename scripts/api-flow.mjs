import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const externalBase = process.env.API_TEST_BASE_URL;
const testPort = 4300 + (process.pid % 500);
const base = externalBase || "http://127.0.0.1:" + testPort;
const identities = {
  super: { id: "u-super", role: "Super Admin" },
  import: { id: "u-import", role: "Import Officer" },
  warehouse: { id: "u-warehouse", role: "Warehouse Manager" },
  accounts: { id: "u-accounts", role: "Accounts" },
  salesManager: { id: "u-sales-manager", role: "Sales Manager" },
  sales1: { id: "sales1", role: "Sales Executive" },
  sales2: { id: "sales2", role: "Sales Executive" }
};

let server;
let serverOutput = "";

function rememberOutput(chunk) {
  serverOutput = (serverOutput + chunk.toString()).slice(-12_000);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server && server.exitCode !== null) throw new Error("Mock API exited before startup.\n" + serverOutput);
    try {
      const response = await fetch(base + "/api/health");
      if (response.ok) return;
    } catch {
      // The child process is still starting.
    }
    await new Promise((done) => setTimeout(done, 100));
  }
  throw new Error("Mock API did not start at " + base + ".\n" + serverOutput);
}

async function api(path, options = {}) {
  const method = options.method || "GET";
  const as = options.as || identities.super;
  const expected = options.expected || 200;
  const response = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", "x-user-id": as.id, "x-role": as.role },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const payload = await response.json();
  assert.equal(response.status, expected, method + " " + path + " returned " + response.status + ": " + payload.message);
  return payload.data;
}

async function rawApi(path, options = {}) {
  const method = options.method || "GET";
  const as = options.as || identities.super;
  const response = await fetch(base + path, {
    method,
    redirect: options.redirect || "manual",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://127.0.0.1:5173",
      "x-user-id": as.id,
      "x-role": as.role
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  assert.equal(response.status, options.expected || 200, method + " " + path + " returned " + response.status);
  return response;
}

function metric(report, group, label) {
  return report[group].find((entry) => entry.label === label)?.value;
}

function table(report, group, id) {
  return report.tables[group].find((entry) => entry.id === id);
}

function businessDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return values.year + "-" + values.month + "-" + values.day;
}

async function run() {
  const today = businessDate();
  const monthStart = today.slice(0, 7) + "-01";
  const suffix = String(Date.now()).slice(-7);

  console.log("1. PO-first import, authoritative status and server-derived item bases");
  const importRecord = await api("/api/imports", {
    method: "POST",
    expected: 201,
    as: identities.import,
    body: {
      supplierId: "sup-renhe",
      poNumber: "PO-FLOW-" + suffix,
      poDate: today,
      notes: "Created before PI and LC for the integrity flow.",
      items: [
        { id: "flow-item-a-" + suffix, productId: "prd-d17h", quantity: "100", currency: "USD", fobUnitForeign: "0", exchangeRate: "0", fobTotalBdt: "999999.99", cbmPerCarton: "0", cartonCount: "0", totalCbm: "9999" },
        { id: "flow-item-b-" + suffix, productId: "prd-bts", quantity: "200", currency: "USD", fobUnitForeign: "0", exchangeRate: "0", fobTotalBdt: "999999.99", cbmPerCarton: "0", cartonCount: "0", totalCbm: "9999" }
      ]
    }
  });
  assert.equal(importRecord.status, "Draft");
  assert.match(importRecord.primaryReference, /^IMP-2026-/);
  assert.equal(importRecord.paymentMode, "Pending");
  assert.equal(importRecord.items[0].fobTotalBdt, "0.00");
  assert.equal(importRecord.items[0].totalCbm, "0.0000");

  await api("/api/imports/" + importRecord.id, { method: "PATCH", as: identities.import, expected: 422, body: { status: "Received" } });
  const protectedReference = await api("/api/imports/" + importRecord.id, { method: "PATCH", as: identities.import, body: { primaryReference: "FAKE-LC" } });
  assert.notEqual(protectedReference.primaryReference, "FAKE-LC");
  const cancellableDraft = await api("/api/imports", {
    method: "POST",
    expected: 201,
    as: identities.import,
    body: { supplierId: "sup-renhe", poNumber: "PO-CANCEL-" + suffix, poDate: today, items: [{ productId: "prd-d17h", quantity: "1", fobUnitForeign: "0", exchangeRate: "0", cbmPerCarton: "0", cartonCount: "0" }] }
  });
  const cancelledDraft = await api("/api/imports/" + cancellableDraft.id + "/transition", { method: "POST", as: identities.import, body: { status: "Cancelled" } });
  assert.equal(cancelledDraft.status, "Cancelled");
  await api("/api/imports/" + cancellableDraft.id, { method: "PATCH", as: identities.import, expected: 423, body: { notes: "Cancelled cases are locked." } });
  await api("/api/imports/" + cancellableDraft.id, { method: "DELETE", as: identities.import });

  const withPi = await api("/api/imports/" + importRecord.id, {
    method: "PATCH",
    as: identities.import,
    body: { piNumber: "PI-FLOW-" + suffix, piDate: today }
  });
  assert.equal(withPi.status, "PI Received");
  assert.match(withPi.primaryReference, /^IMP-2026-/);

  const lcReference = "LC-FLOW-" + suffix;
  const withLc = await api("/api/imports/" + importRecord.id, {
    method: "PATCH",
    as: identities.import,
    body: {
      paymentMode: "LC",
      lcNumber: lcReference,
      lcAmount: "540.00",
      lcOpenDate: today,
      lcExpiryDate: "2027-02-28",
      bank: "City Bank PLC",
      currency: "USD",
      exchangeRate: "122.50",
      rateDate: today,
      rateSource: "Test bank snapshot",
      productionFollowUp: "Supplier confirmed production slot.",
      commercialInvoiceNumber: "CI-" + suffix,
      blNumber: "BL-" + suffix,
      containerNumber: "CONT-" + suffix,
      containerType: "20 GP",
      vessel: "MV Integrity",
      etd: today,
      eta: "2026-09-20"
    }
  });
  assert.equal(withLc.status, "LC/TT Opened");
  assert.equal(withLc.primaryReference, lcReference);
  const duplicateLcDraft = await api("/api/imports", {
    method: "POST",
    expected: 201,
    as: identities.import,
    body: { supplierId: "sup-renhe", poNumber: "PO-DUPLC-" + suffix, poDate: today, items: [{ productId: "prd-d17h", quantity: "1", fobUnitForeign: "0", exchangeRate: "0", cbmPerCarton: "0", cartonCount: "0" }] }
  });
  await api("/api/imports/" + duplicateLcDraft.id, { method: "PATCH", as: identities.import, expected: 409, body: { paymentMode: "LC", lcNumber: lcReference } });
  await api("/api/imports/" + duplicateLcDraft.id, { method: "DELETE", as: identities.import });
  assert.equal((await api("/api/imports/" + importRecord.id + "/transition", { method: "POST", as: identities.import, body: { status: "In Production" } })).status, "In Production");
  assert.equal((await api("/api/imports/" + importRecord.id + "/transition", { method: "POST", as: identities.import, body: { status: "Shipped" } })).status, "Shipped");
  await api("/api/imports/" + importRecord.id + "/transition", { method: "POST", as: identities.import, expected: 409, body: { status: "Closed" } });

  await api("/api/imports/" + importRecord.id + "/items/" + importRecord.items[0].id, {
    method: "PATCH",
    as: identities.import,
    expected: 422,
    body: { quantity: "100", fobUnitForeign: "3.20", exchangeRate: "0", cbmPerCarton: "0.08", cartonCount: "2", cbmMode: "CALCULATED" }
  });
  const itemARecord = await api("/api/imports/" + importRecord.id + "/items/" + importRecord.items[0].id, {
    method: "PATCH",
    as: identities.import,
    body: { quantity: "100", fobUnitForeign: "3.20", exchangeRate: "122.50", fobTotalBdt: "1", cbmPerCarton: "0.08", cartonCount: "2", totalCbm: "8", cbmMode: "CALCULATED" }
  });
  const itemBRecord = await api("/api/imports/" + importRecord.id + "/items/" + importRecord.items[1].id, {
    method: "PATCH",
    as: identities.import,
    body: { quantity: "200", fobUnitForeign: "1.10", exchangeRate: "122.50", fobTotalBdt: "1", cbmPerCarton: "0.10", cartonCount: "4", totalCbm: "8", cbmMode: "CALCULATED" }
  });
  assert.equal(itemARecord.items.find((item) => item.id === importRecord.items[0].id).fobTotalBdt, "0.00");
  assert.equal(itemBRecord.items.find((item) => item.id === importRecord.items[1].id).fobTotalBdt, "0.00");
  const authoritativeItems = (await api("/api/imports/" + importRecord.id)).items;
  const itemA = authoritativeItems.find((item) => item.id === importRecord.items[0].id);
  const itemB = authoritativeItems.find((item) => item.id === importRecord.items[1].id);
  assert.equal(itemA.fobTotalBdt, "39200.00");
  assert.equal(itemA.totalCbm, "0.1600");
  assert.equal(itemB.fobTotalBdt, "26950.00");
  assert.equal(itemB.totalCbm, "0.4000");
  const uploadedInvoice = await api("/api/imports/" + importRecord.id + "/documents", {
    method: "POST",
    as: identities.import,
    expected: 201,
    body: {
      type: "Commercial Invoice",
      sensitive: false,
      upload: {
        fileName: "Commercial-Invoice-" + suffix + ".pdf",
        mimeType: "application/pdf",
        sizeBytes: 15,
        fileDataUrl: "data:application/pdf;base64,JVBERi0xLjQKJSVFT0YK"
      }
    }
  });
  const uploadedInvoiceFile = await rawApi("/api/documents/" + uploadedInvoice.id + "/content", { as: identities.import, expected: 200 });
  assert.match(uploadedInvoiceFile.headers.get("content-type") || "", /application\/pdf/);
  assert.equal((await uploadedInvoiceFile.arrayBuffer()).byteLength, 15);
  await api("/api/imports/" + importRecord.id + "/documents", {
    method: "POST",
    as: identities.import,
    expected: 422,
    body: { type: "Other", upload: { fileName: "spoofed.svg", mimeType: "image/svg+xml", sizeBytes: 1, fileDataUrl: "data:image/svg+xml;base64,PHN2Zy8+" } }
  });

  console.log("2. Five allocations, immutable snapshots and receipt integrity");
  const costs = [
    { name: "Sea Freight", category: "Freight", amountForeign: "560.00", currency: "BDT", exchangeRate: "1", allocationMethod: "CBM", appliesToItemIds: [] },
    { name: "Common Bank Cost", category: "Bank Charge", amountForeign: "400.00", currency: "BDT", exchangeRate: "1", allocationMethod: "FOB_VALUE", appliesToItemIds: [] },
    { name: "Unloading Labour", category: "Labour", amountForeign: "300.00", currency: "BDT", exchangeRate: "1", allocationMethod: "QUANTITY", appliesToItemIds: [] },
    { name: "Assessed Duty A", category: "Customs Duty", amountForeign: "500.00", currency: "BDT", exchangeRate: "1", allocationMethod: "PRODUCT_SPECIFIC", appliesToItemIds: [importRecord.items[0].id] },
    { name: "Manual Shared Cost", category: "Other Import Cost", amountForeign: "30.00", currency: "BDT", exchangeRate: "1", allocationMethod: "MANUAL", appliesToItemIds: [], manualSplits: [{ importItemId: importRecord.items[0].id, amountBdt: "10.00" }, { importItemId: importRecord.items[1].id, amountBdt: "20.00" }] }
  ];
  let firstCostId;
  for (const cost of costs) {
    const updated = await api("/api/imports/" + importRecord.id + "/costs", { method: "POST", expected: 201, body: cost });
    if (cost.name === "Sea Freight") firstCostId = updated.costs.find((entry) => entry.name === cost.name).id;
  }
  const preview = await api("/api/imports/" + importRecord.id + "/cost-preview", { method: "POST", body: {} });
  assert.deepEqual(preview.validationErrors, []);
  assert.equal(preview.totalAdditionalCostBdt, "1790.00");
  assert.equal(preview.allocations.length, 9);
  assert.equal(preview.products.reduce((sum, productRow) => sum + Number(productRow.finalTotalBdt), 0).toFixed(2), preview.totalShipmentCostBdt);
  assert.ok(preview.allocations.every((allocation) => allocation.explanation.length > 20));

  const finalizedV1 = await api("/api/imports/" + importRecord.id + "/finalize", { method: "POST", body: {} });
  assert.equal(finalizedV1.snapshot.immutable, true);
  assert.equal(finalizedV1.snapshot.version, 1);
  const v1Total = finalizedV1.snapshot.totalShipmentCostBdt;
  await api("/api/imports/" + importRecord.id, { method: "PATCH", body: { notes: "must remain locked" }, expected: 423 });
  const reopened = await api("/api/imports/" + importRecord.id + "/reopen", { method: "POST", body: { reason: "Correct the final freight invoice before receiving." } });
  assert.equal(reopened.snapshot, undefined);
  assert.equal(reopened.snapshotHistory.length, 1);
  await api("/api/imports/" + importRecord.id + "/costs/" + firstCostId, { method: "PATCH", body: { amountForeign: "570.00" } });
  const finalizedV2 = await api("/api/imports/" + importRecord.id + "/finalize", { method: "POST", body: {} });
  assert.equal(finalizedV2.snapshot.version, 2);
  assert.equal(finalizedV2.snapshotHistory.length, 2);
  assert.equal(finalizedV2.snapshotHistory[0].totalShipmentCostBdt, v1Total);
  assert.equal(finalizedV2.snapshotHistory[0].immutable, true);

  const receiptLineA = { importItemId: importRecord.items[0].id, productId: "spoof", productName: "Spoof", quantityReceived: "40", quantityRejected: "0", lotNumber: "FLOW-A1-" + suffix, batchNumber: "FLOW-A1-" + suffix, manufacturingDate: "2026-06-01", expiryDate: "2029-06-01", warehouse: "MIPRO Main Warehouse", location: "Rack A-01", landedCostPerUnit: "999999" };
  const receiptLineB = { importItemId: importRecord.items[1].id, productId: "spoof", productName: "Spoof", quantityReceived: "200", quantityRejected: "0", lotNumber: "FLOW-B1-" + suffix, batchNumber: "FLOW-B1-" + suffix, manufacturingDate: "2026-06-01", expiryDate: "2029-06-01", warehouse: "MIPRO Main Warehouse", location: "Rack B-01", landedCostPerUnit: "999999" };
  const firstReceipt = await api("/api/imports/" + importRecord.id + "/receive", { method: "POST", as: identities.warehouse, expected: 201, body: { receivedDate: today, lines: [receiptLineA, receiptLineB] } });
  assert.ok(firstReceipt.lines.every((line) => line.productName !== "Spoof"));
  assert.ok(firstReceipt.lines.every((line) => line.landedCostPerUnit !== "999999"));
  assert.equal((await api("/api/imports/" + importRecord.id)).status, "Partially Received");
  await api("/api/imports/" + importRecord.id + "/reopen", { method: "POST", expected: 409, body: { reason: "This must be blocked after receiving." } });
  await api("/api/imports/" + importRecord.id + "/receive", { method: "POST", as: identities.warehouse, expected: 422, body: { receivedDate: today, lines: [{ ...receiptLineA, quantityReceived: "61", lotNumber: "OVER-" + suffix, batchNumber: "OVER-" + suffix }] } });
  await api("/api/imports/" + importRecord.id + "/receive", { method: "POST", as: identities.warehouse, expected: 409, body: { receivedDate: today, lines: [{ ...receiptLineA, quantityReceived: "10" }] } });
  await api("/api/imports/" + importRecord.id + "/receive", { method: "POST", as: identities.warehouse, expected: 422, body: { receivedDate: today, lines: [{ ...receiptLineA, quantityReceived: "1", lotNumber: "BAD-DATE-" + suffix, batchNumber: "BAD-DATE-" + suffix, manufacturingDate: "2028-01-01", expiryDate: "2027-01-01" }] } });
  await api("/api/imports/" + importRecord.id + "/receive", {
    method: "POST",
    as: identities.warehouse,
    expected: 201,
    body: { receivedDate: today, lines: [{ ...receiptLineA, quantityReceived: "60", lotNumber: "FLOW-A2-" + suffix, batchNumber: "FLOW-A2-" + suffix, manufacturingDate: "2026-06-02", expiryDate: "2029-06-02", location: "Rack A-02" }] }
  });
  assert.equal((await api("/api/imports/" + importRecord.id)).status, "Received");
  const importBatches = (await api("/api/inventory/batches")).filter((batch) => batch.sourceImportId === importRecord.id);
  assert.equal(importBatches.length, 3);
  assert.ok(importBatches.every((batch) => batch.sourceType === "Import Receipt"));
  assert.ok(importBatches.every((batch) => batch.landedCostPerUnit !== "999999"));
  const closedImport = await api("/api/imports/" + importRecord.id + "/transition", { method: "POST", as: identities.import, body: { status: "Closed" } });
  assert.equal(closedImport.status, "Closed");
  await api("/api/imports/" + importRecord.id + "/receive", { method: "POST", as: identities.warehouse, expected: 423, body: { receivedDate: today, lines: [receiptLineA] } });

  console.log("3. Opening stock, expired exclusion and automatic multi-batch FIFO");
  const product = await api("/api/products", {
    method: "POST",
    expected: 201,
    body: { code: "FLOW-" + suffix, name: "FIFO Flow Device " + suffix, category: "Medical Consumable", manufacturer: "Demo Medical", country: "China", unit: "pcs", packSize: "1 pc", hsCode: "9018.90", standardSalePrice: "100.00", reorderLevel: "10", active: true, imageUrl: "/products/dialyzer.png" }
  });
  async function openingBatch(name, quantity, receivedDate, expiryDate) {
    return api("/api/settings/opening-stock", {
      method: "POST",
      expected: 201,
      body: { productId: product.id, quantity, lotNumber: name + "-LOT-" + suffix, batchNumber: name + "-BAT-" + suffix, manufacturingDate: "2024-01-01", expiryDate, receivedDate, sourceReference: "LEGACY-" + suffix, warehouse: "MIPRO Main Warehouse", location: "FIFO Test", landedCostPerUnit: "40.00" }
    });
  }
  const expiredBatch = await openingBatch("EXPIRED", "30", "2024-01-10", "2025-01-01");
  const oldestBatch = await openingBatch("OLD", "30", "2025-01-10", "2030-01-01");
  const nextBatch = await openingBatch("NEXT", "30", "2025-02-10", "2030-02-01");
  await api("/api/settings/opening-stock", { method: "POST", expected: 409, body: { productId: product.id, quantity: "1", lotNumber: "Duplicate", batchNumber: oldestBatch.batchNumber, manufacturingDate: "2024-01-01", expiryDate: "2030-01-01", receivedDate: "2025-01-01", sourceReference: "DUPLICATE", warehouse: "MIPRO Main Warehouse", landedCostPerUnit: "40" } });

  const fifoPlan = await api("/api/inventory/dispatch-preview", { method: "POST", body: { productId: product.id, quantity: "60", date: today, batchId: "AUTO" } });
  assert.deepEqual(fifoPlan.allocations.map((entry) => entry.batchId), [oldestBatch.id, nextBatch.id]);
  assert.deepEqual(fifoPlan.allocations.map((entry) => entry.quantity), ["30.0000", "30.0000"]);
  assert.equal(fifoPlan.availableQuantity, "60.0000");
  assert.ok(!fifoPlan.allocations.some((entry) => entry.batchId === expiredBatch.id));
  const overridePlan = await api("/api/inventory/dispatch-preview", { method: "POST", body: { productId: product.id, quantity: "10", date: today, batchId: nextBatch.id } });
  assert.equal(overridePlan.requiresOverride, true);
  assert.match(overridePlan.warning, /Older matching lot/);

  const customer = await api("/api/customers", {
    method: "POST",
    expected: 201,
    body: { name: "FIFO Test Clinic " + suffix, type: "Clinic", contactPerson: "Store Officer", phone: "+880 1700 000000", address: "Dhaka", territory: "Dhaka North", assignedSalesUserId: identities.sales1.id, paymentTerms: "30 days", creditLimit: "50000.00" }
  });
  const quote = await api("/api/quotations", {
    method: "POST",
    expected: 201,
    body: { date: today, customerId: customer.id, validityDays: 15, paymentTerms: "30 days", remarks: "Automatic FIFO split test", lines: [{ productId: product.id, quantity: "60", unitPrice: "100.00", discount: "0.00", lineTotal: "1.00" }] }
  });
  assert.equal(quote.total, "6000.00");
  const profitPreview = await api("/api/sales/profit-preview", { method: "POST", body: { lines: quote.lines } });
  assert.equal(profitPreview.expectedCogs, "2400.00");
  assert.equal(profitPreview.grossProfit, "3600.00");
  assert.equal(profitPreview.marginPercent, "60.00");
  await api("/api/sales/profit-preview", { method: "POST", as: identities.sales1, expected: 403, body: { lines: quote.lines } });
  await api("/api/quotations/" + quote.id, { method: "PATCH", body: { status: "Accepted" } });
  const order = await api("/api/quotations/" + quote.id + "/convert", { method: "POST", expected: 201, body: { deliveryInstruction: "Deliver to medical store" } });
  await api("/api/deliveries", {
    method: "POST",
    expected: 409,
    as: identities.salesManager,
    body: { orderId: order.id, date: today, remarks: "Unauthorized newer-lot attempt", receiverName: "Store Officer", overrideReason: "Skip older stock", lines: [{ ...order.lines[0], quantity: "10", batchId: nextBatch.id }] }
  });
  const delivery = await api("/api/deliveries", {
    method: "POST",
    expected: 201,
    as: identities.salesManager,
    body: { orderId: order.id, date: today, remarks: "FIFO split delivery", receiverName: "Store Officer", lines: [{ ...order.lines[0], quantity: "60", batchId: "AUTO" }] }
  });
  assert.equal(delivery.lines.length, 2);
  assert.deepEqual(delivery.lines.map((entry) => entry.quantity), ["30.0000", "30.0000"]);
  const batchesAfterDelivery = await api("/api/inventory/batches");
  assert.equal(batchesAfterDelivery.find((entry) => entry.id === oldestBatch.id).quantityAvailable, "0.00");
  assert.equal(batchesAfterDelivery.find((entry) => entry.id === nextBatch.id).quantityAvailable, "0.00");
  assert.equal(batchesAfterDelivery.find((entry) => entry.id === expiredBatch.id).quantityAvailable, "30.0000");
  const postedOrder = (await api("/api/orders")).find((entry) => entry.id === order.id);
  assert.equal(postedOrder.status, "Delivered");
  assert.equal(postedOrder.due, "6000.00");

  console.log("4. Sales ownership and collection/account integrity");
  await api("/api/quotations", { method: "POST", as: identities.sales1, expected: 403, body: { date: today, customerId: "cus-labaid", validityDays: 15, paymentTerms: "30 days", lines: [{ productId: "prd-d17h", quantity: "1", unitPrice: "700", discount: "0" }] } });
  await api("/api/quotations/quo-2", { method: "PATCH", as: identities.sales1, expected: 403, body: { remarks: "Cross-owner edit" } });
  await api("/api/quotations/quo-2/convert", { method: "POST", as: identities.sales1, expected: 403, body: {} });
  await api("/api/collections", { method: "POST", as: identities.sales1, expected: 403, body: { customerId: "cus-labaid", date: today, amount: "1", paymentMode: "Cash", accountId: "acc-cash" } });
  const selfAssignedCustomer = await api("/api/customers", {
    method: "POST",
    as: identities.sales1,
    expected: 201,
    body: { name: "Assigned Customer " + suffix, type: "Clinic", contactPerson: "Owner", phone: "+880 1711 111111", address: "Dhaka", territory: "Dhaka North", assignedSalesUserId: identities.sales2.id, paymentTerms: "Cash", creditLimit: "1000" }
  });
  assert.equal(selfAssignedCustomer.assignedSalesUserId, identities.sales1.id);
  assert.ok((await api("/api/customers", { as: identities.sales1 })).every((entry) => entry.assignedSalesUserId === identities.sales1.id));
  await api("/api/accounts", { as: identities.sales1, expected: 403 });

  await api("/api/collections", { method: "POST", expected: 422, body: { customerId: customer.id, orderId: order.id, date: today, amount: "100", paymentMode: "Credit", accountId: "acc-city" } });
  await api("/api/collections", { method: "POST", expected: 422, body: { customerId: customer.id, orderId: order.id, date: today, amount: "100", paymentMode: "Cash" } });
  await api("/api/collections", { method: "POST", expected: 422, body: { customerId: customer.id, orderId: order.id, date: today, amount: "100", paymentMode: "Bank Transfer", accountId: "missing-account", referenceNumber: "BANK-1" } });
  await api("/api/collections", { method: "POST", expected: 422, body: { customerId: customer.id, orderId: order.id, date: today, amount: "100", paymentMode: "Bank Transfer", accountId: "acc-city" } });
  const cityBefore = (await api("/api/settings/accounts")).find((entry) => entry.id === "acc-city");
  const collection = await api("/api/collections", {
    method: "POST",
    expected: 201,
    body: { customerId: customer.id, orderId: order.id, date: today, amount: "6000", paymentMode: "Bank Transfer", accountId: "acc-city", referenceNumber: "BANK-" + suffix, remarks: "Full FIFO order settlement" }
  });
  assert.match(collection.receiptNumber, /^MR-2026-/);
  const cityAfter = (await api("/api/settings/accounts")).find((entry) => entry.id === "acc-city");
  assert.equal(Number(cityAfter.balance) - Number(cityBefore.balance), 6000);
  assert.equal((await api("/api/customers")).find((entry) => entry.id === customer.id).currentDue, "0.00");
  assert.equal((await api("/api/orders")).find((entry) => entry.id === order.id).due, "0.00");
  assert.ok((await api("/api/account-transactions")).some((entry) => entry.sourceId === collection.id && entry.direction === "In"));

  console.log("5. Opening balances, running ledger and canonical migration data");
  const migrationCustomer = await api("/api/customers", {
    method: "POST",
    expected: 201,
    body: { name: "Legacy Ledger Customer " + suffix, type: "Hospital", contactPerson: "Accounts", phone: "+880 1722 222222", address: "Dhaka", territory: "Dhaka Central", assignedSalesUserId: identities.sales2.id, paymentTerms: "45 days", creditLimit: "200000.00" }
  });
  const openingBalance = await api("/api/settings/customer-opening-balances", {
    method: "POST",
    expected: 201,
    body: { customerId: migrationCustomer.id, date: "2026-01-01", historicalSales: "1000.00", historicalCollected: "400.00", openingDue: "600.00", reference: "LEGACY-LEDGER-" + suffix, remarks: "Verified migration opening." }
  });
  assert.equal(openingBalance.openingDue, "600.00");
  await api("/api/settings/customer-opening-balances", { method: "POST", expected: 409, body: { customerId: migrationCustomer.id, date: "2026-01-01", historicalSales: "1000", historicalCollected: "400", openingDue: "600" } });
  const migratedCustomer = (await api("/api/customers")).find((entry) => entry.id === migrationCustomer.id);
  assert.equal(migratedCustomer.totalSales, "1000.00");
  assert.equal(migratedCustomer.totalCollected, "400.00");
  assert.equal(migratedCustomer.currentDue, "600.00");
  const ledger = await api("/api/customers/" + migrationCustomer.id + "/ledger");
  assert.equal(ledger.entries[0].type, "Opening Due");
  assert.equal(ledger.entries[0].runningDue, "600.00");
  await api("/api/customers/" + migrationCustomer.id + "/ledger", { as: identities.sales1, expected: 403 });
  const alias = await api("/api/settings/product-aliases", { method: "POST", expected: 201, body: { aliasText: "FIFO DEVICE OLD " + suffix, productId: product.id, source: "Integration mapping" } });
  assert.equal(alias.productId, product.id);

  console.log("6. Expense isolation, TA/DA math and date-scoped reports");
  const snapshotTotal = (await api("/api/imports/" + importRecord.id)).snapshot.totalShipmentCostBdt;
  const reportBefore = await api("/api/reports?from=" + monthStart + "&to=" + today);
  const inactiveAccount = await api("/api/settings/accounts", { method: "POST", expected: 201, body: { name: "Inactive Test Account " + suffix, type: "Cash", accountNumber: "N/A", balance: "1000.00", active: false } });
  await api("/api/expenses", { method: "POST", as: identities.accounts, expected: 422, body: { date: today, categoryId: "ec-2", subtype: "General", amount: "10", paidFromAccountId: inactiveAccount.id, remarks: "Must not post" } });
  await api("/api/expenses", { method: "POST", as: identities.accounts, expected: 422, body: { date: today, categoryId: "missing", subtype: "General", amount: "10", paidFromAccountId: "acc-cash", remarks: "Must not post" } });
  const reversibleExpense = await api("/api/expenses", { method: "POST", as: identities.accounts, expected: 201, body: { date: today, categoryId: "ec-2", subtype: "General", amount: "137.99", paidFromAccountId: "acc-cash", remarks: "Temporary report integrity expense" } });
  const reportWithExpense = await api("/api/reports?from=" + monthStart + "&to=" + today);
  assert.equal((Number(metric(reportWithExpense, "expenses", "Operating expenses")) - Number(metric(reportBefore, "expenses", "Operating expenses"))).toFixed(2), "137.99");
  await api("/api/expenses/" + reversibleExpense.id + "/reverse", { method: "POST", as: identities.accounts, body: { reason: "Integration test reversal" } });
  const reportAfterReversal = await api("/api/reports?from=" + monthStart + "&to=" + today);
  assert.equal(metric(reportAfterReversal, "expenses", "Operating expenses"), metric(reportBefore, "expenses", "Operating expenses"));
  const taDa = await api("/api/expenses", {
    method: "POST",
    as: identities.accounts,
    expected: 201,
    body: { date: today, categoryId: "ec-4", subtype: "TA/DA", amount: "999999", taAmount: "20", daAmount: "30", employee: "Rafiq Ahmed", designation: "Sales Executive", paidFromAccountId: "acc-cash", remarks: "Approved customer visit expense" }
  });
  assert.equal(taDa.amount, "50.00");
  assert.equal((await api("/api/imports/" + importRecord.id)).snapshot.totalShipmentCostBdt, snapshotTotal);

  const currentReport = await api("/api/reports?from=" + monthStart + "&to=" + today);
  assert.deepEqual(currentReport.period, { from: monthStart, to: today });
  assert.ok(table(currentReport, "imports", "import-register").rows.some((row) => row.reference === lcReference));
  assert.ok(table(currentReport, "sales", "sales-by-product").rows.some((row) => row.product === product.name));
  assert.ok(table(currentReport, "sales", "customer-ledger").rows.length > 0);
  assert.ok(table(currentReport, "expenses", "daily-expenditure").rows.some((row) => row.category.includes("Rafiq Ahmed")));
  assert.ok(table(currentReport, "expenses", "ta-da").rows.some((row) => row.employee === "Rafiq Ahmed"));
  assert.ok(table(currentReport, "sales", "delivered-sales").columns.some((column) => column.key === "profit"));
  const accountsReport = await api("/api/reports?from=" + monthStart + "&to=" + today, { as: identities.accounts });
  assert.ok(!accountsReport.sales.some((entry) => entry.label === "Realized gross profit"));
  assert.ok(!table(accountsReport, "sales", "delivered-sales").columns.some((column) => column.key === "profit"));
  const emptyReport = await api("/api/reports?from=2035-01-01&to=2035-01-31");
  assert.equal(metric(emptyReport, "sales", "Delivered sales"), "0.00");
  assert.equal(metric(emptyReport, "sales", "Collections received"), "0.00");
  assert.equal(metric(emptyReport, "expenses", "Operating expenses"), "0.00");
  assert.equal(table(emptyReport, "sales", "delivered-sales").rows.length, 0);
  await api("/api/reports?from=2026-09-01&to=2026-08-01", { expected: 422 });

  console.log("7. Role-safe dashboard, dynamic expiry and sensitive redaction");
  const importDashboard = await api("/api/dashboard", { as: identities.import });
  assert.ok(importDashboard.metrics.length <= 6);
  assert.ok(importDashboard.metrics.every((entry) => !["sales", "collection", "due", "expense", "accounts"].includes(entry.id)));
  assert.equal(importDashboard.customerDues.length, 0);
  assert.equal(importDashboard.recentExpenses.length, 0);
  await api("/api/inventory/stock", { as: identities.import, expected: 403 });
  const salesDashboard = await api("/api/dashboard", { as: identities.sales1 });
  assert.ok(salesDashboard.metrics.length <= 6);
  assert.equal(salesDashboard.importAttention.length, 0);
  assert.equal(salesDashboard.recentExpenses.length, 0);
  await api("/api/inventory/stock", { as: identities.sales1, expected: 403 });
  const redactedImport = await api("/api/imports/" + importRecord.id, { as: identities.import });
  assert.equal(redactedImport.costs.length, 0);
  assert.equal(redactedImport.snapshot, undefined);
  assert.ok(redactedImport.items.every((entry) => entry.fobTotalBdt === "0.00"));
  await api("/api/imports/" + importRecord.id + "/cost-preview", { method: "POST", as: identities.import, expected: 403, body: {} });
  const dynamicExpiry = (await api("/api/inventory/batches")).find((entry) => entry.id === expiredBatch.id);
  assert.equal(dynamicExpiry.expiryStatus, "Expired");

  console.log("8. Employee reports, protected documents and contextual AI");
  const performanceAll = await api("/api/reports/salespeople?from=2026-08-01&to=2026-08-31&employeeId=all", { as: identities.salesManager });
  assert.deepEqual(performanceAll.period, { from: "2026-08-01", to: "2026-08-31" });
  assert.ok(performanceAll.comparison.length >= 2);
  assert.ok(performanceAll.comparison.some((entry) => entry.id === identities.sales1.id));
  assert.equal(performanceAll.selected, undefined);
  const employeePerformance = await api("/api/reports/salespeople?from=2026-08-01&to=2026-08-31&employeeId=" + identities.sales1.id, { as: identities.salesManager });
  assert.equal(employeePerformance.selected.employee.id, identities.sales1.id);
  assert.ok(employeePerformance.selected.tables.quotations.rows.length > 0);
  assert.ok(employeePerformance.selected.tables.deliveries.rows.length > 0);
  assert.ok(employeePerformance.selected.tables.collections.rows.length > 0);
  assert.doesNotMatch(JSON.stringify(employeePerformance), /landedCost|fob|grossProfit|profitMargin|supplierPrice/i);
  const ownPerformance = await api("/api/reports/salespeople?from=2026-08-01&to=2026-08-31&employeeId=all", { as: identities.sales1 });
  assert.deepEqual(ownPerformance.employees.map((employee) => employee.id), [identities.sales1.id]);
  assert.deepEqual(ownPerformance.comparison.map((employee) => employee.id), [identities.sales1.id]);
  assert.equal(ownPerformance.selected.employee.id, identities.sales1.id);
  await api("/api/reports/salespeople?from=2026-08-01&to=2026-08-31&employeeId=" + identities.sales2.id, { as: identities.sales1, expected: 403 });
  const ownGeneralReport = await api("/api/reports?from=2026-08-01&to=2026-08-31", { as: identities.sales1 });
  assert.deepEqual(ownGeneralReport.importCosts, []);
  assert.deepEqual(ownGeneralReport.inventory, []);
  assert.deepEqual(ownGeneralReport.expenses, []);
  assert.doesNotMatch(JSON.stringify(ownGeneralReport), /landedCost|fob|grossProfit|profitMargin|supplierPrice/i);

  const normalDocument = await rawApi("/api/documents/doc-pi/content", { as: identities.import, expected: 200 });
  assert.match(normalDocument.headers.get("content-type") || "", /application\/pdf/);
  await rawApi("/api/documents/doc-pi/content", { as: identities.sales1, expected: 403 });
  await rawApi("/api/documents/doc-assess/content", { as: identities.import, expected: 403 });
  await rawApi("/api/documents/doc-cost-frt/content", { as: identities.import, expected: 403 });
  await rawApi("/api/documents/doc-assess/content", { as: identities.super, expected: 200 });
  const expenseReceipt = await rawApi("/api/documents/doc-exp-6/content", { as: identities.accounts, expected: 200 });
  assert.match(expenseReceipt.headers.get("content-type") || "", /image\/png/);
  await rawApi("/api/documents/not-a-document/content", { as: identities.super, expected: 404 });

  const importBeforeExtraction = await api("/api/imports/imp-77612", { as: identities.import });
  const extraction = await api("/api/ai/document-extract", {
    method: "POST",
    as: identities.import,
    body: { importId: "imp-77612", documentId: "doc-pi" }
  });
  assert.equal(extraction.requiresReview, true);
  assert.ok(extraction.fields.length > 0);
  assert.ok(!extraction.fields.some((field) => field.key === "fobUnitForeign"));
  const importAfterExtraction = await api("/api/imports/imp-77612", { as: identities.import });
  assert.deepEqual(importAfterExtraction, importBeforeExtraction);

  const restrictedAi = await api("/api/ai/chat", {
    method: "POST",
    as: identities.sales1,
    body: { message: "What is the landed cost and profit margin?", context: { route: "/app/sales", entityType: "sales" } }
  });
  assert.equal(restrictedAi.restricted, true);
  assert.equal(restrictedAi.sources.length, 0);
  assert.doesNotMatch(restrictedAi.answer, /\d+[,.]\d+/);
  const ownSalesAi = await api("/api/ai/chat", {
    method: "POST",
    as: identities.sales1,
    body: { message: "Which customers need follow-up?", context: { route: "/app/sales", entityType: "sales" } }
  });
  assert.equal(ownSalesAi.restricted, false);
  assert.ok(ownSalesAi.sources.every((source) => source.path.startsWith("/app/sales")));
  const fifoRecommendations = await api("/api/ai/recommendations?route=%2Fapp%2Finventory&entityType=inventory", { as: identities.warehouse });
  assert.ok(fifoRecommendations.some((entry) => entry.id.startsWith("fifo-") || entry.id.startsWith("expiry-")));
  assert.ok(fifoRecommendations.every((entry) => entry.sourcePath === "/app/inventory"));
  const reportAi = await api("/api/ai/chat", {
    method: "POST",
    as: identities.salesManager,
    body: { message: "Summarize this report period", context: { route: "/app/reports", entityType: "reports", reportFrom: "2026-08-01", reportTo: "2026-08-31" } }
  });
  assert.match(reportAi.answer, /2026-08-01 to 2026-08-31/);
  assert.equal(reportAi.restricted, false);
  assert.doesNotMatch(JSON.stringify(reportAi), /landedCost|fob|grossProfit|profitMargin|supplierPrice/i);

  console.log("9. Field Team privacy, scalable selection and Smart Insights");
  const managerField = await api("/api/field-team/current", { as: identities.salesManager });
  assert.equal(managerField.feedLabel, "Demo location feed");
  assert.ok(managerField.employees.length >= 5);
  assert.ok(managerField.locations.some((entry) => entry.status === "LIVE"));
  assert.ok(managerField.locations.some((entry) => entry.status === "STALE"));
  assert.ok(managerField.locations.every((entry) => !Object.hasOwn(entry, "currentDue") && !Object.hasOwn(entry, "landedCost")));
  const firstLive = managerField.locations.find((entry) => entry.userId === identities.sales1.id);
  const nextField = await api("/api/field-team/current", { as: identities.salesManager });
  const movedLive = nextField.locations.find((entry) => entry.userId === identities.sales1.id);
  assert.notDeepEqual([movedLive.latitude, movedLive.longitude], [firstLive.latitude, firstLive.longitude]);
  assert.equal(movedLive.status, "LIVE");
  const ownField = await api("/api/field-team/current", { as: identities.sales1 });
  assert.deepEqual(ownField.employees.map((employee) => employee.id), [identities.sales1.id]);
  assert.deepEqual(ownField.locations.map((entry) => entry.userId), [identities.sales1.id]);
  await api("/api/field-team/current", { as: identities.accounts, expected: 403 });
  await api("/api/field-team/current", { as: identities.import, expected: 403 });
  const employeeSearch = await api("/api/field-team/employees?search=SE-021", { as: identities.salesManager });
  assert.deepEqual(employeeSearch.map((employee) => employee.id), ["sales3"]);
  const territorySearch = await api("/api/field-team/employees?territory=Dhaka%20North", { as: identities.salesManager });
  assert.ok(territorySearch.every((employee) => employee.territory === "Dhaka North"));
  const liveSearch = await api("/api/field-team/employees?status=LIVE", { as: identities.salesManager });
  assert.ok(liveSearch.some((employee) => employee.id === identities.sales1.id));
  const ownHistory = await api("/api/field-team/" + identities.sales1.id + "/history?date=" + today, { as: identities.sales1 });
  assert.equal(ownHistory.employee.id, identities.sales1.id);
  assert.ok(ownHistory.points.length >= 2);
  assert.ok(ownHistory.visits.length >= 1);
  assert.ok(!Object.hasOwn(ownHistory, "distance"));
  await api("/api/field-team/" + identities.sales2.id + "/history?date=" + today, { as: identities.sales1, expected: 403 });
  await api("/api/field-team/tracking/location", { method: "POST", as: identities.sales1, expected: 422, body: { latitude: 200, longitude: 90, accuracyMeters: 10, recordedAt: new Date().toISOString(), source: "WEB_FOREGROUND" } });
  await api("/api/field-team/visits/visit-rafiq-popular/check-in", { method: "POST", as: identities.sales1, expected: 422, body: { latitude: 200, longitude: 90, accuracyMeters: -1 } });
  await api("/api/field-team/visits/visit-shamima-labaid/check-out", { method: "POST", as: identities.sales1, expected: 403, body: { outcome: "Must not post" } });
  const fieldAiRestricted = await api("/api/ai/chat", { method: "POST", as: identities.sales1, body: { message: "Where is Shamima?", context: { route: "/app/sales?view=field-team", entityType: "field-team", employeeId: identities.sales2.id } } });
  assert.equal(fieldAiRestricted.restricted, true);
  const fieldAiManager = await api("/api/ai/chat", { method: "POST", as: identities.salesManager, body: { message: "Who is active in the field?", context: { route: "/app/sales?view=field-team", entityType: "field-team" } } });
  assert.equal(fieldAiManager.restricted, false);
  assert.ok(fieldAiManager.sources.some((source) => source.path.includes("view=field-team")));
  const managerInsights = await api("/api/ai/recommendations?route=%2Fapp%2Finsights&entityType=insights", { as: identities.salesManager });
  assert.ok(managerInsights.some((entry) => entry.category === "Field Team"));
  assert.ok(managerInsights.every((entry) => entry.sourcePath && entry.recommendedAction));
  const accountsInsights = await api("/api/ai/recommendations?route=%2Fapp%2Finsights&entityType=insights", { as: identities.accounts });
  assert.ok(accountsInsights.every((entry) => entry.category !== "Field Team"));

  console.log("All update3 simplified ERP scenarios passed.");
}

try {
  if (!externalBase) {
    server = spawn(process.execPath, [resolve(root, "node_modules", "tsx", "dist", "cli.mjs"), resolve(root, "server", "index.ts")], {
      cwd: root,
      env: { ...process.env, API_PORT: String(testPort) },
      stdio: ["ignore", "pipe", "pipe"]
    });
    server.stdout.on("data", rememberOutput);
    server.stderr.on("data", rememberOutput);
    await waitForServer();
  }
  await run();
} catch (error) {
  console.error(error);
  if (serverOutput) console.error(serverOutput);
  process.exitCode = 1;
} finally {
  if (server && server.exitCode === null) server.kill("SIGTERM");
}
