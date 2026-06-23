import cors from "cors";
import express from "express";
import {
  AuditLogSchema,
  CustomsCostRequestSchema,
  CustomsCostResponseSchema,
  DashboardSummarySchema,
  FinanceSummarySchema,
  ImportDetailSchema,
  ImportPipelineItemSchema,
  InventoryBatchSchema,
  ProductMasterSchema,
  ReportsSummarySchema,
  SalesOrderSchema,
  StockMovementSchema,
  CustomerSchema
} from "../src/shared/schemas";
import {
  auditLogs,
  customers,
  dashboardSummary,
  financeSummary,
  imports,
  inventoryBatches,
  products,
  reportsSummary,
  salesOrders,
  stockMovements
} from "./mockData";

const app = express();
const port = Number(process.env.API_PORT ?? 4174);

const roundMoney = (value: number) => Math.round(value * 100) / 100;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "medical-supplier-erp-api" });
});

app.get("/api/v1/dashboard/summary", (_req, res) => {
  res.json(DashboardSummarySchema.parse(dashboardSummary));
});

app.get("/api/v1/imports/pipeline", (_req, res) => {
  const summary = imports.map(
    ({
      id,
      poNumber,
      supplier,
      country,
      product,
      quantity,
      valueUsd,
      currentStage,
      progress,
      status,
      eta,
      owner
    }) => ({
      id,
      poNumber,
      supplier,
      country,
      product,
      quantity,
      valueUsd,
      currentStage,
      progress,
      status,
      eta,
      owner
    })
  );

  res.json(ImportPipelineItemSchema.array().parse(summary));
});

app.get("/api/v1/imports/:id", (req, res) => {
  const detail = imports.find((item) => item.id === req.params.id);

  if (!detail) {
    res.status(404).json({ message: "Import record not found" });
    return;
  }

  res.json(ImportDetailSchema.parse(detail));
});

app.get("/api/v1/inventory/batches", (_req, res) => {
  res.json(InventoryBatchSchema.array().parse(inventoryBatches));
});

app.get("/api/v1/inventory/movements", (_req, res) => {
  res.json(StockMovementSchema.array().parse(stockMovements));
});

app.get("/api/v1/products", (_req, res) => {
  res.json(ProductMasterSchema.array().parse(products));
});

app.get("/api/v1/sales/orders", (_req, res) => {
  res.json(SalesOrderSchema.array().parse(salesOrders));
});

app.get("/api/v1/customers", (_req, res) => {
  res.json(CustomerSchema.array().parse(customers));
});

app.get("/api/v1/finance/summary", (_req, res) => {
  res.json(FinanceSummarySchema.parse(financeSummary));
});

app.get("/api/v1/reports/summary", (_req, res) => {
  res.json(ReportsSummarySchema.parse(reportsSummary));
});

app.get("/api/v1/security/audit-log", (_req, res) => {
  res.json(AuditLogSchema.array().parse(auditLogs));
});

app.post("/api/v1/customs/landed-cost-preview", (req, res) => {
  const parsed = CustomsCostRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid customs landed-cost payload",
      issues: parsed.error.issues
    });
    return;
  }

  const {
    product,
    quantity,
    fobCostPerPiece,
    duty,
    vat,
    ait,
    freight,
    portCharges,
    cfCharges,
    transportCharges,
    exchangeRate
  } = parsed.data;

  const fobTotalUsd = fobCostPerPiece * quantity;
  const fobTotalBdt = fobTotalUsd * exchangeRate;
  const landedExtrasBdt = duty + vat + ait + freight + portCharges + cfCharges + transportCharges;
  const totalCostBdt = fobTotalBdt + landedExtrasBdt;
  const landedCostPerPieceBdt = totalCostBdt / quantity;
  const recommendedSalesPriceBdt = landedCostPerPieceBdt * 1.18;

  res.json(
    CustomsCostResponseSchema.parse({
      product,
      quantity,
      fobTotalUsd: roundMoney(fobTotalUsd),
      landedExtrasBdt: roundMoney(landedExtrasBdt),
      totalCostBdt: roundMoney(totalCostBdt),
      landedCostPerPieceBdt: roundMoney(landedCostPerPieceBdt),
      recommendedSalesPriceBdt: roundMoney(recommendedSalesPriceBdt),
      marginPercent: 18
    })
  );
});

app.use((_req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.listen(port, () => {
  console.log(`Medical Supplier ERP mock API listening on http://localhost:${port}`);
});
