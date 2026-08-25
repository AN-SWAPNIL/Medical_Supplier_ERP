import type { ApiResponse, Session } from "../../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const SESSION_KEY = "mipro-erp-session";

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function sessionHeaders(): Record<string, string> {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return {};
  }

  try {
    const session = JSON.parse(raw) as Session;
    return {
      Authorization: `Bearer ${session.token}`,
      "x-user-id": session.user.id,
      "x-role": session.user.role
    };
  } catch {
    return {};
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  Object.entries(sessionHeaders()).forEach(([key, value]) => headers.set(key, value));

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  const body = (await response.json().catch(() => ({
    success: false,
    message: "Invalid API response",
    data: null
  }))) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new ApiRequestError(body.message || `API request failed: ${response.status}`, response.status);
  }

  return body;
}

export const apiClient = {
  async login(email: string, password: string) {
    return request<Session>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  async demoUsers() {
    return request<Pick<Session["user"], "email" | "name" | "role" | "title">[]>("/api/auth/demo-users");
  },
  async forgotPassword(email: string) {
    return request<{ email: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  },
  async resetPassword(email: string, password: string) {
    return request<{ email: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  async me() {
    return request<Session>("/api/me");
  }
};

export { SESSION_KEY };
