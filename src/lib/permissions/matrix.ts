import {
  BarChart3,
  Bot,
  Boxes,
  Building2,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  FileCog,
  FileText,
  Landmark,
  LayoutDashboard,
  LockKeyhole,
  PackageCheck,
  Receipt,
  Smartphone,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  Warehouse
} from "lucide-react";
import type { ComponentType } from "react";
import type { PermissionAction, PermissionKey, Role } from "../../types";

export type NavItem = {
  label: string;
  path: string;
  permission: PermissionKey;
  icon: ComponentType<{ className?: string }>;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

const fullActions: PermissionAction[] = ["view", "create", "edit", "delete", "approve", "post", "export"];
const readOnly: PermissionAction[] = ["view", "export"];
const operate: PermissionAction[] = ["view", "create", "edit", "delete", "approve", "export"];
const transact: PermissionAction[] = ["view", "create", "edit", "approve", "post", "export"];

export const permissionMatrix: Record<Role, Partial<Record<PermissionKey, PermissionAction[]>>> = {
  "Super Admin": {
    dashboard: fullActions,
    users: fullActions,
    roles: fullActions,
    "master-data": fullActions,
    suppliers: fullActions,
    customers: fullActions,
    products: fullActions,
    procurement: fullActions,
    import: fullActions,
    shipments: fullActions,
    customs: fullActions,
    warehouse: fullActions,
    inventory: fullActions,
    sales: fullActions,
    accounts: fullActions,
    expenses: fullActions,
    hr: fullActions,
    transport: fullActions,
    reports: fullActions,
    ai: fullActions,
    audit: fullActions,
    settings: fullActions,
    print: fullActions
  },
  "Managing Director": {
    dashboard: ["view", "approve", "export"],
    products: readOnly,
    suppliers: readOnly,
    customers: readOnly,
    procurement: ["view", "approve", "export"],
    import: ["view", "approve", "export"],
    shipments: readOnly,
    customs: ["view", "approve", "export"],
    warehouse: readOnly,
    inventory: readOnly,
    sales: ["view", "approve", "export"],
    accounts: readOnly,
    expenses: readOnly,
    hr: readOnly,
    transport: readOnly,
    reports: readOnly,
    ai: ["view", "approve", "export"],
    audit: readOnly,
    print: readOnly
  },
  Accounts: {
    dashboard: ["view"],
    products: readOnly,
    customers: readOnly,
    accounts: transact,
    expenses: transact,
    hr: ["view", "create", "edit", "post", "export"],
    reports: readOnly,
    ai: ["view", "approve"],
    audit: readOnly,
    print: readOnly
  },
  "Import Officer": {
    dashboard: ["view"],
    products: operate,
    suppliers: operate,
    procurement: operate,
    import: operate,
    shipments: operate,
    customs: operate,
    warehouse: ["view"],
    inventory: ["view"],
    reports: readOnly,
    ai: ["view", "approve"],
    audit: readOnly,
    print: readOnly
  },
  "Warehouse Manager": {
    dashboard: ["view"],
    products: ["view", "edit", "export"],
    suppliers: ["view"],
    shipments: ["view"],
    customs: ["view"],
    warehouse: transact,
    inventory: transact,
    sales: ["view"],
    reports: readOnly,
    ai: ["view", "approve"],
    audit: readOnly,
    print: readOnly
  },
  "Sales Manager": {
    dashboard: ["view"],
    products: readOnly,
    customers: operate,
    inventory: readOnly,
    sales: operate,
    accounts: ["view"],
    reports: readOnly,
    ai: ["view", "approve"],
    audit: readOnly,
    print: readOnly
  },
  "Sales Executive": {
    dashboard: ["view"],
    products: readOnly,
    customers: ["view", "create", "edit"],
    inventory: ["view"],
    sales: ["view", "create", "edit"],
    reports: ["view"],
    ai: ["view"],
    print: ["view"]
  }
};

export function hasPermission(role: Role, permission: PermissionKey, action: PermissionAction = "view") {
  return Boolean(permissionMatrix[role][permission]?.includes(action));
}

export const navSections: NavSection[] = [
  {
    label: "Control",
    items: [
      { label: "Dashboard", path: "/app/dashboard", permission: "dashboard", icon: LayoutDashboard },
      { label: "Users", path: "/app/users", permission: "users", icon: Users },
      { label: "Roles", path: "/app/roles", permission: "roles", icon: ShieldCheck }
    ]
  },
  {
    label: "Master Data",
    items: [
      { label: "Companies", path: "/app/master/companies", permission: "master-data", icon: Building2 },
      { label: "Warehouses", path: "/app/master/warehouses", permission: "master-data", icon: Warehouse },
      { label: "BIN Locations", path: "/app/warehouse/bin-locations", permission: "warehouse", icon: Boxes },
      { label: "Products", path: "/app/products", permission: "products", icon: PackageCheck },
      { label: "Suppliers", path: "/app/suppliers", permission: "suppliers", icon: Building2 },
      { label: "Customers", path: "/app/customers", permission: "customers", icon: Users }
    ]
  },
  {
    label: "Import Flow",
    items: [
      { label: "Supplier Inquiry", path: "/app/procurement/inquiries", permission: "procurement", icon: ClipboardCheck },
      { label: "Purchase Orders", path: "/app/procurement/purchase-orders", permission: "procurement", icon: FileText },
      { label: "PI Management", path: "/app/import/pi", permission: "import", icon: FileCog },
      { label: "LC", path: "/app/import/lc", permission: "import", icon: Landmark },
      { label: "TT Payments", path: "/app/import/tt", permission: "import", icon: CreditCard },
      { label: "Shipments", path: "/app/import/shipments", permission: "shipments", icon: Truck },
      { label: "Landed Cost", path: "/app/customs/landed-cost", permission: "customs", icon: BarChart3 }
    ]
  },
  {
    label: "Warehouse",
    items: [
      { label: "GRN", path: "/app/warehouse/grn", permission: "warehouse", icon: ClipboardCheck },
      { label: "Stock", path: "/app/inventory/stock", permission: "inventory", icon: Boxes },
      { label: "Batches", path: "/app/inventory/batches", permission: "inventory", icon: PackageCheck },
      { label: "Movements", path: "/app/inventory/movements", permission: "inventory", icon: FileBarChart },
      { label: "Physical Count", path: "/app/inventory/physical-counts", permission: "inventory", icon: ClipboardCheck }
    ]
  },
  {
    label: "Sales & Finance",
    items: [
      { label: "Quotations", path: "/app/sales/quotations", permission: "sales", icon: FileText },
      { label: "Sales Orders", path: "/app/sales/orders", permission: "sales", icon: ShoppingCart },
      { label: "Challans", path: "/app/sales/challans", permission: "sales", icon: Truck },
      { label: "Invoices", path: "/app/sales/invoices", permission: "sales", icon: Receipt },
      { label: "Collections", path: "/app/sales/collections", permission: "sales", icon: CreditCard },
      { label: "Returns", path: "/app/sales/returns", permission: "sales", icon: Receipt },
      { label: "Visits", path: "/app/sales/visits", permission: "sales", icon: Users },
      { label: "Targets", path: "/app/sales/targets", permission: "sales", icon: BarChart3 },
      { label: "Mobile Sales", path: "/app/sales/mobile-control", permission: "sales", icon: Smartphone },
      { label: "Vouchers", path: "/app/accounts/vouchers", permission: "accounts", icon: Landmark },
      { label: "Receivables", path: "/app/accounts/receivables", permission: "accounts", icon: FileBarChart },
      { label: "Payables", path: "/app/accounts/payables", permission: "accounts", icon: FileBarChart },
      { label: "Cash Book", path: "/app/accounts/cash-book", permission: "accounts", icon: Receipt },
      { label: "Bank Book", path: "/app/accounts/bank-book", permission: "accounts", icon: Landmark },
      { label: "General Ledger", path: "/app/accounts/general-ledger", permission: "accounts", icon: FileBarChart }
    ]
  },
  {
    label: "Back Office",
    items: [
      { label: "Expenses", path: "/app/expenses", permission: "expenses", icon: Receipt },
      { label: "Employees", path: "/app/hr/employees", permission: "hr", icon: Users },
      { label: "Attendance", path: "/app/hr/attendance", permission: "hr", icon: ClipboardCheck },
      { label: "Leave & Advances", path: "/app/hr/leave-advances", permission: "hr", icon: FileText },
      { label: "Payroll", path: "/app/hr/payroll", permission: "hr", icon: CreditCard },
      { label: "Transport", path: "/app/transport", permission: "transport", icon: Truck }
    ]
  },
  {
    label: "Intelligence",
    items: [
      { label: "Reports", path: "/app/reports", permission: "reports", icon: FileBarChart },
      { label: "AI Agents", path: "/app/ai", permission: "ai", icon: Bot },
      { label: "Audit", path: "/app/audit", permission: "audit", icon: LockKeyhole },
      { label: "Settings", path: "/app/settings", permission: "settings", icon: Settings }
    ]
  }
];
