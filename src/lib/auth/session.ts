import { create } from "zustand";
import { SESSION_KEY, apiClient } from "../api/client";
import type { Role, Session, User } from "../../types";

type AuthState = {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signupRequest: (payload: { id: string; name: string; email: string; requestedRole: Role; phone: string; company: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
};

function loadSession(): Session | null {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Session;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function persistSession(session: Session | null) {
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: loadSession(),
  async login(email, password) {
    const response = await apiClient.login(email, password);
    persistSession(response.data);
    set({ session: response.data });
  },
  async signupRequest(payload) {
    await apiClient.signupRequest({ ...payload, status: "Pending" });
  },
  async forgotPassword(email) {
    await apiClient.forgotPassword(email);
  },
  async resetPassword(email, password) {
    await apiClient.resetPassword(email, password);
  },
  logout() {
    persistSession(null);
    set({ session: null });
  },
  updateUser(user) {
    const session = get().session;
    if (!session) {
      return;
    }
    const updatedSession = { ...session, user };
    persistSession(updatedSession);
    set({ session: updatedSession });
  }
}));

export function useEffectiveRole() {
  return useAuthStore((state) => state.session?.user.role ?? "Sales Executive");
}
