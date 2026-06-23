import type {
  AuditLog,
  Customer,
  DashboardSummary,
  FinanceSummary,
  ImportDetail,
  InventoryBatch,
  ProductMaster,
  ReportsSummary,
  SalesOrder,
  StockMovement
} from "../src/shared/schemas";

export const dashboardSummary: DashboardSummary = {
  metrics: [
    { label: "Today's Sales", value: 1865000, unit: "BDT", delta: 12.4, intent: "sales" },
    { label: "Monthly Sales", value: 48200000, unit: "BDT", delta: 8.2, intent: "sales" },
    { label: "Current Stock", value: 143280, unit: "pcs", delta: -3.1, intent: "stock" },
    { label: "Bank Balance", value: 22750000, unit: "BDT", delta: 4.9, intent: "cash" },
    { label: "Receivable", value: 12600000, unit: "BDT", delta: -5.6, intent: "risk" },
    { label: "Net Profit", value: 7350000, unit: "BDT", delta: 11.1, intent: "profit" }
  ],
  pipelineStages: [
    { stage: "Supplier Inquiry", active: 4, delayed: 0, valueUsd: 82000 },
    { stage: "PI Approval", active: 3, delayed: 1, valueUsd: 146000 },
    { stage: "PO", active: 5, delayed: 0, valueUsd: 235000 },
    { stage: "LC / TT", active: 4, delayed: 1, valueUsd: 198000 },
    { stage: "Shipment", active: 6, delayed: 1, valueUsd: 318000 },
    { stage: "Customs", active: 2, delayed: 0, valueUsd: 97000 },
    { stage: "Warehouse", active: 3, delayed: 0, valueUsd: 76000 }
  ],
  expiryAlerts: [
    {
      product: "Dialyzer FX-80",
      batch: "DLZ-26-034",
      expiryDate: "2026-08-15",
      daysLeft: 53,
      quantity: 2200,
      severity: "critical"
    },
    {
      product: "Blood Line Set",
      batch: "BLS-25-118",
      expiryDate: "2026-10-05",
      daysLeft: 104,
      quantity: 5400,
      severity: "warning"
    },
    {
      product: "Foley Catheter 16FR",
      batch: "FC-26-211",
      expiryDate: "2026-12-28",
      daysLeft: 188,
      quantity: 8400,
      severity: "watch"
    }
  ],
  salesTrend: [
    { month: "Jan", sales: 33600000, collection: 29800000 },
    { month: "Feb", sales: 38200000, collection: 35100000 },
    { month: "Mar", sales: 41500000, collection: 39600000 },
    { month: "Apr", sales: 40400000, collection: 38900000 },
    { month: "May", sales: 45800000, collection: 42100000 },
    { month: "Jun", sales: 48200000, collection: 44900000 }
  ],
  productMix: [
    { product: "Dialyzer", value: 34 },
    { product: "Blood Line", value: 22 },
    { product: "IV Set", value: 16 },
    { product: "Foley Catheter", value: 13 },
    { product: "AV Fistula Needle", value: 9 },
    { product: "Other", value: 6 }
  ],
  trustMetrics: [
    { label: "Import Lead Time", value: "31 days", caption: "China to warehouse average" },
    { label: "Batch Traceability", value: "100%", caption: "LOT, expiry and supplier mapped" },
    { label: "Active Hospitals", value: "126", caption: "Sales coverage in 8 territories" },
    { label: "Audit Events", value: "1,842", caption: "30-day secured activity trail" }
  ],
  roleNotes: {
    "Super Admin": "Full access to all modules, configuration and reports.",
    "Managing Director": "Executive dashboard, profit/loss, bank position and approvals.",
    Accounts: "Cash, bank, voucher, payroll, receivable and payable access.",
    "Import Officer": "PI, LC, TT, shipment, document and customs workflow access.",
    "Warehouse Manager": "GRN, batch stock, BIN transfer and physical count access.",
    "Sales Manager": "Sales pipeline, targets, customer dues and team monitoring.",
    "Sales Executive": "Restricted to owned customers, quotations, invoices and collection entries."
  }
};

export const imports: ImportDetail[] = [
  {
    id: "IMP-26061",
    poNumber: "PO-CN-26061",
    supplier: "Guangzhou Renhe Medical Technology",
    country: "China",
    product: "Dialyzer FX-80",
    quantity: 24000,
    valueUsd: 76800,
    currentStage: "Shipment",
    progress: 67,
    status: "On Track",
    eta: "2026-07-09",
    owner: "Import Officer",
    piNumber: "PI-RH-26061",
    lcNumber: "LC-DBBL-26006",
    ttNumber: null,
    bank: "Dutch-Bangla Bank PLC",
    blNumber: "BL-SHA-88421",
    containerNumber: "MSCU-7391024",
    vesselName: "COSCO Ningbo Star",
    etd: "2026-06-25",
    documents: ["Commercial Invoice", "Packing List", "COA", "CE", "ISO 13485"],
    costLines: [
      { label: "Duty", amount: 980000, currency: "BDT" },
      { label: "VAT", amount: 620000, currency: "BDT" },
      { label: "Freight", amount: 410000, currency: "BDT" },
      { label: "Transport", amount: 85000, currency: "BDT" }
    ],
    notes: ["LC margin settled", "COA received", "C&F agent assigned for Chattogram port"]
  },
  {
    id: "IMP-26058",
    poNumber: "PO-CN-26058",
    supplier: "Shanghai Aoxin Medical Supply",
    country: "China",
    product: "Blood Line Set",
    quantity: 36000,
    valueUsd: 61200,
    currentStage: "LC / TT",
    progress: 48,
    status: "Attention",
    eta: "2026-07-18",
    owner: "Import Officer",
    piNumber: "PI-AOX-26058",
    lcNumber: "LC-EBL-26004",
    ttNumber: "TT-AOX-8290",
    bank: "Eastern Bank PLC",
    blNumber: "Pending",
    containerNumber: "Pending",
    vesselName: "Pending booking",
    etd: "2026-07-02",
    documents: ["Commercial Invoice", "Packing List", "CE"],
    costLines: [
      { label: "Duty", amount: 610000, currency: "BDT" },
      { label: "VAT", amount: 455000, currency: "BDT" },
      { label: "Freight Estimate", amount: 360000, currency: "BDT" }
    ],
    notes: ["Swift copy uploaded", "Supplier requested final artwork approval"]
  },
  {
    id: "IMP-26049",
    poNumber: "PO-IN-26049",
    supplier: "MedSure Global Devices",
    country: "India",
    product: "AV Fistula Needle",
    quantity: 48000,
    valueUsd: 52800,
    currentStage: "Customs",
    progress: 82,
    status: "Ready",
    eta: "2026-06-29",
    owner: "Import Officer",
    piNumber: "PI-MSG-26049",
    lcNumber: "LC-CBL-26001",
    ttNumber: null,
    bank: "City Bank PLC",
    blNumber: "BL-NSA-66108",
    containerNumber: "SEGU-1188392",
    vesselName: "Wan Hai 507",
    etd: "2026-06-11",
    documents: ["Commercial Invoice", "Packing List", "COA", "ISO 13485"],
    costLines: [
      { label: "Duty", amount: 530000, currency: "BDT" },
      { label: "VAT", amount: 384000, currency: "BDT" },
      { label: "AIT", amount: 97000, currency: "BDT" },
      { label: "Port", amount: 115000, currency: "BDT" }
    ],
    notes: ["Assessment completed", "Warehouse receiving slot reserved"]
  },
  {
    id: "IMP-26044",
    poNumber: "PO-CN-26044",
    supplier: "Ningbo Kanghua Healthcare",
    country: "China",
    product: "IV Set",
    quantity: 120000,
    valueUsd: 42000,
    currentStage: "Warehouse Receiving",
    progress: 96,
    status: "Ready",
    eta: "2026-06-24",
    owner: "Warehouse Manager",
    piNumber: "PI-KH-26044",
    lcNumber: "LC-MTB-26003",
    ttNumber: null,
    bank: "Mutual Trust Bank PLC",
    blNumber: "BL-SZX-44312",
    containerNumber: "TLLU-7398120",
    vesselName: "OOCL Jakarta",
    etd: "2026-06-02",
    documents: ["Commercial Invoice", "Packing List", "COA", "CE", "ISO 13485"],
    costLines: [
      { label: "Duty", amount: 405000, currency: "BDT" },
      { label: "VAT", amount: 352000, currency: "BDT" },
      { label: "Transport", amount: 78000, currency: "BDT" }
    ],
    notes: ["GRN draft prepared", "QC sampling pending"]
  }
];

export const inventoryBatches: InventoryBatch[] = [
  {
    id: "BAT-1001",
    product: "Dialyzer FX-80",
    batchNumber: "DLZ-26-034",
    lotNumber: "LOT-DLZ-884",
    supplier: "Guangzhou Renhe Medical Technology",
    binLocation: "A-01-01",
    expiryDate: "2026-08-15",
    availableQty: 2200,
    reservedQty: 900,
    unit: "pcs",
    purchasePrice: 398,
    salesPrice: 520,
    alertLevel: "Critical"
  },
  {
    id: "BAT-1002",
    product: "Blood Line Set",
    batchNumber: "BLS-25-118",
    lotNumber: "LOT-BL-559",
    supplier: "Shanghai Aoxin Medical Supply",
    binLocation: "B-05-03",
    expiryDate: "2026-10-05",
    availableQty: 5400,
    reservedQty: 1200,
    unit: "set",
    purchasePrice: 186,
    salesPrice: 245,
    alertLevel: "Warning"
  },
  {
    id: "BAT-1003",
    product: "IV Set",
    batchNumber: "IVS-26-072",
    lotNumber: "LOT-IV-122",
    supplier: "Ningbo Kanghua Healthcare",
    binLocation: "C-02-02",
    expiryDate: "2028-01-16",
    availableQty: 68400,
    reservedQty: 9800,
    unit: "pcs",
    purchasePrice: 32,
    salesPrice: 48,
    alertLevel: "Normal"
  },
  {
    id: "BAT-1004",
    product: "AV Fistula Needle",
    batchNumber: "AVF-26-301",
    lotNumber: "LOT-AV-731",
    supplier: "MedSure Global Devices",
    binLocation: "A-03-04",
    expiryDate: "2027-05-19",
    availableQty: 27800,
    reservedQty: 4100,
    unit: "pcs",
    purchasePrice: 92,
    salesPrice: 132,
    alertLevel: "Normal"
  },
  {
    id: "BAT-1005",
    product: "Foley Catheter 16FR",
    batchNumber: "FC-26-211",
    lotNumber: "LOT-FC-416",
    supplier: "Hangzhou Carelink Medical",
    binLocation: "D-01-05",
    expiryDate: "2026-12-28",
    availableQty: 8400,
    reservedQty: 600,
    unit: "pcs",
    purchasePrice: 71,
    salesPrice: 104,
    alertLevel: "Warning"
  }
];

export const products: ProductMaster[] = [
  {
    id: "PRD-001",
    sku: "DLZ-FX80-CN",
    name: "Dialyzer FX-80",
    category: "Hemodialysis",
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=700&q=80",
    originCountry: "China",
    supplier: "Guangzhou Renhe Medical Technology",
    batchControlled: true,
    expiryControlled: true,
    certificates: ["CE", "ISO 13485", "COA"],
    stockQty: 2200,
    unit: "pcs",
    purchasePrice: 398,
    salesPrice: 520,
    status: "Review",
    riskTag: "Expiry Watch"
  },
  {
    id: "PRD-002",
    sku: "BLS-AOX-001",
    name: "Blood Line Set",
    category: "Dialysis Consumable",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80",
    originCountry: "China",
    supplier: "Shanghai Aoxin Medical Supply",
    batchControlled: true,
    expiryControlled: true,
    certificates: ["CE", "COA"],
    stockQty: 5400,
    unit: "set",
    purchasePrice: 186,
    salesPrice: 245,
    status: "Active",
    riskTag: "Expiry Watch"
  },
  {
    id: "PRD-003",
    sku: "IVS-KH-260",
    name: "IV Set",
    category: "Infusion",
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=700&q=80",
    originCountry: "China",
    supplier: "Ningbo Kanghua Healthcare",
    batchControlled: true,
    expiryControlled: true,
    certificates: ["CE", "ISO 13485"],
    stockQty: 68400,
    unit: "pcs",
    purchasePrice: 32,
    salesPrice: 48,
    status: "Active",
    riskTag: "High Demand"
  },
  {
    id: "PRD-004",
    sku: "AVF-MSG-017",
    name: "AV Fistula Needle",
    category: "Dialysis Access",
    imageUrl: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=700&q=80",
    originCountry: "India",
    supplier: "MedSure Global Devices",
    batchControlled: true,
    expiryControlled: true,
    certificates: ["ISO 13485", "COA"],
    stockQty: 27800,
    unit: "pcs",
    purchasePrice: 92,
    salesPrice: 132,
    status: "Active",
    riskTag: "Expiry Safe"
  },
  {
    id: "PRD-005",
    sku: "FC-16FR-HZ",
    name: "Foley Catheter 16FR",
    category: "Urology",
    imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=700&q=80",
    originCountry: "China",
    supplier: "Hangzhou Carelink Medical",
    batchControlled: true,
    expiryControlled: true,
    certificates: ["CE", "COA"],
    stockQty: 8400,
    unit: "pcs",
    purchasePrice: 71,
    salesPrice: 104,
    status: "Review",
    riskTag: "Expiry Watch"
  },
  {
    id: "PRD-006",
    sku: "BRT-150ML-CN",
    name: "Burette Set 150ML",
    category: "Infusion",
    imageUrl: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=700&q=80",
    originCountry: "China",
    supplier: "Suzhou Medlink Supplies",
    batchControlled: true,
    expiryControlled: true,
    certificates: ["CE", "ISO 13485"],
    stockQty: 12400,
    unit: "pcs",
    purchasePrice: 58,
    salesPrice: 86,
    status: "Active",
    riskTag: "Expiry Safe"
  }
];

export const stockMovements: StockMovement[] = [
  {
    id: "MOV-901",
    date: "2026-06-23",
    product: "Dialyzer FX-80",
    batchNumber: "DLZ-26-034",
    movementType: "Stock Out",
    quantity: 600,
    reference: "DC-26098 / INV-26098",
    warehouseUser: "Mahmud Hasan"
  },
  {
    id: "MOV-902",
    date: "2026-06-22",
    product: "IV Set",
    batchNumber: "IVS-26-072",
    movementType: "Stock In",
    quantity: 120000,
    reference: "GRN-26044",
    warehouseUser: "Nusrat Jahan"
  },
  {
    id: "MOV-903",
    date: "2026-06-22",
    product: "Blood Line Set",
    batchNumber: "BLS-25-118",
    movementType: "Transfer",
    quantity: 1600,
    reference: "TRF-DHK-CTG-180",
    warehouseUser: "Mahmud Hasan"
  },
  {
    id: "MOV-904",
    date: "2026-06-21",
    product: "Foley Catheter 16FR",
    batchNumber: "FC-26-211",
    movementType: "Adjustment",
    quantity: -32,
    reference: "PHY-COUNT-0621",
    warehouseUser: "Nusrat Jahan"
  }
];

export const salesOrders: SalesOrder[] = [
  {
    id: "SO-26098",
    customer: "National Kidney Hospital",
    customerType: "Hospital",
    territory: "Dhaka North",
    product: "Dialyzer FX-80",
    quantity: 600,
    quotationNo: "QT-26098",
    orderNo: "SO-26098",
    challanNo: "DC-26098",
    invoiceNo: "INV-26098",
    amount: 312000,
    outstanding: 112000,
    status: "Invoiced",
    owner: "Rafiq Ahmed"
  },
  {
    id: "SO-26104",
    customer: "Popular Diagnostic Center",
    customerType: "Clinic",
    territory: "Dhaka South",
    product: "Blood Line Set",
    quantity: 900,
    quotationNo: "QT-26104",
    orderNo: "SO-26104",
    challanNo: "DC-26104",
    invoiceNo: "INV-26104",
    amount: 220500,
    outstanding: 0,
    status: "Collected",
    owner: "Anika Rahman"
  },
  {
    id: "SO-26107",
    customer: "Sylhet Medico Traders",
    customerType: "Dealer",
    territory: "Sylhet",
    product: "IV Set",
    quantity: 5000,
    quotationNo: "QT-26107",
    orderNo: "SO-26107",
    challanNo: "Pending",
    invoiceNo: "Pending",
    amount: 240000,
    outstanding: 240000,
    status: "Sales Order",
    owner: "Rafiq Ahmed"
  },
  {
    id: "SO-26112",
    customer: "Chittagong General Hospital",
    customerType: "Hospital",
    territory: "Chattogram",
    product: "AV Fistula Needle",
    quantity: 1800,
    quotationNo: "QT-26112",
    orderNo: "Pending",
    challanNo: "Pending",
    invoiceNo: "Pending",
    amount: 237600,
    outstanding: 237600,
    status: "Quotation",
    owner: "Tanvir Islam"
  }
];

export const customers: Customer[] = [
  {
    id: "CUS-001",
    name: "National Kidney Hospital",
    type: "Hospital",
    territory: "Dhaka North",
    contactPerson: "Dr. Kamal Uddin",
    monthlyPurchase: 3900000,
    outstandingDues: 112000,
    lastVisit: "2026-06-19",
    nextVisit: "2026-06-26",
    owner: "Rafiq Ahmed"
  },
  {
    id: "CUS-002",
    name: "Popular Diagnostic Center",
    type: "Clinic",
    territory: "Dhaka South",
    contactPerson: "Ms. Farhana Haque",
    monthlyPurchase: 1180000,
    outstandingDues: 0,
    lastVisit: "2026-06-21",
    nextVisit: "2026-07-04",
    owner: "Anika Rahman"
  },
  {
    id: "CUS-003",
    name: "Sylhet Medico Traders",
    type: "Dealer",
    territory: "Sylhet",
    contactPerson: "Mr. Mizan Chowdhury",
    monthlyPurchase: 2480000,
    outstandingDues: 740000,
    lastVisit: "2026-06-12",
    nextVisit: "2026-06-28",
    owner: "Rafiq Ahmed"
  },
  {
    id: "CUS-004",
    name: "Green Care Pharmacy",
    type: "Pharmacy",
    territory: "Cumilla",
    contactPerson: "Mr. Saiful Karim",
    monthlyPurchase: 420000,
    outstandingDues: 65000,
    lastVisit: "2026-06-18",
    nextVisit: "2026-06-30",
    owner: "Tanvir Islam"
  }
];

export const financeSummary: FinanceSummary = {
  cashBalance: 2450000,
  bankBalance: 22750000,
  receivable: 12600000,
  payable: 8940000,
  profit: 7350000,
  cashBook: [
    {
      date: "2026-06-23",
      narration: "Collection from Popular Diagnostic Center",
      debit: 220500,
      credit: 0,
      balance: 2450000
    },
    {
      date: "2026-06-22",
      narration: "Fuel and delivery expense",
      debit: 0,
      credit: 37500,
      balance: 2229500
    },
    {
      date: "2026-06-21",
      narration: "Sales collection from dealer channel",
      debit: 412000,
      credit: 0,
      balance: 2267000
    }
  ],
  bankBook: [
    {
      bank: "Dutch-Bangla Bank PLC",
      accountNo: "DBBL-ERP-0912",
      balance: 9350000,
      lastReconciled: "2026-06-22"
    },
    {
      bank: "Eastern Bank PLC",
      accountNo: "EBL-IMP-0184",
      balance: 8120000,
      lastReconciled: "2026-06-21"
    },
    {
      bank: "City Bank PLC",
      accountNo: "CBL-LC-7731",
      balance: 5280000,
      lastReconciled: "2026-06-20"
    }
  ],
  vouchers: [
    {
      id: "PV-26071",
      type: "Payment",
      party: "C&F Agent - Chattogram",
      amount: 185000,
      status: "Approved"
    },
    {
      id: "RV-26074",
      type: "Receipt",
      party: "Popular Diagnostic Center",
      amount: 220500,
      status: "Posted"
    },
    {
      id: "JV-26078",
      type: "Journal",
      party: "Monthly depreciation",
      amount: 148000,
      status: "Draft"
    }
  ],
  profitLoss: [
    { label: "Gross Sales", amount: 48200000 },
    { label: "Cost of Goods Sold", amount: -32600000 },
    { label: "Import Charges", amount: -4240000 },
    { label: "Operating Expense", amount: -4010000 },
    { label: "Net Profit", amount: 7350000 }
  ]
};

export const reportsSummary: ReportsSummary = {
  daily: [
    { report: "Sales Report", value: "BDT 1.86M", status: "Ready" },
    { report: "Collection Report", value: "BDT 0.72M", status: "Ready" },
    { report: "Stock Report", value: "143,280 pcs", status: "Ready" }
  ],
  weekly: [
    { report: "Sales Summary", value: "BDT 10.4M", status: "Ready" },
    { report: "Expenses Summary", value: "BDT 1.22M", status: "Ready" },
    { report: "Collection Summary", value: "BDT 8.9M", status: "Review" }
  ],
  monthly: [
    { report: "Profit & Loss", value: "BDT 7.35M", status: "Ready" },
    { report: "Balance Sheet", value: "Drafted", status: "Review" },
    { report: "Inventory Valuation", value: "BDT 39.8M", status: "Ready" },
    { report: "Sales by Product", value: "6 categories", status: "Ready" },
    { report: "Sales by Territory", value: "8 territories", status: "Ready" }
  ],
  territorySales: [
    { territory: "Dhaka North", sales: 13800000 },
    { territory: "Dhaka South", sales: 9400000 },
    { territory: "Chattogram", sales: 7800000 },
    { territory: "Sylhet", sales: 5200000 },
    { territory: "Rajshahi", sales: 4100000 },
    { territory: "Khulna", sales: 3900000 }
  ]
};

export const auditLogs: AuditLog[] = [
  {
    id: "AUD-4401",
    time: "2026-06-23 13:42",
    actor: "M. Rahman",
    role: "Managing Director",
    module: "Dashboard",
    action: "Approved LC release note",
    ipAddress: "103.74.22.18",
    severity: "Info"
  },
  {
    id: "AUD-4402",
    time: "2026-06-23 12:18",
    actor: "S. Akter",
    role: "Accounts",
    module: "Voucher",
    action: "Posted receipt voucher RV-26074",
    ipAddress: "103.74.22.32",
    severity: "Info"
  },
  {
    id: "AUD-4403",
    time: "2026-06-23 11:55",
    actor: "N. Jahan",
    role: "Warehouse Manager",
    module: "Inventory",
    action: "Adjusted physical count for FC-26-211",
    ipAddress: "103.74.22.44",
    severity: "Warning"
  },
  {
    id: "AUD-4404",
    time: "2026-06-23 10:04",
    actor: "R. Ahmed",
    role: "Sales Executive",
    module: "Sales",
    action: "Created quotation QT-26112",
    ipAddress: "103.74.22.58",
    severity: "Info"
  }
];
