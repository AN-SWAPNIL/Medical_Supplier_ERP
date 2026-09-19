import type { Capability } from "../erp.types";
import type { PermissionAction, PermissionKey, User } from "../../types";
import { hasCapability, hasEffectivePermission } from "../../lib/permissions/effectiveAccess";

export type ReportCategoryId = "sales" | "inventory" | "imports" | "customers" | "expenses" | "employees";
export type ReportSourceGroup = "sales" | "inventory" | "imports" | "expenses";
export type ReportFilterKey = "salesperson" | "customer" | "product" | "family" | "supplier" | "employee" | "account" | "territory" | "status";

export type ReportDefinition = {
  id: string;
  title: string;
  category: ReportCategoryId;
  description: string;
  keywords: string[];
  source: "table" | "performance" | "marketing";
  sourceGroup?: ReportSourceGroup;
  tableId?: string;
  filters: ReportFilterKey[];
  printable: boolean;
  exportable: boolean;
  permission: { key: PermissionKey; action: PermissionAction };
  capability?: Capability;
  marketingPreset?: string;
};

export const reportCategories: Array<{ id: ReportCategoryId; title: string; description: string }> = [
  { id: "sales", title: "Sales & Transactions", description: "Orders, deliveries, invoices, sales and collections" },
  { id: "inventory", title: "Inventory & Stock", description: "Stock position, items, batches, expiry and movement" },
  { id: "imports", title: "Import & Purchase", description: "Import purchase orders, receipts and landed cost" },
  { id: "customers", title: "Customers & Ledger", description: "Customer, salesperson, due and running ledger reports" },
  { id: "expenses", title: "Expenses & Accounts", description: "Expenses, day book and cash or bank movement" },
  { id: "employees", title: "Employees & Marketing", description: "Employee performance and marketing analysis" }
];

const reports: ReportDefinition[] = [
  table("invoice-register", "Sales Invoice Register", "sales", "Approved, draft and cancelled invoices by period.", "sales", ["salesperson", "customer", "status"], ["invoice", "billing"]),
  table("sales-sheet", "Sales Sheet", "sales", "Invoice-level product quantity, rate and amount detail.", "sales", ["salesperson", "customer", "product"], ["sales", "item"]),
  table("sales-order-register", "Sales Order Register", "sales", "Orders with delivery, invoice and due status.", "sales", ["salesperson", "customer", "status"], ["order", "receiving"]),
  table("order-fulfilment", "Order Fulfilment Difference", "sales", "Ordered, delivered, invoiced and remaining quantities.", "sales", ["salesperson", "customer", "product", "status"], ["difference", "remaining"]),
  table("delivery-challan-register", "Delivery Challan Register", "sales", "Posted challans, delivered quantity and invoice linkage.", "sales", ["customer", "status"], ["delivery", "challan"]),
  table("delivery-invoice-exceptions", "Delivery vs Invoice Exceptions", "sales", "Uninvoiced delivery and invoice control exceptions.", "sales", ["customer"], ["reconciliation", "control"]),
  table("delivered-sales", "Delivered Sales by Product", "sales", "Operational product movement based on delivery challans.", "sales", ["customer", "product"], ["dispatch", "delivered"]),
  table("sales-by-product", "Invoiced Sales by Product", "sales", "Approved invoice quantity and value by product.", "sales", ["product"], ["item", "invoice"]),
  table("sales-by-family", "Sales by Product Family", "sales", "Approved invoice quantity and value by canonical family.", "sales", ["family"], ["category", "group"]),
  table("sales-by-salesperson", "Sales by Salesperson", "sales", "Approved invoice sales and posted collection by owner.", "sales", ["salesperson"], ["salesman", "employee"]),
  table("sales-by-month", "Invoiced Sales by Month", "sales", "Approved invoice count and value grouped by month.", "sales", [], ["monthly"]),
  table("collections", "Collections Received", "sales", "Posted customer collections and payment modes.", "sales", ["customer"], ["receipt", "payment"]),
  table("gross-profit-product", "Gross Profit by Product", "sales", "Invoice revenue less authoritative dispatched-batch cost.", "sales", ["product"], ["profit", "margin"], "view_profit"),

  table("current-stock", "Current Batch Stock", "inventory", "Available quantity by product lot and batch.", "inventory", ["product", "status"], ["batch", "available"]),
  table("stock-summary", "Stock Summary", "inventory", "Consolidated available stock by canonical product.", "inventory", ["product", "family"], ["item", "balance"]),
  table("item-details", "Item Details", "inventory", "Product master, batch count, stock and standard price.", "inventory", ["product", "family", "status"], ["sku", "master"]),
  table("expiry-report", "Expiry Attention", "inventory", "Expired and near-expiry batches requiring action.", "inventory", ["product", "status"], ["expiry", "warning"]),
  table("stock-movement", "Stock Movements", "inventory", "Receipt and dispatch movement history by product.", "inventory", ["product", "status"], ["movement", "receive", "dispatch"]),

  table("import-register", "Import / Shipment Register", "imports", "Import cases, suppliers, references and status.", "import", ["supplier", "status"], ["shipment", "lc", "tt"]),
  table("import-po-register", "Import Purchase Order Register", "imports", "PO date, supplier, products, quantity and FOB.", "import", ["supplier", "status"], ["purchase", "po"]),
  table("imported-product-summary", "Imported Product Summary", "imports", "Imported quantity, FOB, additional cost and landed value.", "import", ["product", "family"], ["purchase", "item"], "view_sensitive_cost"),
  table("supplier-import-summary", "Supplier-wise Import Summary", "imports", "Import count, products, quantity and value by supplier.", "import", ["supplier"], ["vendor", "purchase"]),
  table("import-by-family", "Import by Product Family", "imports", "Imported quantity and value by canonical product family.", "import", ["family"], ["category", "purchase"], "view_sensitive_cost"),
  table("po-receipt-difference", "PO / Import vs Warehouse Receipt", "imports", "Expected, received, rejected and outstanding quantity.", "import", ["supplier", "product", "status"], ["warehouse", "difference"]),
  table("import-cost-breakdown", "Import Cost Breakdown", "imports", "Recorded import cost rows and allocation methods.", "import", ["supplier"], ["cost", "allocation"], "view_sensitive_cost"),
  table("landed-cost-product", "Landed Cost by Product", "imports", "Final landed unit cost from immutable snapshots.", "import", ["product"], ["landed", "cost"], "view_sensitive_cost"),
  table("landed-cost-batch-history", "Landed Cost History by Batch", "imports", "Received batches and their inherited landed unit cost.", "import", ["product"], ["batch", "history"], "view_sensitive_cost"),

  table("sales-by-customer", "Invoiced Sales by Customer", "customers", "Approved invoice quantity and value by customer.", "customers", ["customer"], ["sales", "party"]),
  table("salesman-ledger", "Salesman Ledger", "customers", "Invoice debits and collection credits by salesperson.", "sales", ["salesperson", "customer"], ["employee", "ledger"]),
  table("customer-dues", "Customer Receivables / Dues", "customers", "Current sales, collection and outstanding due by customer.", "customers", ["customer"], ["outstanding", "receivable"]),
  table("customer-ledger", "Customer Running Ledger", "customers", "Opening due, invoice, collection and running balance.", "customers", ["customer"], ["statement", "running"]),

  table("monthly-ac-summary", "Monthly A/C Summary", "expenses", "Operating and non-operating cash summary for any period.", "accounts", [], ["account", "monthly"]),
  table("daily-expenditure", "Daily Expenditure", "expenses", "Posted expenses with category, person and payment account.", "accounts", ["employee", "account"], ["expense", "daily"]),
  table("monthly-category", "Expense Category Summary", "expenses", "Posted expense totals grouped by category.", "accounts", [], ["expense", "category"]),
  table("expense-by-person", "Expense by Person", "expenses", "Employee-attributed operating expenditure.", "accounts", ["employee"], ["staff", "expense"]),
  table("expense-by-unit", "Expense by Office / Warehouse / Company", "expenses", "Operating expense grouped by organizational unit.", "accounts", [], ["unit", "office"]),
  table("monthly-expense", "Monthly Expense", "expenses", "Posted operating expense grouped by month.", "accounts", [], ["month"]),
  table("ta-da", "TA/DA Approved Sheet Data", "expenses", "Approved travel and daily allowance detail.", "accounts", ["employee"], ["travel", "allowance"]),
  table("account-transactions", "Cash / Bank Transactions", "expenses", "All cash, bank and mobile-banking transaction rows.", "accounts", ["account"], ["ledger", "transaction"]),
  table("day-book", "Day Book", "expenses", "Chronological account movement with source and reference.", "accounts", ["account"], ["today", "book"]),
  table("cash-transactions", "Cash Transactions", "expenses", "Transactions posted through cash accounts.", "accounts", ["account"], ["cash"]),
  table("mobile-banking-transactions", "Mobile Banking Transactions", "expenses", "Transactions posted through mobile-banking accounts.", "accounts", ["account"], ["bkash", "mobile"]),
  table("bank-transactions", "Bank Transactions", "expenses", "Transactions posted through bank accounts.", "accounts", ["account"], ["bank"]),
  table("cash-movement-summary", "Cash Movement Summary", "expenses", "Real cash and bank inflow and outflow by account.", "accounts", ["account"], ["flow", "movement"]),

  performance("salesperson-performance", "Sales Team Comparison", "Comparison of owned sales, collections, customers and activity.", ["salesperson", "territory"], ["team", "employee"]),
  performance("employee-performance", "Employee Performance", "Named employee operational and marketing performance.", ["employee", "territory"], ["staff", "personnel"]),
  performance("employee-activity", "Employee Activity", "Open a permitted employee's connected activity and performance record.", ["employee", "territory"], ["daily", "weekly", "monthly", "staff"]),
  marketing("daily-marketing", "Daily Marketing Activity", "Field and office marketing activity by date and employee.", "today", ["daily", "activity"]),
  marketing("lead-funnel", "Lead Funnel", "Lead volume and progression by pipeline stage.", "funnel", ["lead", "pipeline"]),
  marketing("follow-up-status", "Follow-up Status", "Pending, completed and overdue follow-up work.", "week", ["followup", "overdue"]),
  marketing("target-actual", "Target vs Actual", "Official activity, sales, visit and collection progress.", "target", ["target", "progress"]),
  marketing("visit-verification", "Visit Verification", "Field visit evidence and verification status.", "verification", ["gps", "visit"])
];

function table(id: string, title: string, category: ReportCategoryId, description: string, permission: PermissionKey, filters: ReportFilterKey[], keywords: string[], capability?: Capability): ReportDefinition {
  const sourceGroup: ReportSourceGroup = category === "inventory" ? "inventory" : category === "imports" ? "imports" : category === "expenses" ? "expenses" : "sales";
  return { id, title, category, description, keywords, source: "table", sourceGroup, tableId: id, filters, printable: true, exportable: true, permission: { key: permission, action: "view" }, capability };
}

function performance(id: string, title: string, description: string, filters: ReportFilterKey[], keywords: string[]): ReportDefinition {
  return { id, title, category: "employees", description, keywords, source: "performance", sourceGroup: "sales", tableId: "salesperson-performance", filters, printable: true, exportable: true, permission: { key: "marketing", action: "view" } };
}

function marketing(id: string, title: string, description: string, marketingPreset: string, keywords: string[]): ReportDefinition {
  return { id, title, category: "employees", description, keywords, source: "marketing", filters: ["employee", "territory"], printable: true, exportable: true, permission: { key: "marketing", action: "view" }, marketingPreset };
}

export const reportCatalog = reports;

export function visibleReportCatalog(user: User | null | undefined) {
  return reportCatalog.filter((report) => hasEffectivePermission(user, report.permission.key, report.permission.action) && (!report.capability || hasCapability(user, report.capability)));
}

export function reportSearchText(report: ReportDefinition) {
  const category = reportCategories.find((entry) => entry.id === report.category)?.title ?? report.category;
  return [report.title, report.description, category, ...report.keywords].join(" ").toLowerCase();
}
