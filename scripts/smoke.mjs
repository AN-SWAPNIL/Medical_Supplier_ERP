/* global window, document */
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:5173";
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? "msedge";
const sessionKey = "mipro-erp-session";
await mkdir("artifacts", { recursive: true });

const people = {
  super: { id: "u-super", name: "Sadia Karim", email: "superadmin@mipro.local", role: "Super Admin", title: "Owner & System Administrator", department: "Management", phone: "+880 1711 000001", avatarUrl: "/mipro-owner.png", status: "Active", capabilities: ["view_sensitive_cost", "edit_sensitive_cost", "finalize_landed_cost", "reopen_landed_cost", "view_profit", "approve_stock_override", "approve_special_price"] },
  md: { id: "u-md", name: "Mahmud Rahman", email: "md@mipro.local", role: "Managing Director", title: "Managing Director", department: "Management", phone: "", avatarUrl: "", status: "Active", capabilities: [] },
  accounts: { id: "u-accounts", name: "Nusrat Jahan", email: "accounts@mipro.local", role: "Accounts", title: "Accounts Officer", department: "Accounts", phone: "", avatarUrl: "", status: "Active", capabilities: [] },
  import: { id: "u-import", name: "Tanvir Hasan", email: "import@mipro.local", role: "Import Officer", title: "Import Officer", department: "Import", phone: "", avatarUrl: "", status: "Active", capabilities: [] },
  warehouse: { id: "u-warehouse", name: "Aminul Islam", email: "warehouse@mipro.local", role: "Warehouse Manager", title: "Warehouse Manager", department: "Warehouse", phone: "", avatarUrl: "", status: "Active", capabilities: ["approve_stock_override"] },
  salesManager: { id: "u-sales-manager", name: "Farhana Akter", email: "salesmanager@mipro.local", role: "Sales Manager", title: "Sales Manager", department: "Sales", phone: "", avatarUrl: "", status: "Active", capabilities: ["approve_special_price"] },
  sales: { id: "sales1", name: "Rafiq Ahmed", email: "sales1@mipro.local", role: "Sales Executive", title: "Sales Executive", department: "Sales", phone: "", avatarUrl: "", status: "Active", territory: "Dhaka North", capabilities: [] }
};

const session = (user) => ({ token: "mock-token-" + user.id, user });
const browser = await chromium.launch({ channel: browserChannel, headless: true });
const issues = [];
let expectedDocument404 = false;

function watchPage(page, name) {
  page.on("pageerror", (error) => issues.push(name + ": " + error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      if (expectedDocument404 && name === "document-viewer-pdf" && message.text().includes("404")) return;
      issues.push(name + ": console " + message.text());
    }
  });
}

async function preparePage({ name, width, height, user = null }) {
  const page = await browser.newPage({ viewport: { width, height } });
  if (user) {
    await page.addInitScript(
      ({ key, value }) => window.localStorage.setItem(key, JSON.stringify(value)),
      { key: sessionKey, value: session(user) }
    );
  }
  watchPage(page, name);
  return page;
}

async function visitAndCapture({ name, path, width, height, user = null }) {
  const page = await preparePage({ name, width, height, user });
  await page.goto(baseUrl + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  const heading = page.locator("h1:visible, h2:visible").first();
  await heading.waitFor({ timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  if (bodyWidth > width + 4) issues.push(name + ": horizontal page overflow (" + bodyWidth + "px)");
  await page.screenshot({ path: "artifacts/" + name + ".png", fullPage: true });
  console.log(name + ": " + await heading.textContent());
  await page.close();
}

const routes = [
  ["landing-desktop", "/", 1440, 1000, null],
  ["landing-mobile", "/", 390, 1000, null],
  ["login-desktop", "/login", 1440, 900, null],
  ["login-mobile", "/login", 390, 900, null],
  ["dashboard-desktop", "/app/dashboard", 1440, 1000, people.super],
  ["dashboard-mobile", "/app/dashboard", 390, 1100, people.super],
  ["profile-desktop", "/app/profile", 1440, 1000, people.super],
  ["profile-mobile", "/app/profile", 390, 1100, people.super],
  ["imports-desktop", "/app/imports", 1440, 1000, people.super],
  ["import-workspace-desktop", "/app/imports/imp-77612", 1440, 1200, people.super],
  ["import-workspace-mobile", "/app/imports/imp-77612", 390, 1200, people.super],
  ["inventory-desktop", "/app/inventory", 1440, 1000, people.super],
  ["inventory-mobile", "/app/inventory", 390, 1100, people.super],
  ["sales-desktop", "/app/sales", 1440, 1000, people.super],
  ["sales-mobile", "/app/sales", 390, 1100, people.super],
  ["field-team-desktop", "/app/sales?view=field-team", 1440, 1100, people.salesManager],
  ["field-team-mobile", "/app/sales?view=field-team", 390, 1100, people.sales],
  ["accounts-desktop", "/app/accounts", 1440, 1000, people.super],
  ["accounts-mobile", "/app/accounts", 390, 1100, people.super],
  ["reports-desktop", "/app/reports", 1440, 1000, people.super],
  ["reports-mobile", "/app/reports", 390, 1100, people.super],
  ["smart-insights-desktop", "/app/insights", 1440, 1000, people.salesManager],
  ["smart-insights-mobile", "/app/insights", 390, 1000, people.sales],
  ["settings-desktop", "/app/settings", 1440, 1100, people.super],
  ["settings-mobile", "/app/settings", 390, 1100, people.super],
  ["settings-migration-desktop", "/app/settings?view=migration", 1440, 1100, people.super]
];

for (const [name, path, width, height, user] of routes) {
  await visitAndCapture({ name, path, width, height, user });
}

const profilePassword = await preparePage({ name: "profile-password", width: 1280, height: 900, user: people.super });
await profilePassword.goto(baseUrl + "/app/profile", { waitUntil: "networkidle", timeout: 60000 });
await profilePassword.getByRole("button", { name: "Change Password" }).click();
await profilePassword.getByLabel("New Password").fill("temporary123");
await profilePassword.getByLabel("Confirm Password").fill("temporary123");
// The aggregate screenshot run can leave CSS transitions settling; the focused
// control flow is validated by the success toast and subsequent login request.
await profilePassword.getByRole("button", { name: "Update Password" }).click({ force: true });
await profilePassword.getByText("Password updated", { exact: true }).waitFor({ timeout: 30000 });
await profilePassword.close();
const changedLogin = await fetch(baseUrl + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: people.super.email, password: "temporary123" }) });
if (!changedLogin.ok) issues.push("Profile password change did not update login.");
await fetch(baseUrl + "/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: people.super.email, password: "password123" }) });

const costing = await preparePage({ name: "costing-result-desktop", width: 1440, height: 1200, user: people.super });
await costing.goto(baseUrl + "/app/imports/imp-77612", { waitUntil: "networkidle", timeout: 60000 });
await costing.getByRole("button", { name: "Preview" }).click();
await costing.getByText("Final Shipment Cost").waitFor({ timeout: 30000 });
await costing.screenshot({ path: "artifacts/costing-result-desktop.png", fullPage: true });
const reconciliation = await costing.locator("body").textContent();
if (!reconciliation?.includes("Explain") || !reconciliation.includes("Final Shipment Cost")) issues.push("Costing explanation/result is missing.");
const finalizeButton = costing.getByRole("button", { name: "Finalize Snapshot" });
if (await finalizeButton.isVisible().catch(() => false)) {
  await finalizeButton.click();
  await costing.getByText(/Snapshot v\d+/).waitFor({ timeout: 30000 });
} else if ((await costing.getByText(/Snapshot v\d+/).count()) === 0) {
  issues.push("Landed-cost snapshot state is unavailable after preview.");
}
await costing.close();

await visitAndCapture({ name: "costing-result-mobile", path: "/app/imports/imp-77612", width: 390, height: 1200, user: people.super });

const printRoutes = [
  ["print-quotation-digital", "/app/print/quotation/quo-1", 1200, 1000],
  ["print-order", "/app/print/order/so-1", 1200, 1000],
  ["print-challan", "/app/print/challan/del-2", 1200, 1000],
  ["print-receipt", "/app/print/receipt/col-1", 1200, 1000],
  ["print-import-cost", "/app/print/import-cost/imp-77612", 1200, 1000],
  ["print-quotation-mobile", "/app/print/quotation/quo-1", 390, 1000]
];
for (const [name, path, width, height] of printRoutes) {
  await visitAndCapture({ name, path, width, height, user: people.super });
}

const preprinted = await preparePage({ name: "print-quotation-preprinted", width: 1200, height: 1000, user: people.super });
await preprinted.goto(baseUrl + "/app/print/quotation/quo-1", { waitUntil: "networkidle", timeout: 60000 });
await preprinted.getByRole("tab", { name: "Preprinted Paper" }).click();
await preprinted.waitForFunction(() => {
  const table = document.querySelector(".print-sheet table");
  return table && table.getBoundingClientRect().width > 500;
});
await preprinted.screenshot({ path: "artifacts/print-quotation-preprinted.png", fullPage: true });
const preprintedWidth = await preprinted.locator(".print-sheet table").evaluate((element) => element.getBoundingClientRect().width);
if (preprintedWidth < 500) issues.push("Preprinted quotation content did not retain the calibrated A4 safe width.");
await preprinted.close();

const customerLedger = await preparePage({ name: "customer-ledger-desktop", width: 1440, height: 1000, user: people.super });
await customerLedger.goto(baseUrl + "/app/sales", { waitUntil: "networkidle", timeout: 60000 });
await customerLedger.getByLabel("Open customer ledger").selectOption("cus-labaid");
await customerLedger.getByText("Current Due", { exact: true }).waitFor({ timeout: 30000 });
await customerLedger.screenshot({ path: "artifacts/customer-ledger-desktop.png", fullPage: true });
await customerLedger.close();

const employeeReport = await preparePage({ name: "employee-performance-desktop", width: 1440, height: 1100, user: people.salesManager });
await employeeReport.goto(baseUrl + "/app/reports?view=sales&table=salesperson-performance&employee=all", { waitUntil: "networkidle", timeout: 60000 });
await employeeReport.getByLabel("From Date").fill("2026-08-01");
await employeeReport.getByLabel("To Date").fill("2026-08-31");
await employeeReport.getByRole("heading", { name: "Salesperson Performance" }).waitFor({ timeout: 30000 });
await employeeReport.getByTestId("employee-picker").locator("button").first().click();
await employeeReport.getByPlaceholder("Search name / ID / territory").fill("SE-001");
await employeeReport.getByRole("option", { name: /Rafiq Ahmed/ }).click();
await employeeReport.getByText(/Rafiq Ahmed \| Activity details/).waitFor({ timeout: 30000 });
await employeeReport.getByRole("button", { name: "Print Report" }).waitFor();
await employeeReport.getByRole("button", { name: "View Field Activity" }).waitFor();
const performanceText = await employeeReport.locator("body").textContent();
if (!performanceText?.includes("Delivered Sales") || !performanceText.includes("Collections")) issues.push("Employee report summary is incomplete.");
await employeeReport.screenshot({ path: "artifacts/employee-performance-desktop.png", fullPage: true });
await employeeReport.getByRole("button", { name: "Print Report" }).click();
await employeeReport.getByText("SALES EMPLOYEE PERFORMANCE REPORT", { exact: true }).waitFor({ timeout: 30000 });
await employeeReport.screenshot({ path: "artifacts/print-employee-performance.png", fullPage: true });
await employeeReport.close();

const fieldTeam = await preparePage({ name: "field-team-interactions", width: 1440, height: 1050, user: people.salesManager });
await fieldTeam.goto(baseUrl + "/app/sales?view=field-team", { waitUntil: "domcontentloaded", timeout: 60000 });
await fieldTeam.getByTestId("field-team-workspace").waitFor({ timeout: 30000 });
await fieldTeam.locator(".leaflet-container").waitFor({ timeout: 30000 });
await fieldTeam.waitForTimeout(1000);
if ((await fieldTeam.locator(".field-map-marker").count()) < 1) issues.push("Field Team map rendered without coordinate markers.");
await fieldTeam.getByLabel("Territory").selectOption("Dhaka North");
await fieldTeam.getByLabel("Tracking Status").selectOption("LIVE");
await fieldTeam.getByText("Rafiq Ahmed", { exact: true }).first().click();
await fieldTeam.getByText(/GPS accuracy/).waitFor({ timeout: 30000 });
await fieldTeam.screenshot({ path: "artifacts/field-team-filtered-desktop.png", fullPage: true });
await fieldTeam.getByRole("tab", { name: "Route / Visit History" }).click();
await fieldTeam.getByText("Visit timeline", { exact: true }).waitFor({ timeout: 30000 });
await fieldTeam.locator(".leaflet-container").waitFor();
if ((await fieldTeam.getByText(/No synthetic distance is calculated/).count()) === 0) issues.push("Route history does not explain its coordinate-only path.");
await fieldTeam.screenshot({ path: "artifacts/field-team-history-desktop.png", fullPage: true });
await fieldTeam.close();

const insightsPage = await preparePage({ name: "smart-insights-interactions", width: 1280, height: 900, user: people.salesManager });
await insightsPage.goto(baseUrl + "/app/insights", { waitUntil: "networkidle", timeout: 60000 });
await insightsPage.getByTestId("smart-insights-page").waitFor();
await insightsPage.getByRole("tab", { name: /Field Team/ }).click();
await insightsPage.getByText(/field update|field team feed/i).waitFor();
const cardsBeforeDismiss = await insightsPage.getByTestId("ai-recommendation").count();
await insightsPage.getByRole("button", { name: "Dismiss recommendation" }).first().click();
if ((await insightsPage.getByTestId("ai-recommendation").count()) !== cardsBeforeDismiss - 1) issues.push("Smart Insight dismissal did not remove only the selected alert.");
await insightsPage.screenshot({ path: "artifacts/smart-insights-filtered.png", fullPage: true });
await insightsPage.close();

const documentPage = await preparePage({ name: "document-viewer-pdf", width: 1440, height: 1000, user: people.super });
await documentPage.goto(baseUrl + "/app/imports/imp-77612", { waitUntil: "networkidle", timeout: 60000 });
await documentPage.getByRole("button", { name: "View", exact: true }).first().click();
const pdfViewer = documentPage.getByTestId("document-viewer");
await pdfViewer.waitFor({ timeout: 30000 });
await pdfViewer.locator("iframe").waitFor({ timeout: 30000 });
await documentPage.screenshot({ path: "artifacts/document-viewer-pdf.png", fullPage: true });
await pdfViewer.getByRole("button", { name: "Close document viewer" }).last().click();
await documentPage.getByRole("button", { name: /View freight-invoice\.pdf/ }).click();
await documentPage.getByRole("dialog", { name: /freight-invoice\.pdf/ }).waitFor({ timeout: 30000 });
await documentPage.getByRole("dialog", { name: /freight-invoice\.pdf/ }).getByRole("button", { name: "Close document viewer" }).last().click();

await documentPage.route("**/api/documents/doc-pi/content", (route) => route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ ok: false, message: "The attachment metadata exists, but its demo file is missing." }) }));
expectedDocument404 = true;
await documentPage.getByRole("button", { name: "View", exact: true }).first().click();
await documentPage.getByText("Preview unavailable", { exact: true }).waitFor({ timeout: 30000 });
expectedDocument404 = false;
await documentPage.getByTestId("document-viewer").getByRole("button", { name: "Close document viewer" }).last().click();

await documentPage.getByTestId("ai-launcher").click();
await documentPage.getByTestId("ai-assistant").waitFor();
await documentPage.getByRole("button", { name: "Explain the current shipment stage" }).click();
await documentPage.getByText(/LC-77612 is at/).waitFor({ timeout: 30000 });
await documentPage.screenshot({ path: "artifacts/contextual-ai-import.png", fullPage: true });
await documentPage.close();

const expenseDocument = await preparePage({ name: "document-viewer-image", width: 1280, height: 900, user: people.super });
await expenseDocument.goto(baseUrl + "/app/accounts", { waitUntil: "networkidle", timeout: 60000 });
await expenseDocument.getByRole("button", { name: "View office-utility-receipt.png" }).click();
const imageViewer = expenseDocument.getByTestId("document-viewer");
await imageViewer.locator("img").waitFor({ timeout: 30000 });
await expenseDocument.screenshot({ path: "artifacts/document-viewer-image.png", fullPage: true });
await expenseDocument.close();

const mobileAi = await preparePage({ name: "contextual-ai-mobile", width: 390, height: 844, user: people.sales });
await mobileAi.goto(baseUrl + "/app/sales", { waitUntil: "networkidle", timeout: 60000 });
await mobileAi.getByTestId("ai-launcher").click();
const mobileAssistant = mobileAi.getByTestId("ai-assistant");
await mobileAssistant.waitFor();
const aiBox = await mobileAssistant.boundingBox();
if (!aiBox || aiBox.width > 390 || aiBox.height > 844 || aiBox.x < 0 || aiBox.y < 0) issues.push("Mobile AI assistant does not fit the viewport.");
await mobileAi.getByPlaceholder("Ask about this workspace...").fill("What is the landed cost and profit margin?");
await mobileAi.getByRole("button", { name: "Send question" }).click();
await mobileAi.getByText(/cannot provide supplier pricing/i).waitFor({ timeout: 30000 });
await mobileAi.screenshot({ path: "artifacts/contextual-ai-mobile.png", fullPage: true });
await mobileAi.close();

const expectedNavigation = new Map([
  [people.super, ["Dashboard", "Imports", "Inventory", "Sales", "Expenses & Accounts", "Reports", "Settings"]],
  [people.md, ["Dashboard", "Imports", "Inventory", "Sales", "Expenses & Accounts", "Reports"]],
  [people.accounts, ["Dashboard", "Sales", "Expenses & Accounts", "Reports"]],
  [people.import, ["Dashboard", "Imports"]],
  [people.warehouse, ["Dashboard", "Inventory"]],
  [people.salesManager, ["Dashboard", "Inventory", "Sales", "Reports"]],
  [people.sales, ["Dashboard", "Sales", "Reports"]]
]);
const deniedRoute = new Map([
  [people.md, "/app/settings"],
  [people.accounts, "/app/imports"],
  [people.import, "/app/accounts"],
  [people.warehouse, "/app/accounts"],
  [people.salesManager, "/app/imports"],
  [people.sales, "/app/accounts"]
]);

for (const [user, expected] of expectedNavigation) {
  const name = "role-" + user.role.toLowerCase().replaceAll(" ", "-");
  const page = await preparePage({ name, width: 1280, height: 900, user });
  await page.goto(baseUrl + "/app/dashboard", { waitUntil: "networkidle", timeout: 60000 });
  const actual = (await page.locator("nav a").allTextContents()).map((value) => value.trim()).filter(Boolean);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    issues.push(user.role + " navigation mismatch: " + JSON.stringify(actual));
  }
  if (deniedRoute.has(user)) {
    await page.goto(baseUrl + deniedRoute.get(user), { waitUntil: "networkidle", timeout: 60000 });
    if (!(await page.locator("body").textContent())?.includes("Access denied")) {
      issues.push(user.role + " direct URL denial failed.");
    }
  }
  await page.close();
}

const salesPage = await preparePage({ name: "sales-executive-own-record", width: 1280, height: 900, user: people.sales });
await salesPage.goto(baseUrl + "/app/sales", { waitUntil: "networkidle", timeout: 60000 });
if ((await salesPage.getByText("My Customers").count()) === 0) issues.push("Sales Executive own-record sales view is missing.");
await salesPage.close();

const headers = { "x-user-id": people.super.id, "x-role": people.super.role, "Content-Type": "application/json" };
for (const path of ["/api/health", "/api/dashboard", "/api/imports", "/api/inventory/stock", "/api/customers", "/api/expenses", "/api/reports", "/api/settings/decisions", "/api/field-team/current", "/api/ai/recommendations?entityType=insights&route=%2Fapp%2Finsights"]) {
  const response = await fetch(baseUrl + path, { headers });
  console.log("api " + path + ": " + response.status);
  if (!response.ok) issues.push(path + " returned " + response.status);
}

const finalizedImport = await fetch(baseUrl + "/api/imports/imp-77612", { headers }).then((response) => response.json());
if (!finalizedImport.data?.snapshot?.immutable) issues.push("Finalized landed-cost snapshot is missing or mutable.");

const importHeaders = { "x-user-id": people.import.id, "x-role": people.import.role, "Content-Type": "application/json" };
const redactedImport = await fetch(baseUrl + "/api/imports/imp-77612", { headers: importHeaders }).then((response) => response.json());
if (redactedImport.data?.costs?.length || redactedImport.data?.snapshot) issues.push("Sensitive import values were exposed to Import Officer.");

const deniedCostAction = await fetch(baseUrl + "/api/imports/imp-77612/costs", {
  method: "POST",
  headers: importHeaders,
  body: JSON.stringify({ name: "Denied", amountForeign: "1.00", amountBdt: "1.00", currency: "BDT", exchangeRate: "1", allocationMethod: "QUANTITY", appliesToItemIds: [] })
});
if (deniedCostAction.status !== 403) issues.push("Sensitive import action was not denied.");

const preview = await fetch(baseUrl + "/api/imports/imp-77612/cost-preview", { method: "POST", headers });
const previewBody = await preview.json();
if (!preview.ok || previewBody.data?.validationErrors?.length || previewBody.data?.allocations?.length < 3) issues.push("Multi-product landed-cost preview failed.");
const sum = previewBody.data?.products?.reduce((total, row) => total + Number(row.finalTotalBdt), 0).toFixed(2);
if (sum !== previewBody.data?.totalShipmentCostBdt) issues.push("Landed-cost product results do not reconcile.");

const fifo = await fetch(baseUrl + "/api/inventory/dispatch-preview", {
  method: "POST",
  headers,
  body: JSON.stringify({ productId: "prd-d17h", batchId: "bat-d17-new", quantity: "60" })
});
const fifoBody = await fifo.json();
if (!fifo.ok || !fifoBody.data?.warning?.includes("Older matching lot")) issues.push("FIFO newer-batch warning failed.");

await browser.close();
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
