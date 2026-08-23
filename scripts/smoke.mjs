/* global window, document */
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:5173";
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? "msedge";
const sessionKey = "mipro-erp-session";
await mkdir("artifacts", { recursive: true });

const people = {
  super: { id: "u-super", name: "Sadia Karim", email: "superadmin@mipro.local", role: "Super Admin", title: "Owner & System Administrator", department: "Management", phone: "+880 1711 000001", avatarUrl: "/mipro-owner.png", status: "Active", capabilities: ["view_sensitive_cost", "edit_sensitive_cost", "finalize_landed_cost", "reopen_landed_cost", "view_profit", "approve_stock_override", "manage_users", "approve_special_price"] },
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

function watchPage(page, name) {
  page.on("pageerror", (error) => issues.push(name + ": " + error.message));
  page.on("console", (message) => {
    if (message.type() === "error") issues.push(name + ": console " + message.text());
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
  ["accounts-desktop", "/app/accounts", 1440, 1000, people.super],
  ["accounts-mobile", "/app/accounts", 390, 1100, people.super],
  ["reports-desktop", "/app/reports", 1440, 1000, people.super],
  ["reports-mobile", "/app/reports", 390, 1100, people.super],
  ["settings-desktop", "/app/settings", 1440, 1100, people.super],
  ["settings-mobile", "/app/settings", 390, 1100, people.super]
];

for (const [name, path, width, height, user] of routes) {
  await visitAndCapture({ name, path, width, height, user });
}

const profilePassword = await preparePage({ name: "profile-password", width: 1280, height: 900, user: people.super });
await profilePassword.goto(baseUrl + "/app/profile", { waitUntil: "networkidle", timeout: 60000 });
await profilePassword.getByRole("button", { name: "Change Password" }).click();
await profilePassword.getByLabel("New Password").fill("temporary123");
await profilePassword.getByLabel("Confirm Password").fill("temporary123");
await profilePassword.getByRole("button", { name: "Update Password" }).click();
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
await costing.getByRole("button", { name: "Finalize Snapshot" }).click();
await costing.getByText("Snapshot v1", { exact: true }).waitFor({ timeout: 30000 });
await costing.close();

await visitAndCapture({ name: "costing-result-mobile", path: "/app/imports/imp-77612", width: 390, height: 1200, user: people.super });

const printRoutes = [
  ["print-quotation-digital", "/app/print/quotation/quo-1", 1200, 1000],
  ["print-order", "/app/print/order/so-1", 1200, 1000],
  ["print-challan", "/app/print/challan/del-1", 1200, 1000],
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
await preprinted.screenshot({ path: "artifacts/print-quotation-preprinted.png", fullPage: true });
await preprinted.close();

const expectedNavigation = new Map([
  [people.super, ["Dashboard", "Imports", "Inventory", "Sales", "Expenses & Accounts", "Reports", "Settings"]],
  [people.md, ["Dashboard", "Imports", "Inventory", "Sales", "Expenses & Accounts", "Reports"]],
  [people.accounts, ["Dashboard", "Sales", "Expenses & Accounts", "Reports"]],
  [people.import, ["Dashboard", "Imports"]],
  [people.warehouse, ["Dashboard", "Inventory"]],
  [people.salesManager, ["Dashboard", "Inventory", "Sales", "Reports"]],
  [people.sales, ["Dashboard", "Sales"]]
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
for (const path of ["/api/health", "/api/dashboard", "/api/imports", "/api/inventory/stock", "/api/customers", "/api/expenses", "/api/reports", "/api/settings/decisions"]) {
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
