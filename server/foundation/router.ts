import { Router, type ErrorRequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { createContext, authenticate, type Context } from "./context.js";
import { createAuthRouter } from "./auth.js";
import { createEmployeeRouter } from "./employees.js";
import { createDocumentRouter } from "./documents.js";
import { HttpError } from "./errors.js";
import { createMasterRouter } from "../operations/masters.js";
import { createImportRouter } from "../operations/imports.js";
import { createInventoryRouter } from "../operations/inventory.js";
import { createTradingRouter } from "../trading/router.js";
import { createFulfilmentRouter } from "../trading/fulfilment.js";
import { createInvoiceRouter } from "../trading/invoices.js";
import { createCollectionRouter } from "../trading/collections.js";
import { createCashAccountRouter } from "../trading/accounts.js";
import { createSalesWorkspaceRouter } from "../trading/workspace.js";
import { createExpenseRouter } from "../finance/expenses.js";
import { createSettlementRouter } from "../finance/settlements.js";
import { createPrintRouter } from "../printing/router.js";
import { createReportRouter } from "../reports/router.js";
import { createWorkforceRouter } from "../workforce/router.js";

export function createFoundationRouter(providedContext?: Context) {
  const ctx = providedContext ?? createContext();
  const router = Router();
  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Referrer-Policy", "no-referrer");
    res.set("X-Request-Id", randomUUID());
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const origin = req.get("origin");
      if (origin && origin !== ctx.config.origin) return next(new HttpError(403, "Request origin is not allowed."));
      if (!req.is("application/json")) return next(new HttpError(415, "Use application/json."));
    }
    next();
  });
  router.get("/health", async (_req, res) => {
    try {
      await ctx.client.query("select 1");
      res.json({ success: true, data: { mode: "foundation", database: "connected" }, message: "Backend foundation healthy" });
    } catch { throw new HttpError(503, "Database dependency unavailable."); }
  });
  router.use("/auth", createAuthRouter(ctx));
  router.use(async (req, res, next) => {
    res.locals.identity = await authenticate(ctx, req);
    next();
  });
  router.get("/system/status", (_req, res) => res.json({ success: true, data: { phase: "Operations, Finance, Workforce & Reports", authentication: "Connected", database: "Connected", privateStorage: "Configured", businessMigration: "Imports, sales, operating finance, employees/marketing and SQL reports connected; dashboard, opening reconciliation, field verification and public-site migration pending" }, message: "Backend migration status" }));
  router.use(createEmployeeRouter(ctx));
  router.use(createDocumentRouter(ctx));
  router.use(createMasterRouter(ctx));
  router.use(createImportRouter(ctx));
  router.use(createInventoryRouter(ctx));
  router.use(createTradingRouter(ctx));
  router.use(createFulfilmentRouter(ctx));
  router.use(createInvoiceRouter(ctx));
  router.use(createCollectionRouter(ctx));
  router.use(createCashAccountRouter(ctx));
  router.use(createSalesWorkspaceRouter(ctx));
  router.use(createExpenseRouter(ctx));
  router.use(createSettlementRouter(ctx));
  router.use(createPrintRouter(ctx));
  router.use(createReportRouter(ctx));
  router.use(createWorkforceRouter(ctx));
  router.use((_req, _res, next) => next(new HttpError(503, "This workflow has not been migrated to the persistent backend. The original prototype remains separate.")));
  const handler: ErrorRequestHandler = (error, _req, res, _next) => {
    void _next;
    if (error instanceof ZodError) return res.status(422).json({ success: false, data: null, message: "Invalid request", errors: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) });
    if (error instanceof HttpError) return res.status(error.status).json({ success: false, data: null, message: error.message });
    const cause = error?.cause ?? error;
    if (cause?.code === "23505") return res.status(409).json({ success: false, data: null, message: "A record with this identifier already exists." });
    if (cause?.code === "22P02") return res.status(422).json({ success: false, data: null, message: "Invalid record identifier." });
    if (["22003", "23514"].includes(cause?.code)) return res.status(422).json({ success: false, data: null, message: "Value exceeds supported precision or violates a data-integrity rule." });
    if (cause?.code === "23503") return res.status(409).json({ success: false, data: null, message: "This record is linked to protected history or refers to an unavailable record." });
    console.error("Backend request failed", { requestId: res.get("X-Request-Id"), code: typeof cause?.code === "string" && /^[A-Z0-9_]+$/.test(cause.code) ? cause.code : "INTERNAL" });
    return res.status(500).json({ success: false, data: null, message: "Request could not be completed. Reference the request ID when reporting this error." });
  };
  router.use(handler);
  return router;
}
