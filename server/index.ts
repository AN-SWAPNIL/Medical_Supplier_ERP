import cors from "cors";
import { Decimal } from "decimal.js";
import express, { type Request, type Response } from "express";
import { calculateLandedCost, importDisplayReference } from "../src/domains/imports/costing.js";
import type {
  Capability,
  Collection,
  Delivery,
  Expense,
  ImportCase,
  ImportCostLine,
  ImportDocument,
  ImportItem,
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
  inventory: ["Super Admin", "Managing Director", "Import Officer", "Warehouse Manager", "Sales Manager", "Sales Executive"],
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
  const visibleCollections = salesScoped(collections, req);
  const visibleCustomers = customerScoped(req);
  const salesTotal = visibleOrders.reduce((sum, order) => sum.plus(order.total), new Decimal(0));
  const collectionTotal = visibleCollections.reduce((sum, collection) => sum.plus(collection.amount), new Decimal(0));
  const dueTotal = visibleCustomers.reduce((sum, customer) => sum.plus(customer.currentDue), new Decimal(0));
  const expenseTotal = expenses.reduce((sum, expense) => sum.plus(expense.amount), new Decimal(0));
  const stockUnits = stockBatches.reduce((sum, batch) => sum.plus(batch.quantityAvailable), new Decimal(0));
  const stockValue = stockBatches.reduce((sum, batch) => sum.plus(decimal(batch.quantityAvailable).mul(batch.landedCostPerUnit)), new Decimal(0));
  const metrics: { id: string; label: string; value: string; unit: string; sensitive?: boolean }[] = [
    { id: "sales", label: user.role === "Sales Executive" ? "My Sales" : "Sales This Month", value: money(salesTotal), unit: "BDT" },
    { id: "collection", label: user.role === "Sales Executive" ? "My Collections" : "Collections This Month", value: money(collectionTotal), unit: "BDT" },
    { id: "due", label: "Outstanding Receivable", value: money(dueTotal), unit: "BDT" },
    { id: "expense", label: "Operating Expenditure", value: money(expenseTotal), unit: "BDT" },
    { id: "stock", label: "Available Stock", value: stockUnits.toFixed(0), unit: "units" },
    { id: "imports", label: "Imports In Progress", value: String(imports.filter((item) => !["Received", "Closed", "Cancelled"].includes(item.status)).length), unit: "cases" }
  ];
  if (hasCapability(req, "view_sensitive_cost")) metrics[4] = { id: "stock", label: "Inventory Value", value: money(stockValue), unit: "BDT", sensitive: true };
  res.json(ok({ role: user.role, metrics, importAttention: areaRoles.imports.includes(user.role) ? imports.filter((item) => ["PI Received", "At Port", "Costing"].includes(item.status)).map((item) => importForRole(item, req)) : [], expiryAlerts: stockBatches.filter((batch) => new Date(batch.expiryDate).getTime() < new Date("2027-06-01").getTime()).map((batch) => batchForRole(batch, req)), customerDues: visibleCustomers.filter((customer) => decimal(customer.currentDue).gt(0)).sort((a, b) => decimal(b.currentDue).comparedTo(a.currentDue)).slice(0, 5), recentSales: visibleOrders.slice(0, 5), recentCollections: visibleCollections.slice(0, 5), recentExpenses: ["Super Admin", "Managing Director", "Accounts"].includes(user.role) ? expenses.slice(0, 5) : [] }, "Dashboard loaded"));
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
  const now = new Date().toISOString();
  const record: ImportCase = { ...req.body, id: id("imp"), draftReference: nextReference("IMP", imports.length), primaryReference: "", status: "Draft", milestone: "Draft", costingStatus: "Not Started", warehouseStatus: "Not Ready", items: req.body.items ?? [], costs: [], documents: [], createdAt: now, updatedAt: now };
  record.primaryReference = importDisplayReference(record);
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
  if (imports[index].snapshot) return fail(res, 423, "Finalized cost records are locked. Reopen with a reason first.");
  imports[index] = { ...imports[index], ...req.body, id: imports[index].id, updatedAt: new Date().toISOString() };
  imports[index].primaryReference = importDisplayReference(imports[index]);
  audit(req, "Import updated", "Import", imports[index].id, `${imports[index].primaryReference} commercial or shipment information updated.`);
  res.json(ok(importForRole(imports[index], req), "Import updated"));
});

app.post("/api/imports/:importId/items", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Import item creation is restricted.") : undefined;
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  const item: ImportItem = { ...req.body, id: id("item") };
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
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  record.items[index] = { ...record.items[index], ...req.body, id: record.items[index].id };
  record.updatedAt = new Date().toISOString();
  audit(req, "Import item updated", "Import", record.id, `${record.items[index].productName} values updated.`);
  res.json(ok(importForRole(record, req), "Import item updated"));
});
app.delete("/api/imports/:importId/items/:itemId", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user || !["Super Admin", "Import Officer"].includes(user.role)) return user ? fail(res, 403, "Import item deletion is restricted.") : undefined;
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
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
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  const cost: ImportCostLine = { ...req.body, id: id("cost"), enteredBy: userFor(req)?.name ?? "Unknown", createdAt: new Date().toISOString() };
  if (!cost.allocationMethod) return fail(res, 422, "Select an allocation method explicitly.");
  cost.amountBdt = cost.currency === "BDT" ? money(cost.amountForeign) : money(decimal(cost.amountForeign).mul(cost.exchangeRate));
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
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  record.costs[index] = { ...record.costs[index], ...req.body, id: record.costs[index].id };
  const cost = record.costs[index];
  cost.amountBdt = cost.currency === "BDT" ? money(cost.amountForeign) : money(decimal(cost.amountForeign).mul(cost.exchangeRate));
  audit(req, "Cost line changed", "Import", record.id, `${cost.name} amount or allocation basis changed.`);
  res.json(ok(record, "Cost updated"));
});
app.delete("/api/imports/:importId/costs/:costId", (req, res) => {
  if (!requireArea(req, res, "imports")) return;
  if (!hasCapability(req, "edit_sensitive_cost")) return fail(res, 403, "Sensitive cost editing requires owner permission.");
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
  if (record.snapshot) return fail(res, 423, "Finalized imports are locked.");
  const cost = record.costs.find((item) => item.id === req.params.costId);
  if (!cost) return fail(res, 404, "Cost line not found");
  record.costs = record.costs.filter((item) => item.id !== cost.id);
  audit(req, "Cost line removed", "Import", record.id, `${cost.name} removed before finalization.`);
  res.json(ok(record, "Cost removed"));
});
app.post("/api/imports/:importId/documents", (req, res) => {
  const user = requireArea(req, res, "imports");
  if (!user) return;
  const record = imports.find((item) => item.id === req.params.importId);
  if (!record) return fail(res, 404, "Import not found");
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
  if (!record.snapshot) return fail(res, 409, "Finalize landed cost before warehouse receiving.");
  const receipt = req.body as WarehouseReceipt;
  for (const line of receipt.lines) {
    const source = record.items.find((item) => item.id === line.importItemId);
    if (!source) return fail(res, 422, `${line.productName}: import item not found.`);
    if (decimal(line.quantityReceived).lt(0) || decimal(line.quantityRejected).lt(0) || decimal(line.quantityReceived).plus(line.quantityRejected).lte(0)) {
      return fail(res, 422, `${line.productName}: enter a received or rejected quantity.`);
    }
    const previouslyProcessed = receipts
      .filter((entry) => entry.importId === record.id)
      .flatMap((entry) => entry.lines)
      .filter((entry) => entry.importItemId === line.importItemId)
      .reduce((sum, entry) => sum.plus(entry.quantityReceived).plus(entry.quantityRejected), new Decimal(0));
    if (previouslyProcessed.plus(line.quantityReceived).plus(line.quantityRejected).gt(source.quantity)) {
      return fail(res, 422, `${line.productName}: total receipts and rejections exceed the imported quantity.`);
    }
    if (new Date(line.expiryDate) <= new Date(line.manufacturingDate)) return fail(res, 422, `${line.productName}: expiry must be after manufacturing date.`);
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
    const batch: StockBatch = { id: id("batch"), productId: line.productId, productCode: item.productCode, productName: line.productName, sourceImportId: record.id, sourceReference: record.primaryReference, lotNumber: line.lotNumber, batchNumber: line.batchNumber, manufacturingDate: line.manufacturingDate, expiryDate: line.expiryDate, receivedDate: posted.receivedDate, quantityReceived: line.quantityReceived, quantityAvailable: line.quantityReceived, warehouse: line.warehouse, location: line.location, landedCostPerUnit: line.landedCostPerUnit };
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
  res.json(ok(stockBatches.map((batch) => batchForRole(batch, req)), "Batches loaded", { total: stockBatches.length }));
});
app.get("/api/inventory/movements", (req, res) => {
  if (!requireArea(req, res, "inventory")) return;
  res.json(ok(stockMovements, "Movements loaded", { total: stockMovements.length }));
});
app.post("/api/inventory/dispatch-preview", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  const eligible = stockBatches.filter((batch) => batch.productId === req.body.productId && decimal(batch.quantityAvailable).gte(req.body.quantity)).sort((a, b) => a.receivedDate.localeCompare(b.receivedDate));
  const selected = eligible.find((batch) => batch.id === req.body.batchId);
  if (!selected) return fail(res, 422, "Selected batch does not have enough available stock.");
  const recommended = eligible[0];
  res.json(ok({ selected: batchForRole(selected, req), recommended: recommended ? batchForRole(recommended, req) : null, warning: recommended && selected.id !== recommended.id ? `Older matching lot ${recommended.lotNumber} still has ${recommended.quantityAvailable} units. Provide an authorized override reason to use ${selected.lotNumber}.` : null }, "Dispatch preview loaded"));
});

app.get("/api/customers", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  const rows = customerScoped(req);
  res.json(ok(rows, "Customers loaded", { total: rows.length, scoped: rows.length !== customers.length }));
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
  customers[index] = { ...customers[index], ...req.body, id: customers[index].id, currentDue: customers[index].currentDue, totalSales: customers[index].totalSales, totalCollected: customers[index].totalCollected };
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
  const lines = req.body.lines ?? [];
  const subtotal = lines.reduce((sum: Decimal, line: { quantity: string; unitPrice: string }) => sum.plus(decimal(line.quantity).mul(line.unitPrice)), new Decimal(0));
  const discount = lines.reduce((sum: Decimal, line: { discount?: string }) => sum.plus(line.discount ?? 0), new Decimal(0));
  const quote: Quotation = { ...req.body, id: id("quo"), quotationNumber: nextReference("QT", quotations.length), ownerId: user.role === "Sales Executive" ? user.id : req.body.ownerId ?? user.id, subtotal: money(subtotal), discountTotal: money(discount), total: money(subtotal.minus(discount)), status: "Draft" };
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
  if (["Converted", "Rejected"].includes(quotations[index].status)) return fail(res, 423, "Finalized quotation is locked.");
  quotations[index] = { ...quotations[index], ...req.body, id: quotations[index].id };
  const lines = quotations[index].lines;
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
  if (quote.status === "Converted") return fail(res, 409, "Quotation has already been converted.");
  quote.status = "Converted";
  const order: SalesOrder = { id: id("order"), orderNumber: nextReference("SO", orders.length), quotationId: quote.id, date: new Date().toISOString().slice(0, 10), customerId: quote.customerId, customerName: quote.customerName, ownerId: quote.ownerId, paymentConditions: quote.paymentTerms, deliveryInstruction: req.body?.deliveryInstruction ?? "Confirm with customer before dispatch", amountReceived: "0.00", due: "0.00", status: "Placed", lines: structuredClone(quote.lines), total: quote.total };
  orders.unshift(order);
  audit(req, "Quotation converted", "SalesOrder", order.id, `${quote.quotationNumber} converted to ${order.orderNumber}.`);
  res.status(201).json(ok(order, "Quotation converted to order"));
});

app.get("/api/orders", (req, res) => {
  if (!requireArea(req, res, "sales")) return;
  res.json(ok(salesScoped(orders, req), "Orders loaded"));
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
  for (const line of payload.lines) {
    if (decimal(line.quantity).lte(0)) return fail(res, 422, `${line.productName}: delivery quantity must be greater than zero.`);
    const ordered = order.lines.find((entry) => entry.productId === line.productId);
    if (!ordered) return fail(res, 422, `${line.productName}: product is not on the selected order.`);
    const alreadyDelivered = deliveries
      .filter((delivery) => delivery.orderId === order.id)
      .flatMap((delivery) => delivery.lines)
      .filter((entry) => entry.productId === line.productId)
      .reduce((sum, entry) => sum.plus(entry.quantity), new Decimal(0));
    if (alreadyDelivered.plus(line.quantity).gt(ordered.quantity)) return fail(res, 422, `${line.productName}: delivery exceeds the remaining ordered quantity.`);
    const eligible = stockBatches.filter((batch) => batch.productId === line.productId && decimal(batch.quantityAvailable).gte(line.quantity)).sort((a, b) => a.receivedDate.localeCompare(b.receivedDate));
    const selected = eligible.find((batch) => batch.id === line.batchId);
    if (!selected) return fail(res, 422, `${line.productName}: selected batch lacks available stock.`);
    if (eligible[0] && eligible[0].id !== selected.id) {
      if (!hasCapability(req, "approve_stock_override") || !payload.overrideReason?.trim()) return fail(res, 409, `Older matching lot ${eligible[0].lotNumber} still has stock. Authorized override and reason are required.`);
      usedOverride = true;
    }
  }
  const delivery: Delivery = { ...payload, id: id("delivery"), challanNumber: nextReference("DC", deliveries.length), status: "Dispatched" };
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
  if (!user) return;
  const customer = customers.find((entry) => entry.id === req.body.customerId);
  if (!customer) return fail(res, 404, "Customer not found");
  const amount = decimal(req.body.amount);
  if (amount.lte(0)) return fail(res, 422, "Collection amount must be greater than zero.");
  if (amount.gt(customer.currentDue) && req.body.paymentMode !== "Credit") return fail(res, 422, "Collection cannot exceed the customer's current due.");
  const collection: Collection = { ...req.body, id: id("collection"), receiptNumber: nextReference("MR", collections.length), ownerId: user.role === "Sales Executive" ? user.id : req.body.ownerId ?? user.id, status: "Posted" };
  collections.unshift(collection);
  if (collection.paymentMode !== "Credit") {
    customer.currentDue = money(decimal(customer.currentDue).minus(amount));
    customer.totalCollected = money(decimal(customer.totalCollected).plus(amount));
    const account = accounts.find((entry) => entry.id === collection.accountId);
    if (account) {
      account.balance = money(decimal(account.balance).plus(amount));
      accountTransactions.unshift({ id: id("trx"), date: collection.date, accountId: account.id, accountName: account.name, direction: "In", amount: collection.amount, sourceType: "Collection", sourceId: collection.id, description: `${customer.name} collection` });
    }
    const order = orders.find((entry) => entry.id === collection.orderId);
    if (order) {
      order.amountReceived = money(decimal(order.amountReceived).plus(amount));
      order.due = money(Decimal.max(0, decimal(order.due).minus(amount)));
    }
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
  const amount = decimal(req.body.amount);
  if (amount.lte(0)) return fail(res, 422, "Expense amount must be greater than zero.");
  const category = expenseCategories.find((entry) => entry.id === req.body.categoryId);
  if (!category) return fail(res, 422, "Select a valid expense category.");
  const account = accounts.find((entry) => entry.id === req.body.paidFromAccountId);
  if (!account || decimal(account.balance).lt(amount)) return fail(res, 422, "Selected account has insufficient balance.");
  const expense: Expense = { ...req.body, id: id("expense"), categoryName: category.name, status: "Posted" };
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
    accountTransactions.unshift({ id: id("trx"), date: new Date().toISOString().slice(0, 10), accountId: account.id, accountName: account.name, direction: "In", amount: expense.amount, sourceType: "Expense", sourceId: expense.id, description: `Reversal: ${reason}` });
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
  const landed = imports.filter((record) => record.snapshot);
  const importCost = landed.reduce((sum, record) => sum.plus(record.snapshot?.totalShipmentCostBdt ?? 0), new Decimal(0));
  const inventoryUnits = stockBatches.reduce((sum, batch) => sum.plus(batch.quantityAvailable), new Decimal(0));
  const salesTotal = orders.reduce((sum, order) => sum.plus(order.total), new Decimal(0));
  const collectionTotal = collections.reduce((sum, collection) => sum.plus(collection.amount), new Decimal(0));
  const expenseTotal = expenses.reduce((sum, expense) => sum.plus(expense.amount), new Decimal(0));
  res.json(ok({
    importCosts: [{ label: "Active import cases", value: String(imports.length) }, { label: "Finalized import value", value: hasCapability(req, "view_sensitive_cost") ? money(importCost) : "Restricted" }, { label: "Pending finalization", value: String(imports.filter((item) => item.costingStatus === "In Progress").length) }],
    inventory: [{ label: "Available units", value: inventoryUnits.toFixed(0) }, { label: "Tracked batches", value: String(stockBatches.length) }, { label: "Expiry attention", value: String(stockBatches.filter((batch) => batch.expiryDate < "2027-06-01").length) }],
    sales: [{ label: "Order value", value: money(salesTotal) }, { label: "Collections", value: money(collectionTotal) }, { label: "Customer dues", value: money(customers.reduce((sum, customer) => sum.plus(customer.currentDue), new Decimal(0))) }],
    expenses: [{ label: "Operating expenses", value: money(expenseTotal) }, { label: "Expense entries", value: String(expenses.length) }, { label: "Cash / bank accounts", value: String(accounts.length) }]
  }, "Reports loaded"));
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
  if (!requireArea(req, res, "settings")) return;
  const index = decisions.findIndex((decision) => decision.id === req.params.decisionId);
  if (index < 0) return fail(res, 404, "Decision not found");
  decisions[index] = { ...decisions[index], ...req.body, id: decisions[index].id };
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
