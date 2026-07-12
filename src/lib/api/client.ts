import type { AiChatResponse, AiRecommendation, ApiResponse, DashboardSummary, EntityRecord, Role, Session } from "../../types";
import { COMPANY_SCOPE_KEY } from "../company/scope";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const SESSION_KEY = "mipro-erp-session";

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
      "x-role": session.user.role,
      "x-company-id": window.localStorage.getItem(COMPANY_SCOPE_KEY) ?? "cmp-001"
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
    throw new Error(body.message || `API request failed: ${response.status}`);
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
  async signupRequest(payload: EntityRecord) {
    return request<EntityRecord>("/api/auth/signup-request", {
      method: "POST",
      body: JSON.stringify(payload)
    });
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
  },
  async getDashboard() {
    return request<DashboardSummary>("/api/dashboard");
  },
  async list(endpoint: string) {
    return request<EntityRecord[]>(endpoint);
  },
  async detail(endpoint: string, id: string) {
    return request<EntityRecord>(`${endpoint}/${id}`);
  },
  async create(endpoint: string, payload: EntityRecord) {
    return request<EntityRecord>(endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async update(endpoint: string, id: string, payload: EntityRecord) {
    return request<EntityRecord>(`${endpoint}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  async remove(endpoint: string, id: string) {
    return request<{ id: string }>(`${endpoint}/${id}`, {
      method: "DELETE"
    });
  },
  async action(endpoint: string, id: string, action: "submit" | "approve" | "reject" | "post" | "cancel") {
    return request<EntityRecord>(`${endpoint}/${id}/${action}`, {
      method: "POST"
    });
  },
  async reports() {
    return request<EntityRecord[]>("/api/reports/summary");
  },
  async aiRecommendations() {
    return request<AiRecommendation[]>("/api/ai/recommendations");
  },
  async aiAction(id: string, action: "approve" | "reject") {
    return request<AiRecommendation>(`/api/ai/recommendations/${id}/${action}`, {
      method: "POST"
    });
  },
  async aiChat(message: string, role: Role) {
    return request<AiChatResponse>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, role })
    });
  },
  async landedCostPreview(payload: EntityRecord) {
    return request<EntityRecord>("/api/v1/customs/landed-cost-preview", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};

export { SESSION_KEY };
