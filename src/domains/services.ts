import { z } from "zod";
import type { ApiResponse, Session, User } from "../types";
import type {
  AccountTransaction,
  AuditEvent,
  BusinessDecision,
  CashBankAccount,
  Collection,
  CostPreset,
  Customer,
  CustomerLedger,
  CustomerOpeningBalance,
  DashboardData,
  Delivery,
  Expense,
  ImportCase,
  ImportCostLine,
  ImportDocument,
  ImportItem,
  LandedCostPreview,
  ProductAlias,
  ProfitPreview,
  PrintConfiguration,
  Product,
  Quotation,
  ReportData,
  SalesOrder,
  StockBatch,
  StockMovement,
  Supplier,
  WarehouseConfig,
  WarehouseReceipt
} from "./erp.types";
import {
  AccountSchema,
  AccountTransactionSchema,
  AuditEventSchema,
  BusinessDecisionSchema,
  CollectionSchema,
  CostPresetSchema,
  CustomerSchema,
  CustomerLedgerSchema,
  CustomerOpeningBalanceSchema,
  DashboardSchema,
  DeliverySchema,
  DispatchPreviewSchema,
  ExpenseCategorySchema,
  ExpenseSchema,
  ImportCaseSchema,
  ImportDocumentSchema,
  LandedCostPreviewSchema,
  PrintConfigurationSchema,
  ProductAliasSchema,
  ProfitPreviewSchema,
  ProductSchema,
  QuotationSchema,
  ReportSchema,
  SalesOrderSchema,
  StockBatchSchema,
  StockMovementSchema,
  StockSummarySchema,
  SupplierSchema,
  UserSchema,
  WarehouseConfigSchema,
  WarehouseReceiptSchema
} from "./schemas";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const SESSION_KEY = "mipro-erp-session";
const IdResponseSchema = z.object({ id: z.string() });

export type StockSummary = z.infer<typeof StockSummarySchema>;
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

function headers() {
  const result = new Headers({ "Content-Type": "application/json" });
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return result;
  try {
    const session = JSON.parse(raw) as Session;
    result.set("Authorization", "Bearer " + session.token);
    result.set("x-user-id", session.user.id);
    result.set("x-role", session.user.role);
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
  }
  return result;
}

async function request<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const response = await fetch(API_BASE_URL + path, { ...init, headers: headers() });
  const body = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
  if (!response.ok || !body?.success) throw new Error(body?.message || "Request failed (" + response.status + ")");
  const parsed = schema.safeParse(body.data);
  if (!parsed.success) throw new Error("API contract validation failed for " + path + ": " + parsed.error.issues[0]?.message);
  return parsed.data;
}

const get = <T>(path: string, schema: z.ZodType<T>) => request(path, schema);
const post = <T>(path: string, payload: unknown, schema: z.ZodType<T>) => request(path, schema, { method: "POST", body: JSON.stringify(payload) });
const patch = <T>(path: string, payload: unknown, schema: z.ZodType<T>) => request(path, schema, { method: "PATCH", body: JSON.stringify(payload) });
const remove = (path: string) => request(path, IdResponseSchema, { method: "DELETE" });

export const dashboardService = {
  get: () => get<DashboardData>("/api/dashboard", DashboardSchema)
};

export const importService = {
  list: () => get<ImportCase[]>("/api/imports", z.array(ImportCaseSchema)),
  get: (id: string) => get<ImportCase>("/api/imports/" + id, ImportCaseSchema),
  create: (payload: Partial<ImportCase>) => post<ImportCase>("/api/imports", payload, ImportCaseSchema),
  update: (id: string, payload: Partial<ImportCase>) => patch<ImportCase>("/api/imports/" + id, payload, ImportCaseSchema),
  transition: (id: string, status: string) => post<ImportCase>("/api/imports/" + id + "/transition", { status }, ImportCaseSchema),
  remove: (id: string) => remove("/api/imports/" + id),
  addItem: (id: string, payload: Omit<ImportItem, "id">) => post<ImportCase>("/api/imports/" + id + "/items", payload, ImportCaseSchema),
  updateItem: (id: string, itemId: string, payload: Partial<ImportItem>) => patch<ImportCase>("/api/imports/" + id + "/items/" + itemId, payload, ImportCaseSchema),
  removeItem: (id: string, itemId: string) => request("/api/imports/" + id + "/items/" + itemId, ImportCaseSchema, { method: "DELETE" }),
  addCost: (id: string, payload: Omit<ImportCostLine, "id" | "enteredBy" | "createdAt">) => post<ImportCase>("/api/imports/" + id + "/costs", payload, ImportCaseSchema),
  updateCost: (id: string, costId: string, payload: Partial<ImportCostLine>) => patch<ImportCase>("/api/imports/" + id + "/costs/" + costId, payload, ImportCaseSchema),
  removeCost: (id: string, costId: string) => request("/api/imports/" + id + "/costs/" + costId, ImportCaseSchema, { method: "DELETE" }),
  addDocument: (id: string, payload: Pick<ImportDocument, "type" | "name">) => post<ImportDocument>("/api/imports/" + id + "/documents", payload, ImportDocumentSchema),
  receipts: (id: string) => get<WarehouseReceipt[]>("/api/imports/" + id + "/receipts", z.array(WarehouseReceiptSchema)),
  preview: (id: string) => post<LandedCostPreview>("/api/imports/" + id + "/cost-preview", {}, LandedCostPreviewSchema),
  finalize: (id: string) => post<ImportCase>("/api/imports/" + id + "/finalize", {}, ImportCaseSchema),
  reopen: (id: string, reason: string) => post<ImportCase>("/api/imports/" + id + "/reopen", { reason }, ImportCaseSchema),
  receive: (id: string, payload: Omit<WarehouseReceipt, "id" | "importId" | "reference" | "status" | "receivedBy">) => post<WarehouseReceipt>("/api/imports/" + id + "/receive", payload, WarehouseReceiptSchema)
};

export const inventoryService = {
  stock: () => get<StockSummary[]>("/api/inventory/stock", z.array(StockSummarySchema)),
  batches: () => get<StockBatch[]>("/api/inventory/batches", z.array(StockBatchSchema)),
  movements: () => get<StockMovement[]>("/api/inventory/movements", z.array(StockMovementSchema)),
  dispatchPreview: (payload: { productId: string; batchId?: string; quantity: string; date?: string }) => post("/api/inventory/dispatch-preview", payload, DispatchPreviewSchema)
};

export const salesService = {
  customers: () => get<Customer[]>("/api/customers", z.array(CustomerSchema)),
  customerLedger: (id: string) => get<CustomerLedger>("/api/customers/" + id + "/ledger", CustomerLedgerSchema),
  createCustomer: (payload: Partial<Customer>) => post<Customer>("/api/customers", payload, CustomerSchema),
  updateCustomer: (id: string, payload: Partial<Customer>) => patch<Customer>("/api/customers/" + id, payload, CustomerSchema),
  removeCustomer: (id: string) => remove("/api/customers/" + id),
  quotations: () => get<Quotation[]>("/api/quotations", z.array(QuotationSchema)),
  createQuotation: (payload: Partial<Quotation>) => post<Quotation>("/api/quotations", payload, QuotationSchema),
  updateQuotation: (id: string, payload: Partial<Quotation>) => patch<Quotation>("/api/quotations/" + id, payload, QuotationSchema),
  removeQuotation: (id: string) => remove("/api/quotations/" + id),
  convertQuotation: (id: string, deliveryInstruction: string) => post<SalesOrder>("/api/quotations/" + id + "/convert", { deliveryInstruction }, SalesOrderSchema),
  orders: () => get<SalesOrder[]>("/api/orders", z.array(SalesOrderSchema)),
  updateOrder: (id: string, payload: Partial<SalesOrder>) => patch<SalesOrder>("/api/orders/" + id, payload, SalesOrderSchema),
  deliveries: () => get<Delivery[]>("/api/deliveries", z.array(DeliverySchema)),
  createDelivery: (payload: Partial<Delivery>) => post<Delivery>("/api/deliveries", payload, DeliverySchema),
  collections: () => get<Collection[]>("/api/collections", z.array(CollectionSchema)),
  createCollection: (payload: Partial<Collection>) => post<Collection>("/api/collections", payload, CollectionSchema),
  profitPreview: (lines: Quotation["lines"]) => post<ProfitPreview>("/api/sales/profit-preview", { lines }, ProfitPreviewSchema),
  paymentAccounts: () => get<CashBankAccount[]>("/api/payment-accounts", z.array(AccountSchema))
};

export const accountsService = {
  expenses: () => get<Expense[]>("/api/expenses", z.array(ExpenseSchema)),
  createExpense: (payload: Partial<Expense>) => post<Expense>("/api/expenses", payload, ExpenseSchema),
  reverseExpense: (id: string, reason: string) => post<Expense>("/api/expenses/" + id + "/reverse", { reason }, ExpenseSchema),
  categories: () => get<ExpenseCategory[]>("/api/expense-categories", z.array(ExpenseCategorySchema)),
  createCategory: (name: string) => post<ExpenseCategory>("/api/expense-categories", { name }, ExpenseCategorySchema),
  accounts: () => get<CashBankAccount[]>("/api/accounts", z.array(AccountSchema)),
  transactions: () => get<AccountTransaction[]>("/api/account-transactions", z.array(AccountTransactionSchema))
};

export const reportService = {
  get: (from: string, to: string) => get<ReportData>(`/api/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, ReportSchema)
};

export const printService = {
  configuration: () => get<PrintConfiguration>("/api/print/config", PrintConfigurationSchema)
};

export const settingsService = {
  users: () => get<User[]>("/api/settings/users", z.array(UserSchema)),
  createUser: (payload: Partial<User> & { password?: string }) => post<User>("/api/settings/users", payload, UserSchema),
  updateUser: (id: string, payload: Partial<User>) => patch<User>("/api/settings/users/" + id, payload, UserSchema),
  decisions: () => get<BusinessDecision[]>("/api/settings/decisions", z.array(BusinessDecisionSchema)),
  updateDecision: (id: string, payload: Partial<BusinessDecision>) => patch<BusinessDecision>("/api/settings/decisions/" + id, payload, BusinessDecisionSchema),
  audit: () => get<AuditEvent[]>("/api/audit", z.array(AuditEventSchema)),
  products: () => get<Product[]>("/api/products", z.array(ProductSchema)),
  createProduct: (payload: Partial<Product>) => post<Product>("/api/products", payload, ProductSchema),
  updateProduct: (id: string, payload: Partial<Product>) => patch<Product>("/api/products/" + id, payload, ProductSchema),
  removeProduct: (id: string) => remove("/api/products/" + id),
  suppliers: () => get<Supplier[]>("/api/suppliers", z.array(SupplierSchema)),
  createSupplier: (payload: Partial<Supplier>) => post<Supplier>("/api/suppliers", payload, SupplierSchema),
  updateSupplier: (id: string, payload: Partial<Supplier>) => patch<Supplier>("/api/suppliers/" + id, payload, SupplierSchema),
  removeSupplier: (id: string) => remove("/api/suppliers/" + id),
  accounts: () => get<CashBankAccount[]>("/api/settings/accounts", z.array(AccountSchema)),
  createAccount: (payload: Partial<CashBankAccount>) => post<CashBankAccount>("/api/settings/accounts", payload, AccountSchema),
  updateAccount: (id: string, payload: Partial<CashBankAccount>) => patch<CashBankAccount>("/api/settings/accounts/" + id, payload, AccountSchema),
  removeAccount: (id: string) => remove("/api/settings/accounts/" + id),
  warehouse: () => get<WarehouseConfig>("/api/settings/warehouse", WarehouseConfigSchema),
  updateWarehouse: (payload: Partial<WarehouseConfig>) => patch<WarehouseConfig>("/api/settings/warehouse", payload, WarehouseConfigSchema),
  createOpeningStock: (payload: Record<string, unknown>) => post<StockBatch>("/api/settings/opening-stock", payload, StockBatchSchema),
  customerOpeningBalances: () => get<CustomerOpeningBalance[]>("/api/settings/customer-opening-balances", z.array(CustomerOpeningBalanceSchema)),
  createCustomerOpeningBalance: (payload: Partial<CustomerOpeningBalance>) => post<CustomerOpeningBalance>("/api/settings/customer-opening-balances", payload, CustomerOpeningBalanceSchema),
  productAliases: () => get<ProductAlias[]>("/api/settings/product-aliases", z.array(ProductAliasSchema)),
  createProductAlias: (payload: Partial<ProductAlias>) => post<ProductAlias>("/api/settings/product-aliases", payload, ProductAliasSchema),
  removeProductAlias: (id: string) => remove("/api/settings/product-aliases/" + id),
  costPresets: () => get<CostPreset[]>("/api/settings/cost-presets", z.array(CostPresetSchema)),
  createCostPreset: (payload: Partial<CostPreset>) => post<CostPreset>("/api/settings/cost-presets", payload, CostPresetSchema),
  updateCostPreset: (id: string, payload: Partial<CostPreset>) => patch<CostPreset>("/api/settings/cost-presets/" + id, payload, CostPresetSchema),
  removeCostPreset: (id: string) => remove("/api/settings/cost-presets/" + id),
  printConfiguration: () => get<PrintConfiguration>("/api/settings/print", PrintConfigurationSchema),
  updatePrintConfiguration: (payload: Partial<PrintConfiguration>) => patch<PrintConfiguration>("/api/settings/print", payload, PrintConfigurationSchema)
};

export const fileService = {
  attachImportDocument: importService.addDocument
};
