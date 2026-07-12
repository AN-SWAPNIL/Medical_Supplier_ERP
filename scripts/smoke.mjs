/* global window */
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:5173";
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? "msedge";
const sessionKey = "mipro-erp-session";

await mkdir("artifacts", { recursive: true });

const browser = await chromium.launch({ channel: browserChannel, headless: true });
const issues = [];

const superAdminSession = {
  token: "mock-token-u-super",
  user: {
    id: "u-super",
    name: "Sadia Karim",
    email: "superadmin@mipro.local",
    role: "Super Admin",
    title: "System Super Admin",
    department: "ERP Administration",
    phone: "+880 1711 000001",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    status: "Active"
  }
};

const salesSession = {
  token: "mock-token-sales1",
  user: {
    id: "sales1",
    name: "Rafiq Ahmed",
    email: "sales1@mipro.local",
    role: "Sales Executive",
    title: "Sales Executive",
    department: "Field Sales",
    phone: "+880 1711 000007",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    status: "Active",
    territory: "Dhaka North"
  }
};

const routes = [
  { name: "landing-desktop", url: "/", viewport: { width: 1440, height: 1100 }, auth: false },
  { name: "landing-mobile", url: "/", viewport: { width: 390, height: 1100 }, auth: false },
  { name: "login-desktop", url: "/login", viewport: { width: 1440, height: 1000 }, auth: false },
  { name: "dashboard-desktop", url: "/app/dashboard", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "dashboard-mobile", url: "/app/dashboard", viewport: { width: 390, height: 1200 }, auth: true },
  { name: "products-desktop", url: "/app/products", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "purchase-orders-desktop", url: "/app/procurement/purchase-orders", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "landed-cost-desktop", url: "/app/customs/landed-cost", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "grn-desktop", url: "/app/warehouse/grn", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "physical-count-desktop", url: "/app/inventory/physical-counts", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "invoices-desktop", url: "/app/sales/invoices", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "mobile-sales-desktop", url: "/app/sales/mobile-control", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "visits-desktop", url: "/app/sales/visits", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "accounts-desktop", url: "/app/accounts/vouchers", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "cash-book-desktop", url: "/app/accounts/cash-book", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "attendance-desktop", url: "/app/hr/attendance", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "leave-advances-desktop", url: "/app/hr/leave-advances", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "roles-desktop", url: "/app/roles", viewport: { width: 1440, height: 1200 }, auth: true },
  { name: "reports-desktop", url: "/app/reports", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "ai-desktop", url: "/app/ai", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "audit-desktop", url: "/app/audit", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "settings-desktop", url: "/app/settings", viewport: { width: 1440, height: 1100 }, auth: true },
  { name: "profile-desktop", url: "/app/profile", viewport: { width: 1440, height: 1100 }, auth: true }
];

for (const route of routes) {
  const page = await browser.newPage({ viewport: route.viewport });
  if (route.auth) {
    await page.addInitScript(
      ({ key, session }) => {
        window.localStorage.setItem(key, JSON.stringify(session));
      },
      { key: sessionKey, session: superAdminSession }
    );
  }

  page.on("pageerror", (error) => issues.push(`${route.name}: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`${route.name}: console ${message.text()}`);
    }
  });

  await page.goto(`${baseUrl}${route.url}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator("h1").first().waitFor({ timeout: 20000 });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: `artifacts/${route.name}.png`, fullPage: true });
  const title = await page.locator("h1").first().textContent();
  console.log(`${route.name}: ${title}`);
  if (route.name === "mobile-sales-desktop") {
    const mapFrameVisible = await page.getByTitle("OpenStreetMap route tracking").isVisible().catch(() => false);
    console.log(`mobile-sales-map-visible: ${mapFrameVisible}`);
    if (!mapFrameVisible) {
      issues.push("Mobile Sales should show OpenStreetMap route tracking");
    }
  }
  await page.close();
}

const salesPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await salesPage.addInitScript(
  ({ key, session }) => {
    window.localStorage.setItem(key, JSON.stringify(session));
  },
  { key: sessionKey, session: salesSession }
);
await salesPage.goto(`${baseUrl}/app/sales/invoices`, { waitUntil: "domcontentloaded", timeout: 60000 });
await salesPage.locator("h1").first().waitFor({ timeout: 20000 });
await salesPage.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
const salesRows = await salesPage.locator("tbody tr").count();
const createButtonVisible = await salesPage.getByRole("button", { name: /Create Invoice/i }).isVisible().catch(() => false);
const salesHead = await salesPage.locator("thead").first().textContent();
const salesEditButtons = await salesPage.getByLabel("Edit").count();
console.log(`sales-exec-invoice-rows: ${salesRows}`);
console.log(`sales-exec-can-create-invoice: ${createButtonVisible}`);
console.log(`sales-exec-cost-fields-hidden: ${!salesHead?.match(/Landed|Profit|Cost/i)}`);
console.log(`sales-exec-finalized-edit-hidden: ${salesEditButtons === 0}`);
if (salesRows !== 2 || !createButtonVisible) {
  issues.push("Sales Executive should see only own two invoices and retain own create access");
}
if (salesHead?.match(/Landed|Profit|Cost/i)) {
  issues.push("Sales Executive invoice table should hide cost, landed cost and profit columns");
}
if (salesEditButtons !== 0) {
  issues.push("Sales Executive should not see edit buttons for posted invoices");
}
await salesPage.getByLabel("Open AI assistant").click();
await salesPage.getByPlaceholder("Ask about sales, stock, landed cost, dues, permissions...").fill("Show my sales summary");
await salesPage.getByRole("button", { name: "Send" }).click();
await salesPage.waitForSelector("text=scoped to the signed-in sales executive", { timeout: 10000 });
const chatText = await salesPage.locator('[aria-label="Mipro AI Assistant"]').textContent();
console.log(`sales-exec-chat-scoped: ${chatText?.includes("2 invoice")}`);
if (!chatText?.includes("2 invoice")) {
  issues.push("Sales Executive AI chat should answer from scoped own sales data");
}
await salesPage.screenshot({ path: "artifacts/sales-exec-invoices.png", fullPage: true });
await salesPage.close();

const deniedPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await deniedPage.addInitScript(
  ({ key, session }) => {
    window.localStorage.setItem(key, JSON.stringify(session));
  },
  { key: sessionKey, session: salesSession }
);
await deniedPage.goto(`${baseUrl}/app/accounts/vouchers`, { waitUntil: "domcontentloaded", timeout: 60000 });
await deniedPage.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
const deniedText = await deniedPage.locator("body").textContent();
console.log(`access-denied: ${deniedText?.includes("Access denied")}`);
if (!deniedText?.includes("Access denied")) {
  issues.push("Sales Executive should be blocked from accounts vouchers");
}
await deniedPage.close();

const apiHeaders = {
  "x-user-id": superAdminSession.user.id,
  "x-role": superAdminSession.user.role,
  "x-company-id": "cmp-001",
  "Content-Type": "application/json"
};
const apiChecks = [
  ["/api/v1/dashboard/summary", "GET"],
  ["/api/v1/imports/pipeline", "GET"],
  ["/api/v1/finance/summary", "GET"],
  ["/api/v1/security/audit-log", "GET"]
];

for (const [path, method] of apiChecks) {
  const response = await fetch(`${baseUrl}${path}`, { method, headers: apiHeaders });
  console.log(`api-check ${path}: ${response.status}`);
  if (!response.ok) {
    issues.push(`${path} should return OK`);
  }
}

const landedPreview = await fetch(`${baseUrl}/api/v1/customs/landed-cost-preview`, {
  method: "POST",
  headers: apiHeaders,
  body: JSON.stringify({ quantity: 100, productImportValue: 10000, freight: 500, duty: 800, vat: 400, transportCharges: 300 })
});
console.log(`api-check landed-cost-preview: ${landedPreview.status}`);
if (!landedPreview.ok) {
  issues.push("/api/v1/customs/landed-cost-preview should return OK");
}

await browser.close();

if (issues.length > 0) {
  console.error(issues.join("\n"));
  process.exit(1);
}
