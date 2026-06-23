import { createContext, useContext } from "react";
import type { Role } from "../shared/schemas";

export const roleOptions: Role[] = [
  "Super Admin",
  "Managing Director",
  "Accounts",
  "Import Officer",
  "Warehouse Manager",
  "Sales Manager",
  "Sales Executive"
];

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
};

export const RoleContext = createContext<RoleContextValue | null>(null);

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used inside RoleContext.Provider");
  }

  return context;
}
