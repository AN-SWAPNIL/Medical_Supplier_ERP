/* global window */
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:5173";
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? "msedge";

await mkdir("artifacts", { recursive: true });

const browser = await chromium.launch({ channel: browserChannel, headless: true });
const issues = [];
const authUser = {
  name: "Super Admin",
  email: "admin@sinomed.demo",
  role: "Super Admin",
  title: "System Administrator",
  department: "System Administration",
  phone: "+880 1711 223344",
  avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"
};
const salesUser = {
  name: "Rafiq Ahmed",
  email: "sales@sinomed.demo",
  role: "Sales Executive",
  title: "Sales Executive",
  department: "Field Sales",
  phone: "+880 1711 223344",
  avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"
};

const routes = [
  {
    name: "landing-desktop",
    url: `${baseUrl}/`,
    viewport: { width: 1440, height: 1100 },
    auth: false
  },
  {
    name: "landing-mobile",
    url: `${baseUrl}/`,
    viewport: { width: 390, height: 1100 },
    auth: false
  },
  {
    name: "signin-desktop",
    url: `${baseUrl}/signin`,
    viewport: { width: 1440, height: 1000 },
    auth: false
  },
  {
    name: "dashboard-desktop",
    url: `${baseUrl}/dashboard`,
    viewport: { width: 1440, height: 1100 },
    auth: true
  },
  {
    name: "dashboard-mobile",
    url: `${baseUrl}/dashboard`,
    viewport: { width: 390, height: 1100 },
    auth: true
  },
  {
    name: "imports-desktop",
    url: `${baseUrl}/imports`,
    viewport: { width: 1440, height: 1100 },
    auth: true
  },
  {
    name: "products-desktop",
    url: `${baseUrl}/products`,
    viewport: { width: 1440, height: 1100 },
    auth: true
  },
  {
    name: "products-mobile",
    url: `${baseUrl}/products`,
    viewport: { width: 390, height: 1200 },
    auth: true
  },
  {
    name: "sales-desktop",
    url: `${baseUrl}/sales`,
    viewport: { width: 1440, height: 1100 },
    auth: true
  },
  {
    name: "admin-ops-desktop",
    url: `${baseUrl}/admin-ops`,
    viewport: { width: 1440, height: 1100 },
    auth: true
  },
  {
    name: "profile-desktop",
    url: `${baseUrl}/profile`,
    viewport: { width: 1440, height: 1100 },
    auth: true
  }
];

for (const route of routes) {
  const page = await browser.newPage({ viewport: route.viewport });
  if (route.auth) {
    await page.addInitScript((user) => {
      window.localStorage.setItem("medical-supplier-auth", JSON.stringify(user));
    }, authUser);
  }
  page.on("pageerror", (error) => issues.push(`${route.name}: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      issues.push(`${route.name}: console ${message.text()}`);
    }
  });

  await page.goto(route.url, { waitUntil: "networkidle" });
  await page.screenshot({ path: `artifacts/${route.name}.png`, fullPage: true });
  const title = await page.locator("h1").first().textContent();
  console.log(`${route.name}: ${title}`);
  await page.close();
}

const rolePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await rolePage.addInitScript((user) => {
  window.localStorage.setItem("medical-supplier-auth", JSON.stringify(user));
}, salesUser);
await rolePage.goto(`${baseUrl}/sales`, { waitUntil: "networkidle" });
await rolePage.waitForSelector(".ant-alert", { timeout: 5000 });

const alertText = await rolePage.locator(".ant-alert").textContent();
const visibleRows = await rolePage.locator(".ant-table-tbody tr.ant-table-row").count();
console.log(`role-alert: ${alertText}`);
console.log(`visible-sales-rows: ${visibleRows}`);

if (!alertText?.includes("Sales Executive lens") || visibleRows !== 2) {
  issues.push("sales role restriction did not show the expected Sales Executive view");
}

await rolePage.close();

const productRolePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await productRolePage.addInitScript((user) => {
  window.localStorage.setItem("medical-supplier-auth", JSON.stringify(user));
}, salesUser);
await productRolePage.goto(`${baseUrl}/products`, { waitUntil: "networkidle" });
const productTitle = await productRolePage.locator("h1").first().textContent();
const productButtonVisible = await productRolePage.getByRole("button", { name: "New Product" }).isVisible().catch(() => false);
console.log(`product-role: ${productTitle}`);
console.log(`product-manage-hidden: ${!productButtonVisible}`);
if (!productTitle?.includes("Medical Consumable Catalog") || productButtonVisible) {
  issues.push("Sales Executive should browse products without product management actions");
}
await productRolePage.close();

const deniedPage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await deniedPage.addInitScript((user) => {
  window.localStorage.setItem("medical-supplier-auth", JSON.stringify(user));
}, salesUser);
await deniedPage.goto(`${baseUrl}/accounts`, { waitUntil: "networkidle" });
const deniedText = await deniedPage.locator(".access-denied-card").textContent();
console.log(`access-denied: ${deniedText?.includes("Access restricted for Sales Executive")}`);
if (!deniedText?.includes("Access restricted for Sales Executive")) {
  issues.push("Sales Executive should be blocked from Accounts");
}
await deniedPage.close();

await browser.close();

if (issues.length > 0) {
  console.error(issues.join("\n"));
  process.exit(1);
}
