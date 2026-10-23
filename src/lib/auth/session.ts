import { create } from "zustand";
import { apiClient } from "../api/client";
import { API_BASE_URL, SESSION_EVENT, SESSION_KEY, readSession, saveSession } from "./transport";
import { foundationMode } from "../runtime";
import type { Session, User } from "../../types";

type AuthState = {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
};

function persistSession(session: Session | null) {
  saveSession(session);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: readSession(),
  async login(email, password) {
    const response = await apiClient.login(email, password);
    persistSession(response.data);
    set({ session: response.data });
  },
  async refreshSession() {
    const current = get().session;
    if (!current) return;
    const response = await apiClient.me();
    if (get().session?.user.id !== current.user.id) return;
    persistSession(response.data);
    set({ session: response.data });
  },
  async forgotPassword(email) {
    await apiClient.forgotPassword(email);
  },
  async resetPassword(email, password) {
    await apiClient.resetPassword(email, password);
  },
  logout() {
    const current = get().session;
    if (foundationMode && current) void fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", keepalive: true, headers: { "Content-Type": "application/json", Authorization: `Bearer ${current.token}` }, body: "{}" }).catch(() => {});
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

window.addEventListener(SESSION_EVENT, () => useAuthStore.setState({ session: readSession() }));
window.addEventListener("storage", (event) => {
  if (event.key === SESSION_KEY) useAuthStore.setState({ session: readSession() });
});

export function useEffectiveRole() {
  return useAuthStore((state) => state.session?.user.role ?? "Sales Executive");
}
