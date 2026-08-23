import assert from "node:assert/strict";

const base = process.env.API_TEST_BASE_URL ?? "http://localhost:4174";
const identities = {
  super: { id: "u-super", role: "Super Admin" },
  import: { id: "u-import", role: "Import Officer" },
  accounts: { id: "u-accounts", role: "Accounts" },
  sales: { id: "sales1", role: "Sales Executive" }
};

async function api(path, { method = "GET", body, as = identities.super, expected = 200 } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", "x-user-id": as.id, "x-role": as.role },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const payload = await response.json();
  assert.equal(response.status, expected, path + " returned " + response.status + ": " + payload.message);
  return payload.data;
}

console.log("1. Multi-product import, five allocations and immutable snapshot");
const importRecord = await api("/api/imports", {
  method: "POST",
  expected: 201,
  body: {
    supplierId: "sup-renhe",
    supplierName: "Guangzhou Renhe Medical Technology",
    poNumber: "PO-FLOW-001",
    poDate: "2026-08-23",
    piNumber: "PI-FLOW-001",
    piDate: "2026-08-23",
    paymentMode: "LC",
    lcNumber: "LC-FLOW-001",
    bank: "City Bank PLC",
    currency: "USD",
    exchangeRate: "122.50",
    rateDate: "2026-08-23",
    rateSource: "Integration test bank snapshot",
    items: [
      { id: "flow-item-a", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "100", unit: "pcs", currency: "USD", fobUnitForeign: "3.20", exchangeRate: "122.50", fobTotalBdt: "39200.00", cbmPerCarton: "0.08", cartonCount: "2", totalCbm: "0.16", hsCode: "9018.90" },
      { id: "flow-item-b", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", quantity: "200", unit: "set", currency: "USD", fobUnitForeign: "1.10", exchangeRate: "122.50", fobTotalBdt: "26950.00", cbmPerCarton: "0.10", cartonCount: "4", totalCbm: "0.40", hsCode: "9018.90" }
    ]
  }
});
assert.equal(importRecord.primaryReference, "LC-FLOW-001");

const costs = [
  { name: "Flow Freight", category: "Freight", amountForeign: "560.00", currency: "BDT", exchangeRate: "1", amountBdt: "560.00", allocationMethod: "CBM", appliesToItemIds: [] },
  { name: "Flow Bank", category: "Bank Charge", amountForeign: "400.00", currency: "BDT", exchangeRate: "1", amountBdt: "400.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [] },
  { name: "Flow Labour", category: "Labour", amountForeign: "300.00", currency: "BDT", exchangeRate: "1", amountBdt: "300.00", allocationMethod: "QUANTITY", appliesToItemIds: [] },
  { name: "Assessed Duty A", category: "Customs Duty", amountForeign: "500.00", currency: "BDT", exchangeRate: "1", amountBdt: "500.00", allocationMethod: "PRODUCT_SPECIFIC", appliesToItemIds: ["flow-item-a"] },
  { name: "Manual Shared", category: "Other Import Cost", amountForeign: "30.00", currency: "BDT", exchangeRate: "1", amountBdt: "30.00", allocationMethod: "MANUAL", appliesToItemIds: [], manualSplits: [{ importItemId: "flow-item-a", amountBdt: "10.00" }, { importItemId: "flow-item-b", amountBdt: "20.00" }] }
];
for (const cost of costs) await api("/api/imports/" + importRecord.id + "/costs", { method: "POST", expected: 201, body: cost });
const preview = await api("/api/imports/" + importRecord.id + "/cost-preview", { method: "POST", body: {} });
assert.deepEqual(preview.validationErrors, []);
assert.equal(preview.totalAdditionalCostBdt, "1790.00");
assert.equal(preview.products.reduce((sum, product) => sum + Number(product.finalTotalBdt), 0).toFixed(2), preview.totalShipmentCostBdt);
const finalized = await api("/api/imports/" + importRecord.id + "/finalize", { method: "POST", body: {} });
assert.equal(finalized.snapshot.immutable, true);
assert.equal(finalized.snapshot.version, 1);
await api("/api/imports/" + importRecord.id, { method: "PATCH", body: { notes: "should fail" }, expected: 423 });

console.log("2. Partial receipt, final receipt and inherited stock cost");
await api("/api/imports/" + importRecord.id + "/receive", {
  method: "POST",
  expected: 201,
  body: {
    receivedDate: "2026-08-23",
    lines: [
      { importItemId: "flow-item-a", productId: "prd-d17h", productName: "Dialyzer 1.7H", quantityReceived: "40", quantityRejected: "0", lotNumber: "FLOW-A-1", batchNumber: "FLOW-A-1", manufacturingDate: "2026-06-01", expiryDate: "2029-06-01", warehouse: "MIPRO Main Warehouse", location: "Rack A-01", landedCostPerUnit: "999999" },
      { importItemId: "flow-item-b", productId: "prd-bts", productName: "Blood Line Sets", quantityReceived: "200", quantityRejected: "0", lotNumber: "FLOW-B-1", batchNumber: "FLOW-B-1", manufacturingDate: "2026-06-01", expiryDate: "2029-06-01", warehouse: "MIPRO Main Warehouse", location: "Rack B-01", landedCostPerUnit: "999999" }
    ]
  }
});
assert.equal((await api("/api/imports/" + importRecord.id)).status, "Partially Received");
await api("/api/imports/" + importRecord.id + "/receive", {
  method: "POST",
  expected: 201,
  body: { receivedDate: "2026-08-24", lines: [{ importItemId: "flow-item-a", productId: "prd-d17h", productName: "Dialyzer 1.7H", quantityReceived: "60", quantityRejected: "0", lotNumber: "FLOW-A-2", batchNumber: "FLOW-A-2", manufacturingDate: "2026-06-02", expiryDate: "2029-06-02", warehouse: "MIPRO Main Warehouse", location: "Rack A-02", landedCostPerUnit: "999999" }] }
});
assert.equal((await api("/api/imports/" + importRecord.id)).status, "Received");
const flowBatches = (await api("/api/inventory/batches")).filter((batch) => batch.sourceImportId === importRecord.id);
assert.equal(flowBatches.length, 3);
assert.ok(flowBatches.every((batch) => batch.landedCostPerUnit !== "999999"), "Warehouse receipt must inherit snapshot cost server-side");

console.log("3. Quotation to order to FIFO delivery to collection");
const quote = await api("/api/quotations", {
  method: "POST",
  expected: 201,
  body: { date: "2026-08-23", customerId: "cus-popular", customerName: "Popular Medicine & Departmental Store", validityDays: 15, paymentTerms: "Cash / 15 days", remarks: "Flow test", lines: [{ id: "flow-sale-line", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "10", unitPrice: "690.00", discount: "0.00", lineTotal: "6900.00" }] }
});
const accepted = await api("/api/quotations/" + quote.id, { method: "PATCH", body: { status: "Accepted" } });
assert.equal(accepted.total, "6900.00");
const order = await api("/api/quotations/" + quote.id + "/convert", { method: "POST", expected: 201, body: { deliveryInstruction: "Deliver to receiving counter" } });
assert.equal(order.lines[0].productId, quote.lines[0].productId);
assert.equal(order.due, "0.00");
const beforeBatch = (await api("/api/inventory/batches")).find((batch) => batch.id === "bat-d17-old");
await api("/api/deliveries", {
  method: "POST",
  expected: 201,
  body: { orderId: order.id, customerId: order.customerId, customerName: order.customerName, date: "2026-08-23", remarks: "FIFO flow dispatch", receiverName: "Store Officer", lines: [{ ...order.lines[0], quantity: "10", lineTotal: "6900.00", batchId: "bat-d17-old", batchNumber: "BAT-D17H-2509" }] }
});
const afterBatch = (await api("/api/inventory/batches")).find((batch) => batch.id === "bat-d17-old");
assert.equal(Number(beforeBatch.quantityAvailable) - Number(afterBatch.quantityAvailable), 10);
assert.equal((await api("/api/orders")).find((row) => row.id === order.id).due, "6900.00");
const customerBeforeCollection = (await api("/api/customers")).find((customer) => customer.id === order.customerId);
const collection = await api("/api/collections", {
  method: "POST",
  expected: 201,
  body: { customerId: order.customerId, customerName: order.customerName, orderId: order.id, date: "2026-08-23", amount: "6900.00", paymentMode: "Cash", accountId: "acc-cash", referenceNumber: "FLOW-CASH-1", remarks: "Full order settlement" }
});
assert.match(collection.receiptNumber, /^MR-/);
const customerAfterCollection = (await api("/api/customers")).find((customer) => customer.id === order.customerId);
assert.equal(Number(customerBeforeCollection.currentDue) - Number(customerAfterCollection.currentDue), 6900);
assert.equal((await api("/api/orders")).find((row) => row.id === order.id).due, "0.00");

console.log("4. Operating expense isolation and role access");
const snapshotTotal = (await api("/api/imports/" + importRecord.id)).snapshot.totalShipmentCostBdt;
await api("/api/expenses", { method: "POST", expected: 201, body: { date: "2026-08-23", categoryId: "ec-2", subtype: "General", amount: "100.00", paidFromAccountId: "acc-cash", remarks: "Flow test office expense" } });
assert.equal((await api("/api/imports/" + importRecord.id)).snapshot.totalShipmentCostBdt, snapshotTotal);
const redacted = await api("/api/imports/" + importRecord.id, { as: identities.import });
assert.equal(redacted.costs.length, 0);
assert.equal(redacted.snapshot, undefined);
await api("/api/imports", { as: identities.accounts, expected: 403 });
await api("/api/accounts", { as: identities.sales, expected: 403 });
const ownCustomers = await api("/api/customers", { as: identities.sales });
assert.ok(ownCustomers.every((customer) => customer.assignedSalesUserId === identities.sales.id));

console.log("All simplified ERP API flow scenarios passed.");
