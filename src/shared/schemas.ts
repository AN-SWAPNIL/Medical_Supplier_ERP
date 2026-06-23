import { z } from "zod";

export const RoleSchema = z.enum([
  "Super Admin",
  "Managing Director",
  "Accounts",
  "Import Officer",
  "Warehouse Manager",
  "Sales Manager",
  "Sales Executive"
]);

export type Role = z.infer<typeof RoleSchema>;

export const MetricSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string(),
  delta: z.number(),
  intent: z.enum(["sales", "stock", "cash", "risk", "profit"])
});

export const PipelineStageSchema = z.object({
  stage: z.string(),
  active: z.number(),
  delayed: z.number(),
  valueUsd: z.number()
});

export const ExpiryAlertSchema = z.object({
  product: z.string(),
  batch: z.string(),
  expiryDate: z.string(),
  daysLeft: z.number(),
  quantity: z.number(),
  severity: z.enum(["critical", "warning", "watch"])
});

export const SalesTrendSchema = z.object({
  month: z.string(),
  sales: z.number(),
  collection: z.number()
});

export const ProductMixSchema = z.object({
  product: z.string(),
  value: z.number()
});

export const DashboardSummarySchema = z.object({
  metrics: z.array(MetricSchema),
  pipelineStages: z.array(PipelineStageSchema),
  expiryAlerts: z.array(ExpiryAlertSchema),
  salesTrend: z.array(SalesTrendSchema),
  productMix: z.array(ProductMixSchema),
  trustMetrics: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      caption: z.string()
    })
  ),
  roleNotes: z.record(z.string(), z.string())
});

export const ImportPipelineItemSchema = z.object({
  id: z.string(),
  poNumber: z.string(),
  supplier: z.string(),
  country: z.string(),
  product: z.string(),
  quantity: z.number(),
  valueUsd: z.number(),
  currentStage: z.string(),
  progress: z.number(),
  status: z.enum(["On Track", "Attention", "Delayed", "Ready"]),
  eta: z.string(),
  owner: z.string()
});

export const CostLineSchema = z.object({
  label: z.string(),
  amount: z.number(),
  currency: z.string()
});

export const ImportDetailSchema = ImportPipelineItemSchema.extend({
  piNumber: z.string(),
  lcNumber: z.string(),
  ttNumber: z.string().nullable(),
  bank: z.string(),
  blNumber: z.string(),
  containerNumber: z.string(),
  vesselName: z.string(),
  etd: z.string(),
  documents: z.array(z.string()),
  costLines: z.array(CostLineSchema),
  notes: z.array(z.string())
});

export const InventoryBatchSchema = z.object({
  id: z.string(),
  product: z.string(),
  batchNumber: z.string(),
  lotNumber: z.string(),
  supplier: z.string(),
  binLocation: z.string(),
  expiryDate: z.string(),
  availableQty: z.number(),
  reservedQty: z.number(),
  unit: z.string(),
  purchasePrice: z.number(),
  salesPrice: z.number(),
  alertLevel: z.enum(["Critical", "Warning", "Normal"])
});

export const ProductMasterSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  imageUrl: z.string(),
  originCountry: z.string(),
  supplier: z.string(),
  batchControlled: z.boolean(),
  expiryControlled: z.boolean(),
  certificates: z.array(z.string()),
  stockQty: z.number(),
  unit: z.string(),
  purchasePrice: z.number(),
  salesPrice: z.number(),
  status: z.enum(["Active", "Review", "Inactive"]),
  riskTag: z.enum(["Expiry Safe", "Expiry Watch", "High Demand"])
});

export const StockMovementSchema = z.object({
  id: z.string(),
  date: z.string(),
  product: z.string(),
  batchNumber: z.string(),
  movementType: z.enum(["Stock In", "Stock Out", "Transfer", "Adjustment"]),
  quantity: z.number(),
  reference: z.string(),
  warehouseUser: z.string()
});

export const SalesOrderSchema = z.object({
  id: z.string(),
  customer: z.string(),
  customerType: z.enum(["Hospital", "Clinic", "Dealer", "Pharmacy"]),
  territory: z.string(),
  product: z.string(),
  quantity: z.number(),
  quotationNo: z.string(),
  orderNo: z.string(),
  challanNo: z.string(),
  invoiceNo: z.string(),
  amount: z.number(),
  outstanding: z.number(),
  status: z.enum(["Quotation", "Sales Order", "Delivered", "Invoiced", "Collected"]),
  owner: z.string()
});

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["Hospital", "Clinic", "Dealer", "Pharmacy"]),
  territory: z.string(),
  contactPerson: z.string(),
  monthlyPurchase: z.number(),
  outstandingDues: z.number(),
  lastVisit: z.string(),
  nextVisit: z.string(),
  owner: z.string()
});

export const FinanceSummarySchema = z.object({
  cashBalance: z.number(),
  bankBalance: z.number(),
  receivable: z.number(),
  payable: z.number(),
  profit: z.number(),
  cashBook: z.array(
    z.object({
      date: z.string(),
      narration: z.string(),
      debit: z.number(),
      credit: z.number(),
      balance: z.number()
    })
  ),
  bankBook: z.array(
    z.object({
      bank: z.string(),
      accountNo: z.string(),
      balance: z.number(),
      lastReconciled: z.string()
    })
  ),
  vouchers: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["Journal", "Contra", "Payment", "Receipt"]),
      party: z.string(),
      amount: z.number(),
      status: z.enum(["Draft", "Approved", "Posted"])
    })
  ),
  profitLoss: z.array(
    z.object({
      label: z.string(),
      amount: z.number()
    })
  )
});

export const ReportsSummarySchema = z.object({
  daily: z.array(
    z.object({
      report: z.string(),
      value: z.string(),
      status: z.string()
    })
  ),
  weekly: z.array(
    z.object({
      report: z.string(),
      value: z.string(),
      status: z.string()
    })
  ),
  monthly: z.array(
    z.object({
      report: z.string(),
      value: z.string(),
      status: z.string()
    })
  ),
  territorySales: z.array(
    z.object({
      territory: z.string(),
      sales: z.number()
    })
  )
});

export const AuditLogSchema = z.object({
  id: z.string(),
  time: z.string(),
  actor: z.string(),
  role: RoleSchema,
  module: z.string(),
  action: z.string(),
  ipAddress: z.string(),
  severity: z.enum(["Info", "Warning", "Critical"])
});

export const CustomsCostRequestSchema = z.object({
  product: z.string(),
  quantity: z.number().positive(),
  fobCostPerPiece: z.number().nonnegative(),
  duty: z.number().nonnegative(),
  vat: z.number().nonnegative(),
  ait: z.number().nonnegative(),
  freight: z.number().nonnegative(),
  portCharges: z.number().nonnegative(),
  cfCharges: z.number().nonnegative(),
  transportCharges: z.number().nonnegative(),
  exchangeRate: z.number().positive()
});

export const CustomsCostResponseSchema = z.object({
  product: z.string(),
  quantity: z.number(),
  fobTotalUsd: z.number(),
  landedExtrasBdt: z.number(),
  totalCostBdt: z.number(),
  landedCostPerPieceBdt: z.number(),
  recommendedSalesPriceBdt: z.number(),
  marginPercent: z.number()
});

export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
export type ImportPipelineItem = z.infer<typeof ImportPipelineItemSchema>;
export type ImportDetail = z.infer<typeof ImportDetailSchema>;
export type InventoryBatch = z.infer<typeof InventoryBatchSchema>;
export type ProductMaster = z.infer<typeof ProductMasterSchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;
export type SalesOrder = z.infer<typeof SalesOrderSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type FinanceSummary = z.infer<typeof FinanceSummarySchema>;
export type ReportsSummary = z.infer<typeof ReportsSummarySchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type CustomsCostRequest = z.infer<typeof CustomsCostRequestSchema>;
export type CustomsCostResponse = z.infer<typeof CustomsCostResponseSchema>;
