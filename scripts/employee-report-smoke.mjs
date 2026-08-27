/* global window */
import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const base = process.env.SMOKE_BASE_URL ?? "http://localhost:5173";
const sessionKey = "mipro-erp-session";
const executablePath = [
  process.env.PLAYWRIGHT_EXECUTABLE_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
].filter(Boolean).find((candidate) => existsSync(candidate));

const manager = {
  id: "u-sales-manager",
  name: "Farhana Akter",
  email: "salesmanager@mipro.local",
  role: "Sales Manager",
  title: "Sales Manager",
  department: "Sales",
  phone: "+880 1711 000006",
  avatarUrl: "",
  status: "Active",
  permissionOverrides: [
    { permission: "users", action: "view", effect: "ALLOW" },
    { permission: "users", action: "create", effect: "ALLOW" },
    { permission: "users", action: "edit", effect: "ALLOW" },
    { permission: "reports", action: "export", effect: "DENY" }
  ],
  capabilities: ["approve_special_price", "manage_users"]
};

mkdirSync("artifacts/employee-report", { recursive: true });
const browser = await chromium.launch(executablePath ? { headless: true, executablePath } : { headless: true });

async function pageFor(viewport) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(({ key, user }) => window.localStorage.setItem(key, JSON.stringify({ token: `mock-token-${user.id}`, user })), { key: sessionKey, user: manager });
  return page;
}

try {
  const desktop = await pageFor({ width: 1440, height: 1000 });
  const errors = [];
  desktop.on("pageerror", (error) => errors.push(error.message));
  desktop.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

  await desktop.goto(`${base}/app/employees?view=directory`, { waitUntil: "networkidle" });
  const directorySearch = desktop.getByPlaceholder("Name, ID, role, phone...");
  await directorySearch.fill("SE-014");
  await desktop.getByRole("button", { name: "Shamima Sultana", exact: true }).waitFor();
  assert.equal(await desktop.locator("tbody tr").count(), 1, "Directory search should return one matching employee row");
  await desktop.getByRole("button", { name: "Clear employee search" }).click();
  assert.ok(await desktop.locator("tbody tr").count() > 1, "Clearing employee search should restore the directory");

  await desktop.goto(`${base}/app/employees?view=activity&employee=sales1`, { waitUntil: "networkidle" });
  await desktop.getByTestId("employee-activity-performance").waitFor();
  await desktop.getByTestId("employee-picker").getByRole("button").first().click();
  await desktop.getByPlaceholder("Search name, ID, designation...").fill("SE-014");
  const employeeListbox = desktop.getByTestId("employee-picker").getByRole("listbox");
  assert.equal(await employeeListbox.getByRole("option").count(), 1, "Typed employee search must not retain the All Employees option");
  await employeeListbox.getByRole("option", { name: /Shamima Sultana/ }).click();
  await desktop.getByRole("heading", { name: "Shamima Sultana", exact: true }).waitFor();

  await desktop.getByRole("tab", { name: "Weekly" }).click();
  await desktop.getByLabel("Choose Any Date in the Week").fill("2026-08-27");
  await desktop.getByLabel("Report Content").selectOption("Field Work");
  await desktop.getByRole("heading", { name: "Weekly Employee Field Work Report" }).waitFor();
  await desktop.getByRole("button", { name: "Print / Save PDF" }).waitFor();
  await desktop.getByRole("button", { name: "CSV" }).waitFor();
  assert.match(await desktop.locator(".employee-print-report").innerText(), /Shamima Sultana/);
  assert.match(await desktop.locator(".employee-print-report").innerText(), /SE-014/);
  assert.match(await desktop.locator(".employee-print-report").innerText(), /Employee Activity Log/);
  await desktop.screenshot({ path: "artifacts/employee-report/employee-weekly-desktop.png", fullPage: true, animations: "disabled" });

  await desktop.emulateMedia({ media: "print" });
  assert.equal(await desktop.locator(".no-print").isVisible(), false, "Report controls must be hidden in print media");
  assert.equal(await desktop.locator(".employee-print-report header").isVisible(), true, "Branded employee report header must print");
  await desktop.pdf({ path: "artifacts/employee-report/employee-weekly-print.pdf", format: "A4", printBackground: true });
  await desktop.close();

  const mobile = await pageFor({ width: 390, height: 844 });
  await mobile.goto(`${base}/app/employees?view=activity&employee=sales1`, { waitUntil: "networkidle" });
  await mobile.getByTestId("employee-activity-performance").waitFor();
  assert.equal(await mobile.locator("body").evaluate((body) => body.scrollWidth <= body.clientWidth + 1), true, "Employee reports must not overflow the mobile viewport");
  await mobile.screenshot({ path: "artifacts/employee-report/employee-daily-mobile.png", fullPage: true, animations: "disabled" });
  await mobile.close();

  const publicPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await publicPage.goto(`${base}/`, { waitUntil: "networkidle" });
  await publicPage.getByRole("heading", { name: "Dialysis products shown with practical model information" }).waitFor();
  await publicPage.getByRole("tab", { name: "Technical Data" }).click();
  await publicPage.getByRole("heading", { name: "A technical reference across the HD high-flux series" }).waitFor();
  assert.match(await publicPage.locator("main").innerText(), /HD-17H highlighted with 1.7 m²/);
  const literatureResponse = await publicPage.request.get(`${base}/resources/mipro-hd17h-technical.pdf`);
  assert.equal(literatureResponse.ok(), true, "Supplied technical literature PDF must be publicly served");
  await publicPage.screenshot({ path: "artifacts/employee-report/landing-literature-desktop.png", fullPage: true, animations: "disabled" });
  await publicPage.setViewportSize({ width: 390, height: 844 });
  await publicPage.goto(`${base}/`, { waitUntil: "networkidle" });
  assert.equal(await publicPage.locator("body").evaluate((body) => body.scrollWidth <= body.clientWidth + 1), true, "Landing page must not overflow the mobile viewport");
  await publicPage.screenshot({ path: "artifacts/employee-report/landing-literature-mobile.png", fullPage: true, animations: "disabled" });
  await publicPage.close();

  assert.deepEqual(errors, [], `Browser errors: ${errors.join(" | ")}`);
  console.log("Employee reports, employee search, print media and landing literature passed.");
} finally {
  await browser.close();
}
