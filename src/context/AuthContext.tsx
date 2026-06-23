import { createContext, useContext } from "react";
import type { Role } from "../shared/schemas";

export type AuthUser = {
  name: string;
  email: string;
  role: Role;
  title?: string;
  phone?: string;
  department?: string;
  avatarUrl?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  updateUser: (user: AuthUser) => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthContext.Provider");
  }

  return context;
}
