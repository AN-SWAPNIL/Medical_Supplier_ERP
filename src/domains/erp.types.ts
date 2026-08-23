import type { Role } from "../types/index.js";

export type DecimalString = string;
export type PaymentMode = "Pending" | "LC" | "TT";
export type AllocationMethod = "CBM" | "FOB_VALUE" | "QUANTITY" | "PRODUCT_SPECIFIC" | "MANUAL";
export type ImportStatus =
  | "Draft"
  | "PI Received"
  | "LC/TT Opened"
  | "In Production"
  | "Shipped"
  | "At Port"
  | "Costing"
  | "Cost Finalized"
  | "Partially Received"
  | "Received"
  | "Closed"
  | "Cancelled";

export type Capability =
  | "view_sensitive_cost"
  | "edit_sensitive_cost"
  | "finalize_landed_cost"
  | "reopen_landed_cost"
  | "view_profit"
  | "approve_stock_override"
  | "manage_users"
  | "approve_special_price";

export type Product = {
  id: string;
  code: string;
  family: string;
  variant: string;
  name: string;
  unit: string;
  hsCode?: string;
  imageUrl: string;
  standardSalePrice: DecimalString;
  active: boolean;
};

export type Supplier = {
  id: string;
  name: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  paymentTerms: string;
  active: boolean;
};

export type ImportItem = {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: DecimalString;
  unit: string;
  currency: string;
  fobUnitForeign: DecimalString;
  exchangeRate: DecimalString;
  fobTotalBdt: DecimalString;
  cbmPerCarton: DecimalString;
  cartonCount: DecimalString;
  totalCbm: DecimalString;
  cbmMode?: "CALCULATED" | "MANUAL";
  grossWeight?: DecimalString;
  netWeight?: DecimalString;
  hsCode?: string;
};

export type ManualSplit = {
  importItemId: string;
  amountBdt: DecimalString;
};

export type ImportCostLine = {
  id: string;
  name: string;
  category: string;
  amountForeign: DecimalString;
  currency: string;
  exchangeRate: DecimalString;
  amountBdt: DecimalString;
  allocationMethod: AllocationMethod;
  appliesToItemIds: string[];
  manualSplits?: ManualSplit[];
  vendor?: string;
  paymentDate?: string;
  accountId?: string;
  notes?: string;
  attachmentName?: string;
  enteredBy: string;
  createdAt: string;
};

export type ImportDocument = {
  id: string;
  importId: string;
  type: string;
  name: string;
  uploadedAt: string;
  uploadedBy: string;
  status: "Available" | "Pending";
};

export type CostAllocation = {
  costLineId: string;
  costName: string;
  importItemId: string;
  productName: string;
  method: AllocationMethod;
  basisValue: DecimalString;
  sharePercent: DecimalString;
  allocatedBdt: DecimalString;
  perUnitBdt: DecimalString;
  explanation: string;
};

export type LandedCostProductResult = {
  importItemId: string;
  productCode: string;
  productName: string;
  quantity: DecimalString;
  fobTotalBdt: DecimalString;
  fobPerUnitBdt: DecimalString;
  additionalCostBdt: DecimalString;
  additionalPerUnitBdt: DecimalString;
  finalTotalBdt: DecimalString;
  finalPerUnitBdt: DecimalString;
  components: CostAllocation[];
};

export type LandedCostPreview = {
  importId: string;
  totalProductValueBdt: DecimalString;
  totalAdditionalCostBdt: DecimalString;
  totalShipmentCostBdt: DecimalString;
  products: LandedCostProductResult[];
  allocations: CostAllocation[];
  validationErrors: string[];
};

export type LandedCostSnapshot = LandedCostPreview & {
  id: string;
  version: number;
  finalizedAt: string;
  finalizedBy: string;
  immutable: true;
};

export type ImportCase = {
  id: string;
  draftReference: string;
  primaryReference: string;
  supplierId: string;
  supplierName: string;
  poNumber: string;
  poDate: string;
  piNumber?: string;
  piDate?: string;
  paymentMode: PaymentMode;
  lcNumber?: string;
  lcAmount?: DecimalString;
  lcOpenDate?: string;
  lcExpiryDate?: string;
  ttReference?: string;
  ttAmount?: DecimalString;
  ttDate?: string;
  bank?: string;
  currency: string;
  exchangeRate: DecimalString;
  rateDate: string;
  rateSource: string;
  expectedShipmentDate?: string;
  commercialInvoiceNumber?: string;
  commercialInvoiceDate?: string;
  productionStatus?: string;
  productionFollowUpNote?: string;
  blNumber?: string;
  containerNumber?: string;
  containerType?: string;
  vesselName?: string;
  etd?: string;
  eta?: string;
  status: ImportStatus;
  milestone: ImportStatus;
  costingStatus: "Not Started" | "In Progress" | "Ready" | "Finalized";
  warehouseStatus: "Not Ready" | "Ready" | "Partially Received" | "Received";
  notes?: string;
  items: ImportItem[];
  costs: ImportCostLine[];
  documents: ImportDocument[];
  snapshot?: LandedCostSnapshot;
  snapshotHistory?: LandedCostSnapshot[];
  createdAt: string;
  updatedAt: string;
};

export type WarehouseReceiptLine = {
  importItemId: string;
  productId: string;
  productName: string;
  quantityReceived: DecimalString;
  quantityRejected: DecimalString;
  lotNumber: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  warehouse: string;
  location?: string;
  landedCostPerUnit: DecimalString;
};

export type WarehouseReceipt = {
  id: string;
  importId: string;
  reference: string;
  receivedDate: string;
  lines: WarehouseReceiptLine[];
  status: "Posted";
  receivedBy: string;
};

export type StockBatch = {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  sourceImportId: string;
  sourceReference: string;
  lotNumber: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  receivedDate: string;
  quantityReceived: DecimalString;
  quantityAvailable: DecimalString;
  warehouse: string;
  location?: string;
  landedCostPerUnit: DecimalString;
  sourceType?: "Import Receipt" | "Opening Stock";
  expiryStatus?: "Expired" | "1 Month Alert" | "3 Month Alert" | "6 Month Alert" | "Normal";
};

export type StockMovement = {
  id: string;
  date: string;
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  type: "Receive" | "Dispatch" | "Return" | "Adjustment";
  quantity: DecimalString;
  reference: string;
  reason?: string;
  createdBy: string;
};

export type Customer = {
  id: string;
  name: string;
  type: "Hospital" | "Clinic" | "Dealer" | "Pharmacy" | "Other";
  contactPerson: string;
  phone: string;
  address: string;
  territory: string;
  assignedSalesUserId?: string;
  paymentTerms: string;
  creditLimit: DecimalString;
  currentDue: DecimalString;
  totalSales: DecimalString;
  totalCollected: DecimalString;
  active: boolean;
};

export type SalesLine = {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: DecimalString;
  unitPrice: DecimalString;
  discount: DecimalString;
  lineTotal: DecimalString;
};

export type Quotation = {
  id: string;
  quotationNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerAddressSnapshot?: string;
  customerPhoneSnapshot?: string;
  customerContactSnapshot?: string;
  ownerId: string;
  validityDays: number;
  paymentTerms: string;
  remarks?: string;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Converted";
  lines: SalesLine[];
  subtotal: DecimalString;
  discountTotal: DecimalString;
  total: DecimalString;
};

export type SalesOrder = {
  id: string;
  orderNumber: string;
  quotationId?: string;
  date: string;
  customerId: string;
  customerName: string;
  customerAddressSnapshot?: string;
  customerPhoneSnapshot?: string;
  customerContactSnapshot?: string;
  ownerId: string;
  paymentConditions: string;
  deliveryInstruction: string;
  amountReceived: DecimalString;
  due: DecimalString;
  status: "Placed" | "Ready" | "Partially Delivered" | "Delivered" | "Cancelled";
  lines: SalesLine[];
  total: DecimalString;
  paymentConfirmation?: string;
  paymentReference?: string;
  paymentDate?: string;
  requestedDeliveryDate?: string;
  orderReceivedByName?: string;
  orderReceivedByDesignation?: string;
  orderGivenBy?: string;
  headOfSalesSignoff?: string;
  coeSignoff?: string;
  mdSignoff?: string;
};

export type DeliveryLine = SalesLine & {
  batchId: string;
  batchNumber: string;
};

export type Delivery = {
  id: string;
  challanNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  date: string;
  remarks: string;
  receiverName?: string;
  overrideReason?: string;
  status: "Draft" | "Dispatched" | "Delivered";
  lines: DeliveryLine[];
};

export type Collection = {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  date: string;
  amount: DecimalString;
  paymentMode: "Cash" | "bKash" | "Bank Transfer" | "Cheque";
  accountId?: string;
  referenceNumber?: string;
  remarks?: string;
  ownerId: string;
  status: "Posted" | "Reversed";
};

export type Expense = {
  id: string;
  date: string;
  categoryId: string;
  categoryName: string;
  subtype: "General" | "TA/DA";
  amount: DecimalString;
  paidFromAccountId: string;
  employee?: string;
  designation?: string;
  taAmount?: DecimalString;
  daAmount?: DecimalString;
  remarks: string;
  attachmentName?: string;
  status: "Posted" | "Reversed";
};

export type CashBankAccount = {
  id: string;
  name: string;
  type: "Cash" | "Bank" | "Mobile Banking";
  accountNumber?: string;
  balance: DecimalString;
  active: boolean;
};

export type AccountTransaction = {
  id: string;
  date: string;
  accountId: string;
  accountName: string;
  direction: "In" | "Out";
  amount: DecimalString;
  sourceType: "Collection" | "Expense" | "Import Cost" | "Opening Balance";
  sourceId: string;
  description: string;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  reason?: string;
};

export type CapabilityGrant = {
  userId: string;
  role: Role;
  capabilities: Capability[];
};

export type BusinessDecision = {
  id: string;
  title: string;
  question: string;
  currentBehavior: string;
  status: "Pending Client Confirmation" | "Confirmed";
  blocks: string[];
  resolutionValue?: string;
  resolutionNotes?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  sourceReference?: string;
};

export type ProductAlias = {
  id: string;
  aliasText: string;
  productId: string;
  productName: string;
  source: string;
  active: boolean;
};

export type CustomerLedgerEntry = {
  id: string;
  date: string;
  type: "Opening Due" | "Delivery" | "Collection";
  reference: string;
  debit: DecimalString;
  credit: DecimalString;
  runningDue: DecimalString;
  remarks: string;
};

export type CustomerLedger = {
  customer: Customer;
  deliveredSales: DecimalString;
  collected: DecimalString;
  currentDue: DecimalString;
  entries: CustomerLedgerEntry[];
  deliveries: Delivery[];
  collections: Collection[];
};

export type CustomerOpeningBalance = {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  openingDue: DecimalString;
  historicalSales: DecimalString;
  historicalCollected: DecimalString;
  reference: string;
  remarks: string;
  createdBy: string;
  createdAt: string;
};

export type DispatchAllocation = {
  batchId: string;
  batchNumber: string;
  lotNumber: string;
  quantity: DecimalString;
  receivedDate: string;
  expiryDate: string;
};

export type DispatchPreview = {
  productId: string;
  requestedQuantity: DecimalString;
  availableQuantity: DecimalString;
  allocations: DispatchAllocation[];
  warning?: string;
  requiresOverride: boolean;
};

export type ProfitPreviewLine = {
  productId: string;
  productCode: string;
  productName: string;
  quantity: DecimalString;
  proposedUnitPrice: DecimalString;
  effectiveUnitPrice: DecimalString;
  expectedCostPerUnit: DecimalString;
  grossProfitPerUnit: DecimalString;
  grossProfitTotal: DecimalString;
  marginPercent: DecimalString;
  stockCoverage: DecimalString;
  isLoss: boolean;
};

export type ProfitPreview = {
  lines: ProfitPreviewLine[];
  revenue: DecimalString;
  expectedCogs: DecimalString;
  grossProfit: DecimalString;
  marginPercent: DecimalString;
};

export type WarehouseConfig = {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  locations: string[];
  active: boolean;
};

export type CostPreset = {
  id: string;
  name: string;
  category: string;
  suggestedAllocationMethod?: AllocationMethod;
  requiresExplicitChoice: boolean;
  active: boolean;
};

export type PrintIdentity = {
  id: "mipro" | "led-trackers";
  companyName: string;
  displayName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  backgroundImageUrl: string;
  footerText: string;
  authorizedSignatory: string;
  safeArea: { topMm: number; rightMm: number; bottomMm: number; leftMm: number };
};

export type PrintConfiguration = {
  identities: PrintIdentity[];
  defaultIdentityId: PrintIdentity["id"];
  defaultLetterheadMode: "Digital" | "Preprinted";
};

export type DashboardData = {
  role: Role;
  metrics: { id: string; label: string; value: DecimalString; unit: string; sensitive?: boolean }[];
  importAttention: ImportCase[];
  expiryAlerts: StockBatch[];
  customerDues: Customer[];
  recentSales: SalesOrder[];
  recentCollections: Collection[];
  recentExpenses: Expense[];
};

export type ReportTable = {
  id: string;
  title: string;
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, string>[];
};

export type ReportData = {
  period: { from: string; to: string };
  importCosts: { label: string; value: DecimalString }[];
  inventory: { label: string; value: DecimalString }[];
  sales: { label: string; value: DecimalString }[];
  expenses: { label: string; value: DecimalString }[];
  tables: {
    imports: ReportTable[];
    inventory: ReportTable[];
    sales: ReportTable[];
    expenses: ReportTable[];
  };
};
