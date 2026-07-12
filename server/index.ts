import cors from "cors";
import express, { type Request } from "express";
import { aiRecommendations, collections as seedCollections, dashboardSummary, demoUsers, passwordByEmail } from "../src/data/seed";
import { canDeleteRecordForRole, canEditRecordForRole, sanitizeRecordForRole, sanitizeRecordsForRole } from "../src/lib/permissions/dataVisibility";
import type { AiChatResponse, AiRecommendation, ApiResponse, DashboardSummary, EntityRecord, Role, Session, User } from "../src/types";

const app = express();
const port = Number(process.env.API_PORT ?? 4174);

const collections: Record<string, EntityRecord[]> = structuredClone(seedCollections);
const aiItems: AiRecommendation[] = structuredClone(aiRecommendations);
const pendingSignupRequests: EntityRecord[] = [];
const companyScopedCollections = new Set(Object.keys(collections).filter((key) => !["companies", "users", "audit-logs", "login-activity", "documents"].includes(key)));

companyScopedCollections.forEach((key) => {
  collections[key]?.forEach((row) => {
    row.companyId = row.companyId || "cmp-001";
  });
});

app.use(cors());
app.use((req, _res, next) => {
  const [path = "/", query] = req.url.split("?");
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!normalizedPath.startsWith("/api")) {
    normalizedPath = normalizedPath === "/" ? "/api" : `/api${normalizedPath}`;
  }

  normalizedPath = normalizedPath.replace(/^\/api\/v1(?=\/|$)/, "/api");
  req.url = `${normalizedPath}${query ? `?${query}` : ""}`;
  next();
});
app.use(express.json({ limit: "5mb" }));
app.use((req, _res, next) => {
  if (req.url.startsWith("/api/v1/")) {
    req.url = req.url.replace(/^\/api\/v1/, "/api");
  }
  next();
});

function respond<T>(data: T, message = "OK", meta?: ApiResponse<T>["meta"]): ApiResponse<T> {
  return { success: true, message, data, meta };
}

function fail(message: string, data: EntityRecord | null = null): ApiResponse<EntityRecord | null> {
  return { success: false, message, data };
}

function currentUser(req: Request): User | null {
  const userId = String(req.headers["x-user-id"] ?? "");
  return demoUsers.find((user) => user.id === userId) ?? null;
}

function currentRole(req: Request): Role | null {
  const role = String(req.headers["x-role"] ?? "");
  return demoUsers.find((user) => user.role === role)?.role ?? null;
}

function currentCompanyId(req: Request) {
  return String(req.headers["x-company-id"] ?? "cmp-001");
}

function scopedRows(key: string, rows: EntityRecord[], req: Request) {
  const role = currentRole(req);
  const user = currentUser(req);
  const companyId = currentCompanyId(req);
  const salesScopedKeys = new Set([
    "customers",
    "sales/quotations",
    "sales/orders",
    "sales/challans",
    "sales/invoices",
    "sales/returns",
    "sales/collections",
    "sales/visits",
    "sales/targets"
  ]);
  let visibleRows = rows;

  if (companyScopedCollections.has(key)) {
    visibleRows = visibleRows.filter((row) => String(row.companyId ?? "cmp-001") === companyId);
  }

  if (role === "Sales Executive" && user && salesScopedKeys.has(key)) {
    return visibleRows.filter((row) => row.ownerId === user.id || row.assignedSalesExecutive === user.name);
  }

  return visibleRows;
}

function idFor(key: string) {
  return `${key.replace(/[^a-z0-9]/gi, "-")}-${Date.now()}`;
}

function statusForAction(action: string) {
  const map: Record<string, string> = {
    submit: "Pending Approval",
    approve: "Approved",
    reject: "Rejected",
    post: "Posted",
    cancel: "Cancelled"
  };
  return map[action] ?? "Updated";
}

function money(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(value);
}

function numberValue(row: EntityRecord, key: string) {
  return typeof row[key] === "number" ? row[key] : Number(row[key] ?? 0);
}

function sum(rows: EntityRecord[], key: string) {
  return rows.reduce((total, row) => total + numberValue(row, key), 0);
}

function reportRowsForRole(req: Request) {
  const role = currentRole(req) ?? "Managing Director";

  if (role === "Sales Executive") {
    const invoices = scopedRows("sales/invoices", collections["sales/invoices"] ?? [], req);
    const collectionsRows = scopedRows("sales/collections", collections["sales/collections"] ?? [], req);
    const visits = scopedRows("sales/visits", collections["sales/visits"] ?? [], req);
    return [
      { id: "rep-my-sales", label: "My Sales", sales: sum(invoices, "totalGrossRevenue"), collection: 0, expense: 0, status: "Ready" },
      { id: "rep-my-collection", label: "My Collection", sales: 0, collection: sum(collectionsRows, "amount"), expense: 0, status: "Ready" },
      { id: "rep-my-visits", label: "My Visit Plan", sales: visits.length, collection: 0, expense: 0, status: "Ready" },
      { id: "rep-stock", label: "Available Stock", sales: sum(collections["inventory/stock"] ?? [], "currentStockInHand"), collection: 0, expense: 0, status: "Ready" }
    ];
  }

  if (role === "Sales Manager") {
    const invoices = scopedRows("sales/invoices", collections["sales/invoices"] ?? [], req);
    const collectionsRows = scopedRows("sales/collections", collections["sales/collections"] ?? [], req);
    return [
      { id: "rep-team-sales", label: "Team Sales", sales: sum(invoices, "totalGrossRevenue"), collection: sum(collectionsRows, "amount"), expense: 0, status: "Ready" },
      { id: "rep-target", label: "Collection vs Target", sales: 3970000, collection: sum(collectionsRows, "amount"), expense: 0, status: "Review" },
      { id: "rep-territory", label: "Territory Sales", sales: 3970000, collection: 0, expense: 0, status: "Ready" },
      { id: "rep-credit", label: "Credit Follow-up", sales: 1770000, collection: 0, expense: 0, status: "Attention" }
    ];
  }

  return [
    { id: "rep-001", label: "Daily Sales", sales: 1080000, collection: 1200000, expense: 37500, status: "Ready" },
    { id: "rep-002", label: "Weekly Sales", sales: 3970000, collection: 1850000, expense: 235000, status: "Ready" },
    { id: "rep-003", label: "Monthly P&L", sales: 3970000, collection: 1850000, expense: 2888350, status: "Review" },
    { id: "rep-004", label: "Inventory Valuation", sales: 0, collection: 0, expense: 1286145, status: "Ready" }
  ];
}

function dashboardForRole(req: Request): DashboardSummary {
  const role = currentRole(req) ?? "Managing Director";
  const data: DashboardSummary = { ...dashboardSummary, role };

  if (role === "Sales Executive") {
    const invoices = scopedRows("sales/invoices", collections["sales/invoices"] ?? [], req);
    const collectionsRows = scopedRows("sales/collections", collections["sales/collections"] ?? [], req);
    const customers = scopedRows("customers", collections.customers ?? [], req);
    const visits = scopedRows("sales/visits", collections["sales/visits"] ?? [], req);
    const sales = sum(invoices, "totalGrossRevenue");
    const collected = sum(collectionsRows, "amount");

    return {
      ...data,
      metrics: [
        { id: "m-sales-own", label: "My Sales", value: sales, unit: "BDT", trend: 8.2, status: "Good" },
        { id: "m-collection-own", label: "My Collections", value: collected, unit: "BDT", trend: 5.1, status: "Good" },
        { id: "m-customers-own", label: "My Customers", value: customers.length, unit: "accounts", trend: 0, status: "Normal" },
        { id: "m-visits-own", label: "Visit Logs", value: visits.length, unit: "visits", trend: 2.4, status: "Ready" },
        { id: "m-stock-view", label: "Available Stock", value: sum(collections["inventory/stock"] ?? [], "currentStockInHand"), unit: "pcs", trend: -3.1, status: "Normal" }
      ],
      importPipeline: [
        { id: "wf-qt", stage: "Quotation", active: 1, delayed: 0, value: sum(scopedRows("sales/quotations", collections["sales/quotations"] ?? [], req), "quantity") },
        { id: "wf-so", stage: "Order", active: 1, delayed: 0, value: sum(scopedRows("sales/orders", collections["sales/orders"] ?? [], req), "amount") },
        { id: "wf-dc", stage: "Challan", active: 1, delayed: 0, value: scopedRows("sales/challans", collections["sales/challans"] ?? [], req).length },
        { id: "wf-inv", stage: "Invoice", active: invoices.length, delayed: 0, value: sales },
        { id: "wf-col", stage: "Collection", active: collectionsRows.length, delayed: 0, value: collected }
      ],
      salesByProduct: invoices.map((invoice) => ({ id: `sp-${invoice.id}`, product: invoice.productName, sales: invoice.totalGrossRevenue })),
      salesByCustomer: invoices.map((invoice) => ({ id: `sc-${invoice.id}`, customer: invoice.customerName, sales: invoice.totalGrossRevenue })),
      targetVsAchievement: scopedRows("sales/targets", collections["sales/targets"] ?? [], req).map((target) => ({
        id: String(target.id),
        rep: target.salesRep,
        target: target.monthlyTarget,
        achieved: target.achieved
      })),
      aiSummary: {
        ...data.aiSummary,
        summary: "Your view is scoped to assigned customers, own sales documents, collections and visit follow-ups. Cost, landed cost and profit fields are intentionally hidden."
      }
    };
  }

  if (role === "Sales Manager") {
    return {
      ...data,
      metrics: data.metrics.filter((metric) => !["Gross Margin", "Net Profit", "Bank Balance", "Payables", "Inventory Valuation"].includes(String(metric.label))),
      aiSummary: {
        ...data.aiSummary,
        summary: "Team sales, targets, collections and credit follow-up are visible. Core import cost, landed cost and profit fields are restricted from the sales management view."
      }
    };
  }

  return data;
}

function effectiveChatRole(req: Request): Role {
  const signedInRole = currentRole(req) ?? "Managing Director";
  return signedInRole;
}

function rowsForRole(key: string, role: Role, req: Request) {
  const rows = collections[key] ?? [];
  const user = currentUser(req);

  if (role === "Sales Executive" && user?.role === "Sales Executive") {
    return scopedRows(key, rows, req);
  }

  return rows;
}

function chatAnswer(message: string, role: Role, req: Request): AiChatResponse {
  const text = message.toLowerCase();
  const suggestions = [
    "Show sales and profit summary",
    "Explain landed cost for PO-2026-001",
    "What inventory needs attention?",
    "What can my role access?"
  ];
  const restrictedForRole = (module: string) =>
    `${role} does not have enough permission for ${module}. I can summarize allowed modules for this role, but I should not expose restricted financial or operational details.`;

  if (text.includes("permission") || text.includes("access") || text.includes("role")) {
    const roleNotes: Record<Role, string> = {
      "Super Admin": "full access to users, roles, settings, audit logs, all modules, company scope and all actions.",
      "Managing Director": "executive dashboards, approvals, P&L, bank position, sales reports, import pipeline, inventory valuation, receivables/payables and AI summaries.",
      Accounts: "cash book, bank book, general ledger, vouchers, receivables, payables, payroll, expenses, bank reconciliation and finance reports.",
      "Import Officer": "suppliers, inquiries, PI, PO, LC, TT, shipments, customs documents and landed cost drafts.",
      "Warehouse Manager": "GRN, warehouse receiving, BIN, batch/LOT/expiry, stock transfers, physical count, FEFO and inventory reports.",
      "Sales Manager": "team monitoring, targets, quotation/invoice approval, discount approval, territory performance and collection oversight.",
      "Sales Executive": "own customers, own quotations, own orders, own invoices, own visit logs and own collection entries only."
    };

    return {
      role,
      answer: `For ${role}, access is ${roleNotes[role]} Sidebar, route, button and data visibility are controlled by the central RBAC matrix.`,
      sources: ["RBAC permission matrix", "Latest proposal: User Roles & Access Control"],
      suggestions
    };
  }

  if (text.includes("landed") || text.includes("custom") || text.includes("po-2026-001") || text.includes("lc-77612")) {
    if (!["Super Admin", "Managing Director", "Import Officer", "Warehouse Manager"].includes(role)) {
      return { role, answer: restrictedForRole("customs and landed cost"), sources: ["RBAC permission matrix"], suggestions };
    }

    const landed = collections["customs/landed-cost"] ?? [];
    const lines = landed
      .map((row) => `${row.productCode} ${row.productName}: landed cost/U ${money(numberValue(row, "totalLandedUnit"))}, margin preview ${row.marginPreview}%`)
      .join("; ");
    return {
      role,
      answer: `PO-2026-001 / CN-9982 / LC-77612 landed-cost tracker has ${landed.length} product lines. ${lines}. Formula followed: product import value + freight + insurance + duty + VAT + AIT + port + C&F + transport + other approved import expenses.`,
      sources: ["Mipro HealthCare Corp.xlsx: Landed costs", "Latest proposal: Import, Procurement & Landed Cost Management"],
      suggestions: ["Show stock from this PO", "Which product has best margin?", "What needs approval?"]
    };
  }

  if (text.includes("stock") || text.includes("inventory") || text.includes("expiry") || text.includes("fefo") || text.includes("warehouse")) {
    if (!["Super Admin", "Managing Director", "Import Officer", "Warehouse Manager", "Sales Manager", "Sales Executive"].includes(role)) {
      return { role, answer: restrictedForRole("inventory"), sources: ["RBAC permission matrix"], suggestions };
    }

    const stockRows = collections["inventory/stock"] ?? [];
    const batches = collections["inventory/batches"] ?? [];
    const totalUnits = sum(stockRows, "currentStockInHand");
    const stockValue = sum(stockRows, "totalStockAssetValue");
    const alerts = batches.filter((row) => String(row.status ?? "").includes("Alert"));
    const firstFefo = batches.sort((a, b) => numberValue(a, "fefoRank") - numberValue(b, "fefoRank"))[0];
    return {
      role,
      answer: `Current warehouse stock is ${totalUnits.toLocaleString("en-BD")} units with asset value ${money(stockValue)}. ${alerts.length} batch alert(s) need attention. FEFO first issue recommendation is ${firstFefo?.product ?? "N/A"} batch ${firstFefo?.batchNumber ?? "N/A"} from BIN ${firstFefo?.binLocation ?? "N/A"}.`,
      sources: ["Mipro HealthCare Corp.xlsx: Warehouse Inventory Management", "Latest proposal: Warehouse, Batch, LOT, Expiry & Inventory Control"],
      suggestions: ["Show expiry alerts", "Explain FEFO", "Which stock is highest value?"]
    };
  }

  if (text.includes("gps") || text.includes("track") || text.includes("route") || text.includes("mobile") || text.includes("visit")) {
    if (!["Super Admin", "Managing Director", "Sales Manager", "Sales Executive"].includes(role)) {
      return { role, answer: restrictedForRole("field sales tracking"), sources: ["RBAC permission matrix"], suggestions };
    }

    const visits = rowsForRole("sales/visits", role, req);
    const checkedIn = visits.filter((row) => row.gpsLat && row.gpsLng);
    const scopeText =
      role === "Sales Executive" ? "This is scoped to the signed-in sales executive's own visit logs." : "This includes all visible field-team visit logs for the role.";
    const latest = checkedIn[0];
    return {
      role,
      answer: `${scopeText} I can see ${checkedIn.length} GPS check-in(s). Latest evidence is ${latest?.customer ?? "N/A"} at ${latest?.checkInTime ?? "N/A"} with coordinates ${latest?.gpsLat ?? "N/A"}, ${latest?.gpsLng ?? "N/A"} and ${latest?.accuracyMeter ?? "N/A"}m accuracy. The Mobile Sales Control page shows these on a no-key OpenStreetMap route view.`,
      sources: ["Latest proposal: Mobile App for Sales Team & Managers", "Meeting minutes: GPS Tracking", "sales/visits API"],
      suggestions: ["Open mobile sales control", "Show my sales summary", "What can my role access?"]
    };
  }

  if (text.includes("sales") || text.includes("invoice") || text.includes("customer") || text.includes("collection") || text.includes("profit")) {
    if (role === "Accounts" && text.includes("profit")) {
      return { role, answer: restrictedForRole("management profit details outside finance report view"), sources: ["RBAC permission matrix"], suggestions };
    }

    const invoices = rowsForRole("sales/invoices", role, req);
    const collectionsRows = rowsForRole("sales/collections", role, req);
    const customers = rowsForRole("customers", role, req);
    const revenue = sum(invoices, "totalGrossRevenue");
    const profit = sum(invoices, "totalProfitRealized");
    const collected = sum(collectionsRows, "amount");
    const scopeText =
      role === "Sales Executive" ? "This is scoped to the signed-in sales executive's own records." : "This includes all visible team/company records for the role.";
    if (role === "Sales Executive" || role === "Sales Manager") {
      return {
        role,
        answer: `${scopeText} I can see ${invoices.length} invoice(s), ${customers.length} customer(s), visible revenue ${money(revenue)}, and collection entries totaling ${money(collected)}. Purchase cost, landed cost and profit are hidden for sales privacy.`,
        sources: ["Mipro HealthCare Corp.xlsx: Sales Tracking & Revenue", "Latest proposal: Sales, CRM & Customer Management", "Meeting minutes: Sales privacy"],
        suggestions: ["Show overdue collection risk", "Who are top customers?", "Can I approve discounts?"]
      };
    }
    return {
      role,
      answer: `${scopeText} I can see ${invoices.length} invoice(s), ${customers.length} customer(s), revenue ${money(revenue)}, realized gross profit ${money(profit)}, and collection entries totaling ${money(collected)}.`,
      sources: ["Mipro HealthCare Corp.xlsx: Sales Tracking & Revenue", "Latest proposal: Sales, CRM & Customer Management"],
      suggestions: ["Show overdue collection risk", "Who are top customers?", "Can I approve discounts?"]
    };
  }

  if (text.includes("receivable") || text.includes("payable") || text.includes("bank") || text.includes("voucher") || text.includes("accounts")) {
    if (!["Super Admin", "Managing Director", "Accounts", "Sales Manager"].includes(role)) {
      return { role, answer: restrictedForRole("accounts and finance"), sources: ["RBAC permission matrix"], suggestions };
    }

    const receivable = sum(collections["accounts/receivables"] ?? [], "totalDue");
    const payable = sum(collections["accounts/payables"] ?? [], "amount");
    const bank = sum(collections.banks ?? [], "balance");
    return {
      role,
      answer: `Visible finance snapshot: receivables ${money(receivable)}, payables ${money(payable)}, and bank balance ${money(bank)} across active bank accounts. Voucher posting remains human-controlled.`,
      sources: ["Latest proposal: Accounts & Finance", "Mipro HealthCare Corp.xlsx: Dashboard Summary"],
      suggestions: ["Show overdue receivables", "Explain voucher status", "Summarize bank position"]
    };
  }

  if (text.includes("latest") || text.includes("proposal") || text.includes("excel") || text.includes("mipro")) {
    return {
      role,
      answer:
        "This prototype is grounded in the latest custom ERP proposal and Mipro workbook seed data: PO-2026-001, CN-9982, LC-77612, Mip001/Mip002/Mip003 landed costs, 17,500 stock units, BDT 1,286,145 stock asset value, and sales ledger entries for Dhaka Medical College Hospital, Popular Hospital Uttara and Labaid Group.",
      sources: ["Project_Requirements_Presentation.pdf", "Mipro HealthCare Corp.xlsx"],
      suggestions
    };
  }

  return {
    role,
    answer:
      `I can help ${role} with role-safe ERP questions about procurement, landed cost, shipments, GRN, inventory, sales, collections, accounts, reports, audit/security and AI recommendations. Ask for a summary, risk, approval queue, customer dues, stock position, or landed-cost explanation.`,
    sources: ["ERP mock API", "RBAC permission matrix", "Latest proposal and Mipro workbook seed data"],
    suggestions
  };
}

app.get("/api/health", (_req, res) => {
  res.json(respond({ service: "mipro-erp-api", ok: true }));
});

app.get("/api/auth/demo-users", (_req, res) => {
  res.json(
    respond(
      demoUsers.map(({ email, name, role, title }) => ({ email, name, role, title })),
      "Demo users loaded"
    )
  );
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const user = demoUsers.find((item) => item.email === email);

  if (!user || passwordByEmail.get(user.email) !== password) {
    res.status(401).json(fail("Invalid email or password"));
    return;
  }

  const session: Session = {
    token: `mock-token-${user.id}`,
    user
  };
  res.json(respond(session, "Login successful"));
});

app.post("/api/auth/signup-request", (req, res) => {
  const payload = req.body as EntityRecord;
  const request = {
    ...payload,
    id: payload.id || idFor("signup-request"),
    status: "Pending",
    createdAt: new Date().toISOString()
  };
  pendingSignupRequests.unshift(request);
  res.json(respond(request, "Access request submitted for Super Admin approval"));
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body as { email?: string };
  res.json(respond({ email: email ?? "" }, "Mock reset link generated"));
});

app.post("/api/auth/reset-password", (req, res) => {
  const { email } = req.body as { email?: string };
  res.json(respond({ email: email ?? "" }, "Mock password reset completed"));
});

app.get("/api/me", (req, res) => {
  const user = currentUser(req);
  if (!user) {
    res.status(401).json(fail("No active session"));
    return;
  }
  res.json(respond({ token: `mock-token-${user.id}`, user }, "Current user"));
});

app.get(["/api/dashboard", "/api/dashboard/summary"], (req, res) => {
  const role = currentRole(req) ?? "Managing Director";
  res.json(respond(dashboardForRole(req), "Dashboard loaded", { role, scoped: role === "Sales Executive" }));
});

app.get("/api/reports/summary", (req, res) => {
  res.json(respond(reportRowsForRole(req), "Reports loaded", { role: currentRole(req) ?? undefined }));
});

app.get("/api/imports/pipeline", (req, res) => {
  const role = currentRole(req) ?? "Managing Director";
  const pipeline = [
    ...scopedRows("supplier-inquiries", collections["supplier-inquiries"] ?? [], req).map((row) => ({ ...row, stage: "Supplier Inquiry" })),
    ...scopedRows("proforma-invoices", collections["proforma-invoices"] ?? [], req).map((row) => ({ ...row, stage: "PI Approval" })),
    ...scopedRows("purchase-orders", collections["purchase-orders"] ?? [], req).map((row) => ({ ...row, stage: "Purchase Order" })),
    ...scopedRows("lc-records", collections["lc-records"] ?? [], req).map((row) => ({ ...row, stage: "LC" })),
    ...scopedRows("tt-payments", collections["tt-payments"] ?? [], req).map((row) => ({ ...row, stage: "TT" })),
    ...scopedRows("shipments", collections.shipments ?? [], req).map((row) => ({ ...row, stage: "Shipment" })),
    ...scopedRows("customs/landed-cost", collections["customs/landed-cost"] ?? [], req).map((row) => ({ ...row, stage: "Customs" })),
    ...scopedRows("grn", collections.grn ?? [], req).map((row) => ({ ...row, stage: "Warehouse Receiving" }))
  ];
  res.json(respond(sanitizeRecordsForRole(pipeline, role), "Import pipeline loaded", { total: pipeline.length, role }));
});

app.get("/api/imports/:id", (req, res) => {
  const role = currentRole(req) ?? "Managing Director";
  const sources = ["supplier-inquiries", "proforma-invoices", "purchase-orders", "lc-records", "tt-payments", "shipments", "customs/landed-cost", "grn"];
  const item = sources.flatMap((key) => scopedRows(key, collections[key] ?? [], req)).find((row) => Object.values(row).some((value) => String(value) === req.params.id));

  if (!item) {
    res.status(404).json(fail("Import record not found"));
    return;
  }

  res.json(respond(sanitizeRecordForRole(item, role), "Import detail loaded", { role }));
});

app.get("/api/finance/summary", (req, res) => {
  const role = currentRole(req) ?? "Managing Director";
  if (!["Super Admin", "Managing Director", "Accounts"].includes(role)) {
    res.status(403).json(fail("Finance summary is restricted to executive and accounts roles."));
    return;
  }

  const payload = {
    cashBalance: sum(collections["accounts/cash-book"] ?? [], "balance"),
    bankBalance: sum(collections.banks ?? [], "balance"),
    receivable: sum(collections["accounts/receivables"] ?? [], "totalDue"),
    payable: sum(collections["accounts/payables"] ?? [], "amount"),
    vouchers: scopedRows("accounts/vouchers", collections["accounts/vouchers"] ?? [], req),
    cashBook: scopedRows("accounts/cash-book", collections["accounts/cash-book"] ?? [], req),
    bankBook: scopedRows("accounts/bank-book", collections["accounts/bank-book"] ?? [], req)
  };
  res.json(respond(payload, "Finance summary loaded", { role }));
});

app.get("/api/security/audit-log", (req, res) => {
  const role = currentRole(req) ?? "Managing Director";
  const rows = sanitizeRecordsForRole(scopedRows("audit-logs", collections["audit-logs"] ?? [], req), role);
  res.json(respond(rows, "Audit log loaded", { total: rows.length, role }));
});

app.post("/api/customs/landed-cost-preview", (req, res) => {
  const payload = req.body as Record<string, number | string>;
  const quantity = Number(payload.quantity ?? 1) || 1;
  const total =
    Number(payload.productImportValue ?? 0) +
    Number(payload.freight ?? 0) +
    Number(payload.insurance ?? 0) +
    Number(payload.duty ?? 0) +
    Number(payload.vat ?? 0) +
    Number(payload.ait ?? 0) +
    Number(payload.portCharges ?? 0) +
    Number(payload.cfCharges ?? 0) +
    Number(payload.transportCharges ?? 0) +
    Number(payload.otherApprovedExpenses ?? 0);
  res.json(
    respond(
      {
        totalLandedCost: total,
        perUnitLandedCost: total / quantity,
        formula: "Product Import Value + Freight + Insurance + Duty + VAT + AIT + Port + C&F + Transport + Other Approved Expenses"
      },
      "Landed cost preview calculated"
    )
  );
});

app.get("/api/ai/recommendations", (_req, res) => {
  res.json(respond(aiItems, "AI recommendations loaded"));
});

app.post("/api/ai/recommendations/:id/:action", (req, res) => {
  const item = aiItems.find((entry) => entry.id === req.params.id);
  if (!item) {
    res.status(404).json(fail("AI recommendation not found"));
    return;
  }
  const status = req.params.action === "approve" ? "Approved" : "Rejected";
  item.status = status;
  res.json(respond(item, `AI recommendation ${status.toLowerCase()}`));
});

app.post("/api/ai/chat", (req, res) => {
  const { message } = req.body as { message?: string };

  if (!message?.trim()) {
    res.status(400).json(fail("Chat message is required"));
    return;
  }

  const role = effectiveChatRole(req);
  res.json(respond(chatAnswer(message, role, req), "AI chat response generated", { role }));
});

app.use("/api", (req, res) => {
  const requestPath = req.path.replace(/^\/+/, "");
  const key = Object.keys(collections)
    .sort((a, b) => b.length - a.length)
    .find((candidate) => requestPath === candidate || requestPath.startsWith(`${candidate}/`));

  if (!key) {
    res.status(404).json(fail("API route not found"));
    return;
  }

  const rest = requestPath.slice(key.length).replace(/^\/+/, "");
  const [id, action] = rest.split("/").filter(Boolean);
  const list = collections[key];
  const role = currentRole(req) ?? "Managing Director";

  if (req.method === "GET" && !id) {
    const rows = scopedRows(key, list, req);
    const visibleRows = sanitizeRecordsForRole(rows, role);
    res.json(respond(visibleRows, "List loaded", { total: visibleRows.length, role, scoped: rows.length !== list.length }));
    return;
  }

  if (req.method === "GET" && id) {
    const item = scopedRows(key, list, req).find((row) => row.id === id);
    if (!item) {
      res.status(404).json(fail("Record not found"));
      return;
    }
    res.json(respond(sanitizeRecordForRole(item, role), "Detail loaded"));
    return;
  }

  if (req.method === "POST" && !id) {
    const user = currentUser(req);
    const payload = req.body as EntityRecord;
    const item: EntityRecord = {
      ...payload,
      id: payload.id || idFor(key),
      companyId: payload.companyId || (companyScopedCollections.has(key) ? currentCompanyId(req) : payload.companyId),
      ownerId: payload.ownerId || (currentRole(req) === "Sales Executive" ? user?.id : payload.ownerId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(item);
    res.status(201).json(respond(item, "Record created"));
    return;
  }

  const index = list.findIndex((row) => row.id === id);
  if (index < 0) {
    res.status(404).json(fail("Record not found"));
    return;
  }

  const scopedRecord = scopedRows(key, list, req).find((row) => row.id === id);
  if (!scopedRecord) {
    res.status(404).json(fail("Record not found in current role/company scope"));
    return;
  }

  if (req.method === "PATCH" && id) {
    if (!canEditRecordForRole(role, list[index])) {
      res.status(423).json(fail("Finalized records are locked. Only Super Admin can edit approved, posted or delivered data."));
      return;
    }
    const payload = req.body as EntityRecord;
    list[index] = { ...list[index], ...payload, id, updatedAt: new Date().toISOString() };
    res.json(respond(sanitizeRecordForRole(list[index], role), "Record updated"));
    return;
  }

  if (req.method === "DELETE" && id) {
    if (!canDeleteRecordForRole(role, list[index])) {
      res.status(423).json(fail("Finalized records are locked. Only Super Admin can delete approved, posted or delivered data."));
      return;
    }
    list.splice(index, 1);
    res.json(respond({ id }, "Record deleted"));
    return;
  }

  if (req.method === "POST" && id && action) {
    list[index] = {
      ...list[index],
      status: statusForAction(action),
      approvalTimeline: [
        "Created in draft",
        action === "submit" ? "Submitted for approval" : "Submitted for approval",
        ["approve", "post"].includes(action) ? `${action === "approve" ? "Approved" : "Posted"} by ${currentUser(req)?.name ?? role}` : `${statusForAction(action)} by ${currentUser(req)?.name ?? role}`
      ],
      updatedAt: new Date().toISOString()
    };
    res.json(respond(sanitizeRecordForRole(list[index], role), `Record ${action} completed`));
    return;
  }

  res.status(405).json(fail("Method not allowed"));
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Mipro ERP mock API listening on http://localhost:${port}`);
  });
}

export default app;
