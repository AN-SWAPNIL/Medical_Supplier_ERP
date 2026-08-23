import type {
  AccountTransaction,
  AuditEvent,
  BusinessDecision,
  CashBankAccount,
  Collection,
  CostPreset,
  Customer,
  CustomerOpeningBalance,
  Delivery,
  Expense,
  ImportCase,
  Product,
  Quotation,
  SalesOrder,
  StockBatch,
  StockMovement,
  Supplier,
  WarehouseConfig,
  WarehouseReceipt,
  PrintConfiguration
} from "../src/domains/erp.types.js";
import type { User } from "../src/types/index.js";

export const demoUsers: User[] = [
  {
    id: "u-super",
    name: "Sadia Karim",
    email: "superadmin@mipro.local",
    role: "Super Admin",
    title: "Owner & System Administrator",
    department: "Management",
    phone: "+880 1711 000001",
    avatarUrl: "/mipro-owner.png",
    status: "Active",
    capabilities: ["view_sensitive_cost", "edit_sensitive_cost", "finalize_landed_cost", "reopen_landed_cost", "view_profit", "approve_stock_override", "manage_users", "approve_special_price"]
  },
  {
    id: "u-md",
    name: "Mahmud Rahman",
    email: "md@mipro.local",
    role: "Managing Director",
    title: "Managing Director",
    department: "Management",
    phone: "+880 1711 000002",
    avatarUrl: "",
    status: "Active",
    capabilities: []
  },
  {
    id: "u-accounts",
    name: "Nusrat Jahan",
    email: "accounts@mipro.local",
    role: "Accounts",
    title: "Accounts Officer",
    department: "Accounts",
    phone: "+880 1711 000003",
    avatarUrl: "",
    status: "Active",
    capabilities: []
  },
  {
    id: "u-import",
    name: "Tanvir Hasan",
    email: "import@mipro.local",
    role: "Import Officer",
    title: "Import Officer",
    department: "Import",
    phone: "+880 1711 000004",
    avatarUrl: "",
    status: "Active",
    capabilities: []
  },
  {
    id: "u-warehouse",
    name: "Aminul Islam",
    email: "warehouse@mipro.local",
    role: "Warehouse Manager",
    title: "Warehouse Manager",
    department: "Warehouse",
    phone: "+880 1711 000005",
    avatarUrl: "",
    status: "Active",
    capabilities: ["approve_stock_override"]
  },
  {
    id: "u-sales-manager",
    name: "Farhana Akter",
    email: "salesmanager@mipro.local",
    role: "Sales Manager",
    title: "Sales Manager",
    department: "Sales",
    phone: "+880 1711 000006",
    avatarUrl: "",
    status: "Active",
    capabilities: ["approve_special_price"]
  },
  {
    id: "sales1",
    name: "Rafiq Ahmed",
    email: "sales1@mipro.local",
    role: "Sales Executive",
    title: "Sales Executive",
    department: "Sales",
    phone: "+880 1711 000007",
    avatarUrl: "",
    status: "Active",
    territory: "Dhaka North",
    capabilities: []
  },
  {
    id: "sales2",
    name: "Shamima Sultana",
    email: "sales2@mipro.local",
    role: "Sales Executive",
    title: "Sales Executive",
    department: "Sales",
    phone: "+880 1711 000008",
    avatarUrl: "",
    status: "Active",
    territory: "Dhaka Central",
    capabilities: []
  }
];

export const passwordByEmail = new Map(demoUsers.map((user) => [user.email, "password123"]));

export const products: Product[] = [
  { id: "prd-d17h", code: "DIAL-17H", family: "Dialyzer", variant: "1.7H", name: "Dialyzer 1.7H", unit: "pcs", hsCode: "9018.90", standardSalePrice: "690.00", active: true, imageUrl: "/medical-products.png#dialyzer" },
  { id: "prd-d17l", code: "DIAL-17L", family: "Dialyzer", variant: "1.7L", name: "Dialyzer 1.7L", unit: "pcs", hsCode: "9018.90", standardSalePrice: "690.00", active: true, imageUrl: "/medical-products.png#dialyzer" },
  { id: "prd-d15h", code: "DIAL-15H", family: "Dialyzer", variant: "1.5H", name: "Dialyzer 1.5H", unit: "pcs", hsCode: "9018.90", standardSalePrice: "700.00", active: true, imageUrl: "/medical-products.png#dialyzer" },
  { id: "prd-d15l", code: "DIAL-15L", family: "Dialyzer", variant: "1.5L", name: "Dialyzer 1.5L", unit: "pcs", hsCode: "9018.90", standardSalePrice: "700.00", active: true, imageUrl: "/medical-products.png#dialyzer" },
  { id: "prd-d16h", code: "DIAL-16H", family: "Dialyzer", variant: "1.6H", name: "Dialyzer 1.6H", unit: "pcs", hsCode: "9018.90", standardSalePrice: "690.00", active: true, imageUrl: "/medical-products.png#dialyzer" },
  { id: "prd-d16l", code: "DIAL-16L", family: "Dialyzer", variant: "1.6L", name: "Dialyzer 1.6L", unit: "pcs", hsCode: "9018.90", standardSalePrice: "690.00", active: true, imageUrl: "/medical-products.png#dialyzer" },
  { id: "prd-bts", code: "BTS-001", family: "Blood Line", variant: "Standard", name: "Blood Line Sets", unit: "set", hsCode: "9018.90", standardSalePrice: "230.00", active: true, imageUrl: "/medical-products.png#bloodline" },
  { id: "prd-av16", code: "AVF-16G", family: "AV Fistula", variant: "16G", name: "AV Fistula 16G", unit: "pcs", hsCode: "9018.32", standardSalePrice: "60.00", active: true, imageUrl: "/medical-products.png#avf" },
  { id: "prd-av17", code: "AVF-17G", family: "AV Fistula", variant: "17G", name: "AV Fistula 17G", unit: "pcs", hsCode: "9018.32", standardSalePrice: "60.00", active: true, imageUrl: "/medical-products.png#avf" },
  { id: "prd-cat", code: "CATH-7F13", family: "Catheter", variant: "7Fr-13cm", name: "Central Venous Catheter 7Fr-13cm", unit: "pcs", hsCode: "9018.39", standardSalePrice: "1300.00", active: true, imageUrl: "/medical-products.png#catheter" }
];

export const productAliases = [
  { id: "alias-1", aliasText: "Dialyzer 1.7 High Flux", productId: "prd-d17h", productName: "Dialyzer 1.7H", source: "Sales_Ledger_1.2.1.xlsx", active: true },
  { id: "alias-2", aliasText: "Bloodline Set", productId: "prd-bts", productName: "Blood Line Sets", source: "Sales_Ledger_1.2.1.xlsx", active: true },
  { id: "alias-3", aliasText: "A.V. Fistula 16", productId: "prd-av16", productName: "AV Fistula 16G", source: "Sales_Ledger_1.2.1.xlsx", active: true }
];

export const suppliers: Supplier[] = [
  { id: "sup-renhe", name: "Guangzhou Renhe Medical Technology", country: "China", contactPerson: "Liu Wen", phone: "+86 20 5550 1840", email: "export@renhe-med.cn", paymentTerms: "LC at sight", active: true },
  { id: "sup-aoxin", name: "Shanghai Aoxin Medical Supply", country: "China", contactPerson: "Chen Yu", phone: "+86 21 8810 2260", email: "sales@aoxin-med.cn", paymentTerms: "30% TT / 70% before shipment", active: true },
  { id: "sup-safe", name: "Qingdao SafeHand Medical", country: "China", contactPerson: "Mei Zhang", phone: "+86 532 4418 0930", email: "trade@safehand.cn", paymentTerms: "LC 60 days", active: true }
];

const lcItems = [
  { id: "ii-77612-1", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "10500", unit: "pcs", currency: "USD", fobUnitForeign: "3.20", exchangeRate: "122.50", fobTotalBdt: "4116000.00", cbmPerCarton: "0.080", cartonCount: "210", totalCbm: "16.80", grossWeight: "4200", netWeight: "3885", hsCode: "9018.90" },
  { id: "ii-77612-2", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", quantity: "10500", unit: "set", currency: "USD", fobUnitForeign: "0.78", exchangeRate: "122.50", fobTotalBdt: "1003275.00", cbmPerCarton: "0.107", cartonCount: "160", totalCbm: "17.12", grossWeight: "2950", netWeight: "2690", hsCode: "9018.90" },
  { id: "ii-77612-3", productId: "prd-av16", productCode: "AVF-16G", productName: "AV Fistula 16G", quantity: "5000", unit: "pcs", currency: "USD", fobUnitForeign: "0.18", exchangeRate: "122.50", fobTotalBdt: "110250.00", cbmPerCarton: "0.050", cartonCount: "100", totalCbm: "5.00", grossWeight: "620", netWeight: "560", hsCode: "9018.32" }
];

export const imports: ImportCase[] = [
  {
    id: "imp-77612", draftReference: "IMP-2026-001", primaryReference: "LC-77612", supplierId: "sup-renhe", supplierName: "Guangzhou Renhe Medical Technology", poNumber: "PO-2026-001", poDate: "2026-05-18", piNumber: "PI-RH-26061", piDate: "2026-05-21", paymentMode: "LC", lcNumber: "LC-77612", bank: "City Bank PLC", currency: "USD", exchangeRate: "122.50", rateDate: "2026-06-02", rateSource: "Bank statement", expectedShipmentDate: "2026-07-18", blNumber: "CN-9982", containerNumber: "MSCU-7391024", containerType: "40 FT", vesselName: "COSCO Shipping Star", etd: "2026-07-20", eta: "2026-08-18", status: "Costing", milestone: "Costing", costingStatus: "In Progress", warehouseStatus: "Not Ready", notes: "Customs assessment received. Cost lines are being reconciled before warehouse receiving.", items: lcItems,
    costs: [
      { id: "cost-frt", name: "China-Bangladesh Sea Freight", category: "Freight", amountForeign: "3000.00", currency: "USD", exchangeRate: "122.50", amountBdt: "367500.00", allocationMethod: "CBM", appliesToItemIds: [], vendor: "COSCO Shipping", paymentDate: "2026-07-18", notes: "Container freight allocated by product CBM.", attachmentName: "freight-invoice.pdf", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:00:00.000Z" },
      { id: "cost-duty-d", name: "Customs Duty - Dialyzer", category: "Customs Duty", amountForeign: "525000.00", currency: "BDT", exchangeRate: "1", amountBdt: "525000.00", allocationMethod: "PRODUCT_SPECIFIC", appliesToItemIds: ["ii-77612-1"], vendor: "Bangladesh Customs", notes: "Final assessed amount entered manually.", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:15:00.000Z" },
      { id: "cost-duty-b", name: "Customs Duty - Blood Line", category: "Customs Duty", amountForeign: "410000.00", currency: "BDT", exchangeRate: "1", amountBdt: "410000.00", allocationMethod: "PRODUCT_SPECIFIC", appliesToItemIds: ["ii-77612-2"], vendor: "Bangladesh Customs", notes: "Final assessed amount entered manually.", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:20:00.000Z" },
      { id: "cost-duty-a", name: "Customs Duty - AV Fistula", category: "Customs Duty", amountForeign: "92000.00", currency: "BDT", exchangeRate: "1", amountBdt: "92000.00", allocationMethod: "PRODUCT_SPECIFIC", appliesToItemIds: ["ii-77612-3"], vendor: "Bangladesh Customs", notes: "Final assessed amount entered manually.", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:25:00.000Z" },
      { id: "cost-bank", name: "Bank LC Opening Fee", category: "Bank", amountForeign: "85000.00", currency: "BDT", exchangeRate: "1", amountBdt: "85000.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [], vendor: "City Bank PLC", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:30:00.000Z" },
      { id: "cost-ins", name: "Marine Insurance", category: "Insurance", amountForeign: "42500.00", currency: "BDT", exchangeRate: "1", amountBdt: "42500.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [], vendor: "Green Delta Insurance", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:35:00.000Z" },
      { id: "cost-cf", name: "C&F Cost", category: "Port / C&F", amountForeign: "120000.00", currency: "BDT", exchangeRate: "1", amountBdt: "120000.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [], vendor: "Port Link C&F", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:40:00.000Z" },
      { id: "cost-gate", name: "Gate Fee", category: "Port / C&F", amountForeign: "3566.00", currency: "BDT", exchangeRate: "1", amountBdt: "3566.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [], enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:45:00.000Z" },
      { id: "cost-port", name: "Port Utility", category: "Port / C&F", amountForeign: "28000.00", currency: "BDT", exchangeRate: "1", amountBdt: "28000.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [], enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:50:00.000Z" },
      { id: "cost-local", name: "Local Covered Van", category: "Local Transport", amountForeign: "60000.00", currency: "BDT", exchangeRate: "1", amountBdt: "60000.00", allocationMethod: "CBM", appliesToItemIds: [], vendor: "Chattogram Logistics", enteredBy: "Sadia Karim", createdAt: "2026-08-19T10:00:00.000Z" },
      { id: "cost-labour", name: "Unloading Labour", category: "Labour", amountForeign: "18000.00", currency: "BDT", exchangeRate: "1", amountBdt: "18000.00", allocationMethod: "QUANTITY", appliesToItemIds: [], enteredBy: "Sadia Karim", createdAt: "2026-08-19T10:05:00.000Z" }
    ],
    documents: [
      { id: "doc-pi", importId: "imp-77612", type: "PI", name: "PI-RH-26061.pdf", uploadedAt: "2026-05-21", uploadedBy: "Tanvir Hasan", status: "Available" },
      { id: "doc-lc", importId: "imp-77612", type: "LC", name: "LC-77612-swift.pdf", uploadedAt: "2026-06-02", uploadedBy: "Tanvir Hasan", status: "Available" },
      { id: "doc-bl", importId: "imp-77612", type: "Bill of Lading", name: "CN-9982.pdf", uploadedAt: "2026-07-21", uploadedBy: "Tanvir Hasan", status: "Available" },
      { id: "doc-assess", importId: "imp-77612", type: "Customs Assessment", name: "customs-assessment-77612.pdf", uploadedAt: "2026-08-19", uploadedBy: "Sadia Karim", status: "Available" }
    ], createdAt: "2026-05-18T08:00:00.000Z", updatedAt: "2026-08-19T10:05:00.000Z"
  },
  {
    id: "imp-draft-2", draftReference: "IMP-2026-002", primaryReference: "IMP-2026-002", supplierId: "sup-aoxin", supplierName: "Shanghai Aoxin Medical Supply", poNumber: "PO-2026-006", poDate: "2026-08-15", piNumber: "PI-AOX-26088", piDate: "2026-08-17", paymentMode: "LC", currency: "USD", exchangeRate: "122.75", rateDate: "2026-08-17", rateSource: "Provisional bank quote", expectedShipmentDate: "2026-10-10", status: "PI Received", milestone: "PI Received", costingStatus: "Not Started", warehouseStatus: "Not Ready", notes: "LC application preparation in progress.", items: [{ id: "ii-draft-1", productId: "prd-d15h", productCode: "DIAL-15H", productName: "Dialyzer 1.5H", quantity: "8000", unit: "pcs", currency: "USD", fobUnitForeign: "3.15", exchangeRate: "122.75", fobTotalBdt: "3093300.00", cbmPerCarton: "0.08", cartonCount: "160", totalCbm: "12.80", hsCode: "9018.90" }], costs: [], documents: [], createdAt: "2026-08-15T08:00:00.000Z", updatedAt: "2026-08-17T11:00:00.000Z"
  },
  {
    id: "imp-tt-8", draftReference: "IMP-2026-003", primaryReference: "TT-26008", supplierId: "sup-safe", supplierName: "Qingdao SafeHand Medical", poNumber: "PO-2026-004", poDate: "2026-07-03", piNumber: "PI-QSH-26031", piDate: "2026-07-05", paymentMode: "TT", ttReference: "TT-26008", bank: "Eastern Bank PLC", currency: "USD", exchangeRate: "121.80", rateDate: "2026-07-07", rateSource: "Bank statement", blNumber: "BL-QD-8821", containerNumber: "TLLU-228901", vesselName: "Wan Hai 512", etd: "2026-08-02", eta: "2026-08-28", status: "Shipped", milestone: "Shipped", costingStatus: "Not Started", warehouseStatus: "Not Ready", items: [{ id: "ii-tt-1", productId: "prd-av17", productCode: "AVF-17G", productName: "AV Fistula 17G", quantity: "25000", unit: "pcs", currency: "USD", fobUnitForeign: "0.19", exchangeRate: "121.80", fobTotalBdt: "578550.00", cbmPerCarton: "0.05", cartonCount: "250", totalCbm: "12.50", hsCode: "9018.32" }], costs: [], documents: [], createdAt: "2026-07-03T08:00:00.000Z", updatedAt: "2026-08-02T08:00:00.000Z"
  }
];

export const stockBatches: StockBatch[] = [
  { id: "bat-d17-old", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", sourceImportId: "opening-stock", sourceReference: "LEGACY-LC-77102", sourceType: "Opening Stock", lotNumber: "LOT-D17H-2509", batchNumber: "BAT-D17H-2509", manufacturingDate: "2025-09-10", expiryDate: "2028-09-09", receivedDate: "2025-11-18", quantityReceived: "1800", quantityAvailable: "450", warehouse: "MIPRO Main Warehouse", location: "Rack A-01", landedCostPerUnit: "438.25" },
  { id: "bat-d17-new", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", sourceImportId: "imp-old-2", sourceReference: "LC-77508", lotNumber: "LOT-D17H-2603", batchNumber: "BAT-D17H-2603", manufacturingDate: "2026-03-12", expiryDate: "2029-03-11", receivedDate: "2026-05-20", quantityReceived: "2200", quantityAvailable: "1720", warehouse: "MIPRO Main Warehouse", location: "Rack A-02", landedCostPerUnit: "452.80" },
  { id: "bat-bts-old", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", sourceImportId: "imp-old-1", sourceReference: "LC-77102", lotNumber: "LOT-BTS-2510", batchNumber: "BAT-BTS-2510", manufacturingDate: "2025-10-04", expiryDate: "2027-10-03", receivedDate: "2025-11-18", quantityReceived: "6000", quantityAvailable: "1350", warehouse: "MIPRO Main Warehouse", location: "Rack B-01", landedCostPerUnit: "158.40" },
  { id: "bat-bts-new", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", sourceImportId: "imp-old-2", sourceReference: "LC-77508", lotNumber: "LOT-BTS-2604", batchNumber: "BAT-BTS-2604", manufacturingDate: "2026-04-11", expiryDate: "2028-04-10", receivedDate: "2026-05-20", quantityReceived: "7200", quantityAvailable: "6200", warehouse: "MIPRO Main Warehouse", location: "Rack B-02", landedCostPerUnit: "164.15" },
  { id: "bat-av16", productId: "prd-av16", productCode: "AVF-16G", productName: "AV Fistula 16G", sourceImportId: "imp-old-3", sourceReference: "LC-77311", lotNumber: "LOT-AV16-2601", batchNumber: "BAT-AV16-2601", manufacturingDate: "2026-01-20", expiryDate: "2029-01-19", receivedDate: "2026-03-15", quantityReceived: "10000", quantityAvailable: "7480", warehouse: "MIPRO Main Warehouse", location: "Rack C-01", landedCostPerUnit: "42.20" },
  { id: "bat-cat", productId: "prd-cat", productCode: "CATH-7F13", productName: "Central Venous Catheter 7Fr-13cm", sourceImportId: "imp-old-4", sourceReference: "TT-25118", lotNumber: "LOT-CATH-2508", batchNumber: "BAT-CATH-2508", manufacturingDate: "2025-08-10", expiryDate: "2027-02-10", receivedDate: "2025-10-12", quantityReceived: "850", quantityAvailable: "210", warehouse: "MIPRO Main Warehouse", location: "Rack D-01", landedCostPerUnit: "890.00" }
];

export const stockMovements: StockMovement[] = [
  { id: "mov-1", date: "2026-05-20", productId: "prd-d17h", productName: "Dialyzer 1.7H", batchId: "bat-d17-new", batchNumber: "BAT-D17H-2603", type: "Receive", quantity: "2200", reference: "LC-77508", createdBy: "Aminul Islam" },
  { id: "mov-2", date: "2026-07-15", productId: "prd-d17h", productName: "Dialyzer 1.7H", batchId: "bat-d17-old", batchNumber: "BAT-D17H-2509", type: "Dispatch", quantity: "120", reference: "DC-2026-031", createdBy: "Aminul Islam" },
  { id: "mov-3", date: "2026-07-21", productId: "prd-bts", productName: "Blood Line Sets", batchId: "bat-bts-old", batchNumber: "BAT-BTS-2510", type: "Dispatch", quantity: "90", reference: "DC-2026-034", createdBy: "Aminul Islam" },
  { id: "mov-4", date: "2026-08-09", productId: "prd-d17h", productName: "Dialyzer 1.7H", batchId: "bat-d17-old", batchNumber: "BAT-D17H-2509", type: "Dispatch", quantity: "60", reference: "DC-2026-036", createdBy: "Aminul Islam" },
  { id: "mov-5", date: "2026-08-09", productId: "prd-bts", productName: "Blood Line Sets", batchId: "bat-bts-old", batchNumber: "BAT-BTS-2510", type: "Dispatch", quantity: "30", reference: "DC-2026-036", createdBy: "Aminul Islam" }
];

export const receipts: WarehouseReceipt[] = [];

export const customers: Customer[] = [
  { id: "cus-ark", name: "ARK Hospital", type: "Hospital", contactPerson: "Purchase Department", phone: "+880 1712 410011", address: "Dhaka", territory: "Dhaka North", assignedSalesUserId: "sales1", paymentTerms: "30 days", creditLimit: "500000.00", currentDue: "0.00", totalSales: "367000.00", totalCollected: "367000.00", active: true },
  { id: "cus-popular", name: "Popular Medicine & Departmental Store", type: "Pharmacy", contactPerson: "Manager", phone: "+880 1811 220035", address: "Uttara, Dhaka", territory: "Dhaka North", assignedSalesUserId: "sales1", paymentTerms: "Cash / 15 days", creditLimit: "250000.00", currentDue: "27900.00", totalSales: "86937.00", totalCollected: "59037.00", active: true },
  { id: "cus-kuwait", name: "Kuwait Moitri Hospital", type: "Hospital", contactPerson: "Medical Store", phone: "+880 1715 881220", address: "Uttara, Dhaka", territory: "Dhaka North", assignedSalesUserId: "sales1", paymentTerms: "30 days", creditLimit: "400000.00", currentDue: "0.00", totalSales: "27600.00", totalCollected: "27600.00", active: true },
  { id: "cus-bismillah", name: "Bismillah Surgical", type: "Dealer", contactPerson: "Proprietor", phone: "+880 1912 771122", address: "Mitford, Dhaka", territory: "Dhaka Central", assignedSalesUserId: "sales2", paymentTerms: "Cash", creditLimit: "300000.00", currentDue: "0.00", totalSales: "121200.00", totalCollected: "121200.00", active: true },
  { id: "cus-labaid", name: "Labaid Specialized Hospital", type: "Hospital", contactPerson: "Supply Chain", phone: "+880 1714 330010", address: "Dhanmondi, Dhaka", territory: "Dhaka Central", assignedSalesUserId: "sales2", paymentTerms: "45 days", creditLimit: "900000.00", currentDue: "186500.00", totalSales: "945000.00", totalCollected: "758500.00", active: true },
  { id: "cus-insaf", name: "Insaf Barakah Foundation Hospital", type: "Hospital", contactPerson: "Purchase Office", phone: "+880 1718 332214", address: "Moghbazar, Dhaka", territory: "Dhaka Central", assignedSalesUserId: "sales2", paymentTerms: "30 days", creditLimit: "600000.00", currentDue: "69000.00", totalSales: "422000.00", totalCollected: "353000.00", active: true }
];

export const customerOpeningBalances: CustomerOpeningBalance[] = [
  { id: "opening-cus-labaid", customerId: "cus-labaid", customerName: "Labaid Specialized Hospital", date: "2026-01-01", historicalSales: "945000.00", historicalCollected: "608500.00", openingDue: "336500.00", reference: "SALES-LEDGER-OPENING-2026", remarks: "Verified opening position before collections entered in the ERP period.", createdBy: "Sadia Karim", createdAt: "2026-08-23T09:00:00.000Z" }
];

export const quotations: Quotation[] = [
  { id: "quo-1", quotationNumber: "QT-2026-041", date: "2026-08-18", customerId: "cus-popular", customerName: "Popular Medicine & Departmental Store", ownerId: "sales1", validityDays: 15, paymentTerms: "Cash / 15 days", remarks: "Delivery within three working days.", status: "Sent", lines: [{ id: "ql-1", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "60", unitPrice: "690.00", discount: "0.00", lineTotal: "41400.00" }, { id: "ql-2", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", quantity: "30", unitPrice: "230.00", discount: "0.00", lineTotal: "6900.00" }], subtotal: "48300.00", discountTotal: "0.00", total: "48300.00" },
  { id: "quo-2", quotationNumber: "QT-2026-038", date: "2026-08-14", customerId: "cus-labaid", customerName: "Labaid Specialized Hospital", ownerId: "sales2", validityDays: 30, paymentTerms: "45 days", status: "Accepted", lines: [{ id: "ql-3", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "180", unitPrice: "685.00", discount: "1800.00", lineTotal: "121500.00" }], subtotal: "123300.00", discountTotal: "1800.00", total: "121500.00" }
];

export const orders: SalesOrder[] = [
  { id: "so-1", orderNumber: "SO-2026-033", quotationId: "quo-2", date: "2026-08-15", customerId: "cus-labaid", customerName: "Labaid Specialized Hospital", customerAddressSnapshot: "Dhanmondi, Dhaka", customerPhoneSnapshot: "+880 1714 330010", customerContactSnapshot: "Supply Chain", ownerId: "sales2", paymentConditions: "45 days", deliveryInstruction: "Deliver to central medical store", paymentConfirmation: "Credit approved under 45-day terms", requestedDeliveryDate: "2026-08-25", orderReceivedByName: "Farhana Akter", orderReceivedByDesignation: "Sales Manager", orderGivenBy: "Labaid Supply Chain", headOfSalesSignoff: "Pending signature", coeSignoff: "Pending signature", mdSignoff: "Pending signature", amountReceived: "0.00", due: "121500.00", status: "Ready", lines: quotations[1].lines, total: "121500.00" },
  { id: "so-2", orderNumber: "SO-2026-035", date: "2026-08-08", customerId: "cus-ark", customerName: "ARK Hospital", customerAddressSnapshot: "Dhaka", customerPhoneSnapshot: "+880 1712 410011", customerContactSnapshot: "Purchase Department", ownerId: "sales1", paymentConditions: "Bank transfer on delivery", deliveryInstruction: "Deliver to the hospital receiving counter", requestedDeliveryDate: "2026-08-09", amountReceived: "47700.00", due: "0.00", status: "Delivered", lines: [{ id: "sol-2", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "60", unitPrice: "680.00", discount: "0.00", lineTotal: "40800.00" }, { id: "sol-3", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", quantity: "30", unitPrice: "230.00", discount: "0.00", lineTotal: "6900.00" }], total: "47700.00" }
];

export const deliveries: Delivery[] = [
  { id: "del-1", challanNumber: "DC-2026-031", orderId: "so-old-1", customerId: "cus-popular", customerName: "Popular Medicine & Departmental Store", date: "2026-07-15", remarks: "Delivered to receiving counter", receiverName: "Store Officer", status: "Delivered", lines: [{ id: "dl-1", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "120", unitPrice: "690.00", discount: "0.00", lineTotal: "82800.00", batchId: "bat-d17-old", batchNumber: "BAT-D17H-2509" }] },
  { id: "del-2", challanNumber: "DC-2026-036", orderId: "so-2", customerId: "cus-ark", customerName: "ARK Hospital", date: "2026-08-09", remarks: "Delivered against confirmed hospital order", receiverName: "Medical Store Officer", status: "Delivered", lines: [{ id: "dl-2", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "60", unitPrice: "680.00", discount: "0.00", lineTotal: "40800.00", batchId: "bat-d17-old", batchNumber: "BAT-D17H-2509" }, { id: "dl-3", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", quantity: "30", unitPrice: "230.00", discount: "0.00", lineTotal: "6900.00", batchId: "bat-bts-old", batchNumber: "BAT-BTS-2510" }] }
];

export const collections: Collection[] = [
  { id: "col-1", receiptNumber: "MR-2026-051", customerId: "cus-ark", customerName: "ARK Hospital", orderId: "so-2", date: "2026-08-10", amount: "47700.00", paymentMode: "Bank Transfer", accountId: "acc-city", referenceNumber: "CITY-TRX-88112", remarks: "Full settlement of SO-2026-035 after delivery", ownerId: "sales1", status: "Posted" },
  { id: "col-2", receiptNumber: "MR-2026-052", customerId: "cus-labaid", customerName: "Labaid Specialized Hospital", date: "2026-08-17", amount: "150000.00", paymentMode: "Cheque", accountId: "acc-city", referenceNumber: "CHQ-773310", remarks: "Part collection", ownerId: "sales2", status: "Posted" },
  { id: "col-3", receiptNumber: "MR-2026-053", customerId: "cus-popular", customerName: "Popular Medicine & Departmental Store", date: "2026-08-20", amount: "28050.00", paymentMode: "bKash", accountId: "acc-bkash", referenceNumber: "BK-8H22P", remarks: "June due received", ownerId: "sales1", status: "Posted" }
];

export const accounts: CashBankAccount[] = [
  { id: "acc-cash", name: "Office Cash", type: "Cash", balance: "185420.00", active: true },
  { id: "acc-city", name: "City Bank PLC", type: "Bank", accountNumber: "**** 7761", balance: "4275000.00", active: true },
  { id: "acc-ebl", name: "Eastern Bank PLC", type: "Bank", accountNumber: "**** 2608", balance: "2180000.00", active: true },
  { id: "acc-bkash", name: "MIPRO bKash Merchant", type: "Mobile Banking", accountNumber: "01*********", balance: "92500.00", active: true }
];

export const expenseCategories = ["Office Entertainment", "Admin Cost", "Stationery", "Office Transport", "TA", "DA", "Salary", "Rent", "Utilities", "Courier", "Marketing", "Other"].map((name, index) => ({ id: `ec-${index + 1}`, name, active: true }));

export const expenses: Expense[] = [
  { id: "exp-1", date: "2026-08-01", categoryId: "ec-1", categoryName: "Office Entertainment", subtype: "General", amount: "135.00", paidFromAccountId: "acc-cash", remarks: "Tea and refreshments", status: "Posted" },
  { id: "exp-2", date: "2026-08-02", categoryId: "ec-2", categoryName: "Admin Cost", subtype: "General", amount: "200.00", paidFromAccountId: "acc-cash", remarks: "Office labour cost", status: "Posted" },
  { id: "exp-3", date: "2026-08-02", categoryId: "ec-4", categoryName: "Office Transport", subtype: "General", amount: "310.00", paidFromAccountId: "acc-cash", remarks: "Product delivery to Popular Hospital", status: "Posted" },
  { id: "exp-4", date: "2026-08-05", categoryId: "ec-5", categoryName: "TA", subtype: "TA/DA", amount: "2500.00", paidFromAccountId: "acc-bkash", employee: "Nihad Hasan", designation: "Sales Executive", taAmount: "1800.00", daAmount: "700.00", remarks: "Mymensingh customer visit", status: "Posted" },
  { id: "exp-5", date: "2026-08-10", categoryId: "ec-8", categoryName: "Rent", subtype: "General", amount: "45000.00", paidFromAccountId: "acc-city", remarks: "Office monthly rent", status: "Posted" },
  { id: "exp-6", date: "2026-08-12", categoryId: "ec-9", categoryName: "Utilities", subtype: "General", amount: "12850.00", paidFromAccountId: "acc-city", remarks: "Office electricity and internet", status: "Posted" }
];

export const accountTransactions: AccountTransaction[] = [
  { id: "trx-open-city", date: "2026-08-01", accountId: "acc-city", accountName: "City Bank PLC", direction: "In", amount: "4075000.00", sourceType: "Opening Balance", sourceId: "opening", description: "Opening balance" },
  { id: "trx-col-1", date: "2026-08-10", accountId: "acc-city", accountName: "City Bank PLC", direction: "In", amount: "47700.00", sourceType: "Collection", sourceId: "col-1", description: "ARK Hospital collection" },
  { id: "trx-col-2", date: "2026-08-17", accountId: "acc-city", accountName: "City Bank PLC", direction: "In", amount: "150000.00", sourceType: "Collection", sourceId: "col-2", description: "Labaid collection" },
  { id: "trx-exp-5", date: "2026-08-10", accountId: "acc-city", accountName: "City Bank PLC", direction: "Out", amount: "45000.00", sourceType: "Expense", sourceId: "exp-5", description: "Office monthly rent" }
];

export const decisions: BusinessDecision[] = [
  { id: "dec-cost-default", title: "Common cost allocation default", question: "Should common bank, insurance and C&F charges default to FOB value?", currentBehavior: "Every common cost line requires an explicit allocation choice; FOB Value is only suggested.", status: "Pending Client Confirmation", blocks: ["Automatic common-cost default"], sourceReference: "Meeting 1 allocation discussion" },
  { id: "dec-transport", title: "Local transport allocation", question: "Should local covered-van transport default to CBM?", currentBehavior: "Local Transport presets default to CBM; an authorized user may explicitly choose another basis for an exceptional invoice.", status: "Confirmed", blocks: [], resolutionValue: "CBM", resolutionNotes: "Treat local covered-van transport like sea freight by product volume.", confirmedBy: "Client", confirmedAt: "2026-08-23T00:00:00.000Z", sourceReference: "Latest Meeting 1 discussion" },
  { id: "dec-fifo", title: "FIFO issue sequence", question: "Should dispatch recommend the oldest matching eligible batch?", currentBehavior: "Oldest non-expired matching stock is allocated first; bypass requires capability and reason.", status: "Confirmed", blocks: [], resolutionValue: "FIFO_WITH_EXPIRY_AWARENESS", resolutionNotes: "FIFO is authoritative while expiry remains visible and expired stock is excluded.", confirmedBy: "Client", confirmedAt: "2026-08-23T00:00:00.000Z", sourceReference: "Latest Meeting 1 discussion" },
  { id: "dec-invoice", title: "Invoice requirement", question: "Is an invoice mandatory, optional, or generated from order/challan?", currentBehavior: "Quotation, order, challan and collection operate without a mandatory invoice.", status: "Pending Client Confirmation", blocks: ["Invoice generation"] },
  { id: "dec-accounting", title: "Accounting depth", question: "Should MIPRO ERP replace formal accounting software?", currentBehavior: "Only operational cash, bank, expense, collection and due ledgers are enabled.", status: "Pending Client Confirmation", blocks: ["General Ledger", "Trial Balance", "Balance Sheet"] },
  { id: "dec-warehouse", title: "Additional warehouses", question: "How many active warehouse locations are required?", currentBehavior: "One MIPRO Main Warehouse is active.", status: "Pending Client Confirmation", blocks: ["Multi-warehouse transfers"] },
  { id: "dec-price", title: "Selling-price approval", question: "Which price or discount requires manager approval?", currentBehavior: "Sales can propose a price; no automatic floor is enforced.", status: "Pending Client Confirmation", blocks: ["Automatic special-price approval"] },
  { id: "dec-tax", title: "Sales VAT and tax", question: "What VAT/tax rules apply to sales documents?", currentBehavior: "No sales tax is calculated or printed.", status: "Pending Client Confirmation", blocks: ["Sales tax automation"] },
  { id: "dec-finalize", title: "Cost finalization authority", question: "Who may finalize or reopen landed cost besides the owner?", currentBehavior: "Only Super Admin can finalize or reopen before receipt. Reopening after any warehouse receipt is blocked.", status: "Pending Client Confirmation", blocks: ["Delegated finalization", "Post-receipt valuation adjustment"], sourceReference: "Simplified plan and update1 integrity audit" }
];

export const warehouseConfig: WarehouseConfig = {
  id: "wh-main",
  name: "MIPRO Main Warehouse",
  address: "Uttara, Dhaka, Bangladesh",
  contactPerson: "Aminul Islam",
  phone: "+880 1711 000005",
  locations: ["Rack A-01", "Rack A-02", "Rack B-01", "Rack B-02", "Rack C-01", "Rack D-01"],
  active: true
};

export const costPresets: CostPreset[] = [
  { id: "preset-freight", name: "Ocean / Air Freight", category: "Freight", suggestedAllocationMethod: "CBM", requiresExplicitChoice: true, active: true },
  { id: "preset-duty", name: "Assessed Customs Duty", category: "Customs Duty", suggestedAllocationMethod: "PRODUCT_SPECIFIC", requiresExplicitChoice: true, active: true },
  { id: "preset-bank", name: "Bank Charge", category: "Bank Charge", suggestedAllocationMethod: "FOB_VALUE", requiresExplicitChoice: true, active: true },
  { id: "preset-local", name: "Local Transport", category: "Local Transport", suggestedAllocationMethod: "CBM", requiresExplicitChoice: false, active: true }
];

export const printConfiguration: PrintConfiguration = {
  defaultIdentityId: "mipro",
  identities: [
    { id: "mipro", displayName: "MIPRO Healthcare", companyName: "MIPRO HEALTHCARE CORPORATION", address: "Flat-B2, House-26, Road-06, Sector-09, Uttara, Dhaka-1230", phone: "+88 018 05 050780", email: "ledtrackers@gmail.com", website: "www.miprobd.com", logoUrl: "/mipro-logo.svg", backgroundImageUrl: "/mipro-letterhead.png", footerText: "PRECISION IN HEALTHCARE", authorizedSignatory: "Authorized Signatory", safeArea: { topMm: 39, rightMm: 19, bottomMm: 24, leftMm: 24 } },
    { id: "led-trackers", displayName: "LED Trackers", companyName: "LED TRACKERS", address: "Flat-B2, House-26, Road-06, Sector-09, Uttara, Dhaka-1230", phone: "+88 018 05 050780", email: "ledtrackers@gmail.com", website: "www.miprobd.com", logoUrl: "/mipro-logo.svg", backgroundImageUrl: "/led-letterhead.png", footerText: "PRECISION IN HEALTHCARE", authorizedSignatory: "Authorized Signatory", safeArea: { topMm: 39, rightMm: 19, bottomMm: 24, leftMm: 24 } }
  ],
  defaultLetterheadMode: "Digital"
};

export const auditEvents: AuditEvent[] = [
  { id: "audit-1", timestamp: "2026-08-19T10:05:00.000Z", userId: "u-super", userName: "Sadia Karim", role: "Super Admin", action: "Cost line added", entityType: "Import", entityId: "imp-77612", summary: "Unloading Labour added with Quantity allocation." },
  { id: "audit-2", timestamp: "2026-08-20T12:20:00.000Z", userId: "u-accounts", userName: "Nusrat Jahan", role: "Accounts", action: "Collection posted", entityType: "Collection", entityId: "col-3", summary: "Tk 28,050 posted to MIPRO bKash Merchant." },
  { id: "audit-3", timestamp: "2026-07-15T09:45:00.000Z", userId: "u-warehouse", userName: "Aminul Islam", role: "Warehouse Manager", action: "Stock dispatched", entityType: "Delivery", entityId: "del-1", summary: "120 Dialyzer 1.7H dispatched from oldest eligible batch." }
];
