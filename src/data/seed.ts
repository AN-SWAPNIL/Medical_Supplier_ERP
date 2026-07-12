import type { AiRecommendation, DashboardSummary, EntityRecord, Role, User } from "../types";

export const demoUsers: User[] = [
  {
    id: "u-super",
    name: "Sadia Karim",
    email: "superadmin@mipro.local",
    role: "Super Admin",
    title: "System Super Admin",
    department: "ERP Administration",
    phone: "+880 1711 000001",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    status: "Active"
  },
  {
    id: "u-md",
    name: "Mahfuz Rahman",
    email: "md@mipro.local",
    role: "Managing Director",
    title: "Managing Director",
    department: "Executive Office",
    phone: "+880 1711 000002",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
    status: "Active"
  },
  {
    id: "u-accounts",
    name: "Nusrat Akter",
    email: "accounts@mipro.local",
    role: "Accounts",
    title: "Accounts Lead",
    department: "Finance & Accounts",
    phone: "+880 1711 000003",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    status: "Active"
  },
  {
    id: "u-import",
    name: "Imran Hossain",
    email: "import@mipro.local",
    role: "Import Officer",
    title: "Import Officer",
    department: "Import Management",
    phone: "+880 1711 000004",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    status: "Active"
  },
  {
    id: "u-warehouse",
    name: "Mahmud Hasan",
    email: "warehouse@mipro.local",
    role: "Warehouse Manager",
    title: "Warehouse Manager",
    department: "Warehouse",
    phone: "+880 1711 000005",
    avatarUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80",
    status: "Active"
  },
  {
    id: "u-sales-manager",
    name: "Farhana Islam",
    email: "salesmanager@mipro.local",
    role: "Sales Manager",
    title: "Sales Manager",
    department: "Sales",
    phone: "+880 1711 000006",
    avatarUrl: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=300&q=80",
    status: "Active"
  },
  {
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
  },
  {
    id: "sales2",
    name: "Anika Rahman",
    email: "sales2@mipro.local",
    role: "Sales Executive",
    title: "Sales Executive",
    department: "Field Sales",
    phone: "+880 1711 000008",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    status: "Active",
    territory: "Dhaka South"
  }
];

export const passwordByEmail = new Map(demoUsers.map((user) => [user.email, "password123"]));

export const collections: Record<string, EntityRecord[]> = {
  users: demoUsers.map((user) => ({ ...user })),
  companies: [
    { id: "cmp-001", companyName: "Mipro HealthCare Corp.", branch: "Head Office", phone: "+880 2 5500 1000", status: "Active" },
    { id: "cmp-002", companyName: "Mipro HealthCare Chattogram", branch: "Port Office", phone: "+880 31 255 1000", status: "Active" }
  ],
  branches: [
    { id: "br-001", branchName: "Dhaka Head Office", city: "Dhaka", manager: "Mahfuz Rahman", status: "Active" },
    { id: "br-002", branchName: "Chattogram Port Desk", city: "Chattogram", manager: "Imran Hossain", status: "Active" }
  ],
  warehouses: [
    { id: "wh-001", warehouseName: "Central Medical Warehouse", location: "Tongi, Gazipur", capacity: "2,50,000 pcs", status: "Active" },
    { id: "wh-002", warehouseName: "Chattogram Transit Store", location: "Halishahar", capacity: "80,000 pcs", status: "Active" }
  ],
  "bin-locations": [
    { id: "bin-001", warehouse: "Central Medical Warehouse", binCode: "A-01-01", zone: "Dialysis", status: "Available" },
    { id: "bin-002", warehouse: "Central Medical Warehouse", binCode: "A-01-02", zone: "Dialysis", status: "Available" },
    { id: "bin-003", warehouse: "Central Medical Warehouse", binCode: "B-05-03", zone: "Infusion", status: "Reserved" }
  ],
  "product-categories": [
    { id: "cat-001", categoryName: "Hemodialysis", deviceType: "Class II", status: "Active" },
    { id: "cat-002", categoryName: "Infusion", deviceType: "Consumable", status: "Active" },
    { id: "cat-003", categoryName: "Urology", deviceType: "Consumable", status: "Active" }
  ],
  units: [
    { id: "uom-001", unitName: "pcs", description: "Single piece", status: "Active" },
    { id: "uom-002", unitName: "set", description: "Complete set", status: "Active" },
    { id: "uom-003", unitName: "box", description: "Sales carton", status: "Active" }
  ],
  products: [
    {
      id: "prd-001",
      productCode: "Mip001",
      productName: "Dialyzer",
      category: "Hemodialysis",
      unit: "pcs",
      brand: "Mipro",
      manufacturer: "Guangzhou Renhe Medical Technology",
      deviceType: "Dialysis Consumable",
      purchasePrice: 455.64,
      salesPrice: 640,
      reorderLevel: 500,
      description: "High-flux dialyzer with batch, LOT and expiry tracking.",
      imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80",
      status: "Active"
    },
    {
      id: "prd-002",
      productCode: "Mip002",
      productName: "Blood Tubing Set",
      category: "Dialysis Consumable",
      unit: "set",
      brand: "Mipro",
      manufacturer: "Shanghai Aoxin Medical Supply",
      deviceType: "Dialysis Consumable",
      purchasePrice: 186.27,
      salesPrice: 215,
      reorderLevel: 800,
      description: "Blood line set for dialysis distribution channels.",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80",
      status: "Active"
    },
    {
      id: "prd-003",
      productCode: "Mip003",
      productName: "A.V Fistula Needle",
      category: "Dialysis Access",
      unit: "pcs",
      brand: "Mipro",
      manufacturer: "MedSure Global Devices",
      deviceType: "Sterile Needle",
      purchasePrice: 36.74,
      salesPrice: 54,
      reorderLevel: 3000,
      description: "Sterile AV fistula needle with FEFO issue control.",
      imageUrl: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=900&q=80",
      status: "Active"
    },
    {
      id: "prd-004",
      productCode: "Mip004",
      productName: "Foley Catheter",
      category: "Urology",
      unit: "pcs",
      brand: "CareLink",
      manufacturer: "Hangzhou Carelink Medical",
      deviceType: "Catheter",
      purchasePrice: 71,
      salesPrice: 104,
      reorderLevel: 700,
      description: "16FR catheter, expiry controlled.",
      imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80",
      status: "Active"
    },
    {
      id: "prd-005",
      productCode: "Mip005",
      productName: "IV Set",
      category: "Infusion",
      unit: "pcs",
      brand: "Kanghua",
      manufacturer: "Ningbo Kanghua Healthcare",
      deviceType: "Infusion Consumable",
      purchasePrice: 32,
      salesPrice: 48,
      reorderLevel: 6000,
      description: "IV set with stock aging and batch movement ledger.",
      imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
      status: "Active"
    }
  ],
  suppliers: [
    { id: "sup-001", companyName: "Guangzhou Renhe Medical Technology", country: "China", contactPerson: "Li Wei", productCategory: "Hemodialysis", paymentTerms: "LC at sight", rating: 94, status: "Active" },
    { id: "sup-002", companyName: "Shanghai Aoxin Medical Supply", country: "China", contactPerson: "Chen Ming", productCategory: "Blood Tubing Set", paymentTerms: "30% TT + 70% LC", rating: 88, status: "Active" },
    { id: "sup-003", companyName: "MediPort C&F Services", country: "Bangladesh", contactPerson: "Alamgir Hossain", productCategory: "C&F Agent", paymentTerms: "Monthly Bill", rating: 91, status: "Active" }
  ],
  customers: [
    { id: "cus-001", customerName: "Dhaka Medical College Hospital", type: "Hospital", territory: "Dhaka North", contactPerson: "Dr. Kamal Uddin", phone: "+880 1712 111111", email: "procurement@dmch.gov.bd", address: "Bakshibazar, Dhaka", creditLimit: 3500000, openingDue: 620000, assignedSalesExecutive: "Rafiq Ahmed", ownerId: "sales1", status: "Active" },
    { id: "cus-002", customerName: "Popular Hospital Uttara", type: "Hospital", territory: "Dhaka North", contactPerson: "Ms. Farhana Haque", phone: "+880 1712 222222", email: "supply@popularuttara.com", address: "Uttara, Dhaka", creditLimit: 1800000, openingDue: 325000, assignedSalesExecutive: "Rafiq Ahmed", ownerId: "sales1", status: "Active" },
    { id: "cus-003", customerName: "Labaid Group", type: "Clinic", territory: "Dhaka South", contactPerson: "Mr. Tariq Alam", phone: "+880 1712 333333", email: "purchase@labaidgroup.com", address: "Dhanmondi, Dhaka", creditLimit: 4200000, openingDue: 1080000, assignedSalesExecutive: "Anika Rahman", ownerId: "sales2", status: "Active" },
    { id: "cus-004", customerName: "Square Hospital", type: "Hospital", territory: "Dhaka South", contactPerson: "Ms. Sabina Rahman", phone: "+880 1712 444444", email: "central.store@squarehospital.com", address: "Panthapath, Dhaka", creditLimit: 5000000, openingDue: 0, assignedSalesExecutive: "Anika Rahman", ownerId: "sales2", status: "Active" },
    { id: "cus-005", customerName: "United Hospital", type: "Hospital", territory: "Dhaka North", contactPerson: "Mr. Rashed Islam", phone: "+880 1712 555555", email: "supply@uhlbd.com", address: "Gulshan, Dhaka", creditLimit: 5000000, openingDue: 240000, assignedSalesExecutive: "Rafiq Ahmed", ownerId: "sales1", status: "Active" }
  ],
  territories: [
    { id: "ter-001", territoryName: "Dhaka North", manager: "Farhana Islam", monthlyTarget: 12000000, status: "Active" },
    { id: "ter-002", territoryName: "Dhaka South", manager: "Farhana Islam", monthlyTarget: 10000000, status: "Active" },
    { id: "ter-003", territoryName: "Chattogram", manager: "Farhana Islam", monthlyTarget: 7000000, status: "Active" }
  ],
  banks: [
    { id: "bank-001", bankName: "Eastern Bank PLC", accountNo: "EBL-IMP-0184", balance: 8120000, currency: "BDT", status: "Active" },
    { id: "bank-002", bankName: "Dutch-Bangla Bank PLC", accountNo: "DBBL-ERP-0912", balance: 9350000, currency: "BDT", status: "Active" },
    { id: "bank-003", bankName: "City Bank PLC", accountNo: "CBL-LC-7731", balance: 5280000, currency: "BDT", status: "Active" }
  ],
  employees: [
    { id: "emp-001", employeeName: "Rafiq Ahmed", department: "Sales", designation: "Sales Executive", salary: 52000, status: "Active" },
    { id: "emp-002", employeeName: "Anika Rahman", department: "Sales", designation: "Sales Executive", salary: 54000, status: "Active" },
    { id: "emp-003", employeeName: "Mahmud Hasan", department: "Warehouse", designation: "Warehouse Manager", salary: 78000, status: "Active" }
  ],
  vehicles: [
    { id: "veh-001", vehicleNo: "DHA-METRO-13-4455", type: "Covered Van", driver: "Kamal Hossain", fuelBalance: 48, status: "Active" },
    { id: "veh-002", vehicleNo: "DHA-METRO-14-9921", type: "Pickup", driver: "Jamal Uddin", fuelBalance: 34, status: "Maintenance Due" }
  ],
  drivers: [
    { id: "drv-001", driverName: "Kamal Hossain", phone: "+880 1777 100001", licenseNo: "DL-77821", status: "Active" },
    { id: "drv-002", driverName: "Jamal Uddin", phone: "+880 1777 100002", licenseNo: "DL-88102", status: "Active" }
  ],
  "supplier-inquiries": [
    { id: "inq-001", inquiryNo: "INQ-2026-001", supplier: "Guangzhou Renhe Medical Technology", product: "Dialyzer", requestedQty: 4500, targetPrice: 390, status: "Quoted" },
    { id: "inq-002", inquiryNo: "INQ-2026-002", supplier: "Shanghai Aoxin Medical Supply", product: "Blood Tubing Set", requestedQty: 4500, targetPrice: 135, status: "Pending" }
  ],
  "proforma-invoices": [
    { id: "pi-001", piNumber: "PI-RH-26061", supplier: "Guangzhou Renhe Medical Technology", product: "Dialyzer", amount: 90000, currency: "USD", approvalOwner: "Managing Director", status: "Approved" },
    { id: "pi-002", piNumber: "PI-AOX-26058", supplier: "Shanghai Aoxin Medical Supply", product: "Blood Tubing Set", amount: 22500, currency: "USD", approvalOwner: "Managing Director", status: "Pending Approval" }
  ],
  "purchase-orders": [
    { id: "po-001", poNumber: "PO-2026-001", supplier: "Guangzhou Renhe Medical Technology", date: "2026-06-24", product: "Dialyzer / BTS / AV Fistula Needle", quantity: 44000, currency: "BDT", exchangeRate: 123, totalValue: 2488200, status: "Approved" },
    { id: "po-002", poNumber: "PO-2026-002", supplier: "Ningbo Kanghua Healthcare", date: "2026-07-02", product: "IV Set", quantity: 120000, currency: "USD", exchangeRate: 123, totalValue: 42000, status: "Pending Approval" }
  ],
  "lc-records": [
    { id: "lc-001", lcNumber: "LC-77612", bank: "Eastern Bank PLC", supplier: "Guangzhou Renhe Medical Technology", amount: 90000, expiryDate: "2026-08-31", shipmentDate: "2026-07-18", status: "Open" },
    { id: "lc-002", lcNumber: "LC-DBBL-26006", bank: "Dutch-Bangla Bank PLC", supplier: "Shanghai Aoxin Medical Supply", amount: 61200, expiryDate: "2026-09-15", shipmentDate: "2026-07-26", status: "Draft" }
  ],
  "tt-payments": [
    { id: "tt-001", ttNumber: "TT-AOX-8290", supplier: "Shanghai Aoxin Medical Supply", amount: 18360, swiftCopy: "swift-aox-8290.pdf", status: "Sent" },
    { id: "tt-002", ttNumber: "TT-KH-2770", supplier: "Ningbo Kanghua Healthcare", amount: 12600, swiftCopy: "swift-kh-2770.pdf", status: "Pending Approval" }
  ],
  shipments: [
    { id: "shp-001", blNumber: "BL-SHA-88421", containerNumber: "CN-9982", vesselName: "COSCO Ningbo Star", etd: "2026-06-25", eta: "2026-07-09", supplier: "Guangzhou Renhe Medical Technology", poReference: "PO-2026-001", status: "Customs" },
    { id: "shp-002", blNumber: "BL-SZX-44312", containerNumber: "TLLU-7398120", vesselName: "OOCL Jakarta", etd: "2026-07-02", eta: "2026-07-21", supplier: "Ningbo Kanghua Healthcare", poReference: "PO-2026-002", status: "Shipped" }
  ],
  "customs/landed-cost": [
    { id: "lcst-001", poNumber: "PO-2026-001", consignmentNumber: "CN-9982", lcTtNumber: "LC-77612", productName: "Dialyzer", productCode: "Mip001", purchaseUnitFob: 393.6, seaFreightUnit: 7.23, customsDutyUnit: 49.7, cfCostUnit: 2.38, localTransportUnit: 1, bankLcInsuranceUnit: 1.4, totalLandedUnit: 455.64, marginPreview: 28.8, status: "Approved" },
    { id: "lcst-002", poNumber: "PO-2026-001", consignmentNumber: "CN-9982", lcTtNumber: "LC-77612", productName: "Blood Tubing Set", productCode: "Mip002", purchaseUnitFob: 137.8, seaFreightUnit: 4.59, customsDutyUnit: 38.77, cfCostUnit: 2.38, localTransportUnit: 1, bankLcInsuranceUnit: 1.4, totalLandedUnit: 186.27, marginPreview: 13.4, status: "Approved" },
    { id: "lcst-003", poNumber: "PO-2026-001", consignmentNumber: "CN-9982", lcTtNumber: "LC-77612", productName: "A.V Fistula Needle", productCode: "Mip003", purchaseUnitFob: 33, seaFreightUnit: 0.75, customsDutyUnit: 2.71, cfCostUnit: 0.12, localTransportUnit: 0.06, bankLcInsuranceUnit: 0.08, totalLandedUnit: 36.74, marginPreview: 31.9, status: "Approved" }
  ],
  grn: [
    { id: "grn-001", grnNumber: "GRN-2026-001", supplier: "Guangzhou Renhe Medical Technology", containerReference: "CN-9982", product: "Dialyzer", receivedQuantity: 4500, rejectedQuantity: 0, batchNumber: "DLZ-26-034", lotNumber: "LOT-DLZ-884", expiryDate: "2027-08-15", binLocation: "A-01-01", warehouse: "Central Medical Warehouse", receivedBy: "Mahmud Hasan", receivedDate: "2026-06-24", status: "Posted" },
    { id: "grn-002", grnNumber: "GRN-2026-002", supplier: "Shanghai Aoxin Medical Supply", containerReference: "CN-9982", product: "Blood Tubing Set", receivedQuantity: 4500, rejectedQuantity: 35, batchNumber: "BTS-26-118", lotNumber: "LOT-BTS-559", expiryDate: "2027-09-18", binLocation: "A-01-02", warehouse: "Central Medical Warehouse", receivedBy: "Mahmud Hasan", receivedDate: "2026-06-24", status: "Posted" }
  ],
  "inventory/stock": [
    { id: "stk-001", productCode: "Mip001", productName: "Dialyzer", totalReceivedQty: 4500, totalSoldQty: 3500, currentStockInHand: 1000, unitLandedCost: 455.64, totalStockAssetValue: 455640, warehouse: "Central Medical Warehouse", status: "Normal" },
    { id: "stk-002", productCode: "Mip002", productName: "Blood Tubing Set", totalReceivedQty: 4500, totalSoldQty: 3000, currentStockInHand: 1500, unitLandedCost: 186.27, totalStockAssetValue: 279405, warehouse: "Central Medical Warehouse", status: "Normal" },
    { id: "stk-003", productCode: "Mip003", productName: "A.V Fistula Needle", totalReceivedQty: 35000, totalSoldQty: 20000, currentStockInHand: 15000, unitLandedCost: 36.74, totalStockAssetValue: 551100, warehouse: "Central Medical Warehouse", status: "Normal" }
  ],
  "inventory/batches": [
    { id: "bat-001", product: "Dialyzer", batchNumber: "DLZ-26-034", lotNumber: "LOT-DLZ-884", expiryDate: "2027-08-15", binLocation: "A-01-01", quantity: 1000, fefoRank: 1, status: "6 Month Alert" },
    { id: "bat-002", product: "Blood Tubing Set", batchNumber: "BTS-26-118", lotNumber: "LOT-BTS-559", expiryDate: "2027-09-18", binLocation: "A-01-02", quantity: 1500, fefoRank: 2, status: "Normal" },
    { id: "bat-003", product: "A.V Fistula Needle", batchNumber: "AVF-26-301", lotNumber: "LOT-AV-731", expiryDate: "2027-05-19", binLocation: "B-05-03", quantity: 15000, fefoRank: 1, status: "3 Month Alert" }
  ],
  "inventory/movements": [
    { id: "mov-001", date: "2026-06-24", product: "Dialyzer", batchNumber: "DLZ-26-034", movementType: "Stock In", quantity: 4500, reference: "GRN-2026-001", warehouseUser: "Mahmud Hasan", status: "Posted" },
    { id: "mov-002", date: "2026-06-25", product: "Dialyzer", batchNumber: "DLZ-26-034", movementType: "Sale", quantity: -3000, reference: "INV-2026-001", warehouseUser: "Mahmud Hasan", status: "Posted" }
  ],
  "inventory/physical-counts": [
    { id: "pc-001", countNo: "PHY-2026-001", warehouse: "Central Medical Warehouse", product: "Dialyzer", batchNumber: "DLZ-26-034", systemQty: 1000, countedQty: 998, varianceQty: -2, countedBy: "Mahmud Hasan", countDate: "2026-07-07", status: "Pending Approval" },
    { id: "pc-002", countNo: "PHY-2026-002", warehouse: "Central Medical Warehouse", product: "Blood Tubing Set", batchNumber: "BTS-26-118", systemQty: 1500, countedQty: 1500, varianceQty: 0, countedBy: "Mahmud Hasan", countDate: "2026-07-07", status: "Approved" }
  ],
  "sales/quotations": [
    { id: "qt-001", quotationNo: "QT-2026-001", customer: "Dhaka Medical College Hospital", product: "Dialyzer", quantity: 3000, unitPrice: 640, discountPercent: 2, ownerId: "sales1", status: "Approved" },
    { id: "qt-002", quotationNo: "QT-2026-002", customer: "Labaid Group", product: "A.V Fistula Needle", quantity: 20000, unitPrice: 54, discountPercent: 0, ownerId: "sales2", status: "Pending Approval" }
  ],
  "sales/orders": [
    { id: "so-001", orderNo: "SO-2026-001", quotationNo: "QT-2026-001", customer: "Dhaka Medical College Hospital", product: "Dialyzer", quantity: 3000, ownerId: "sales1", amount: 1920000, status: "Delivered" },
    { id: "so-002", orderNo: "SO-2026-002", quotationNo: "QT-2026-002", customer: "Labaid Group", product: "A.V Fistula Needle", quantity: 20000, ownerId: "sales2", amount: 1080000, status: "Sales Order" }
  ],
  "sales/challans": [
    { id: "dc-001", challanNo: "DC-2026-001", orderNo: "SO-2026-001", customer: "Dhaka Medical College Hospital", deliveryDate: "2026-06-25", vehicleNo: "DHA-METRO-13-4455", ownerId: "sales1", status: "Delivered" },
    { id: "dc-002", challanNo: "DC-2026-002", orderNo: "SO-2026-002", customer: "Labaid Group", deliveryDate: "2026-06-27", vehicleNo: "DHA-METRO-14-9921", ownerId: "sales2", status: "Ready" }
  ],
  "sales/invoices": [
    { id: "inv-001", invoiceNo: "INV-2026-001", salesDate: "2026-06-25", customerName: "Dhaka Medical College Hospital", productName: "Dialyzer", productCode: "Mip001", unitLandedCost: 455.64, qtySold: 3000, unitSalePrice: 640, totalCostAmount: 1366920, totalGrossRevenue: 1920000, profitMarginUnit: 184.36, totalProfitRealized: 553080, ownerId: "sales1", status: "Posted" },
    { id: "inv-002", invoiceNo: "INV-2026-002", salesDate: "2026-06-26", customerName: "Popular Hospital Uttara", productName: "Dialyzer", productCode: "Mip001", unitLandedCost: 455.64, qtySold: 500, unitSalePrice: 650, totalCostAmount: 227820, totalGrossRevenue: 325000, profitMarginUnit: 194.36, totalProfitRealized: 97180, ownerId: "sales1", status: "Posted" },
    { id: "inv-003", invoiceNo: "INV-2026-003", salesDate: "2026-06-27", customerName: "Labaid Group", productName: "A.V Fistula Needle", productCode: "Mip003", unitLandedCost: 36.74, qtySold: 20000, unitSalePrice: 54, totalCostAmount: 734800, totalGrossRevenue: 1080000, profitMarginUnit: 17.26, totalProfitRealized: 345200, ownerId: "sales2", status: "Posted" }
  ],
  "sales/returns": [
    { id: "sr-001", returnNo: "RET-2026-001", invoiceNo: "INV-2026-001", customer: "Dhaka Medical College Hospital", product: "Dialyzer", quantity: 12, reason: "Damaged carton", ownerId: "sales1", status: "Pending Approval" }
  ],
  "sales/collections": [
    { id: "col-001", receiptNo: "MR-2026-001", invoiceNo: "INV-2026-001", customer: "Dhaka Medical College Hospital", collectionDate: "2026-06-28", amount: 1200000, method: "Bank", ownerId: "sales1", status: "Posted" },
    { id: "col-002", receiptNo: "MR-2026-002", invoiceNo: "INV-2026-003", customer: "Labaid Group", collectionDate: "2026-06-30", amount: 650000, method: "Cheque", ownerId: "sales2", status: "Pending Approval" }
  ],
  "sales/visits": [
    {
      id: "vis-001",
      visitDate: "2026-07-04",
      customer: "Dhaka Medical College Hospital",
      outcome: "Next PO expected",
      checkInTime: "10:14",
      gpsLat: 23.7266,
      gpsLng: 90.3976,
      accuracyMeter: 18,
      routeSequence: 1,
      nextFollowUp: "2026-07-11",
      ownerId: "sales1",
      status: "Completed"
    },
    {
      id: "vis-002",
      visitDate: "2026-07-05",
      customer: "Labaid Group",
      outcome: "Collection promised",
      checkInTime: "12:35",
      gpsLat: 23.7461,
      gpsLng: 90.3742,
      accuracyMeter: 22,
      routeSequence: 2,
      nextFollowUp: "2026-07-09",
      ownerId: "sales2",
      status: "Completed"
    },
    {
      id: "vis-003",
      visitDate: "2026-07-06",
      customer: "Popular Hospital Uttara",
      outcome: "Invoice follow-up and stock confirmation",
      checkInTime: "15:20",
      gpsLat: 23.8759,
      gpsLng: 90.3795,
      accuracyMeter: 16,
      routeSequence: 3,
      nextFollowUp: "2026-07-13",
      ownerId: "sales1",
      status: "Follow-up"
    }
  ],
  "sales/targets": [
    { id: "tar-001", salesRep: "Rafiq Ahmed", ownerId: "sales1", territory: "Dhaka North", monthlyTarget: 6000000, achieved: 2245000, commissionRate: 1.5, status: "On Track" },
    { id: "tar-002", salesRep: "Anika Rahman", ownerId: "sales2", territory: "Dhaka South", monthlyTarget: 5500000, achieved: 1080000, commissionRate: 1.5, status: "Attention" }
  ],
  "accounts/vouchers": [
    { id: "vch-001", voucherNo: "RV-2026-001", type: "Receipt", party: "Dhaka Medical College Hospital", amount: 1200000, date: "2026-06-28", status: "Posted" },
    { id: "vch-002", voucherNo: "PV-2026-001", type: "Payment", party: "MediPort C&F Services", amount: 185000, date: "2026-06-26", status: "Approved" }
  ],
  "accounts/receivables": [
    { id: "ar-001", customer: "Dhaka Medical College Hospital", current: 720000, days30: 0, days60: 0, days90: 620000, totalDue: 1340000, status: "Attention" },
    { id: "ar-002", customer: "Labaid Group", current: 430000, days30: 0, days60: 0, days90: 0, totalDue: 430000, status: "Normal" }
  ],
  "accounts/payables": [
    { id: "ap-001", supplier: "Guangzhou Renhe Medical Technology", dueDate: "2026-07-20", amount: 2250000, currency: "BDT", status: "Scheduled" },
    { id: "ap-002", supplier: "MediPort C&F Services", dueDate: "2026-07-10", amount: 185000, currency: "BDT", status: "Due" }
  ],
  "accounts/cash-book": [
    { id: "cash-001", date: "2026-06-28", narration: "Collection MR-2026-001", debit: 1200000, credit: 0, balance: 2450000, status: "Posted" },
    { id: "cash-002", date: "2026-06-29", narration: "Fuel expense", debit: 0, credit: 37500, balance: 2412500, status: "Posted" }
  ],
  "accounts/bank-book": [
    { id: "bb-001", bank: "Eastern Bank PLC", accountNo: "EBL-IMP-0184", debit: 1200000, credit: 0, balance: 8120000, status: "Reconciled" },
    { id: "bb-002", bank: "Dutch-Bangla Bank PLC", accountNo: "DBBL-ERP-0912", debit: 0, credit: 185000, balance: 9350000, status: "Pending Reconciliation" }
  ],
  "accounts/general-ledger": [
    { id: "gl-001", accountCode: "4001", accountName: "Sales Revenue", debit: 0, credit: 3970000, balance: -3970000, status: "Posted" },
    { id: "gl-002", accountCode: "5001", accountName: "Cost of Goods Sold", debit: 2888350, credit: 0, balance: 2888350, status: "Posted" }
  ],
  expenses: [
    { id: "exp-001", expenseNo: "EXP-2026-001", category: "Fuel", department: "Transport", amount: 37500, date: "2026-06-29", status: "Approved" },
    { id: "exp-002", expenseNo: "EXP-2026-002", category: "Internet", department: "Head Office", amount: 12000, date: "2026-07-01", status: "Pending Approval" }
  ],
  attendance: [
    { id: "att-001", employeeName: "Rafiq Ahmed", date: "2026-07-06", checkIn: "09:08", checkOut: "18:05", status: "Present" },
    { id: "att-002", employeeName: "Anika Rahman", date: "2026-07-06", checkIn: "09:20", checkOut: "18:00", status: "Present" }
  ],
  "hr/leave-advances": [
    { id: "hla-001", employeeName: "Rafiq Ahmed", requestType: "Leave", fromDate: "2026-07-15", toDate: "2026-07-16", amount: 0, reason: "Family appointment", status: "Pending Approval" },
    { id: "hla-002", employeeName: "Mahmud Hasan", requestType: "Salary Advance", fromDate: "2026-07-01", toDate: "2026-07-01", amount: 15000, reason: "Emergency advance", status: "Approved" }
  ],
  payroll: [
    { id: "pay-001", payslipNo: "PAY-2026-001", employeeName: "Rafiq Ahmed", grossSalary: 52000, bonus: 5000, deductions: 1200, netPay: 55800, status: "Ready" },
    { id: "pay-002", payslipNo: "PAY-2026-002", employeeName: "Mahmud Hasan", grossSalary: 78000, bonus: 6000, deductions: 1800, netPay: 82200, status: "Ready" }
  ],
  trips: [
    { id: "trip-001", tripNo: "TRP-2026-001", vehicleNo: "DHA-METRO-13-4455", driver: "Kamal Hossain", customer: "Dhaka Medical College Hospital", fuelCost: 8500, deliveryCost: 12500, status: "Completed" },
    { id: "trip-002", tripNo: "TRP-2026-002", vehicleNo: "DHA-METRO-14-9921", driver: "Jamal Uddin", customer: "Labaid Group", fuelCost: 7600, deliveryCost: 11300, status: "Scheduled" }
  ],
  "audit-logs": [
    { id: "aud-001", user: "Sadia Karim", role: "Super Admin", action: "Created user", module: "Users", recordId: "u-import", timestamp: "2026-07-06 10:15", ipAddress: "103.74.22.18", device: "Chrome / Windows", beforeAfterSummary: "New import officer activated", status: "Info" },
    { id: "aud-002", user: "Nusrat Akter", role: "Accounts", action: "Posted receipt voucher", module: "Accounts", recordId: "RV-2026-001", timestamp: "2026-07-06 11:42", ipAddress: "103.74.22.32", device: "Edge / Windows", beforeAfterSummary: "Draft to Posted", status: "Info" }
  ],
  "login-activity": [
    { id: "log-001", user: "Mahfuz Rahman", role: "Managing Director", loginTime: "2026-07-06 09:02", ipAddress: "103.74.22.11", device: "Safari / iPad", status: "Success" },
    { id: "log-002", user: "Rafiq Ahmed", role: "Sales Executive", loginTime: "2026-07-06 09:18", ipAddress: "103.74.22.58", device: "Chrome / Android Browser", status: "Success" }
  ],
  approvals: [
    { id: "apr-001", module: "Purchase Order", recordId: "PO-2026-002", requestedBy: "Imran Hossain", approver: "Mahfuz Rahman", status: "Pending Approval" },
    { id: "apr-002", module: "Discount", recordId: "QT-2026-002", requestedBy: "Anika Rahman", approver: "Farhana Islam", status: "Pending Approval" }
  ],
  documents: [
    { id: "doc-001", documentName: "Commercial Invoice PO-2026-001", module: "Import", fileType: "PDF", recordId: "PO-2026-001", status: "Archived" },
    { id: "doc-002", documentName: "COA Dialyzer Batch DLZ-26-034", module: "Warehouse", fileType: "PDF", recordId: "DLZ-26-034", status: "Archived" },
    { id: "doc-003", documentName: "Proforma Invoice PI-RH-26061", module: "Import", fileType: "PDF", recordId: "PI-RH-26061", status: "Archived" },
    { id: "doc-004", documentName: "LC Bank Document LC-77612", module: "Import", fileType: "PDF", recordId: "LC-77612", status: "Archived" },
    { id: "doc-005", documentName: "Bill of Lading BL-SHA-88421", module: "Shipment", fileType: "PDF", recordId: "BL-SHA-88421", status: "Archived" },
    { id: "doc-006", documentName: "Packing List CN-9982", module: "Shipment", fileType: "PDF", recordId: "CN-9982", status: "Archived" },
    { id: "doc-007", documentName: "CE Certificate Dialyzer Mip001", module: "Compliance", fileType: "PDF", recordId: "Mip001", status: "Archived" },
    { id: "doc-008", documentName: "ISO 13485 Supplier Certificate", module: "Compliance", fileType: "PDF", recordId: "Guangzhou Renhe Medical Technology", status: "Archived" },
    { id: "doc-009", documentName: "Delivery Challan DC-2026-001", module: "Sales", fileType: "PDF", recordId: "DC-2026-001", status: "Archived" },
    { id: "doc-010", documentName: "Sales Invoice INV-2026-001", module: "Sales", fileType: "PDF", recordId: "INV-2026-001", status: "Archived" }
  ]
};

export const dashboardSummary: DashboardSummary = {
  role: "Managing Director",
  metrics: [
    { id: "m-001", label: "Today Sales", value: 1080000, unit: "BDT", trend: 12.4, status: "Good" },
    { id: "m-002", label: "Monthly Sales", value: 3970000, unit: "BDT", trend: 8.2, status: "Good" },
    { id: "m-003", label: "Gross Margin", value: 1081650, unit: "BDT", trend: 14.1, status: "Good" },
    { id: "m-004", label: "Net Profit", value: 345200, unit: "BDT", trend: 6.8, status: "Good" },
    { id: "m-005", label: "Bank Balance", value: 22750000, unit: "BDT", trend: 4.9, status: "Good" },
    { id: "m-006", label: "Receivables", value: 1770000, unit: "BDT", trend: -5.6, status: "Attention" },
    { id: "m-007", label: "Payables", value: 2435000, unit: "BDT", trend: 2.1, status: "Scheduled" },
    { id: "m-008", label: "Inventory Valuation", value: 1286145, unit: "BDT", trend: -3.1, status: "Normal" }
  ],
  importPipeline: [
    { id: "p-001", stage: "Inquiry", active: 4, delayed: 0, value: 82000 },
    { id: "p-002", stage: "PI", active: 3, delayed: 1, value: 146000 },
    { id: "p-003", stage: "PO", active: 5, delayed: 0, value: 235000 },
    { id: "p-004", stage: "LC/TT", active: 4, delayed: 1, value: 198000 },
    { id: "p-005", stage: "Shipment", active: 6, delayed: 1, value: 318000 },
    { id: "p-006", stage: "Customs", active: 2, delayed: 0, value: 97000 },
    { id: "p-007", stage: "GRN", active: 3, delayed: 0, value: 76000 }
  ],
  salesByTerritory: [
    { id: "t-001", territory: "Dhaka North", sales: 2245000, target: 6000000 },
    { id: "t-002", territory: "Dhaka South", sales: 1080000, target: 5500000 },
    { id: "t-003", territory: "Chattogram", sales: 645000, target: 3500000 }
  ],
  salesByProduct: [
    { id: "sp-001", product: "Dialyzer", sales: 2245000 },
    { id: "sp-002", product: "Blood Tubing Set", sales: 645000 },
    { id: "sp-003", product: "A.V Fistula Needle", sales: 1080000 }
  ],
  salesByCustomer: [
    { id: "sc-001", customer: "Dhaka Medical College Hospital", sales: 2565000 },
    { id: "sc-002", customer: "Labaid Group", sales: 1080000 },
    { id: "sc-003", customer: "Popular Hospital Uttara", sales: 325000 }
  ],
  targetVsAchievement: [
    { id: "ta-001", rep: "Rafiq Ahmed", target: 6000000, achieved: 2245000 },
    { id: "ta-002", rep: "Anika Rahman", target: 5500000, achieved: 1080000 }
  ],
  expiryAlerts: [
    { id: "ea-001", product: "Dialyzer", batch: "DLZ-26-034", daysLeft: 220, status: "6 Month Alert" },
    { id: "ea-002", product: "A.V Fistula Needle", batch: "AVF-26-301", daysLeft: 136, status: "3 Month Alert" }
  ],
  aiSummary: {
    id: "ai-md",
    title: "AI executive summary",
    summary:
      "Sales conversion is healthy, but receivable aging for Dhaka Medical needs follow-up. PO-2026-002 is waiting for MD approval and the AV Fistula Needle batch should be issued first by FEFO.",
    confidence: 91,
    status: "Pending Review"
  }
};

export const aiRecommendations: AiRecommendation[] = [
  {
    id: "ai-001",
    agent: "Import Document Extraction Agent",
    title: "PI fields extracted for PO-2026-002",
    confidence: 94,
    reason: "Supplier, product, shipment date and LC amount matched known supplier records.",
    sourceData: "PI-KH-26044.pdf, supplier master, purchase-order draft",
    recommendedAction: "Auto-fill PI draft and send to Import Officer for verification.",
    status: "Pending"
  },
  {
    id: "ai-002",
    agent: "Inventory Risk Agent",
    title: "FEFO issue recommendation for AV Fistula Needle",
    confidence: 88,
    reason: "Batch AVF-26-301 has the nearest expiry among available stock.",
    sourceData: "Batch ledger, expiry dashboard, sales order SO-2026-002",
    recommendedAction: "Reserve AVF-26-301 before newer lots for the next delivery challan.",
    status: "Pending"
  },
  {
    id: "ai-003",
    agent: "Collection Risk Agent",
    title: "Dhaka Medical overdue exposure needs escalation",
    confidence: 86,
    reason: "Aged receivable exceeds 90-day bucket while a new quotation is active.",
    sourceData: "Customer ledger, invoices, quotation QT-2026-001",
    recommendedAction: "Ask Sales Manager to approve credit hold or collection visit.",
    status: "Pending"
  },
  {
    id: "ai-004",
    agent: "Finance Reconciliation Agent",
    title: "Bank book entry needs voucher match",
    confidence: 82,
    reason: "DBBL outgoing payment amount matches C&F charge but voucher is still Approved, not Posted.",
    sourceData: "Bank book, payment voucher PV-2026-001, landed cost tracker",
    recommendedAction: "Accounts should post PV-2026-001 after document check.",
    status: "Pending"
  }
];

export const roleDashboardNotes: Record<Role, string> = {
  "Super Admin": "Full system overview with users, audit, security and every operating module available.",
  "Managing Director": "Executive dashboard focused on sales, profit, bank, receivables, payables, imports and AI summaries.",
  Accounts: "Finance dashboard focused on cash, bank, ledgers, vouchers, receivables, payables and payroll.",
  "Import Officer": "Import dashboard focused on suppliers, PI, PO, LC/TT, shipments, customs and landed cost drafts.",
  "Warehouse Manager": "Warehouse dashboard focused on GRN, BIN, batch, LOT, expiry, FEFO and physical count control.",
  "Sales Manager": "Sales dashboard focused on team target, quotation approval, discount approval and collections.",
  "Sales Executive": "Personal sales dashboard restricted to assigned customers, own quotations, invoices, visits and collections."
};
