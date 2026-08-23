import {
  BarChart3,
  Boxes,
  FileDown,
  LayoutDashboard,
  ReceiptText,
  Settings,
  ShoppingCart
} from "lucide-react";
import type { ComponentType } from "react";
import type { Capability } from "../../domains/erp.types";
import type { PermissionAction, PermissionKey, Role, User } from "../../types";

export type NavItem = {
  label: string;
  path: string;
  permission: PermissionKey;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
};

export type NavSection = { label: string; items: NavItem[] };

const all: PermissionAction[] = ["view", "create", "edit", "delete", "approve", "post", "export"];
const read: PermissionAction[] = ["view", "export"];
const work: PermissionAction[] = ["view", "create", "edit", "delete", "post", "export"];

export const permissionMatrix: Record<Role, Partial<Record<PermissionKey, PermissionAction[]>>> = {
  "Super Admin": {
    dashboard: all,
    import: all,
    inventory: all,
    sales: all,
    accounts: all,
    reports: all,
    settings: all,
    print: all,
    products: all,
    suppliers: all,
    customers: all
  },
  "Managing Director": {
    dashboard: read,
    import: ["view", "approve", "export"],
    inventory: read,
    sales: ["view", "approve", "export"],
    accounts: read,
    reports: read,
    print: read
  },
  Accounts: {
    dashboard: ["view"],
    sales: ["view", "create", "edit", "post", "export"],
    accounts: work,
    reports: read,
    customers: read,
    print: read
  },
  "Import Officer": {
    dashboard: ["view"],
    import: work,
    products: work,
    suppliers: work,
    print: read
  },
  "Warehouse Manager": {
    dashboard: ["view"],
    import: read,
    inventory: work,
    sales: ["view", "create", "post", "export"],
    products: read,
    print: read
  },
  "Sales Manager": {
    dashboard: ["view"],
    inventory: read,
    sales: work,
    customers: work,
    reports: read,
    print: read
  },
  "Sales Executive": {
    dashboard: ["view"],
    sales: ["view", "create", "edit", "post"],
    customers: ["view", "create", "edit"],
    print: ["view"]
  }
};

export function hasPermission(role: Role, permission: PermissionKey, action: PermissionAction = "view") {
  return Boolean(permissionMatrix[role][permission]?.includes(action));
}

export function hasCapability(user: User | null | undefined, capability: Capability) {
  return Boolean(user?.capabilities?.includes(capability));
}

export const navSections: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", path: "/app/dashboard", permission: "dashboard", icon: LayoutDashboard, roles: ["Super Admin", "Managing Director", "Accounts", "Import Officer", "Warehouse Manager", "Sales Manager", "Sales Executive"] },
      { label: "Imports", path: "/app/imports", permission: "import", icon: FileDown, roles: ["Super Admin", "Managing Director", "Import Officer"] },
      { label: "Inventory", path: "/app/inventory", permission: "inventory", icon: Boxes, roles: ["Super Admin", "Managing Director", "Warehouse Manager", "Sales Manager"] },
      { label: "Sales", path: "/app/sales", permission: "sales", icon: ShoppingCart, roles: ["Super Admin", "Managing Director", "Accounts", "Sales Manager", "Sales Executive"] },
      { label: "Expenses & Accounts", path: "/app/accounts", permission: "accounts", icon: ReceiptText, roles: ["Super Admin", "Managing Director", "Accounts"] },
      { label: "Reports", path: "/app/reports", permission: "reports", icon: BarChart3, roles: ["Super Admin", "Managing Director", "Accounts", "Sales Manager"] },
      { label: "Settings", path: "/app/settings", permission: "settings", icon: Settings, roles: ["Super Admin"] }
    ]
  }
];
