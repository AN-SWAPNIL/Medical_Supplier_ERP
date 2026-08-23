import cors from "cors";
import { Decimal } from "decimal.js";
import express, { type Request, type Response } from "express";
import { calculateLandedCost, importDisplayReference } from "../src/domains/imports/costing.js";
import type {
  Capability,
  Collection,
  CustomerOpeningBalance,
  CustomerLedger,
  DispatchAllocation,
  Delivery,
  Expense,
  ImportCase,
  ImportCostLine,
  ImportDocument,
  ImportItem,
  ImportStatus,
  ProductAlias,
  ProfitPreview,
  Quotation,
  SalesOrder,
  StockBatch,
  WarehouseReceipt
} from "../src/domains/erp.types.js";
import type { ApiResponse, Role, Session, User } from "../src/types/index.js";
import {
  accountTransactions as seedAccountTransactions,
  accounts as seedAccounts,
  auditEvents as seedAuditEvents,
  collections as seedCollections,
  customerOpeningBalances as seedCustomerOpeningBalances,
  customers as seedCustomers,
  decisions,
  deliveries as seedDeliveries,
  demoUsers,
  expenseCategories as seedExpenseCategories,
  expenses as seedExpenses,
  imports as seedImports,
  orders as seedOrders,
  passwordByEmail,
  printConfiguration as seedPrintConfiguration,
  productAliases as seedProductAliases,
  products as seedProducts,
  quotations as seedQuotations,
  receipts as seedReceipts,
  costPresets as seedCostPresets,
  stockBatches as seedStockBatches,
  stockMovements as seedStockMovements,
  suppliers as seedSuppliers,
  warehouseConfig as seedWarehouseConfig
} from "./data.js";

const app = express();
const port = Number(process.env.API_PORT ?? 4174);

// The frontend approval build intentionally keeps transactional state in process memory.
const products = structuredClone(seedProducts);
const suppliers = structuredClone(seedSuppliers);
const imports = structuredClone(seedImports);
const stockBatches = structuredClone(seedStockBatches);
const stockMovements = structuredClone(seedStockMovements);
const receipts = structuredClone(seedReceipts);
const customers = structuredClone(seedCustomers);
const quotations = structuredClone(seedQuotations);
const orders = structuredClone(seedOrders);
const deliveries = structuredClone(seedDeliveries);
const collections = structuredClone(seedCollections);
const expenses = structuredClone(seedExpenses);
const accounts = structuredClone(seedAccounts);
const accountTransactions = structuredClone(seedAccountTransactions);
const expenseCategories = structuredClone(seedExpenseCategories);
const auditEvents = structuredClone(seedAuditEvents);
const costPresets = structuredClone(seedCostPresets);
const warehouseConfig = structuredClone(seedWarehouseConfig);
const printConfiguration = structuredClone(seedPrintConfiguration);
const productAliases: ProductAlias[] = structuredClone(seedProductAliases);
const customerOpeningBalances: CustomerOpeningBalance[] = structuredClone(seedCustomerOpeningBalances);
const pendingSignupRequests: Record<string, unknown>[] = [];

app.use(cors());
app.use(express.json({ limit: "8mb" }));
app.use((req, _res, next) => {
  const [path = "/", query] = req.url.split("?");
  let normalized = path.startsWith("/") ? path : `/${path}`;
  if (!normalized.startsWith("/api")) normalized = normalized === "/" ? "/api" : `/api${normalized}`;
  normalized = normalized.replace(/^\/api\/v1(?=\/|$)/, "/api");
  req.url = `${normalized}${query ? `?${query}` : ""}`;
  next();
});

function ok<T>(data: T, message = "OK", meta?: ApiResponse<T>["meta"]): ApiResponse<T> {
  return { success: true, message, data, meta };
}

function fail(res: Response, status: number, message: string) {
  res.status(status).json({ success: false, message, data: null });
}

function userFor(req: Request): User | null {
  const id = String(req.headers["x-user-id"] ?? "");
  return demoUsers.find((user) => user.id === id) ?? null;
}

function hasCapability(req: Request, capability: Capability) {
  return userFor(req)?.capabilities?.includes(capability) ?? false;
}

function requireUser(req: Request, res: Response) {
  const user = userFor(req);
  if (!user) fail(res, 401, "A valid ERP session is required.");
  return user;
}

const areaRoles: Record<string, Role[]> = {
  dashboard: ["Super Admin", "Managing Director", "Accounts", "Import Officer", "Warehouse Manager", "Sales Manager", "Sales Executive"],
  imports: ["Super Admin", "Managing Director", "Import Officer", "Warehouse Manager"],
  inventory: ["Super Admin", "Managing Director", "Warehouse Manager", "Sales Manager"],
  sales: ["Super Admin", "Managing Director", "Accounts", "Warehouse Manager", "Sales Manager", "Sales Executive"],
  accounts: ["Super Admin", "Managing Director", "Accounts"],
  reports: ["Super Admin", "Managing Director", "Accounts", "Sales Manager"],
  settings: ["Super Admin"]
};

function requireArea(req: Request, res: Response, area: keyof typeof areaRoles) {
  const user = requireUser(req, res);
  if (!user) return null;
  if (!areaRoles[area].includes(user.role)) {
    fail(res, 403, `${user.role} cannot access ${area}.`);
    return null;
  }
  return user;
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function decimal(value: string | number | undefined) {
  return new Decimal(value || 0);
}

function money(value: Decimal | string | number) {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
}

function precise(value: Decimal | string | number, places = 4) {
  return new Decimal(value).toDecimalPlaces(places, Decimal.ROUND_HALF_UP).toFixed(places);
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

function requiredDecimal(value: unknown, label: string, options: { allowZero?: boolean } = {}) {
  let parsed: Decimal;
  try {
    parsed = new Decimal(String(value ?? ""));
  } catch {
    throw new Error(`${label} must be a valid number.`);
  }
  if (!parsed.isFinite() || (options.allowZero ? parsed.lt(0) : parsed.lte(0))) {
    throw new Error(`${label} must be ${options.allowZero ? "zero or greater" : "greater than zero"}.`);
  }
  return parsed;
}

function normalizeImportItem(payload: Partial<ImportItem>, existing?: ImportItem): ImportItem {
  const product = products.find((entry) => entry.id === (payload.productId ?? existing?.productId));
  if (!product) throw new Error("Select a valid canonical product.");
  const quantity = requiredDecimal(payload.quantity ?? existing?.quantity, `${product.name} quantity`);
  const fobUnit = requiredDecimal(payload.fobUnitForeign ?? existing?.fobUnitForeign ?? "0", `${product.name} FOB per unit`, { allowZero: true });
  const rate = requiredDecimal(payload.exchangeRate ?? existing?.exchangeRate ?? "0", `${product.name} exchange rate`, { allowZero: fobUnit.eq(0) });
  const cartons = requiredDecimal(payload.cartonCount ?? existing?.cartonCount ?? "0", `${product.name} carton count`, { allowZero: true });
  const cbmPerCarton = requiredDecimal(payload.cbmPerCarton ?? existing?.cbmPerCarton ?? "0", `${product.name} CBM per carton`, { allowZero: true });
  const cbmMode = payload.cbmMode ?? existing?.cbmMode ?? "CALCULATED";
  const totalCbm = cbmMode === "MANUAL"
    ? requiredDecimal(payload.totalCbm ?? existing?.totalCbm ?? "0", `${product.name} manual total CBM`, { allowZero: true })
    : cartons.mul(cbmPerCarton);
  return {
    ...existing,
    ...payload,
    id: existing?.id ?? String(payload.id || id("item")),
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    quantity: precise(quantity, 4),
    unit: product.unit,
    currency: String(payload.currency ?? existing?.currency ?? "USD"),
    fobUnitForeign: precise(fobUnit, 4),
    exchangeRate: precise(rate, 4),
    fobTotalBdt: money(quantity.mul(fobUnit).mul(rate)),
    cbmPerCarton: precise(cbmPerCarton, 4),
    cartonCount: precise(cartons, 4),
    totalCbm: precise(totalCbm, 4),
    cbmMode,
    hsCode: product.hsCode
  };
}

const protectedImportFields = new Set(["id", "draftReference", "primaryReference", "status", "milestone", "costingStatus", "warehouseStatus", "items", "costs", "documents", "snapshot", "snapshotHistory", "createdAt", "updatedAt"]);

function deriveImportStatus(record: ImportCase) {
  const received = receipts.filter((entry) => entry.importId === record.id);
  if (received.length) {
    const processed = new Map<string, Decimal>();
    for (const receipt of received) for (const line of receipt.lines) processed.set(line.importItemId, (processed.get(line.importItemId) ?? new Decimal(0)).plus(line.quantityReceived).plus(line.quantityRejected));
    const complete = record.items.every((item) => (processed.get(item.id) ?? new Decimal(0)).gte(item.quantity));
    record.status = complete ? "Received" : "Partially Received";
    record.warehouseStatus = complete ? "Received" : "Partially Received";
    record.costingStatus = "Finalized";
  } else if (record.snapshot) {
    record.status = "Cost Finalized";
    record.costingStatus = "Finalized";
    record.warehouseStatus = "Ready";
  } else if (record.costs.length) {
    record.status = "Costing";
    record.costingStatus = "In Progress";
    record.warehouseStatus = "Not Ready";
  } else if (!["In Production", "Shipped", "At Port", "Cancelled", "Closed"].includes(record.status)) {
    if ((record.paymentMode === "LC" && record.lcNumber?.trim()) || (record.paymentMode === "TT" && record.ttReference?.trim())) record.status = "LC/TT Opened";
    else if (record.piNumber?.trim()) record.status = "PI Received";
    else record.status = "Draft";
    record.costingStatus = "Not Started";
    record.warehouseStatus = "Not Ready";
  }
  record.milestone = record.status;
  record.primaryReference = importDisplayReference(record);
  record.updatedAt = new Date().toISOString();
}

function terminalImportLocked(record: ImportCase, res: Response) {
  if (!["Closed", "Cancelled"].includes(record.status)) return false;
  fail(res, 423, record.status + " import cases are read-only.");
  return true;
}

function expiryStatus(expiryDate: string, today = new Date()) {
  const expiry = new Date(`${expiryDate}T23:59:59`);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "Expired" as const;
  if (days <= 31) return "1 Month Alert" as const;
  if (days <= 92) return "3 Month Alert" as const;
  if (days <= 183) return "6 Month Alert" as const;
  return "Normal" as const;
}

function visibleBatch(batch: StockBatch, req: Request): StockBatch {
  return batchForRole({ ...batch, expiryStatus: expiryStatus(batch.expiryDate) }, req);
}

function fifoAllocation(productId: string, quantityValue: string, dispatchDate: string, preferredBatchId?: string) {
  const quantity = requiredDecimal(quantityValue, "Dispatch quantity");
  const candidates = stockBatches
    .filter((batch) => batch.productId === productId && decimal(batch.quantityAvailable).gt(0) && new Date(`${batch.expiryDate}T23:59:59`) >= new Date(`${dispatchDate}T00:00:00`))
    .sort((a, b) => a.receivedDate.localeCompare(b.receivedDate) || a.id.localeCompare(b.id));
  const available = candidates.reduce((sum, batch) => sum.plus(batch.quantityAvailable), new Decimal(0));
  if (available.lt(quantity)) throw new Error(`Only ${available.toFixed(0)} non-expired units are available for FIFO dispatch.`);
  const selected = preferredBatchId && preferredBatchId !== "AUTO" ? candidates.find((batch) => batch.id === preferredBatchId) : undefined;
  if (preferredBatchId && preferredBatchId !== "AUTO" && !selected) throw new Error("Selected batch is unavailable or expired.");
  const ordered = selected ? [selected, ...candidates.filter((batch) => batch.id !== selected.id)] : candidates;
  let remaining = quantity;
  const allocations: DispatchAllocation[] = [];
  for (const batch of ordered) {
    if (remaining.lte(0)) break;
    const take = Decimal.min(remaining, batch.quantityAvailable);
    if (take.lte(0)) continue;
    allocations.push({ batchId: batch.id, batchNumber: batch.batchNumber, lotNumber: batch.lotNumber, quantity: precise(take, 4), receivedDate: batch.receivedDate, expiryDate: batch.expiryDate });
    remaining = remaining.minus(take);
  }
  const requiresOverride = Boolean(selected && candidates[0] && selected.id !== candidates[0].id);
  return {
    productId,
    requestedQuantity: precise(quantity, 4),
    availableQuantity: precise(available, 4),
    allocations,
    requiresOverride,
    warning: requiresOverride ? `Older matching lot ${candidates[0].lotNumber} still has ${candidates[0].quantityAvailable} units. Authorized override and reason are required.` : undefined
  };
}

function ownsCustomer(req: Request, customerId: string) {
  const user = userFor(req);
  const customer = customers.find((entry) => entry.id === customerId);
  return Boolean(customer && (user?.role !== "Sales Executive" || customer.assignedSalesUserId === user.id));
}

function inPeriod(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

function normalizeSalesLines(payload: unknown) {
  if (!Array.isArray(payload) || !payload.length) throw new Error("Add at least one sales line.");
  return payload.map((raw: Record<string, unknown>) => {
    const product = products.find((entry) => entry.id === raw.productId);
    if (!product) throw new Error("A sales line references an unknown product.");
    const quantity = requiredDecimal(raw.quantity, `${product.name} quantity`);
    const unitPrice = requiredDecimal(raw.unitPrice, `${product.name} unit price`);
    const discount = requiredDecimal(raw.discount ?? "0", `${product.name} discount`, { allowZero: true });
    const gross = quantity.mul(unitPrice);
    if (discount.gt(gross)) throw new Error(`${product.name} discount cannot exceed the gross line value.`);
    return {
      id: String(raw.id || id("sales-line")),
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      quantity: precise(quantity, 4),
      unitPrice: money(unitPrice),
      discount: money(discount),
      lineTotal: money(gross.minus(discount))
    };
  });
}

function customerLedger(customerId: string): CustomerLedger | null {
  const customer = customers.find((entry) => entry.id === customerId);
  if (!customer) return null;
  const customerDeliveries = deliveries.filter((entry) => entry.customerId === customer.id);
  const customerCollections = collections.filter((entry) => entry.customerId === customer.id && entry.status === "Posted");
  const transactions = [
    ...customerDeliveries.map((delivery) => ({ id: delivery.id, date: delivery.date, type: "Delivery" as const, reference: delivery.challanNumber, debit: delivery.lines.reduce((sum, line) => sum.plus(line.lineTotal), new Decimal(0)), credit: new Decimal(0), remarks: delivery.remarks || "Stock delivered" })),
    ...customerCollections.map((collection) => ({ id: collection.id, date: collection.date, type: "Collection" as const, reference: collection.receiptNumber, debit: new Decimal(0), credit: decimal(collection.amount), remarks: `${collection.paymentMode}${collection.referenceNumber ? ` · ${collection.referenceNumber}` : ""}${collection.remarks ? ` · ${collection.remarks}` : ""}` }))
  ].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const transactionDebit = transactions.reduce((sum, entry) => sum.plus(entry.debit), new Decimal(0));
  const transactionCredit = transactions.reduce((sum, entry) => sum.plus(entry.credit), new Decimal(0));
  const configuredOpening = customerOpeningBalances.find((entry) => entry.customerId === customer.id);
  const openingDue = configuredOpening ? decimal(configuredOpening.openingDue) : Decimal.max(0, decimal(customer.currentDue).minus(transactionDebit).plus(transactionCredit));
  let running = openingDue;
  const entries = [];
  if (openingDue.gt(0)) entries.push({ id: configuredOpening?.id ?? `opening-${customer.id}`, date: configuredOpening?.date ?? transactions[0]?.date ?? "2026-01-01", type: "Opening Due" as const, reference: configuredOpening?.reference ?? "MIGRATED", debit: money(openingDue), credit: "0.00", runningDue: money(openingDue), remarks: configuredOpening?.remarks ?? "Opening customer due imported from the legacy sales ledger." });
  for (const entry of transactions) {
    running = running.plus(entry.debit).minus(entry.credit);
    entries.push({ id: entry.id, date: entry.date, type: entry.type, reference: entry.reference, debit: money(entry.debit), credit: money(entry.credit), runningDue: money(running), remarks: entry.remarks });
  }
  return { customer, deliveredSales: customer.totalSales, collected: customer.totalCollected, currentDue: customer.currentDue, entries, deliveries: customerDeliveries, collections: customerCollections };
}

function audit(req: Request, action: string, entityType: string, entityId: string, summary: string, reason?: string) {
  const user = userFor(req);
  if (!user) return;
  auditEvents.unshift({ id: id("audit"), timestamp: new Date().toISOString(), userId: user.id, userName: user.name, role: user.role, action, entityType, entityId, summary, reason });
}

function importForRole(record: ImportCase, req: Request): ImportCase {
  const copy = structuredClone(record);
  if (!hasCapability(req, "view_sensitive_cost")) {
    copy.costs = [];
    delete copy.snapshot;
    copy.items = copy.items.map((item) => ({ ...item, fobUnitForeign: "0.00", fobTotalBdt: "0.00", exchangeRate: "0.00" }));
  }
  return copy;
}

function batchForRole(batch: StockBatch, req: Request): StockBatch {
  return hasCapability(req, "view_sensitive_cost") ? batch : { ...batch, landedCostPerUnit: "0.00" };
}

function salesScoped<T extends { ownerId?: string }>(rows: T[], req: Request) {
  const user = userFor(req);
  return user?.role === "Sales Executive" ? rows.filter((row) => row.ownerId === user.id) : rows;
}

function customerScoped(req: Request) {
  const user = userFor(req);
  return user?.role === "Sales Executive" ? customers.filter((customer) => customer.assignedSalesUserId === user.id) : customers;
}

function nextReference(prefix: string, count: number) {
  return `${prefix}-2026-${String(count + 1).padStart(3, "0")}`;
}

app.get("/api/health", (_req, res) => res.json(ok({ service: "mipro-simplified-erp-api", ok: true })));

app.get("/api/auth/demo-users", (_req, res) => {
  res.json(ok(demoUsers.map(({ email, name, role, title }) => ({ email, name, role, title })), "Demo users loaded"));
});

app.post("/api/auth/login", (req, res) => {
  const email = String(req.body?.email ?? "");
  const user = demoUsers.find((entry) => entry.email === email);
  if (!user || user.status !== "Active" || passwordByEmail.get(email) !== req.body?.password) return fail(res, 401, "Invalid email, password or inactive account");
  const session: Session = { token: `mock-token-${user.id}`, user };
  res.json(ok(session, "Login successful"));
});

app.post("/api/auth/signup-request", (req, res) => {
  const request = { ...req.body, id: id("access"), status: "Pending", createdAt: new Date().toISOString() };
  pendingSignupRequests.unshift(request);
  res.status(201).json(ok(request, "Access request submitted"));
});

app.post("/api/auth/forgot-password", (req, res) => res.json(ok({ email: req.body?.email ?? "" }, "Reset request accepted")));
app.post("/api/auth/reset-password", (req, res) => {
  const email = String(req.body?.email ?? "");
  const password = String(req.body?.password ?? "");
  if (!passwordByEmail.has(email)) return fail(res, 404, "Account not found.");
  if (password.length < 6) return fail(res, 400, "Password must contain at least 6 characters.");
  passwordByEmail.set(email, password);
  res.json(ok({ email }, "Password updated for this running demo session"));
});
app.get("/api/me", (req, res) => {
  const user = requireUser(req, res);
  if (user) res.json(ok({ token: `mock-token-${user.id}`, user }, "Current session"));
});

app.get(["/api/dashboard", "/api/dashboard/summary"], (req, res) => {
  const user = requireArea(req, res, "dashboard");
  if (!user) return;
  const visibleOrders = salesScoped(orders, req);
  const visibleOrderIds = new Set(visibleOrders.map((order) => order.id));
  const visibleDeliveries = user.role === "Sales Executive" ? deliveries.filter((delivery) => visibleOrderIds.has(delivery.orderId)) : deliveries;
  const visibleCollections = salesScoped(collections, req).filter((collection) => collection.status === "Posted");
  const visibleCustomers = customerScoped(req);
  const currentMonth = businessDate().slice(0, 7);
  const salesTotal = visibleDeliveries.filter((delivery) => delivery.date.startsWith(currentMonth)).flatMap((delivery) => delivery.lines).reduce((sum, line) => sum.plus(line.lineTotal), new Decimal(0));
  const collectionTotal = visibleCollections.filter((collection) => collection.date.startsWith(currentMonth)).reduce((sum, collection) => sum.plus(collection.amount), new Decimal(0));
  const dueTotal = visibleCustomers.reduce((sum, customer) => sum.plus(customer.currentDue), new Decimal(0));
  const expenseTotal = expenses.filter((expense) => expense.status === "Posted" && expense.date.startsWith(currentMonth)).reduce((sum, expense) => sum.plus(expense.amount), new Decimal(0));
  const stockUnits = stockBatches.reduce((sum, batch) => sum.plus(batch.quantityAvailable), new Decimal(0));
  const stockValue = stockBatches.reduce((sum, batch) => sum.plus(decimal(batch.quantityAvailable).mul(batch.landedCostPerUnit)), new Decimal(0));
  const importsInProgress = imports.filter((item) => !["Received", "Closed", "Cancelled"].includes(item.status));
  const expiryAttention = stockBatches.filter((batch) => expiryStatus(batch.expiryDate) !== "Normal");
  const readyToReceive = imports.filter((item) => ["Cost Finalized", "Partially Received"].includes(item.status));
  const openOrders = visibleOrders.filter((order) => !["Delivered", "Cancelled"].includes(order.status));
  const openQuotes = salesScoped(quotations, req).filter((quote) => !["Converted", "Rejected"].includes(quote.status));
  const orderPipeline = openOrders.reduce((sum, order) => sum.plus(order.total), new Decimal(0));
  const accountBalance = accounts.filter((account) => account.active).reduce((sum, account) => sum.plus(account.balance), new Decimal(0));
  const dispatchCount = visibleDeliveries.filter((delivery) => delivery.date.startsWith(currentMonth)).length;
  const financial = ["Super Admin", "Managing Director"].includes(user.role);
  const metricsByRole: Record<Role, { id: string; label: string; value: string; unit: string; sensitive?: boolean }[]> = {
    "Super Admin": [
      { id: "sales", label: "Delivered Sales This Month", value: money(salesTotal), unit: "BDT" },
      { id: "collection", label: "Collections This Month", value: money(collectionTotal), unit: "BDT" },
      { id: "due", label: "Outstanding Receivable", value: money(dueTotal), unit: "BDT" },
      { id: "expense", label: "Operating Expense This Month", value: money(expenseTotal), unit: "BDT" },
      hasCapability(req, "view_sensitive_cost") ? { id: "stock", label: "Inventory Value", value: money(stockValue), unit: "BDT", sensitive: true } : { id: "stock", label: "Available Stock", value: stockUnits.toFixed(0), unit: "units" },
      { id: "imports", label: "Imports In Progress", value: String(importsInProgress.length), unit: "cases" }
    ],
    "Managing Director": [
      { id: "sales", label: "Delivered Sales This Month", value: money(salesTotal), unit: "BDT" },
      { id: "collection", label: "Collections This Month", value: money(collectionTotal), unit: "BDT" },
      { id: "due", label: "Outstanding Receivable", value: money(dueTotal), unit: "BDT" },
      { id: "expense", label: "Operating Expense This Month", value: money(expenseTotal), unit: "BDT" },
      { id: "stock", label: "Available Stock", value: stockUnits.toFixed(0), unit: "units" },
      { id: "imports", label: "Imports In Progress", value: String(importsInProgress.length), unit: "cases" }
    ],
    Accounts: [
      { id: "sales", label: "Delivered Sales This Month", value: money(salesTotal), unit: "BDT" },
      { id: "collection", label: "Collections This Month", value: money(collectionTotal), unit: "BDT" },
      { id: "due", label: "Outstanding Receivable", value: money(dueTotal), unit: "BDT" },
      { id: "expense", label: "Operating Expense This Month", value: money(expenseTotal), unit: "BDT" },
      { id: "accounts", label: "Cash / Bank Position", value: money(accountBalance), unit: "BDT" }
    ],
    "Import Officer": [
      { id: "imports", label: "Imports In Progress", value: String(importsInProgress.length), unit: "cases" },
      { id: "pi", label: "Awaiting PI", value: String(imports.filter((item) => item.status === "Draft").length), unit: "cases" },
      { id: "shipment", label: "Shipped / At Port", value: String(imports.filter((item) => ["Shipped", "At Port"].includes(item.status)).length), unit: "cases" },
      { id: "costing", label: "Awaiting Cost Finalization", value: String(imports.filter((item) => item.status === "Costing").length), unit: "cases" },
      { id: "receiving", label: "Ready for Warehouse", value: String(readyToReceive.length), unit: "cases" }
    ],
    "Warehouse Manager": [
      { id: "stock", label: "Available Stock", value: stockUnits.toFixed(0), unit: "units" },
      { id: "batches", label: "Tracked Batches", value: String(stockBatches.length), unit: "batches" },
      { id: "expiry", label: "Expiry Attention", value: String(expiryAttention.length), unit: "batches" },
      { id: "receiving", label: "Imports Ready to Receive", value: String(readyToReceive.length), unit: "cases" },
      { id: "dispatch", label: "Dispatches This Month", value: String(dispatchCount), unit: "challans" }
    ],
    "Sales Manager": [
      { id: "sales", label: "Delivered Sales This Month", value: money(salesTotal), unit: "BDT" },
      { id: "collection", label: "Collections This Month", value: money(collectionTotal), unit: "BDT" },
      { id: "due", label: "Outstanding Receivable", value: money(dueTotal), unit: "BDT" },
      { id: "pipeline", label: "Open Order Pipeline", value: money(orderPipeline), unit: "BDT" },
      { id: "quotes", label: "Open Quotations", value: String(openQuotes.length), unit: "quotes" },
      { id: "stock", label: "Available Stock", value: stockUnits.toFixed(0), unit: "units" }
    ],
    "Sales Executive": [
      { id: "sales", label: "My Delivered Sales This Month", value: money(salesTotal), unit: "BDT" },
      { id: "collection", label: "My Collections This Month", value: money(collectionTotal), unit: "BDT" },
      { id: "due", label: "My Customer Receivable", value: money(dueTotal), unit: "BDT" },
      { id: "pipeline", label: "My Open Order Pipeline", value: money(orderPipeline), unit: "BDT" },
      { id: "quotes", label: "My Open Quotations", value: String(openQuotes.length), unit: "quotes" }
    ]
  };
  const salesVisibility = financial || ["Accounts", "Sales Manager", "Sales Executive"].includes(user.role);
  const expiryVisibility = financial || ["Warehouse Manager", "Sales Manager"].includes(user.role);
  res.json(ok({
    role: user.role,
    metrics: metricsByRole[user.role],
    importAttention: areaRoles.imports.includes(user.role) ? imports.filter((item) => ["Draft", "PI Received", "At Port", "Costing", "Cost Finalized", "Partially Received"].includes(item.status)).map((item) => importForRole(item, req)) : [],
    expiryAlerts: expiryVisibility ? expiryAttention.map((batch) => visibleBatch(batch, req)) : [],
    customerDues: salesVisibility ? visibleCustomers.filter((customer) => decimal(customer.currentDue).gt(0)).sort((a, b) => decimal(b.currentDue).comparedTo(a.currentDue)).slice(0, 5) : [],
    recentSales: salesVisibility ? visibleOrders.slice(0, 5) : [],
    recentCollections: salesVisibility ? visibleCollections.slice(0, 5) : [],
    recentExpenses: financial || user.role === "Accounts" ? expenses.filter((expense) => expense.status === "Posted").slice(0, 5) : []
  }, "Dashboard loaded"));
});

app.get("/api/products", (req, res) => {
  if (!requireUser(req, res)) return;
  res.json(ok(products, "Products loaded", { total: products.length }));
});
app.post("/api/products", (req, res) => {
  const user = requireUser(req, res);
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Product creation is restricted.") : undefined;
  const product = { ...req.body, id: id("prd") };
  products.unshift(product);
  audit(req, "Product created", "Product", product.id, `${product.name} added to canonical product master.`);
  res.status(201).json(ok(product, "Product created"));
});
app.patch("/api/products/:productId", (req, res) => {
  const user = requireUser(req, res);
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Product editing is restricted.") : undefined;
  const index = products.findIndex((product) => product.id === req.params.productId);
  if (index < 0) return fail(res, 404, "Product not found");
  products[index] = { ...products[index], ...req.body, id: products[index].id };
  audit(req, "Product updated", "Product", products[index].id, `${products[index].name} canonical data updated.`);
  res.json(ok(products[index], "Product updated"));
});
app.delete("/api/products/:productId", (req, res) => {
  const user = requireUser(req, res);
  if (!user || user.role !== "Super Admin") return user ? fail(res, 403, "Only Super Admin can delete products.") : undefined;
  const index = products.findIndex((product) => product.id === req.params.productId);
  if (index < 0) return fail(res, 404, "Product not found");
  const product = products[index];
  const referenced = imports.some((record) => record.items.some((item) => item.productId === product.id)) || orders.some((order) => order.lines.some((line) => line.productId === product.id)) || stockBatches.some((batch) => batch.productId === product.id);
  if (referenced) return fail(res, 409, "Referenced products cannot be deleted; mark the product inactive.");
  products.splice(index, 1);
  audit(req, "Product deleted", "Product", product.id, `${product.name} removed before use.`);
  res.json(ok({ id: product.id }, "Product deleted"));
});

app.get("/api/suppliers", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  res.json(ok(suppliers, "Suppliers loaded", { total: suppliers.length }));
});
app.post("/api/suppliers", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Supplier creation is restricted.") : undefined;
  const supplier = { ...req.body, id: id("sup"), active: true };
  suppliers.unshift(supplier);
  audit(req, "Supplier created", "Supplier", supplier.id, `${supplier.name} added.`);
  res.status(201).json(ok(supplier, "Supplier created"));
});
app.patch("/api/suppliers/:supplierId", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Supplier editing is restricted.") : undefined;
  const index = suppliers.findIndex((supplier) => supplier.id === req.params.supplierId);
  if (index < 0) return fail(res, 404, "Supplier not found");
  suppliers[index] = { ...suppliers[index], ...req.body, id: suppliers[index].id };
  audit(req, "Supplier updated", "Supplier", suppliers[index].id, `${suppliers[index].name} updated.`);
  res.json(ok(suppliers[index], "Supplier updated"));
});
app.delete("/api/suppliers/:supplierId", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || user.role !== "Super Admin") return user ? fail(res, 403, "Only Super Admin can delete suppliers.") : undefined;
  const index = suppliers.findIndex((supplier) => supplier.id === req.params.supplierId);
  if (index < 0) return fail(res, 404, "Supplier not found");
  const supplier = suppliers[index];
  if (imports.some((record) => record.supplierId === supplier.id)) return fail(res, 409, "Referenced suppliers cannot be deleted; mark the supplier inactive.");
  suppliers.splice(index, 1);
  audit(req, "Supplier deleted", "Supplier", supplier.id, `${supplier.name} removed before use.`);
  res.json(ok({ id: supplier.id }, "Supplier deleted"));
});

app.get("/api/imports", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  res.json(ok(imports.map((record) => importForRole(record, req)), "Imports loaded", { total: imports.length }));
});
app.post("/api/imports", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Import creation is restricted.") : undefined;
  const supplier = suppliers.find((entry) => entry.id === req.body.supplierId);
  if (!supplier || !String(req.body.poNumber ?? "").trim() || !req.body.poDate) return fail(res, 422, "Supplier, PO number and PO date are required.");
  if (!Array.isArray(req.body.items) || !req.body.items.length) return fail(res, 422, "Add at least one product line to the draft import.");
  let items: ImportItem[];
  try {
    items = req.body.items.map((item: Partial<ImportItem>) => normalizeImportItem(item));
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Import item values are invalid.");
  }
  const now = new Date().toISOString();
  const record: ImportCase = {
    ...req.body,
    id: id("imp"),
    draftReference: nextReference("IMP", imports.length),
    primaryReference: "",
    supplierId: supplier.id,
    supplierName: supplier.name,
    paymentMode: req.body.paymentMode ?? "Pending",
    piNumber: req.body.piNumber || undefined,
    piDate: req.body.piDate || undefined,
    currency: req.body.currency ?? "USD",
    exchangeRate: String(req.body.exchangeRate ?? "0"),
    rateDate: req.body.rateDate ?? "",
    rateSource: req.body.rateSource ?? "Pending",
    status: "Draft",
    milestone: "Draft",
    costingStatus: "Not Started",
    warehouseStatus: "Not Ready",
    items,
    costs: [],
    documents: [],
    createdAt: now,
    updatedAt: now
  };
  deriveImportStatus(record);
  imports.unshift(record);
  audit(req, "Import created", "Import", record.id, `${record.draftReference} created for ${record.supplierName}.`);
  res.status(201).json(ok(importForRole(record, req), "Import created"));
});
app.get("/api/imports/:importId", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  res.json(ok(importForRole(record, req), "Import loaded"));
});
app.delete("/api/imports/:importId", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Import deletion is restricted.") : undefined;
  const index = imports.findIndex((item) => item.id === req.params.importId);
  if (index < 0) return fail(res, 404, "Import not found");
  const record = imports[index];
  if (record.snapshot || receipts.some((receipt) => receipt.importId === record.id) || !["Draft", "PI Received", "Cancelled"].includes(record.status)) {
    return fail(res, 409, "Only unreceived draft, PI-received or cancelled imports can be deleted.");
  }
  imports.splice(index, 1);
  audit(req, "Import deleted", "Import", record.id, `${record.primaryReference} removed before financial or warehouse posting.`);
  res.json(ok({ id: record.id }, "Import deleted"));
});
app.patch("/api/imports/:importId", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Import editing is restricted.") : undefined;
  const index = imports.findIndex((item) => item.id === req.params.importId);
  if (index < 0) return fail(res, 404, "Import not found");
  if (terminalImportLocked(imports[index], res)) return;
  if (imports[index].snapshot) return fail(res, 423, "Finalized cost records are locked. Reopen with a reason first.");
  if (req.body.status !== undefined || req.body.milestone !== undefined || req.body.costingStatus !== undefined || req.body.warehouseStatus !== undefined) {
    return fail(res, 422, "Workflow status is derived from recorded actions and cannot be patched directly.");
  }
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => !protectedImportFields.has(key)));
  const proposedLc = String(updates.lcNumber ?? imports[index].lcNumber ?? "").trim();
  if (proposedLc && imports.some((entry, entryIndex) => entryIndex !== index && entry.lcNumber?.trim().toLowerCase() === proposedLc.toLowerCase())) {
    return fail(res, 409, `LC number ${proposedLc} is already assigned to another import case.`);
  }
  imports[index] = { ...imports[index], ...updates, id: imports[index].id };
  deriveImportStatus(imports[index]);
  audit(req, "Import updated", "Import", imports[index].id, `${imports[index].primaryReference} commercial or shipment information updated.`);
  res.json(ok(importForRole(imports[index], req), "Import updated"));
});

app.post("/api/imports/:importId/transition", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Import milestone updates are restricted.") : undefined;
  const record = imports.find((entry) => entry.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  const target = String(req.body?.status ?? "") as ImportStatus;
  if (target === "Closed") {
    if (record.status !== "Received") return fail(res, 409, "Only a fully received import case can be closed.");
    record.status = "Closed";
    record.milestone = "Closed";
    record.updatedAt = new Date().toISOString();
    audit(req, "Import case closed", "Import", record.id, `${record.primaryReference} closed after complete warehouse receiving.`);
    return res.json(ok(importForRole(record, req), "Import case closed"));
  }
  if (target === "Cancelled") {
    const cancellable: ImportStatus[] = ["Draft", "PI Received", "LC/TT Opened", "In Production", "Shipped", "At Port", "Costing"];
    if (record.snapshot || receipts.some((entry) => entry.importId === record.id)) return fail(res, 423, "Finalized or received imports cannot be cancelled.");
    if (!cancellable.includes(record.status)) return fail(res, 409, `Cannot cancel an import in ${record.status} status.`);
    record.status = "Cancelled";
    record.milestone = "Cancelled";
    record.updatedAt = new Date().toISOString();
    audit(req, "Import case cancelled", "Import", record.id, `${record.primaryReference} cancelled before financial or warehouse posting.`);
    return res.json(ok(importForRole(record, req), "Import case cancelled"));
  }
  if (terminalImportLocked(record, res)) return;
  if (record.snapshot || receipts.some((entry) => entry.importId === record.id)) return fail(res, 423, "Finalized or received imports cannot use operational milestone transitions.");
  const allowed: Partial<Record<ImportStatus, ImportStatus[]>> = {
    "LC/TT Opened": ["In Production"],
    "In Production": ["Shipped"],
    Shipped: ["At Port"]
  };
  if (!(allowed[record.status] ?? []).includes(target)) return fail(res, 409, `Cannot move ${record.status} directly to ${target}. Complete the preceding business action first.`);
  record.status = target;
  record.milestone = target;
  record.updatedAt = new Date().toISOString();
  audit(req, "Import milestone advanced", "Import", record.id, `${record.primaryReference}: ${target}.`);
  res.json(ok(importForRole(record, req), `Import moved to ${target}`));
});

app.post("/api/imports/:importId/items", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Import item creation is restricted.") : undefined;
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  if (terminalImportLocked(record, res)) return;
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  let item: ImportItem;
  try {
    item = normalizeImportItem(req.body);
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Import item values are invalid.");
  }
  record.items.push(item);
  record.costingStatus = record.costs.length ? "In Progress" : "Not Started";
  record.updatedAt = new Date().toISOString();
  audit(req, "Import item added", "Import", record.id, `${item.productName} added to ${record.primaryReference}.`);
  res.status(201).json(ok(importForRole(record, req), "Import item added"));
});
app.patch("/api/imports/:importId/items/:itemId", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Import item editing is restricted.") : undefined;
  const record = imports.find((item) => item.id === req.params.importId);
  const index = record?.items.findIndex((item) => item.id === req.params.itemId) ?? -1;
  if (!record || index < 0) return fail(res, 404, "Import item not found");
  if (terminalImportLocked(record, res)) return;
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  try {
    record.items[index] = normalizeImportItem(req.body, record.items[index]);
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Import item values are invalid.");
  }
  record.updatedAt = new Date().toISOString();
  audit(req, "Import item updated", "Import", record.id, `${record.items[index].productName} values updated.`);
  res.json(ok(importForRole(record, req), "Import item updated"));
});
app.delete("/api/imports/:importId/items/:itemId", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Import item deletion is restricted.") : undefined;
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  if (terminalImportLocked(record, res)) return;
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  const existing = record.items.find((item) => item.id === req.params.itemId);
  if (!existing) return fail(res, 404, "Import item not found");
  record.items = record.items.filter((item) => item.id !== req.params.itemId);
  record.costs = record.costs.filter((cost) => !cost.appliesToItemIds.includes(req.params.itemId));
  audit(req, "Import item removed", "Import", record.id, `${existing.productName} removed before finalization.`);
  res.json(ok(importForRole(record, req), "Import item removed"));
});

app.post("/api/imports/:importId/costs", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  if (!hasCapability(req, "edit_sensitive_cost")) return fail(res, 403, "Sensitive cost editing requires owner permission.");
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  if (terminalImportLocked(record, res)) return;
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  const cost: ImportCostLine = { ...req.body, id: id("cost"), enteredBy: userFor(req)?.name ?? "Unknown", createdAt: new Date().toISOString() };
  if (!cost.allocationMethod) return fail(res, 422, "Select an allocation method explicitly.");
  try {
    const amount = requiredDecimal(cost.amountForeign, `${cost.name || "Cost"} amount`);
    const rate = cost.currency === "BDT" ? new Decimal(1) : requiredDecimal(cost.exchangeRate, `${cost.name || "Cost"} exchange rate`);
    cost.exchangeRate = precise(rate, 4);
    cost.amountBdt = money(amount.mul(rate));
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Cost values are invalid.");
  }
  record.costs.push(cost);
  record.status = "Costing";
  record.milestone = "Costing";
  record.costingStatus = "In Progress";
  record.updatedAt = new Date().toISOString();
  audit(req, "Cost line added", "Import", record.id, `${cost.name} added using ${cost.allocationMethod}.`);
  res.status(201).json(ok(record, "Cost added"));
});
app.patch("/api/imports/:importId/costs/:costId", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  if (!hasCapability(req, "edit_sensitive_cost")) return fail(res, 403, "Sensitive cost editing requires owner permission.");
  const record = imports.find((item) => item.id === req.params.importId);
  const index = record?.costs.findIndex((cost) => cost.id === req.params.costId) ?? -1;
  if (!record || index < 0) return fail(res, 404, "Cost line not found");
  if (terminalImportLocked(record, res)) return;
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  const cost: ImportCostLine = { ...record.costs[index], ...req.body, id: record.costs[index].id };
  try {
    const amount = requiredDecimal(cost.amountForeign, `${cost.name || "Cost"} amount`);
    const rate = cost.currency === "BDT" ? new Decimal(1) : requiredDecimal(cost.exchangeRate, `${cost.name || "Cost"} exchange rate`);
    cost.exchangeRate = precise(rate, 4);
    cost.amountBdt = money(amount.mul(rate));
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Cost values are invalid.");
  }
  record.costs[index] = cost;
  audit(req, "Cost line changed", "Import", record.id, `${cost.name} amount or allocation basis changed.`);
  res.json(ok(record, "Cost updated"));
});
app.delete("/api/imports/:importId/costs/:costId", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  if (!hasCapability(req, "edit_sensitive_cost")) return fail(res, 403, "Sensitive cost editing requires owner permission.");
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  if (terminalImportLocked(record, res)) return;
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  const cost = record.costs.find((item) => item.id === req.params.costId);
  if (!cost) return fail(res, 404, "Cost line not found");
  record.costs = record.costs.filter((item) => item.id !== cost.id);
  deriveImportStatus(record);
  audit(req, "Cost line removed", "Import", record.id, `${cost.name} removed before finalization.`);
  res.json(ok(record, "Cost removed"));
});
app.post("/api/imports/:importId/documents", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user) return;
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  if (terminalImportLocked(record, res)) return;
  const document: ImportDocument = { id: id("doc"), importId: record.id, type: req.body.type, name: req.body.name, uploadedAt: new Date().toISOString(), uploadedBy: user.name, status: "Available" };
  record.documents.push(document);
  audit(req, "Document attached", "Import", record.id, `${document.type}: ${document.name}`);
  res.status(201).json(ok(document, "Document metadata saved"));
});
app.post("/api/imports/:importId/cost-preview", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  if (!hasCapability(req, "view_sensitive_cost")) return fail(res, 403, "Landed-cost preview requires owner permission.");
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  res.json(ok(calculateLandedCost(record.id, record.items, record.costs), "Landed cost preview calculated"));
});
app.post("/api/imports/:importId/finalize", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  if (!hasCapability(req, "finalize_landed_cost")) return fail(res, 403, "Only the authorized owner can finalize landed cost.");
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  if (terminalImportLocked(record, res)) return;
  if (!record.piNumber?.trim()) return fail(res, 422, "Add the supplier PI before finalizing landed cost.");
  if (record.paymentMode === "Pending" || (record.paymentMode === "LC" && !record.lcNumber?.trim()) || (record.paymentMode === "TT" && !record.ttReference?.trim())) return fail(res, 422, "Record the LC number or TT reference before finalizing landed cost.");
  for (const item of record.items) {
    if (decimal(item.fobUnitForeign).lte(0) || decimal(item.exchangeRate).lte(0) || decimal(item.fobTotalBdt).lte(0)) return fail(res, 422, `${item.productName}: enter positive FOB and exchange-rate values before finalization.`);
  }
  const preview = calculateLandedCost(record.id, record.items, record.costs);
  if (preview.validationErrors.length) return fail(res, 422, preview.validationErrors.join(" "));
  const previousVersion = record.snapshotHistory?.at(-1)?.version ?? 0;
  record.snapshot = { ...preview, id: id("snapshot"), version: previousVersion + 1, finalizedAt: new Date().toISOString(), finalizedBy: userFor(req)?.name ?? "Owner", immutable: true };
  record.snapshotHistory = [...(record.snapshotHistory ?? []), structuredClone(record.snapshot)];
  record.status = "Cost Finalized";
  record.milestone = "Cost Finalized";
  record.costingStatus = "Finalized";
  record.warehouseStatus = "Ready";
  record.updatedAt = new Date().toISOString();
  audit(req, "Landed cost finalized", "Import", record.id, `${record.primaryReference} snapshot v${record.snapshot.version} finalized.`);
  res.json(ok(record, "Landed cost finalized"));
});
app.post("/api/imports/:importId/reopen", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  if (!hasCapability(req, "reopen_landed_cost")) return fail(res, 403, "Only the authorized owner can reopen landed cost.");
  const reason = String(req.body?.reason ?? "").trim();
  if (!reason) return fail(res, 422, "A reopening reason is required.");
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  if (receipts.some((receipt) => receipt.importId === record.id) || stockBatches.some((batch) => batch.sourceImportId === record.id)) {
    return fail(res, 409, "Landed cost cannot be reopened after warehouse receipt. A future valuation-adjustment workflow is required to preserve stock history.");
  }
  delete record.snapshot;
  record.status = "Costing";
  record.milestone = "Costing";
  record.costingStatus = "In Progress";
  record.warehouseStatus = "Not Ready";
  audit(req, "Landed cost reopened", "Import", record.id, `${record.primaryReference} reopened for correction.`, reason);
  res.json(ok(record, "Landed cost reopened"));
});

app.post("/api/imports/:importId/receive", (req, res) => {
  const user = requireArea(req, res, "inventory");
  if (!user || !["Super Admin", "Warehouse Manager"].includes(user.role)) return user ? fail(res, 403, "Warehouse receiving is restricted.") : undefined;
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  if (terminalImportLocked(record, res)) return;
  if (!record.snapshot) return fail(res, 409, "Finalize landed cost before warehouse receiving.");
  if (!Array.isArray(req.body?.lines) || !req.body.lines.length) return fail(res, 422, "Add at least one product receipt line.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(req.body.receivedDate ?? ""))) return fail(res, 422, "Enter a valid warehouse received date.");
  const receipt = req.body as WarehouseReceipt;
  const payloadBatchNumbers = new Set<string>();
  for (const line of receipt.lines) {
    const source = record.items.find((item) => item.id === line.importItemId);
    if (!source) return fail(res, 422, `${line.productName}: import item not found.`);
    let receivedQuantity: Decimal;
    let rejectedQuantity: Decimal;
    try {
      receivedQuantity = requiredDecimal(line.quantityReceived ?? "0", `${source.productName} received quantity`, { allowZero: true });
      rejectedQuantity = requiredDecimal(line.quantityRejected ?? "0", `${source.productName} rejected quantity`, { allowZero: true });
    } catch (error) {
      return fail(res, 422, error instanceof Error ? error.message : `${source.productName}: receipt quantities are invalid.`);
    }
    if (receivedQuantity.plus(rejectedQuantity).lte(0)) {
      return fail(res, 422, `${line.productName}: enter a received or rejected quantity.`);
    }
    line.quantityReceived = precise(receivedQuantity, 4);
    line.quantityRejected = precise(rejectedQuantity, 4);
    const previouslyProcessed = receipts
      .filter((entry) => entry.importId === record.id)
      .flatMap((entry) => entry.lines)
      .filter((entry) => entry.importItemId === line.importItemId)
      .reduce((sum, entry) => sum.plus(entry.quantityReceived).plus(entry.quantityRejected), new Decimal(0));
    if (previouslyProcessed.plus(receivedQuantity).plus(rejectedQuantity).gt(source.quantity)) {
      return fail(res, 422, `${line.productName}: total receipts and rejections exceed the imported quantity.`);
    }
    if (receivedQuantity.gt(0)) {
      if (!line.lotNumber?.trim() || !line.batchNumber?.trim() || !line.manufacturingDate || !line.expiryDate || !line.warehouse?.trim()) return fail(res, 422, `${source.productName}: lot, batch, manufacturing, expiry and warehouse are required for received stock.`);
      if (new Date(line.expiryDate) <= new Date(line.manufacturingDate)) return fail(res, 422, `${source.productName}: expiry must be after manufacturing date.`);
      const batchKey = line.batchNumber.trim().toLowerCase();
      if (payloadBatchNumbers.has(batchKey) || stockBatches.some((batch) => batch.batchNumber.trim().toLowerCase() === batchKey)) return fail(res, 409, `${source.productName}: batch number ${line.batchNumber} already exists.`);
      payloadBatchNumbers.add(batchKey);
    }
  }
  const postedLines = receipt.lines.map((line) => {
    const source = record.items.find((item) => item.id === line.importItemId)!;
    const result = record.snapshot!.products.find((product) => product.importItemId === line.importItemId);
    return {
      ...line,
      productId: source.productId,
      productName: source.productName,
      landedCostPerUnit: result?.finalPerUnitBdt ?? "0.00"
    };
  });
  const posted: WarehouseReceipt = { ...receipt, lines: postedLines, id: id("grn"), importId: record.id, reference: record.primaryReference, status: "Posted", receivedBy: user.name };
  receipts.unshift(posted);
  for (const line of posted.lines) {
    if (decimal(line.quantityReceived).eq(0)) continue;
    const item = record.items.find((entry) => entry.id === line.importItemId)!;
    const batch: StockBatch = { id: id("batch"), productId: line.productId, productCode: item.productCode, productName: line.productName, sourceImportId: record.id, sourceReference: record.primaryReference, sourceType: "Import Receipt", lotNumber: line.lotNumber, batchNumber: line.batchNumber, manufacturingDate: line.manufacturingDate, expiryDate: line.expiryDate, receivedDate: posted.receivedDate, quantityReceived: line.quantityReceived, quantityAvailable: line.quantityReceived, warehouse: line.warehouse, location: line.location, landedCostPerUnit: line.landedCostPerUnit };
    stockBatches.unshift(batch);
    stockMovements.unshift({ id: id("mov"), date: posted.receivedDate, productId: batch.productId, productName: batch.productName, batchId: batch.id, batchNumber: batch.batchNumber, type: "Receive", quantity: batch.quantityReceived, reference: record.primaryReference, createdBy: user.name });
  }
  const processedByItem = new Map<string, Decimal>();
  for (const existingReceipt of receipts.filter((entry) => entry.importId === record.id)) {
    for (const line of existingReceipt.lines) {
      processedByItem.set(
        line.importItemId,
        (processedByItem.get(line.importItemId) ?? new Decimal(0)).plus(line.quantityReceived).plus(line.quantityRejected)
      );
    }
  }
  const complete = record.items.every((item) => (processedByItem.get(item.id) ?? new Decimal(0)).gte(item.quantity));
  record.status = complete ? "Received" : "Partially Received";
  record.milestone = record.status;
  record.warehouseStatus = complete ? "Received" : "Partially Received";
  audit(req, "Warehouse receipt posted", "Import", record.id, `${posted.id} received ${posted.lines.length} product batch(es).`);
  res.status(201).json(ok(posted, "Warehouse receipt posted"));
});

app.get("/api/imports/:importId/receipts", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  const visible = receipts.filter((receipt) => receipt.importId === record.id).map((receipt) => {
    if (hasCapability(req, "view_sensitive_cost")) return receipt;
    return { ...receipt, lines: receipt.lines.map((line) => ({ ...line, landedCostPerUnit: "0.00" })) };
  });
  res.json(ok(visible, "Warehouse receipts loaded"));
});

app.get("/api/inventory/stock", (req, res) => {
  if (!requireArea(req, res, "inventory")) return;
  const grouped = products.map((product) => {
    const batches = stockBatches.filter((batch) => batch.productId === product.id && decimal(batch.quantityAvailable).gt(0));
    const available = batches.reduce((sum, batch) => sum.plus(batch.quantityAvailable), new Decimal(0));
    const oldest = [...batches].sort((a, b) => a.receivedDate.localeCompare(b.receivedDate))[0];
    const nearest = [...batches].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))[0];
    const valuation = batches.reduce((sum, batch) => sum.plus(decimal(batch.quantityAvailable).mul(batch.landedCostPerUnit)), new Decimal(0));
    return { productId: product.id, productCode: product.code, productName: product.name, imageUrl: product.imageUrl, availableQuantity: available.toFixed(0), oldestLot: oldest?.lotNumber ?? "-", nearestExpiry: nearest?.expiryDate ?? "-", standardSalePrice: product.standardSalePrice, inventoryValue: hasCapability(req, "view_sensitive_cost") ? money(valuation) : undefined };
  }).filter((row) => decimal(row.availableQuantity).gt(0));
  res.json(ok(grouped, "Stock summary loaded", { total: grouped.length }));
});
app.get("/api/inventory/batches", (req, res) => {
  if (!requireArea(req, res, "inventory")) return;
  res.json(ok(stockBatches.map((batch) => visibleBatch(batch, req)), "Batches loaded", { total: stockBatches.length }));
});
app.get("/api/inventory/movements", (req, res) => {
  if (!requireArea(req, res, "inventory")) return;
  res.json(ok(stockMovements, "Movements loaded", { total: stockMovements.length }));
});
app.post("/api/inventory/dispatch-preview", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  try {
    const preview = fifoAllocation(req.body.productId, req.body.quantity, req.body.date ?? businessDate(), req.body.batchId);
    res.json(ok(preview, "FIFO dispatch plan loaded"));
  } catch (error) {
    fail(res, 422, error instanceof Error ? error.message : "Stock cannot fulfill this dispatch.");
  }
});

app.get("/api/customers", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  const rows = customerScoped(req);
  res.json(ok(rows, "Customers loaded", { total: rows.length, scoped: rows.length !== customers.length }));
});
app.get("/api/customers/:customerId/ledger", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  if (!ownsCustomer(req, req.params.customerId)) return fail(res, 403, "This customer ledger is outside your assigned records.");
  const ledger = customerLedger(req.params.customerId);
  if (!ledger) return fail(res, 404, "Customer not found");
  res.json(ok(ledger, "Customer transaction ledger loaded"));
});
app.post("/api/customers", (req, res) => {
  const user = requireArea(req, res, "sales");
  if (!user) return;
  const customer = { ...req.body, id: id("cus"), assignedSalesUserId: user.role === "Sales Executive" ? user.id : req.body.assignedSalesUserId, currentDue: "0.00", totalSales: "0.00", totalCollected: "0.00", active: true };
  customers.unshift(customer);
  audit(req, "Customer created", "Customer", customer.id, `${customer.name} added.`);
  res.status(201).json(ok(customer, "Customer created"));
});
app.patch("/api/customers/:customerId", (req, res) => {
  const user = requireArea(req, res, "sales");
  if (!user) return;
  const index = customers.findIndex((customer) => customer.id === req.params.customerId);
  if (index < 0) return fail(res, 404, "Customer not found");
  if (user.role === "Sales Executive" && customers[index].assignedSalesUserId !== user.id) return fail(res, 403, "You can edit only your assigned customers.");
  customers[index] = { ...customers[index], ...req.body, id: customers[index].id, assignedSalesUserId: user.role === "Sales Executive" ? user.id : req.body.assignedSalesUserId ?? customers[index].assignedSalesUserId, currentDue: customers[index].currentDue, totalSales: customers[index].totalSales, totalCollected: customers[index].totalCollected };
  audit(req, "Customer updated", "Customer", customers[index].id, `${customers[index].name} details updated.`);
  res.json(ok(customers[index], "Customer updated"));
});
app.delete("/api/customers/:customerId", (req, res) => {
  const user = requireArea(req, res, "sales");
  if (!user || !["Super Admin", "Sales Manager"].includes(user.role)) return user ? fail(res, 403, "Customer deletion is restricted.") : undefined;
  const index = customers.findIndex((customer) => customer.id === req.params.customerId);
  if (index < 0) return fail(res, 404, "Customer not found");
  const customer = customers[index];
  if (decimal(customer.currentDue).gt(0) || orders.some((order) => order.customerId === customer.id)) return fail(res, 409, "Customers with dues or sales history cannot be deleted; mark them inactive instead.");
  customers.splice(index, 1);
  audit(req, "Customer deleted", "Customer", customer.id, `${customer.name} removed before transactions.`);
  res.json(ok({ id: customer.id }, "Customer deleted"));
});

app.get("/api/quotations", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  res.json(ok(salesScoped(quotations, req), "Quotations loaded"));
});
app.post("/api/quotations", (req, res) => {
  const user = requireArea(req, res, "sales");
  if (!user || !["Super Admin", "Sales Manager", "Sales Executive"].includes(user.role)) return user ? fail(res, 403, "Quotation creation is restricted.") : undefined;
  if (!ownsCustomer(req, req.body.customerId)) return fail(res, 403, "You can create quotations only for customers assigned to you.");
  const customer = customers.find((entry) => entry.id === req.body.customerId)!;
  let lines;
  try {
    lines = normalizeSalesLines(req.body.lines);
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Quotation lines are invalid.");
  }
  const subtotal = lines.reduce((sum, line) => sum.plus(decimal(line.quantity).mul(line.unitPrice)), new Decimal(0));
  const discount = lines.reduce((sum, line) => sum.plus(line.discount), new Decimal(0));
  const quote: Quotation = { ...req.body, id: id("quo"), quotationNumber: nextReference("QT", quotations.length), customerId: customer.id, customerName: customer.name, customerAddressSnapshot: customer.address, customerPhoneSnapshot: customer.phone, customerContactSnapshot: customer.contactPerson, ownerId: user.role === "Sales Executive" ? user.id : req.body.ownerId ?? user.id, lines, subtotal: money(subtotal), discountTotal: money(discount), total: money(subtotal.minus(discount)), status: "Draft" };
  quotations.unshift(quote);
  audit(req, "Quotation created", "Quotation", quote.id, `${quote.quotationNumber} created for ${quote.customerName}.`);
  res.status(201).json(ok(quote, "Quotation created"));
});
app.patch("/api/quotations/:quoteId", (req, res) => {
  const user = requireArea(req, res, "sales");
  if (!user) return;
  const index = quotations.findIndex((quote) => quote.id === req.params.quoteId);
  if (index < 0) return fail(res, 404, "Quotation not found");
  if (user.role === "Sales Executive" && quotations[index].ownerId !== user.id) return fail(res, 403, "You can edit only your own quotations.");
  const nextCustomerId = req.body.customerId ?? quotations[index].customerId;
  if (!ownsCustomer(req, nextCustomerId)) return fail(res, 403, "The selected customer is outside your assigned records.");
  if (["Converted", "Rejected"].includes(quotations[index].status)) return fail(res, 423, "Finalized quotation is locked.");
  const customer = customers.find((entry) => entry.id === nextCustomerId)!;
  let lines;
  try {
    lines = normalizeSalesLines(req.body.lines ?? quotations[index].lines);
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Quotation lines are invalid.");
  }
  quotations[index] = { ...quotations[index], ...req.body, id: quotations[index].id, quotationNumber: quotations[index].quotationNumber, ownerId: quotations[index].ownerId, customerId: customer.id, customerName: customer.name, customerAddressSnapshot: customer.address, customerPhoneSnapshot: customer.phone, customerContactSnapshot: customer.contactPerson, lines };
  const subtotal = lines.reduce((sum, line) => sum.plus(decimal(line.quantity).mul(line.unitPrice)), new Decimal(0));
  const discount = lines.reduce((sum, line) => sum.plus(line.discount), new Decimal(0));
  quotations[index].subtotal = money(subtotal);
  quotations[index].discountTotal = money(discount);
  quotations[index].total = money(subtotal.minus(discount));
  audit(req, "Quotation updated", "Quotation", quotations[index].id, `${quotations[index].quotationNumber} updated.`);
  res.json(ok(quotations[index], "Quotation updated"));
});
app.delete("/api/quotations/:quoteId", (req, res) => {
  const user = requireArea(req, res, "sales");
  if (!user) return;
  const index = quotations.findIndex((quote) => quote.id === req.params.quoteId);
  if (index < 0) return fail(res, 404, "Quotation not found");
  const quote = quotations[index];
  if (user.role === "Sales Executive" && quote.ownerId !== user.id) return fail(res, 403, "You can delete only your own quotations.");
  if (!["Draft", "Rejected"].includes(quote.status)) return fail(res, 409, "Only draft or rejected quotations can be deleted.");
  quotations.splice(index, 1);
  audit(req, "Quotation deleted", "Quotation", quote.id, `${quote.quotationNumber} removed before conversion.`);
  res.json(ok({ id: quote.id }, "Quotation deleted"));
});
app.post("/api/quotations/:quoteId/convert", (req, res) => {
  const user = requireArea(req, res, "sales");
  if (!user) return;
  const quote = quotations.find((item) => item.id === req.params.quoteId);
  if (!quote) return fail(res, 404, "Quotation not found");
  if (user.role === "Sales Executive" && quote.ownerId !== user.id) return fail(res, 403, "You can convert only your own quotation.");
  if (!ownsCustomer(req, quote.customerId)) return fail(res, 403, "The quotation customer is outside your assigned records.");
  if (quote.status === "Converted") return fail(res, 409, "Quotation has already been converted.");
  quote.status = "Converted";
  const order: SalesOrder = { id: id("order"), orderNumber: nextReference("SO", orders.length), quotationId: quote.id, date: businessDate(), customerId: quote.customerId, customerName: quote.customerName, customerAddressSnapshot: quote.customerAddressSnapshot, customerPhoneSnapshot: quote.customerPhoneSnapshot, customerContactSnapshot: quote.customerContactSnapshot, ownerId: quote.ownerId, paymentConditions: quote.paymentTerms, deliveryInstruction: req.body?.deliveryInstruction ?? "Confirm with customer before dispatch", requestedDeliveryDate: req.body?.requestedDeliveryDate, orderReceivedByName: req.body?.orderReceivedByName, orderReceivedByDesignation: req.body?.orderReceivedByDesignation, orderGivenBy: req.body?.orderGivenBy, paymentConfirmation: req.body?.paymentConfirmation, paymentReference: req.body?.paymentReference, paymentDate: req.body?.paymentDate, headOfSalesSignoff: req.body?.headOfSalesSignoff, coeSignoff: req.body?.coeSignoff, mdSignoff: req.body?.mdSignoff, amountReceived: "0.00", due: "0.00", status: "Placed", lines: structuredClone(quote.lines), total: quote.total };
  orders.unshift(order);
  audit(req, "Quotation converted", "SalesOrder", order.id, `${quote.quotationNumber} converted to ${order.orderNumber}.`);
  res.status(201).json(ok(order, "Quotation converted to order"));
});

app.get("/api/orders", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  res.json(ok(salesScoped(orders, req), "Orders loaded"));
});
app.patch("/api/orders/:orderId", (req, res) => {
  const user = requireArea(req, res, "sales");
  if (!user) return;
  const order = orders.find((entry) => entry.id === req.params.orderId);
  if (!order) return fail(res, 404, "Sales order not found");
  if (user.role === "Sales Executive" && order.ownerId !== user.id) return fail(res, 403, "You can update only your own order details.");
  if (!["Super Admin", "Sales Manager", "Sales Executive"].includes(user.role)) return fail(res, 403, "Order receiving details are restricted.");
  const allowed = ["deliveryInstruction", "paymentConditions", "paymentConfirmation", "paymentReference", "paymentDate", "requestedDeliveryDate", "orderReceivedByName", "orderReceivedByDesignation", "orderGivenBy", "headOfSalesSignoff", "coeSignoff", "mdSignoff"] as const;
  for (const key of allowed) if (req.body[key] !== undefined) order[key] = String(req.body[key]);
  audit(req, "Order receiving details updated", "SalesOrder", order.id, `${order.orderNumber} office and payment details updated.`);
  res.json(ok(order, "Order receiving details updated"));
});

app.post("/api/sales/profit-preview", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  if (!hasCapability(req, "view_profit")) return fail(res, 403, "Profit and landed-cost preview is restricted to authorized ownership roles.");
  let lines;
  try {
    lines = normalizeSalesLines(req.body.lines);
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Sales lines are invalid.");
  }
  try {
    const previewLines = lines.map((line) => {
      const plan = fifoAllocation(line.productId, line.quantity, businessDate());
      const expectedCogs = plan.allocations.reduce((sum, allocation) => {
        const batch = stockBatches.find((entry) => entry.id === allocation.batchId)!;
        return sum.plus(decimal(allocation.quantity).mul(batch.landedCostPerUnit));
      }, new Decimal(0));
      const quantity = decimal(line.quantity);
      const revenue = decimal(line.lineTotal);
      const effectiveUnitPrice = revenue.div(quantity);
      const expectedCostPerUnit = expectedCogs.div(quantity);
      const profit = revenue.minus(expectedCogs);
      const profitPerUnit = profit.div(quantity);
      return { productId: line.productId, productCode: line.productCode, productName: line.productName, quantity: line.quantity, proposedUnitPrice: line.unitPrice, effectiveUnitPrice: money(effectiveUnitPrice), expectedCostPerUnit: money(expectedCostPerUnit), grossProfitPerUnit: money(profitPerUnit), grossProfitTotal: money(profit), marginPercent: precise(revenue.eq(0) ? 0 : profit.div(revenue).mul(100), 2), stockCoverage: line.quantity, isLoss: profit.lt(0) };
    });
    const revenue = previewLines.reduce((sum, line) => sum.plus(decimal(line.effectiveUnitPrice).mul(line.quantity)), new Decimal(0));
    const expectedCogs = previewLines.reduce((sum, line) => sum.plus(decimal(line.expectedCostPerUnit).mul(line.quantity)), new Decimal(0));
    const grossProfit = revenue.minus(expectedCogs);
    const result: ProfitPreview = { lines: previewLines, revenue: money(revenue), expectedCogs: money(expectedCogs), grossProfit: money(grossProfit), marginPercent: precise(revenue.eq(0) ? 0 : grossProfit.div(revenue).mul(100), 2) };
    res.json(ok(result, "Owner-only FIFO cost and profit preview calculated"));
  } catch (error) {
    fail(res, 422, error instanceof Error ? error.message : "Profit preview could not be calculated.");
  }
});
app.get("/api/deliveries", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  const visibleOrders = new Set(salesScoped(orders, req).map((order) => order.id));
  res.json(ok(userFor(req)?.role === "Sales Executive" ? deliveries.filter((delivery) => visibleOrders.has(delivery.orderId)) : deliveries, "Deliveries loaded"));
});
app.post("/api/deliveries", (req, res) => {
  const user = requireArea(req, res, "sales");
  if (!user || !["Super Admin", "Warehouse Manager", "Sales Manager"].includes(user.role)) return user ? fail(res, 403, "Only warehouse or sales management can dispatch stock.") : undefined;
  const payload = req.body as Delivery;
  const order = orders.find((item) => item.id === payload.orderId);
  if (!order) return fail(res, 404, "Sales order not found");
  let usedOverride = false;
  const plannedLines: Delivery["lines"] = [];
  for (const requested of payload.lines ?? []) {
    if (decimal(requested.quantity).lte(0)) return fail(res, 422, `${requested.productName}: delivery quantity must be greater than zero.`);
    const ordered = order.lines.find((entry) => entry.productId === requested.productId);
    if (!ordered) return fail(res, 422, `${requested.productName}: product is not on the selected order.`);
    const alreadyDelivered = deliveries
      .filter((delivery) => delivery.orderId === order.id)
      .flatMap((delivery) => delivery.lines)
      .filter((entry) => entry.productId === requested.productId)
      .reduce((sum, entry) => sum.plus(entry.quantity), new Decimal(0));
    if (alreadyDelivered.plus(requested.quantity).gt(ordered.quantity)) return fail(res, 422, `${requested.productName}: delivery exceeds the remaining ordered quantity.`);
    let plan;
    try {
      plan = fifoAllocation(requested.productId, requested.quantity, payload.date, requested.batchId);
    } catch (error) {
      return fail(res, 422, error instanceof Error ? `${requested.productName}: ${error.message}` : `${requested.productName}: stock allocation failed.`);
    }
    if (plan.requiresOverride) {
      if (!hasCapability(req, "approve_stock_override") || !payload.overrideReason?.trim()) return fail(res, 409, plan.warning ?? "Authorized FIFO override and reason are required.");
      usedOverride = true;
    }
    const discountPerUnit = decimal(ordered.discount).div(ordered.quantity);
    for (const allocation of plan.allocations) {
      const allocatedDiscount = discountPerUnit.mul(allocation.quantity);
      plannedLines.push({ ...ordered, id: id("delivery-line"), quantity: allocation.quantity, discount: money(allocatedDiscount), lineTotal: money(decimal(allocation.quantity).mul(ordered.unitPrice).minus(allocatedDiscount)), batchId: allocation.batchId, batchNumber: allocation.batchNumber });
    }
  }
  if (!plannedLines.length) return fail(res, 422, "Enter at least one delivery quantity.");
  const delivery: Delivery = { ...payload, lines: plannedLines, id: id("delivery"), challanNumber: nextReference("DC", deliveries.length), status: "Dispatched", customerId: order.customerId, customerName: order.customerName };
  deliveries.unshift(delivery);
  for (const line of delivery.lines) {
    const batch = stockBatches.find((entry) => entry.id === line.batchId)!;
    batch.quantityAvailable = money(decimal(batch.quantityAvailable).minus(line.quantity));
    stockMovements.unshift({ id: id("mov"), date: delivery.date, productId: line.productId, productName: line.productName, batchId: batch.id, batchNumber: batch.batchNumber, type: "Dispatch", quantity: line.quantity, reference: delivery.challanNumber, reason: usedOverride ? delivery.overrideReason : undefined, createdBy: user.name });
  }
  const deliveredValue = delivery.lines.reduce((sum, line) => sum.plus(decimal(line.quantity).mul(line.unitPrice).minus(line.discount)), new Decimal(0));
  const customer = customers.find((entry) => entry.id === order.customerId);
  if (customer) {
    customer.currentDue = money(decimal(customer.currentDue).plus(deliveredValue));
    customer.totalSales = money(decimal(customer.totalSales).plus(deliveredValue));
  }
  order.due = money(decimal(order.due).plus(deliveredValue));
  const deliveredByProduct = new Map<string, Decimal>();
  for (const postedDelivery of deliveries.filter((entry) => entry.orderId === order.id)) {
    for (const line of postedDelivery.lines) deliveredByProduct.set(line.productId, (deliveredByProduct.get(line.productId) ?? new Decimal(0)).plus(line.quantity));
  }
  order.status = order.lines.every((line) => (deliveredByProduct.get(line.productId) ?? new Decimal(0)).gte(line.quantity)) ? "Delivered" : "Partially Delivered";
  if (usedOverride) audit(req, "FIFO overridden", "Delivery", delivery.id, `${delivery.challanNumber} used a newer batch.`, delivery.overrideReason);
  audit(req, "Delivery dispatched", "Delivery", delivery.id, `${delivery.challanNumber} posted and stock reduced.`);
  res.status(201).json(ok(delivery, "Delivery dispatched"));
});

app.get("/api/collections", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  res.json(ok(salesScoped(collections, req), "Collections loaded"));
});
app.get("/api/payment-accounts", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  res.json(ok(accounts.filter((account) => account.active).map((account) => ({ ...account, balance: "Restricted" })), "Payment accounts loaded"));
});
app.post("/api/collections", (req, res) => {
  const user = requireArea(req, res, "sales");
  if (!user || !["Super Admin", "Accounts", "Sales Manager", "Sales Executive"].includes(user.role)) return user ? fail(res, 403, "Collection posting is restricted.") : undefined;
  const customer = customers.find((entry) => entry.id === req.body.customerId);
  if (!customer) return fail(res, 404, "Customer not found");
  if (!ownsCustomer(req, customer.id)) return fail(res, 403, "You can post collections only for customers assigned to you.");
  const allowedModes: Collection["paymentMode"][] = ["Cash", "bKash", "Bank Transfer", "Cheque"];
  if (!allowedModes.includes(req.body.paymentMode)) return fail(res, 422, "Credit is an outstanding sales condition, not a payment collection. Select an actual received-payment mode.");
  const account = accounts.find((entry) => entry.id === req.body.accountId && entry.active);
  if (!account) return fail(res, 422, "Select a valid active cash, bank or mobile-banking destination account.");
  const linkedOrder = req.body.orderId ? orders.find((entry) => entry.id === req.body.orderId) : undefined;
  if (req.body.orderId && (!linkedOrder || linkedOrder.customerId !== customer.id)) return fail(res, 422, "The selected order does not belong to this customer.");
  if (user.role === "Sales Executive" && linkedOrder && linkedOrder.ownerId !== user.id) return fail(res, 403, "You cannot collect against another sales executive's order.");
  let amount: Decimal;
  try {
    amount = requiredDecimal(req.body.amount, "Collection amount");
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Collection amount is invalid.");
  }
  if (req.body.paymentMode !== "Cash" && !String(req.body.referenceNumber ?? "").trim()) return fail(res, 422, "Enter the bank, mobile-banking or cheque reference for this collection.");
  if (amount.gt(customer.currentDue)) return fail(res, 422, "Collection cannot exceed the customer's current due.");
  if (linkedOrder && amount.gt(linkedOrder.due)) return fail(res, 422, "Collection cannot exceed the selected order's due amount.");
  const collection: Collection = { ...req.body, amount: money(amount), customerName: customer.name, accountId: account.id, id: id("collection"), receiptNumber: nextReference("MR", collections.length), ownerId: user.role === "Sales Executive" ? user.id : linkedOrder?.ownerId ?? req.body.ownerId ?? user.id, status: "Posted" };
  collections.unshift(collection);
  customer.currentDue = money(decimal(customer.currentDue).minus(amount));
  customer.totalCollected = money(decimal(customer.totalCollected).plus(amount));
  account.balance = money(decimal(account.balance).plus(amount));
  accountTransactions.unshift({ id: id("trx"), date: collection.date, accountId: account.id, accountName: account.name, direction: "In", amount: collection.amount, sourceType: "Collection", sourceId: collection.id, description: `${customer.name} collection` });
  if (linkedOrder) {
    linkedOrder.amountReceived = money(decimal(linkedOrder.amountReceived).plus(amount));
    linkedOrder.due = money(Decimal.max(0, decimal(linkedOrder.due).minus(amount)));
  }
  audit(req, "Collection posted", "Collection", collection.id, `${collection.receiptNumber}: Tk ${collection.amount} from ${customer.name}.`);
  res.status(201).json(ok(collection, "Collection posted and customer due updated"));
});

app.get("/api/expenses", (req, res) => {
  if (!requireArea(req, res, "accounts")) return;
  res.json(ok(expenses, "Expenses loaded"));
});
app.post("/api/expenses", (req, res) => {
  const user = requireArea(req, res, "accounts");
  if (!user || !["Super Admin", "Accounts"].includes(user.role)) return user ? fail(res, 403, "Expense entry is restricted.") : undefined;
  let amount: Decimal;
  try {
    if (req.body.subtype === "TA/DA") {
      if (!String(req.body.employee ?? "").trim()) return fail(res, 422, "Select or enter the employee for a TA/DA expense.");
      const ta = requiredDecimal(req.body.taAmount ?? "0", "TA amount", { allowZero: true });
      const da = requiredDecimal(req.body.daAmount ?? "0", "DA amount", { allowZero: true });
      amount = ta.plus(da);
      if (amount.lte(0)) return fail(res, 422, "TA and DA cannot both be zero.");
      req.body.taAmount = money(ta);
      req.body.daAmount = money(da);
    } else {
      amount = requiredDecimal(req.body.amount, "Expense amount");
    }
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Expense amount is invalid.");
  }
  const category = expenseCategories.find((entry) => entry.id === req.body.categoryId);
  if (!category?.active) return fail(res, 422, "Select a valid active expense category.");
  const account = accounts.find((entry) => entry.id === req.body.paidFromAccountId && entry.active);
  if (!account || decimal(account.balance).lt(amount)) return fail(res, 422, "Selected account has insufficient balance.");
  const expense: Expense = { ...req.body, amount: money(amount), id: id("expense"), categoryName: category.name, status: "Posted" };
  expenses.unshift(expense);
  account.balance = money(decimal(account.balance).minus(amount));
  accountTransactions.unshift({ id: id("trx"), date: expense.date, accountId: account.id, accountName: account.name, direction: "Out", amount: expense.amount, sourceType: "Expense", sourceId: expense.id, description: expense.remarks });
  audit(req, "Expense posted", "Expense", expense.id, `${expense.categoryName}: Tk ${expense.amount}.`);
  res.status(201).json(ok(expense, "Expense posted; landed cost remains unchanged"));
});
app.post("/api/expenses/:expenseId/reverse", (req, res) => {
  const user = requireArea(req, res, "accounts");
  if (!user || !["Super Admin", "Accounts"].includes(user.role)) return user ? fail(res, 403, "Expense reversal is restricted.") : undefined;
  const expense = expenses.find((entry) => entry.id === req.params.expenseId);
  if (!expense) return fail(res, 404, "Expense not found");
  if (expense.status === "Reversed") return fail(res, 409, "Expense is already reversed.");
  const reason = String(req.body?.reason ?? "").trim();
  if (reason.length < 5) return fail(res, 422, "Enter a clear reversal reason.");
  const account = accounts.find((entry) => entry.id === expense.paidFromAccountId);
  if (account) {
    account.balance = money(decimal(account.balance).plus(expense.amount));
    accountTransactions.unshift({ id: id("trx"), date: businessDate(), accountId: account.id, accountName: account.name, direction: "In", amount: expense.amount, sourceType: "Expense", sourceId: expense.id, description: `Reversal: ${reason}` });
  }
  expense.status = "Reversed";
  audit(req, "Expense reversed", "Expense", expense.id, `${expense.categoryName}: Tk ${expense.amount} returned to ${account?.name ?? "source account"}.`, reason);
  res.json(ok(expense, "Expense reversed and account balance restored"));
});
app.get("/api/expense-categories", (req, res) => {
  if (!requireArea(req, res, "accounts")) return;
  res.json(ok(expenseCategories, "Expense categories loaded"));
});
app.post("/api/expense-categories", (req, res) => {
  const user = requireArea(req, res, "accounts");
  if (!user || user.role !== "Super Admin") return user ? fail(res, 403, "Only Super Admin can add expense categories.") : undefined;
  const category = { id: id("ec"), name: String(req.body.name), active: true };
  expenseCategories.push(category);
  res.status(201).json(ok(category, "Expense category created"));
});
app.get("/api/accounts", (req, res) => {
  if (!requireArea(req, res, "accounts")) return;
  res.json(ok(accounts, "Cash and bank accounts loaded"));
});
app.get("/api/account-transactions", (req, res) => {
  if (!requireArea(req, res, "accounts")) return;
  res.json(ok(accountTransactions, "Account transactions loaded"));
});

app.get("/api/reports", (req, res) => {
  if (!requireArea(req, res, "reports")) return;
  const today = businessDate();
  const defaultFrom = `${today.slice(0, 7)}-01`;
  const from = String(req.query.from ?? defaultFrom);
  const to = String(req.query.to ?? today);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) return fail(res, 422, "Enter a valid report date range.");
  const landed = imports.filter((record) => record.snapshot && inPeriod(record.snapshot.finalizedAt.slice(0, 10), from, to));
  const importCost = landed.reduce((sum, record) => sum.plus(record.snapshot?.totalShipmentCostBdt ?? 0), new Decimal(0));
  const inventoryUnits = stockBatches.reduce((sum, batch) => sum.plus(batch.quantityAvailable), new Decimal(0));
  const periodDeliveries = deliveries.filter((delivery) => inPeriod(delivery.date, from, to));
  const periodCollections = collections.filter((collection) => collection.status === "Posted" && inPeriod(collection.date, from, to));
  const periodExpenses = expenses.filter((expense) => expense.status === "Posted" && inPeriod(expense.date, from, to));
  const salesTotal = periodDeliveries.flatMap((delivery) => delivery.lines).reduce((sum, line) => sum.plus(line.lineTotal), new Decimal(0));
  const collectionTotal = periodCollections.reduce((sum, collection) => sum.plus(collection.amount), new Decimal(0));
  const expenseTotal = periodExpenses.reduce((sum, expense) => sum.plus(expense.amount), new Decimal(0));
  const realized = periodDeliveries.flatMap((delivery) => delivery.lines).reduce((totals, line) => {
    const batch = stockBatches.find((entry) => entry.id === line.batchId);
    const revenue = decimal(line.lineTotal);
    const cogs = decimal(line.quantity).mul(batch?.landedCostPerUnit ?? 0);
    return { revenue: totals.revenue.plus(revenue), cogs: totals.cogs.plus(cogs) };
  }, { revenue: new Decimal(0), cogs: new Decimal(0) });
  const categoryTotals = new Map<string, Decimal>();
  for (const expense of periodExpenses) categoryTotals.set(expense.categoryName, (categoryTotals.get(expense.categoryName) ?? new Decimal(0)).plus(expense.amount));
  const salesByCustomer = new Map<string, { customer: string; quantity: Decimal; value: Decimal }>();
  const salesByProduct = new Map<string, { product: string; quantity: Decimal; value: Decimal }>();
  const salesByMonth = new Map<string, { deliveries: number; value: Decimal }>();
  for (const delivery of periodDeliveries) {
    const customerRow = salesByCustomer.get(delivery.customerId) ?? { customer: delivery.customerName, quantity: new Decimal(0), value: new Decimal(0) };
    for (const line of delivery.lines) {
      customerRow.quantity = customerRow.quantity.plus(line.quantity);
      customerRow.value = customerRow.value.plus(line.lineTotal);
      const productRow = salesByProduct.get(line.productId) ?? { product: line.productName, quantity: new Decimal(0), value: new Decimal(0) };
      productRow.quantity = productRow.quantity.plus(line.quantity);
      productRow.value = productRow.value.plus(line.lineTotal);
      salesByProduct.set(line.productId, productRow);
    }
    salesByCustomer.set(delivery.customerId, customerRow);
    const month = delivery.date.slice(0, 7);
    const monthRow = salesByMonth.get(month) ?? { deliveries: 0, value: new Decimal(0) };
    monthRow.deliveries += 1;
    monthRow.value = monthRow.value.plus(delivery.lines.reduce((sum, line) => sum.plus(line.lineTotal), new Decimal(0)));
    salesByMonth.set(month, monthRow);
  }
  const sensitive = hasCapability(req, "view_sensitive_cost");
  const profitVisible = hasCapability(req, "view_profit");
  const report = {
    period: { from, to },
    importCosts: [{ label: "Imports created", value: String(imports.filter((record) => inPeriod(record.createdAt.slice(0, 10), from, to)).length) }, { label: "Finalized shipment value", value: sensitive ? money(importCost) : "Restricted" }, { label: "Pending finalization", value: String(imports.filter((item) => item.costingStatus === "In Progress").length) }],
    inventory: [{ label: "Available units", value: inventoryUnits.toFixed(0) }, { label: "Tracked batches", value: String(stockBatches.length) }, { label: "Expiry attention", value: String(stockBatches.filter((batch) => expiryStatus(batch.expiryDate) !== "Normal").length) }],
    sales: [{ label: "Delivered sales", value: money(salesTotal) }, { label: "Collections received", value: money(collectionTotal) }, { label: "Customer dues", value: money(customers.reduce((sum, customer) => sum.plus(customer.currentDue), new Decimal(0))) }, ...(profitVisible ? [{ label: "Realized gross profit", value: money(realized.revenue.minus(realized.cogs)) }] : [])],
    expenses: [{ label: "Operating expenses", value: money(expenseTotal) }, { label: "Posted entries", value: String(periodExpenses.length) }, { label: "Cash / bank accounts", value: String(accounts.filter((entry) => entry.active).length) }],
    tables: {
      imports: [
        { id: "import-register", title: "Import / Shipment Register", columns: [{ key: "date", label: "Created" }, { key: "reference", label: "Reference" }, { key: "supplier", label: "Supplier" }, { key: "po", label: "PO" }, { key: "products", label: "Products", align: "right" as const }, { key: "status", label: "Status" }], rows: imports.filter((record) => inPeriod(record.createdAt.slice(0, 10), from, to)).map((record) => ({ date: record.createdAt.slice(0, 10), reference: record.primaryReference, supplier: record.supplierName, po: record.poNumber, products: String(record.items.length), status: record.status })) },
        { id: "import-cost-breakdown", title: "Import Cost Breakdown", columns: [{ key: "date", label: "Date" }, { key: "reference", label: "Import" }, { key: "cost", label: "Cost Type" }, { key: "method", label: "Allocation" }, { key: "amount", label: "BDT", align: "right" as const }], rows: imports.flatMap((record) => record.costs.filter((cost) => inPeriod((cost.paymentDate || cost.createdAt).slice(0, 10), from, to)).map((cost) => ({ date: (cost.paymentDate || cost.createdAt).slice(0, 10), reference: record.primaryReference, cost: cost.name, method: cost.allocationMethod.replace("_", " "), amount: sensitive ? cost.amountBdt : "Restricted" }))) },
        { id: "landed-cost-product", title: "Landed Cost by Product", columns: [{ key: "date", label: "Finalized" }, { key: "reference", label: "Import" }, { key: "product", label: "Product" }, { key: "quantity", label: "Qty", align: "right" as const }, { key: "landed", label: "Landed / Unit", align: "right" as const }], rows: landed.flatMap((record) => record.snapshot!.products.map((product) => ({ date: record.snapshot!.finalizedAt.slice(0, 10), reference: record.primaryReference, product: product.productName, quantity: product.quantity, landed: sensitive ? product.finalPerUnitBdt : "Restricted" }))) },
        { id: "landed-cost-batch-history", title: "Landed Cost History by Batch", columns: [{ key: "received", label: "Received" }, { key: "reference", label: "Import / Source" }, { key: "product", label: "Product" }, { key: "batch", label: "Lot / Batch" }, { key: "quantity", label: "Received Qty", align: "right" as const }, { key: "landed", label: "Landed / Unit", align: "right" as const }], rows: stockBatches.filter((batch) => inPeriod(batch.receivedDate, from, to)).map((batch) => ({ received: batch.receivedDate, reference: batch.sourceReference, product: batch.productName, batch: `${batch.lotNumber} / ${batch.batchNumber}`, quantity: batch.quantityReceived, landed: sensitive ? batch.landedCostPerUnit : "Restricted" })) }
      ],
      inventory: [
        { id: "current-stock", title: "Current Batch Stock", columns: [{ key: "product", label: "Product" }, { key: "lot", label: "Lot / Batch" }, { key: "received", label: "Received" }, { key: "expiry", label: "Expiry" }, { key: "status", label: "Expiry Status" }, { key: "available", label: "Available", align: "right" as const }], rows: stockBatches.map((batch) => ({ product: batch.productName, lot: `${batch.lotNumber} / ${batch.batchNumber}`, received: batch.receivedDate, expiry: batch.expiryDate, status: expiryStatus(batch.expiryDate), available: batch.quantityAvailable })) },
        { id: "expiry-report", title: "Expiry Attention", columns: [{ key: "product", label: "Product" }, { key: "lot", label: "Lot / Batch" }, { key: "expiry", label: "Expiry" }, { key: "status", label: "Status" }, { key: "available", label: "Available", align: "right" as const }, { key: "location", label: "Location" }], rows: stockBatches.filter((batch) => expiryStatus(batch.expiryDate) !== "Normal").sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)).map((batch) => ({ product: batch.productName, lot: `${batch.lotNumber} / ${batch.batchNumber}`, expiry: batch.expiryDate, status: expiryStatus(batch.expiryDate), available: batch.quantityAvailable, location: batch.location ?? batch.warehouse })) },
        { id: "stock-movement", title: "Stock Movements", columns: [{ key: "date", label: "Date" }, { key: "product", label: "Product" }, { key: "batch", label: "Batch" }, { key: "type", label: "Movement" }, { key: "quantity", label: "Qty", align: "right" as const }, { key: "reference", label: "Reference" }], rows: stockMovements.filter((movement) => inPeriod(movement.date, from, to)).map((movement) => ({ date: movement.date, product: movement.productName, batch: movement.batchNumber, type: movement.type, quantity: movement.quantity, reference: movement.reference })) }
      ],
      sales: [
        { id: "delivered-sales", title: "Delivered Sales by Product", columns: [{ key: "date", label: "Date" }, { key: "challan", label: "Challan" }, { key: "customer", label: "Customer" }, { key: "product", label: "Product" }, { key: "quantity", label: "Qty", align: "right" as const }, { key: "value", label: "Delivered Value", align: "right" as const }, ...(profitVisible ? [{ key: "profit", label: "Gross Profit", align: "right" as const }] : [])], rows: periodDeliveries.flatMap((delivery) => delivery.lines.map((line) => { const batch = stockBatches.find((entry) => entry.id === line.batchId); return { date: delivery.date, challan: delivery.challanNumber, customer: delivery.customerName, product: line.productName, quantity: line.quantity, value: line.lineTotal, ...(profitVisible ? { profit: money(decimal(line.lineTotal).minus(decimal(line.quantity).mul(batch?.landedCostPerUnit ?? 0))) } : {}) }; })) },
        { id: "sales-by-customer", title: "Sales by Customer", columns: [{ key: "customer", label: "Customer" }, { key: "quantity", label: "Units Delivered", align: "right" as const }, { key: "value", label: "Delivered Value", align: "right" as const }], rows: [...salesByCustomer.values()].sort((a, b) => b.value.comparedTo(a.value)).map((row) => ({ customer: row.customer, quantity: precise(row.quantity, 4), value: money(row.value) })) },
        { id: "sales-by-product", title: "Sales by Product", columns: [{ key: "product", label: "Product" }, { key: "quantity", label: "Units Delivered", align: "right" as const }, { key: "value", label: "Delivered Value", align: "right" as const }], rows: [...salesByProduct.values()].sort((a, b) => b.value.comparedTo(a.value)).map((row) => ({ product: row.product, quantity: precise(row.quantity, 4), value: money(row.value) })) },
        { id: "sales-by-month", title: "Sales by Month", columns: [{ key: "month", label: "Month" }, { key: "deliveries", label: "Challans", align: "right" as const }, { key: "value", label: "Delivered Value", align: "right" as const }], rows: [...salesByMonth].sort(([a], [b]) => a.localeCompare(b)).map(([month, row]) => ({ month, deliveries: String(row.deliveries), value: money(row.value) })) },
        { id: "collections", title: "Collections Received", columns: [{ key: "date", label: "Date" }, { key: "receipt", label: "Receipt" }, { key: "customer", label: "Customer" }, { key: "mode", label: "Mode" }, { key: "reference", label: "Payment Ref" }, { key: "amount", label: "Amount", align: "right" as const }], rows: periodCollections.map((collection) => ({ date: collection.date, receipt: collection.receiptNumber, customer: collection.customerName, mode: collection.paymentMode, reference: collection.referenceNumber ?? "-", amount: collection.amount })) },
        { id: "customer-dues", title: "Customer Receivables", columns: [{ key: "customer", label: "Customer" }, { key: "terms", label: "Terms" }, { key: "sales", label: "Total Sales", align: "right" as const }, { key: "collected", label: "Collected", align: "right" as const }, { key: "due", label: "Current Due", align: "right" as const }], rows: customers.map((customer) => ({ customer: customer.name, terms: customer.paymentTerms, sales: customer.totalSales, collected: customer.totalCollected, due: customer.currentDue })) },
        { id: "customer-ledger", title: "Customer Running Ledger", columns: [{ key: "date", label: "Date" }, { key: "customer", label: "Customer" }, { key: "type", label: "Type" }, { key: "reference", label: "Reference" }, { key: "debit", label: "Debit / Sale", align: "right" as const }, { key: "credit", label: "Credit / Collection", align: "right" as const }, { key: "runningDue", label: "Running Due", align: "right" as const }], rows: customers.flatMap((customer) => (customerLedger(customer.id)?.entries ?? []).filter((entry) => inPeriod(entry.date, from, to)).map((entry) => ({ date: entry.date, customer: customer.name, type: entry.type, reference: entry.reference, debit: entry.debit, credit: entry.credit, runningDue: entry.runningDue }))) }
      ],
      expenses: [
        { id: "daily-expenditure", title: "Daily Expenditure", columns: [{ key: "date", label: "Date" }, { key: "category", label: "Category / Detail" }, { key: "remarks", label: "Remarks" }, { key: "paidFrom", label: "Paid From" }, { key: "amount", label: "Cost", align: "right" as const }], rows: periodExpenses.map((expense) => ({ date: expense.date, category: `${expense.categoryName}${expense.subtype === "TA/DA" ? ` · ${expense.employee ?? "Employee"}` : ""}`, remarks: expense.remarks, paidFrom: accounts.find((account) => account.id === expense.paidFromAccountId)?.name ?? expense.paidFromAccountId, amount: expense.amount })) },
        { id: "monthly-category", title: "Expense Category Summary", columns: [{ key: "category", label: "Category" }, { key: "amount", label: "Total Amount", align: "right" as const }], rows: [...categoryTotals].sort(([a], [b]) => a.localeCompare(b)).map(([category, amount]) => ({ category, amount: money(amount) })) },
        { id: "ta-da", title: "TA/DA Approved Sheet Data", columns: [{ key: "date", label: "Date" }, { key: "employee", label: "Employee" }, { key: "designation", label: "Designation" }, { key: "ta", label: "TA", align: "right" as const }, { key: "da", label: "DA", align: "right" as const }, { key: "remarks", label: "Remarks" }], rows: periodExpenses.filter((expense) => expense.subtype === "TA/DA").map((expense) => ({ date: expense.date, employee: expense.employee ?? "-", designation: expense.designation ?? "-", ta: expense.taAmount ?? "0.00", da: expense.daAmount ?? "0.00", remarks: expense.remarks })) },
        { id: "account-transactions", title: "Cash / Bank Transactions", columns: [{ key: "date", label: "Date" }, { key: "account", label: "Account" }, { key: "direction", label: "In / Out" }, { key: "source", label: "Source" }, { key: "description", label: "Description" }, { key: "amount", label: "Amount", align: "right" as const }], rows: accountTransactions.filter((transaction) => inPeriod(transaction.date, from, to)).map((transaction) => ({ date: transaction.date, account: transaction.accountName, direction: transaction.direction, source: transaction.sourceType, description: transaction.description, amount: transaction.amount })) }
      ]
    }
  };
  res.json(ok({
    ...report
  }, `Reports loaded for ${from} to ${to}`));
});

app.get("/api/settings/users", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  res.json(ok(demoUsers, "Users and capabilities loaded"));
});
app.post("/api/settings/users", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const validRoles: Role[] = ["Super Admin", "Managing Director", "Accounts", "Import Officer", "Warehouse Manager", "Sales Manager", "Sales Executive"];
  if (!email || demoUsers.some((user) => user.email.toLowerCase() === email)) return fail(res, 409, "Enter a unique user email.");
  if (!validRoles.includes(req.body?.role)) return fail(res, 422, "Select a valid role.");
  const user: User = {
    id: id("user"),
    name: String(req.body.name ?? "New User"),
    email,
    role: req.body.role,
    title: String(req.body.title ?? req.body.role),
    department: String(req.body.department ?? req.body.role),
    phone: String(req.body.phone ?? ""),
    avatarUrl: String(req.body.avatarUrl ?? ""),
    status: req.body.status ?? "Active",
    territory: req.body.territory,
    capabilities: req.body.capabilities ?? []
  };
  demoUsers.push(user);
  passwordByEmail.set(user.email, String(req.body.password ?? "password123"));
  audit(req, "User created", "User", user.id, `${user.name} assigned ${user.role}.`);
  res.status(201).json(ok(user, "User created"));
});
app.patch("/api/settings/users/:userId", (req, res) => {
  const actor = requireArea(req, res, "settings");
  if (!actor) return;
  const index = demoUsers.findIndex((user) => user.id === req.params.userId);
  if (index < 0) return fail(res, 404, "User not found");
  const previousEmail = demoUsers[index].email;
  demoUsers[index] = { ...demoUsers[index], ...req.body, id: demoUsers[index].id };
  if (req.body.password) passwordByEmail.set(demoUsers[index].email, String(req.body.password));
  if (previousEmail !== demoUsers[index].email) {
    const existingPassword = passwordByEmail.get(previousEmail) ?? "password123";
    passwordByEmail.delete(previousEmail);
    passwordByEmail.set(demoUsers[index].email, existingPassword);
  }
  audit(req, "User capabilities updated", "User", demoUsers[index].id, `${demoUsers[index].name}: ${demoUsers[index].role} with ${demoUsers[index].capabilities?.length ?? 0} explicit capabilities.`);
  res.json(ok(demoUsers[index], "User and capabilities updated"));
});
app.get("/api/settings/decisions", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  res.json(ok(decisions, "Client confirmation queue loaded"));
});
app.patch("/api/settings/decisions/:decisionId", (req, res) => {
  const user = requireArea(req, res, "settings");
  if (!user) return;
  const index = decisions.findIndex((decision) => decision.id === req.params.decisionId);
  if (index < 0) return fail(res, 404, "Decision not found");
  const confirmed = req.body.status === "Confirmed";
  if (confirmed && !String(req.body.resolutionValue ?? decisions[index].resolutionValue ?? "").trim()) return fail(res, 422, "Record the confirmed resolution before closing this decision.");
  decisions[index] = { ...decisions[index], ...req.body, id: decisions[index].id, confirmedBy: confirmed ? user.name : undefined, confirmedAt: confirmed ? new Date().toISOString() : undefined };
  audit(req, "Business decision updated", "BusinessDecision", decisions[index].id, `${decisions[index].title}: ${decisions[index].status}.`);
  res.json(ok(decisions[index], "Client decision updated"));
});

app.get("/api/settings/accounts", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  res.json(ok(accounts, "Settings accounts loaded"));
});
app.post("/api/settings/accounts", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  const account = { ...req.body, id: id("acc"), balance: money(req.body.balance ?? 0), active: req.body.active ?? true };
  accounts.push(account);
  audit(req, "Account created", "CashBankAccount", account.id, `${account.name} added.`);
  res.status(201).json(ok(account, "Cash or bank account created"));
});
app.patch("/api/settings/accounts/:accountId", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  const index = accounts.findIndex((account) => account.id === req.params.accountId);
  if (index < 0) return fail(res, 404, "Account not found");
  accounts[index] = { ...accounts[index], ...req.body, id: accounts[index].id, balance: req.body.balance === undefined ? accounts[index].balance : money(req.body.balance) };
  audit(req, "Account updated", "CashBankAccount", accounts[index].id, `${accounts[index].name} settings updated.`);
  res.json(ok(accounts[index], "Account updated"));
});
app.delete("/api/settings/accounts/:accountId", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  const index = accounts.findIndex((account) => account.id === req.params.accountId);
  if (index < 0) return fail(res, 404, "Account not found");
  const account = accounts[index];
  if (accountTransactions.some((transaction) => transaction.accountId === account.id)) return fail(res, 409, "Accounts with transactions cannot be deleted; mark the account inactive.");
  accounts.splice(index, 1);
  res.json(ok({ id: account.id }, "Account deleted"));
});

app.get("/api/settings/warehouse", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  res.json(ok(warehouseConfig, "Warehouse configuration loaded"));
});
app.patch("/api/settings/warehouse", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  Object.assign(warehouseConfig, req.body, { id: warehouseConfig.id });
  audit(req, "Warehouse updated", "Warehouse", warehouseConfig.id, `${warehouseConfig.name} configuration updated.`);
  res.json(ok(warehouseConfig, "Warehouse configuration updated"));
});

app.post("/api/settings/opening-stock", (req, res) => {
  const user = requireArea(req, res, "settings");
  if (!user) return;
  const product = products.find((entry) => entry.id === req.body.productId);
  if (!product) return fail(res, 422, "Select a valid canonical product.");
  let quantity: Decimal;
  let landedCost: Decimal;
  try {
    quantity = requiredDecimal(req.body.quantity, "Opening quantity");
    landedCost = requiredDecimal(req.body.landedCostPerUnit ?? "0", "Opening landed cost", { allowZero: true });
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Opening stock values are invalid.");
  }
  if (!req.body.lotNumber || !req.body.batchNumber || !req.body.manufacturingDate || !req.body.expiryDate || !req.body.receivedDate) return fail(res, 422, "Lot, batch, manufacturing, expiry and historical received dates are required.");
  if (new Date(req.body.expiryDate) <= new Date(req.body.manufacturingDate)) return fail(res, 422, "Expiry must be after manufacturing date.");
  const batch: StockBatch = { id: id("opening-batch"), productId: product.id, productCode: product.code, productName: product.name, sourceImportId: "opening-stock", sourceReference: String(req.body.sourceReference || "OPENING-STOCK"), sourceType: "Opening Stock", lotNumber: String(req.body.lotNumber), batchNumber: String(req.body.batchNumber), manufacturingDate: String(req.body.manufacturingDate), expiryDate: String(req.body.expiryDate), receivedDate: String(req.body.receivedDate), quantityReceived: precise(quantity, 4), quantityAvailable: precise(quantity, 4), warehouse: String(req.body.warehouse || warehouseConfig.name), location: req.body.location ? String(req.body.location) : undefined, landedCostPerUnit: money(landedCost) };
  if (stockBatches.some((entry) => entry.batchNumber.toLowerCase() === batch.batchNumber.toLowerCase())) return fail(res, 409, "Batch number already exists.");
  stockBatches.unshift(batch);
  stockMovements.unshift({ id: id("mov"), date: batch.receivedDate, productId: batch.productId, productName: batch.productName, batchId: batch.id, batchNumber: batch.batchNumber, type: "Receive", quantity: batch.quantityReceived, reference: batch.sourceReference, reason: "Opening stock migration", createdBy: user.name });
  audit(req, "Opening stock posted", "StockBatch", batch.id, `${batch.productName}: ${batch.quantityReceived} units from ${batch.sourceReference}.`);
  res.status(201).json(ok(visibleBatch(batch, req), "Opening stock batch created"));
});

app.get("/api/settings/customer-opening-balances", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  res.json(ok(customerOpeningBalances, "Customer opening balances loaded"));
});
app.post("/api/settings/customer-opening-balances", (req, res) => {
  const user = requireArea(req, res, "settings");
  if (!user) return;
  const customer = customers.find((entry) => entry.id === req.body.customerId);
  if (!customer) return fail(res, 422, "Select a valid customer.");
  if (customerOpeningBalances.some((entry) => entry.customerId === customer.id)) return fail(res, 409, "An opening balance is already posted for this customer.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(req.body.date ?? ""))) return fail(res, 422, "Enter a valid migration cutover date.");
  let openingDue: Decimal;
  let historicalSales: Decimal;
  let historicalCollected: Decimal;
  try {
    openingDue = requiredDecimal(req.body.openingDue ?? "0", "Opening due", { allowZero: true });
    historicalSales = requiredDecimal(req.body.historicalSales ?? openingDue, "Historical sales", { allowZero: true });
    historicalCollected = requiredDecimal(req.body.historicalCollected ?? "0", "Historical collections", { allowZero: true });
  } catch (error) {
    return fail(res, 422, error instanceof Error ? error.message : "Opening customer values are invalid.");
  }
  if (!historicalSales.minus(historicalCollected).eq(openingDue)) return fail(res, 422, "Historical sales minus historical collections must equal the opening due.");
  const erpDeliveries = deliveries.filter((entry) => entry.customerId === customer.id);
  const erpCollections = collections.filter((entry) => entry.customerId === customer.id && entry.status === "Posted");
  const delivered = erpDeliveries.flatMap((entry) => entry.lines).reduce((sum, line) => sum.plus(line.lineTotal), new Decimal(0));
  const collected = erpCollections.reduce((sum, entry) => sum.plus(entry.amount), new Decimal(0));
  const currentDue = openingDue.plus(delivered).minus(collected);
  if (currentDue.lt(0)) return fail(res, 422, "Opening due is lower than already-posted ERP collections. Reconcile the migration values first.");
  const opening: CustomerOpeningBalance = {
    id: id("customer-opening"),
    customerId: customer.id,
    customerName: customer.name,
    date: String(req.body.date),
    openingDue: money(openingDue),
    historicalSales: money(historicalSales),
    historicalCollected: money(historicalCollected),
    reference: String(req.body.reference || "LEGACY-SALES-LEDGER"),
    remarks: String(req.body.remarks || "Opening balance imported from the legacy customer ledger."),
    createdBy: user.name,
    createdAt: new Date().toISOString()
  };
  customerOpeningBalances.push(opening);
  customer.currentDue = money(currentDue);
  customer.totalSales = money(historicalSales.plus(delivered));
  customer.totalCollected = money(historicalCollected.plus(collected));
  audit(req, "Customer opening balance posted", "CustomerOpeningBalance", opening.id, `${customer.name}: Tk ${opening.openingDue} opening due at ${opening.date}.`);
  res.status(201).json(ok(opening, "Customer opening balance posted"));
});

app.get("/api/settings/product-aliases", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  res.json(ok(productAliases, "Product aliases loaded"));
});
app.post("/api/settings/product-aliases", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  const product = products.find((entry) => entry.id === req.body.productId);
  const aliasText = String(req.body.aliasText ?? "").trim();
  if (!product || aliasText.length < 2) return fail(res, 422, "Enter an alias and select its canonical product.");
  if (productAliases.some((entry) => entry.aliasText.toLowerCase() === aliasText.toLowerCase())) return fail(res, 409, "This alias already exists.");
  const alias: ProductAlias = { id: id("alias"), aliasText, productId: product.id, productName: product.name, source: String(req.body.source || "Manual mapping"), active: true };
  productAliases.push(alias);
  res.status(201).json(ok(alias, "Product alias mapped"));
});
app.delete("/api/settings/product-aliases/:aliasId", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  const index = productAliases.findIndex((entry) => entry.id === req.params.aliasId);
  if (index < 0) return fail(res, 404, "Product alias not found");
  const [alias] = productAliases.splice(index, 1);
  res.json(ok({ id: alias.id }, "Product alias removed"));
});

app.get("/api/settings/cost-presets", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  res.json(ok(costPresets, "Cost presets loaded"));
});
app.post("/api/settings/cost-presets", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  const preset = { ...req.body, id: id("preset"), requiresExplicitChoice: true, active: req.body.active ?? true };
  costPresets.push(preset);
  res.status(201).json(ok(preset, "Cost preset created"));
});
app.patch("/api/settings/cost-presets/:presetId", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  const index = costPresets.findIndex((preset) => preset.id === req.params.presetId);
  if (index < 0) return fail(res, 404, "Cost preset not found");
  costPresets[index] = { ...costPresets[index], ...req.body, id: costPresets[index].id };
  res.json(ok(costPresets[index], "Cost preset updated"));
});
app.delete("/api/settings/cost-presets/:presetId", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  const index = costPresets.findIndex((preset) => preset.id === req.params.presetId);
  if (index < 0) return fail(res, 404, "Cost preset not found");
  const [preset] = costPresets.splice(index, 1);
  res.json(ok({ id: preset.id }, "Cost preset deleted"));
});

app.get("/api/settings/print", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  res.json(ok(printConfiguration, "Print configuration loaded"));
});
app.get("/api/print/config", (req, res) => {
  if (!requireUser(req, res)) return;
  res.json(ok(printConfiguration, "Print configuration loaded"));
});
app.patch("/api/settings/print", (req, res) => {
  if (!requireArea(req, res, "settings")) return;
  Object.assign(printConfiguration, req.body);
  audit(req, "Print configuration updated", "PrintConfiguration", "primary", "Letterhead and signatory details updated.");
  res.json(ok(printConfiguration, "Print configuration updated"));
});
app.get(["/api/audit", "/api/security/audit-log"], (req, res) => {
  const user = requireUser(req, res);
  if (!user || !["Super Admin", "Managing Director", "Accounts"].includes(user.role)) return user ? fail(res, 403, "Audit access is restricted.") : undefined;
  res.json(ok(auditEvents, "Audit events loaded", { total: auditEvents.length }));
});

app.use("/api", (_req, res) => fail(res, 404, "API route not found"));

if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`MIPRO simplified ERP API listening on http://localhost:${port}`));
}

export default app;
