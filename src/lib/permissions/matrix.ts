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
import type { PermissionKey } from "../../types";
export { permissionMatrix } from "./definitions";
export { hasCapability, hasEffectivePermission, hasRolePermission } from "./effectiveAccess";

export type NavItem = {
  label: string;
  path: string;
  permission: PermissionKey;
  icon: ComponentType<{ className?: string }>;
};

export type NavSection = { label: string; items: NavItem[] };

export const navSections: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", path: "/app/dashboard", permission: "dashboard", icon: LayoutDashboard },
      { label: "Imports", path: "/app/imports", permission: "import", icon: FileDown },
      { label: "Inventory", path: "/app/inventory", permission: "inventory", icon: Boxes },
      { label: "Sales", path: "/app/sales", permission: "sales", icon: ShoppingCart },
      { label: "Expenses & Accounts", path: "/app/accounts", permission: "accounts", icon: ReceiptText },
      { label: "Reports", path: "/app/reports", permission: "reports", icon: BarChart3 },
      { label: "Settings", path: "/app/settings", permission: "settings", icon: Settings }
    ]
  }
];
