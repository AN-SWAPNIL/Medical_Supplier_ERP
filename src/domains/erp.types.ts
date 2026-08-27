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
  | "manage_user_access"
  | "approve_special_price";

export type DocumentEntityType = "import" | "import-cost" | "expense" | "marketing-activity" | "field-visit" | "lead";
export type DocumentSource = "UPLOADED" | "GENERATED";

export type DocumentRecord = {
  id: string;
  entityType: DocumentEntityType;
  entityId: string;
  documentType: string;
  source: DocumentSource;
  fileName: string;
  mimeType: string;
  sizeBytes?: number;
  previewUrl: string;
  sensitive: boolean;
  notes?: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
};

export type DocumentUpload = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  fileDataUrl: string;
};

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
  attachment?: DocumentRecord;
  enteredBy: string;
  createdAt: string;
};

export type ImportDocument = DocumentRecord & {
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
  email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
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
  leadId?: string;
  date: string;
  customerId: string;
  customerName: string;
  customerAddressSnapshot?: string;
  customerPhoneSnapshot?: string;
  customerContactSnapshot?: string;
  ownerId: string;
  createdByUserId?: string;
  createdAt?: string;
  submittedAt?: string;
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
  createdByUserId?: string;
  createdAt?: string;
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
  salesOwnerId?: string;
  dispatchedByUserId?: string;
  postedAt?: string;
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
  postedByUserId?: string;
  postedAt?: string;
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
  expenseFor: "Employee" | "Office" | "Warehouse" | "Company / General";
  expenseForId?: string;
  expenseForName: string;
  employeeId?: string;
  employee?: string;
  employeeCode?: string;
  designation?: string;
  department?: string;
  enteredByUserId: string;
  enteredByName: string;
  taAmount?: DecimalString;
  daAmount?: DecimalString;
  remarks: string;
  attachmentName?: string;
  attachment?: DocumentRecord;
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

export type EmployeeDirectoryEntry = SalespersonEmployee & {
  employeeCode: string;
  department: string;
  phone?: string;
  avatarUrl?: string;
  status: "Active" | "Pending" | "Inactive";
};

export type MarketingVerification = "SYSTEM_VERIFIED" | "GPS_VERIFIED" | "MANUAL" | "UNVERIFIED";

export type MarketingActivityType =
  | "LEAD_CREATED"
  | "CUSTOMER_CONTACT"
  | "CUSTOMER_VISIT"
  | "DOCTOR_MEETING"
  | "PROCUREMENT_MEETING"
  | "DEALER_VISIT"
  | "PRODUCT_PRESENTATION"
  | "PRODUCT_DEMONSTRATION"
  | "SAMPLE_DELIVERED"
  | "FOLLOW_UP_COMPLETED"
  | "NEGOTIATION_UPDATE"
  | "TENDER_FOLLOW_UP"
  | "COLLECTION_VISIT"
  | "TRAINING_SESSION"
  | "SERVICE_FOLLOW_UP"
  | "MARKET_SURVEY"
  | "OFFICE_COORDINATION"
  | "GENERAL_NOTE"
  | "CHECK_IN"
  | "CHECK_OUT"
  | "QUOTATION_SUBMITTED"
  | "ORDER_RECEIVED"
  | "DELIVERY_POSTED"
  | "PAYMENT_COLLECTED"
  | "LEAD_CONVERTED";

export type MarketingActivity = {
  id: string;
  userId: string;
  employeeCode: string;
  employeeName: string;
  territory?: string;
  activityType: MarketingActivityType;
  source: "MANUAL" | "FIELD_VISIT" | "QUOTATION" | "ORDER" | "DELIVERY" | "COLLECTION" | "LEAD";
  occurredAt: string;
  submittedAt: string;
  leadId?: string;
  customerId?: string;
  subjectName?: string;
  productIds?: string[];
  purpose?: string;
  remarks?: string;
  nextFollowUpAt?: string;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  amountBdt?: DecimalString;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  verification: MarketingVerification;
  attachments?: DocumentRecord[];
  createdByUserId: string;
};

export type MarketingLeadStage =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "PRESENTATION"
  | "SAMPLE"
  | "QUOTATION"
  | "NEGOTIATION"
  | "ORDER"
  | "DELIVERED"
  | "PAYMENT"
  | "LOST";

export type MarketingLead = {
  id: string;
  leadNumber: string;
  organizationName: string;
  organizationType: Customer["type"];
  contactPerson?: string;
  contactRole?: "Doctor" | "Procurement" | "Owner" | "Management" | "Other";
  mobile: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  interestedProductIds: string[];
  leadSource: string;
  assignedUserId: string;
  stage: MarketingLeadStage;
  nextFollowUpAt?: string;
  lastContactAt?: string;
  customerId?: string;
  lostReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketingFollowUpStatus = "PENDING" | "COMPLETED" | "OVERDUE" | "CANCELLED";

export type MarketingFollowUp = {
  id: string;
  assignedUserId: string;
  leadId?: string;
  customerId?: string;
  subjectName: string;
  dueAt: string;
  purpose: string;
  status: MarketingFollowUpStatus;
  completedAt?: string;
  outcome?: string;
  nextFollowUpAt?: string;
  createdAt: string;
};

export type DailyMarketingPlan = {
  id: string;
  userId: string;
  date: string;
  plannedVisits: Array<{ id: string; customerId?: string; leadId?: string; subjectName: string; plannedTime?: string; purpose: string; completed: boolean }>;
  notes?: string;
  status: "DRAFT" | "SUBMITTED" | "COMPLETED";
};

export type MonthlyMarketingPlan = {
  id: string;
  userId: string;
  month: string;
  territory: string;
  prioritySubjects: string[];
  productIds: string[];
  plannedActivities: number;
  notes?: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED";
};

export type EmployeeMarketingTarget = {
  id: string;
  userId: string;
  month: string;
  salesTargetBdt: DecimalString;
  newCustomerTarget: number;
  visitTarget: number;
  collectionTargetBdt: DecimalString;
  createdByUserId: string;
  createdAt: string;
};

export type MarketingScoreRule = {
  id: string;
  event: "NEW_QUALIFIED_CUSTOMER" | "VERIFIED_CUSTOMER_VISIT" | "QUALIFIED_LEAD" | "QUOTATION_SUBMITTED" | "ORDER_RECEIVED" | "PAYMENT_COLLECTED" | "FOLLOW_UP_COMPLETED";
  label: string;
  points: number;
  active: boolean;
};

export type MarketingPerformanceRow = {
  employee: EmployeeDirectoryEntry;
  activityCount: number;
  checkIns: number;
  completedVisits: number;
  verifiedVisits: number;
  newLeads: number;
  qualifiedLeads: number;
  followUpsCompleted: number;
  overdueFollowUps: number;
  presentations: number;
  samples: number;
  quotations: number;
  orders: number;
  deliveredSalesBdt: DecimalString;
  collectionsBdt: DecimalString;
  convertedCustomers: number;
  activityScore: number;
  targets: EmployeeMarketingTarget;
  progress: { sales: DecimalString; visits: DecimalString; customers: DecimalString; collections: DecimalString; overall: DecimalString };
};

export type MarketingDashboardData = {
  scope: "NONE" | "SELF" | "TEAM" | "ALL";
  businessDate: string;
  metrics: Array<{ id: string; label: string; value: DecimalString; unit: string }>;
  activities: MarketingActivity[];
  followUps: MarketingFollowUp[];
  leads: MarketingLead[];
  funnel: Array<{ stage: MarketingLeadStage; count: number }>;
  fieldTeam: FieldTeamCurrentData["summary"];
  performance: MarketingPerformanceRow[];
  dailyPlan?: DailyMarketingPlan;
  monthlyPlan?: MonthlyMarketingPlan;
};

export type MarketingReportData = {
  period: { from: string; to: string };
  filters: { employeeId: string; territory: string; activityType: string; subjectId: string; verification: string; status: string; groupBy: string; mode: "Summary" | "Detail" };
  summary: Array<{ label: string; value: DecimalString }>;
  tables: ReportTable[];
  performance: MarketingPerformanceRow[];
};

export type EmployeeMarketingSnapshot = {
  period: { from: string; to: string };
  employee: EmployeeDirectoryEntry;
  performance: MarketingPerformanceRow;
  recentActivities: MarketingActivity[];
  followUps: MarketingFollowUp[];
  leads: MarketingLead[];
  dailyPlan?: DailyMarketingPlan;
  dailyPlans: DailyMarketingPlan[];
  monthlyPlans: MonthlyMarketingPlan[];
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
  marketing?: {
    title: string;
    metrics: Array<{ id: string; label: string; value: DecimalString; unit: string }>;
    actionPath: string;
  };
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

export type SalespersonEmployee = {
  id: string;
  name: string;
  title: string;
  territory?: string;
  employeeCode?: string;
};

export type SalespersonPerformanceSummary = {
  quotationsCreated: number;
  quotationValue: DecimalString;
  sentQuotations: number;
  acceptedQuotations: number;
  convertedQuotations: number;
  rejectedQuotations: number;
  pendingQuotationValue: DecimalString;
  ordersCreated: number;
  ordersDelivered: number;
  deliveredSalesValue: DecimalString;
  unitsDelivered: DecimalString;
  collectionsReceived: DecimalString;
  customersHandled: number;
  assignedCustomerDue: DecimalString;
  averageOrderValue: DecimalString;
  conversionRate: DecimalString;
  totalDiscount: DecimalString;
  averageDiscount: DecimalString;
  checkIns: number;
  completedVisits: number;
  verifiedVisits: number;
  newLeads: number;
  qualifiedLeads: number;
  followUpsCompleted: number;
  overdueFollowUps: number;
  presentations: number;
  samples: number;
  activityScore: number;
  targetProgress: DecimalString;
};

export type SalespersonComparisonRow = SalespersonEmployee & SalespersonPerformanceSummary;

export type SalespersonPerformanceDetail = {
  employee: SalespersonEmployee;
  summary: SalespersonPerformanceSummary;
  tables: {
    quotations: ReportTable;
    orders: ReportTable;
    deliveries: ReportTable;
    collections: ReportTable;
    customers: ReportTable;
    products: ReportTable;
    marketingActivities: ReportTable;
    followUps: ReportTable;
  };
};

export type SalespersonPerformanceData = {
  period: { from: string; to: string };
  selectedEmployeeId: string;
  employees: SalespersonEmployee[];
  comparison: SalespersonComparisonRow[];
  selected?: SalespersonPerformanceDetail;
};

export type TrackingStatus = "LIVE" | "RECENT" | "STALE" | "OFFLINE" | "NOT_TRACKING";
export type LocationSource = "MOBILE_APP" | "WEB_FOREGROUND" | "MANUAL" | "DEMO";

export type FieldEmployee = SalespersonEmployee & {
  employeeCode: string;
  phone: string;
  avatarUrl: string;
};

export type FieldVisit = {
  id: string;
  userId: string;
  customerId: string;
  customerName: string;
  leadId?: string;
  purpose: string;
  outcome?: string;
  status: "Planned" | "Checked In" | "Completed" | "Missed";
  plannedAt: string;
  checkInAt?: string;
  checkOutAt?: string;
  customerLatitude: number;
  customerLongitude: number;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInAccuracyMeters?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkOutAccuracyMeters?: number;
  productIds?: string[];
  nextFollowUpAt?: string;
  remarks?: string;
  verification?: MarketingVerification;
  checkInDistanceMeters?: number;
  distanceWarning?: boolean;
  attachments?: DocumentRecord[];
  submittedAt?: string;
};

export type CurrentEmployeeLocation = {
  userId: string;
  employee: FieldEmployee;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  recordedAt: string;
  status: TrackingStatus;
  source: LocationSource;
  sessionId?: string;
  sessionStartedAt?: string;
  currentVisit?: FieldVisit;
};

export type LocationHistoryPoint = {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  recordedAt: string;
  source: LocationSource;
  event?: "TRACKING_STARTED" | "LOCATION" | "VISIT_CHECK_IN" | "VISIT_CHECK_OUT" | "TRACKING_ENDED";
};

export type TrackingSession = {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  source: LocationSource;
  status: "Active" | "Completed";
};

export type FieldTeamCurrentData = {
  feedLabel: "Demo location feed";
  generatedAt: string;
  employees: FieldEmployee[];
  locations: CurrentEmployeeLocation[];
  summary: { activeNow: number; recent: number; offline: number; notTracking: number; visitsToday: number };
};

export type FieldTeamHistoryData = {
  feedLabel: "Demo location feed";
  employee: FieldEmployee;
  date: string;
  session?: TrackingSession;
  points: LocationHistoryPoint[];
  visits: FieldVisit[];
};

export type LocationUpdateInput = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  recordedAt: string;
  source: Exclude<LocationSource, "DEMO">;
};

export type AIContext = {
  route: string;
  entityType?: "import" | "inventory" | "sales" | "marketing" | "employees" | "reports" | "dashboard" | "accounts" | "settings" | "field-team" | "insights";
  entityId?: string;
  employeeId?: string;
  reportFrom?: string;
  reportTo?: string;
};

export type AISource = {
  label: string;
  path: string;
};

export type AIChatResponse = {
  answer: string;
  contextLabel: string;
  suggestions: string[];
  sources: AISource[];
  restricted: boolean;
};

export type AIInsight = {
  id: string;
  title: string;
  summary: string;
  severity: "Info" | "Attention" | "Critical";
  sourceLabel: string;
  sourcePath?: string;
};

export type AIRecommendation = AIInsight & {
  reason: string;
  recommendedAction: string;
  category?: "Imports" | "Inventory" | "Sales" | "Marketing" | "Collections" | "Finance" | "Field Team";
  detectedAt?: string;
};

export type AIDocumentExtractionField = {
  key: string;
  label: string;
  value: string;
  target: "import" | "item";
  targetId?: string;
  confidence: DecimalString;
};

export type AIDocumentExtraction = {
  importId: string;
  documentId: string;
  documentName: string;
  requiresReview: true;
  fields: AIDocumentExtractionField[];
  warnings: string[];
};
