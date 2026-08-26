import { z } from "zod";
import type { ApiResponse, Session, User } from "../types";
import type {
  AccountTransaction,
  AuditEvent,
  BusinessDecision,
  AIChatResponse,
  AIContext,
  AIDocumentExtraction,
  AIInsight,
  AIRecommendation,
  CashBankAccount,
  Collection,
  CostPreset,
  CurrentEmployeeLocation,
  Customer,
  CustomerLedger,
  CustomerOpeningBalance,
  DailyMarketingPlan,
  DashboardData,
  Delivery,
  DocumentRecord,
  DocumentUpload,
  Expense,
  EmployeeDirectoryEntry,
  EmployeeMarketingSnapshot,
  EmployeeMarketingTarget,
  FieldEmployee,
  FieldTeamCurrentData,
  FieldTeamHistoryData,
  FieldVisit,
  ImportCase,
  ImportCostLine,
  ImportDocument,
  ImportItem,
  LandedCostPreview,
  MarketingActivity,
  MarketingDashboardData,
  MarketingFollowUp,
  MarketingLead,
  MarketingPerformanceRow,
  MarketingReportData,
  MarketingScoreRule,
  MonthlyMarketingPlan,
  LocationUpdateInput,
  ProductAlias,
  ProfitPreview,
  PrintConfiguration,
  Product,
  Quotation,
  ReportData,
  SalespersonPerformanceData,
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
  AIChatResponseSchema,
  AIDocumentExtractionSchema,
  AIInsightSchema,
  AIRecommendationSchema,
  CollectionSchema,
  CostPresetSchema,
  CurrentEmployeeLocationSchema,
  CustomerSchema,
  CustomerLedgerSchema,
  CustomerOpeningBalanceSchema,
  DashboardSchema,
  DeliverySchema,
  DispatchPreviewSchema,
  ExpenseCategorySchema,
  ExpenseSchema,
  EmployeeDirectoryEntrySchema,
  EmployeeMarketingSnapshotSchema,
  EmployeeMarketingTargetSchema,
  FieldEmployeeSchema,
  FieldTeamCurrentSchema,
  FieldTeamHistorySchema,
  FieldVisitSchema,
  ImportCaseSchema,
  ImportDocumentSchema,
  LandedCostPreviewSchema,
  MarketingActivitySchema,
  MarketingDashboardSchema,
  MarketingFollowUpSchema,
  MarketingLeadSchema,
  MarketingPerformanceRowSchema,
  MarketingReportSchema,
  MarketingScoreRuleSchema,
  MonthlyMarketingPlanSchema,
  DailyMarketingPlanSchema,
  PrintConfigurationSchema,
  ProductAliasSchema,
  ProfitPreviewSchema,
  ProductSchema,
  QuotationSchema,
  ReportSchema,
  SalespersonPerformanceSchema,
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
  addCost: (id: string, payload: Omit<ImportCostLine, "id" | "enteredBy" | "createdAt"> & { attachmentUpload?: DocumentUpload }) => post<ImportCase>("/api/imports/" + id + "/costs", payload, ImportCaseSchema),
  updateCost: (id: string, costId: string, payload: Partial<ImportCostLine> & { attachmentUpload?: DocumentUpload }) => patch<ImportCase>("/api/imports/" + id + "/costs/" + costId, payload, ImportCaseSchema),
  removeCost: (id: string, costId: string) => request("/api/imports/" + id + "/costs/" + costId, ImportCaseSchema, { method: "DELETE" }),
  addDocument: (id: string, payload: Pick<ImportDocument, "type" | "name"> & { upload: DocumentUpload; sensitive?: boolean }) => post<ImportDocument>("/api/imports/" + id + "/documents", payload, ImportDocumentSchema),
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

export const employeeService = {
  directory: (scope: "all" | "marketing" = "all") => get<EmployeeDirectoryEntry[]>(`/api/employees/directory?scope=${scope}`, z.array(EmployeeDirectoryEntrySchema))
};

export const marketingService = {
  dashboard: () => get<MarketingDashboardData>("/api/marketing/dashboard", MarketingDashboardSchema),
  subjects: () => get<Array<{ value: string; label: string; type: "Lead" | "Customer" }>>("/api/marketing/subjects", z.array(z.object({ value: z.string(), label: z.string(), type: z.enum(["Lead", "Customer"]) }))),
  activities: (filters: { from?: string; to?: string; employeeId?: string; activityType?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    return get<MarketingActivity[]>(`/api/marketing/activities${params.size ? `?${params}` : ""}`, z.array(MarketingActivitySchema));
  },
  createActivity: (payload: Partial<MarketingActivity> & { attachmentUpload?: DocumentUpload }) => post<MarketingActivity>("/api/marketing/activities", payload, MarketingActivitySchema),
  leads: () => get<MarketingLead[]>("/api/marketing/leads", z.array(MarketingLeadSchema)),
  createLead: (payload: Partial<MarketingLead>) => post<MarketingLead>("/api/marketing/leads", payload, MarketingLeadSchema),
  updateLead: (id: string, payload: Partial<MarketingLead>) => patch<MarketingLead>(`/api/marketing/leads/${id}`, payload, MarketingLeadSchema),
  convertLead: (id: string, payload: { paymentTerms: string; creditLimit: string }) => post<Customer>(`/api/marketing/leads/${id}/convert`, payload, CustomerSchema),
  followUps: (status = "") => get<MarketingFollowUp[]>(`/api/marketing/follow-ups${status ? `?status=${encodeURIComponent(status)}` : ""}`, z.array(MarketingFollowUpSchema)),
  createFollowUp: (payload: Partial<MarketingFollowUp>) => post<MarketingFollowUp>("/api/marketing/follow-ups", payload, MarketingFollowUpSchema),
  updateFollowUp: (id: string, payload: Partial<MarketingFollowUp>) => patch<MarketingFollowUp>(`/api/marketing/follow-ups/${id}`, payload, MarketingFollowUpSchema),
  dailyPlans: (date: string, employeeId = "all") => get<DailyMarketingPlan[]>(`/api/marketing/plans/daily?date=${encodeURIComponent(date)}&employeeId=${encodeURIComponent(employeeId)}`, z.array(DailyMarketingPlanSchema)),
  saveDailyPlan: (payload: Partial<DailyMarketingPlan>) => post<DailyMarketingPlan>("/api/marketing/plans/daily", payload, DailyMarketingPlanSchema),
  monthlyPlans: (month: string) => get<MonthlyMarketingPlan[]>(`/api/marketing/plans/monthly?month=${encodeURIComponent(month)}`, z.array(MonthlyMarketingPlanSchema)),
  saveMonthlyPlan: (payload: Partial<MonthlyMarketingPlan>) => post<MonthlyMarketingPlan>("/api/marketing/plans/monthly", payload, MonthlyMarketingPlanSchema),
  targets: (month: string) => get<EmployeeMarketingTarget[]>(`/api/marketing/targets?month=${encodeURIComponent(month)}`, z.array(EmployeeMarketingTargetSchema)),
  saveTarget: (payload: Partial<EmployeeMarketingTarget>) => post<EmployeeMarketingTarget>("/api/marketing/targets", payload, EmployeeMarketingTargetSchema),
  updateTarget: (id: string, payload: Partial<EmployeeMarketingTarget>) => patch<EmployeeMarketingTarget>(`/api/marketing/targets/${id}`, payload, EmployeeMarketingTargetSchema),
  performance: (from: string, to: string, employeeId = "all") => get<MarketingPerformanceRow[]>(`/api/marketing/performance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&employeeId=${encodeURIComponent(employeeId)}`, z.array(MarketingPerformanceRowSchema)),
  employeeSnapshot: (employeeId: string) => get<EmployeeMarketingSnapshot>(`/api/marketing/employees/${encodeURIComponent(employeeId)}/snapshot`, EmployeeMarketingSnapshotSchema),
  scoreRules: () => get<MarketingScoreRule[]>("/api/marketing/score-rules", z.array(MarketingScoreRuleSchema)),
  updateScoreRule: (id: string, payload: Partial<MarketingScoreRule>) => patch<MarketingScoreRule>(`/api/marketing/score-rules/${id}`, payload, MarketingScoreRuleSchema)
};

export const accountsService = {
  expenses: () => get<Expense[]>("/api/expenses", z.array(ExpenseSchema)),
  createExpense: (payload: Partial<Expense> & { attachmentUpload?: DocumentUpload }) => post<Expense>("/api/expenses", payload, ExpenseSchema),
  reverseExpense: (id: string, reason: string) => post<Expense>("/api/expenses/" + id + "/reverse", { reason }, ExpenseSchema),
  categories: () => get<ExpenseCategory[]>("/api/expense-categories", z.array(ExpenseCategorySchema)),
  createCategory: (name: string) => post<ExpenseCategory>("/api/expense-categories", { name }, ExpenseCategorySchema),
  accounts: () => get<CashBankAccount[]>("/api/accounts", z.array(AccountSchema)),
  transactions: () => get<AccountTransaction[]>("/api/account-transactions", z.array(AccountTransactionSchema))
};

export const reportService = {
  get: (from: string, to: string) => get<ReportData>(`/api/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, ReportSchema),
  salespeople: (from: string, to: string, employeeId = "all") => get<SalespersonPerformanceData>(`/api/reports/salespeople?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&employeeId=${encodeURIComponent(employeeId)}`, SalespersonPerformanceSchema),
  marketing: (filters: { from: string; to: string; employeeId?: string; territory?: string; activityType?: string; subjectId?: string; verification?: string; status?: string; groupBy?: string; mode?: "Summary" | "Detail" }) => {
    const params = new URLSearchParams(filters as Record<string, string>);
    return get<MarketingReportData>(`/api/reports/marketing?${params}`, MarketingReportSchema);
  },
  authorizeExport: () => get<{ authorized: true }>("/api/reports/export-authorization", z.object({ authorized: z.literal(true) })),
  authorizeMarketingExport: () => get<{ authorized: true }>("/api/reports/marketing/export-authorization", z.object({ authorized: z.literal(true) }))
};

export const fieldTeamService = {
  current: () => get<FieldTeamCurrentData>("/api/field-team/current", FieldTeamCurrentSchema),
  employees: (search = "", territory = "", status = "") => {
    const params = new URLSearchParams({ search, territory, status });
    return get<FieldEmployee[]>(`/api/field-team/employees?${params}`, z.array(FieldEmployeeSchema));
  },
  history: (userId: string, date: string) => get<FieldTeamHistoryData>(`/api/field-team/${encodeURIComponent(userId)}/history?date=${encodeURIComponent(date)}`, FieldTeamHistorySchema),
  visits: (userId: string, from: string, to: string) => get<FieldVisit[]>(`/api/field-team/${encodeURIComponent(userId)}/visits?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, z.array(FieldVisitSchema)),
  startTracking: () => post("/api/field-team/tracking/start", {}, z.object({ id: z.string(), userId: z.string(), startedAt: z.string(), endedAt: z.string().optional(), source: z.enum(["MOBILE_APP", "WEB_FOREGROUND", "MANUAL", "DEMO"]), status: z.enum(["Active", "Completed"]) })),
  sendLocation: (payload: LocationUpdateInput) => post<CurrentEmployeeLocation>("/api/field-team/tracking/location", payload, CurrentEmployeeLocationSchema),
  stopTracking: () => post("/api/field-team/tracking/stop", {}, z.object({ id: z.string(), userId: z.string(), startedAt: z.string(), endedAt: z.string().optional(), source: z.enum(["MOBILE_APP", "WEB_FOREGROUND", "MANUAL", "DEMO"]), status: z.enum(["Active", "Completed"]) })),
  checkInVisit: (visitId: string, payload: { latitude: number; longitude: number; accuracyMeters: number }) => post<FieldVisit>(`/api/field-team/visits/${visitId}/check-in`, payload, FieldVisitSchema),
  checkOutVisit: (visitId: string, payload: Partial<FieldVisit> & { attachmentUpload?: DocumentUpload }) => post<FieldVisit>(`/api/field-team/visits/${visitId}/check-out`, payload, FieldVisitSchema)
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
  attachImportDocument: importService.addDocument,
  async open(document: DocumentRecord) {
    const response = await fetch(API_BASE_URL + `/api/documents/${encodeURIComponent(document.id)}/content`, { headers: headers() });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;
      throw new Error(body?.message || `Document could not be opened (${response.status})`);
    }
    return response.blob();
  }
};

function contextParams(context: AIContext) {
  const params = new URLSearchParams();
  Object.entries(context).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export const aiService = {
  chat: (message: string, context: AIContext) => post<AIChatResponse>("/api/ai/chat", { message, context }, AIChatResponseSchema),
  insights: (context: AIContext) => get<AIInsight[]>(`/api/ai/insights?${contextParams(context)}`, z.array(AIInsightSchema)),
  recommendations: (context: AIContext) => get<AIRecommendation[]>(`/api/ai/recommendations?${contextParams(context)}`, z.array(AIRecommendationSchema)),
  extractDocument: (importId: string, documentId: string) => post<AIDocumentExtraction>("/api/ai/document-extract", { importId, documentId }, AIDocumentExtractionSchema)
};
