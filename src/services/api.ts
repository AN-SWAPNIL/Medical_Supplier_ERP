import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import {
  AuditLogSchema,
  CustomsCostRequestSchema,
  CustomsCostResponseSchema,
  DashboardSummarySchema,
  FinanceSummarySchema,
  ImportDetailSchema,
  ImportPipelineItemSchema,
  InventoryBatchSchema,
  ProductMasterSchema,
  ReportsSummarySchema,
  SalesOrderSchema,
  StockMovementSchema,
  CustomerSchema,
  type CustomsCostRequest
} from "../shared/schemas";

const API_BASE = "/api/v1";

async function apiRequest<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  init?: RequestInit
): Promise<z.infer<TSchema>> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `API request failed: ${response.status}`);
  }

  const json = await response.json();
  return schema.parse(json);
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiRequest("/dashboard/summary", DashboardSummarySchema)
  });
}

export function useImportPipeline() {
  return useQuery({
    queryKey: ["imports-pipeline"],
    queryFn: () => apiRequest("/imports/pipeline", ImportPipelineItemSchema.array())
  });
}

export function useImportDetail(id?: string) {
  return useQuery({
    queryKey: ["import-detail", id],
    queryFn: () => apiRequest(`/imports/${id}`, ImportDetailSchema),
    enabled: Boolean(id)
  });
}

export function useInventoryBatches() {
  return useQuery({
    queryKey: ["inventory-batches"],
    queryFn: () => apiRequest("/inventory/batches", InventoryBatchSchema.array())
  });
}

export function useStockMovements() {
  return useQuery({
    queryKey: ["stock-movements"],
    queryFn: () => apiRequest("/inventory/movements", StockMovementSchema.array())
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => apiRequest("/products", ProductMasterSchema.array())
  });
}

export function useSalesOrders() {
  return useQuery({
    queryKey: ["sales-orders"],
    queryFn: () => apiRequest("/sales/orders", SalesOrderSchema.array())
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => apiRequest("/customers", CustomerSchema.array())
  });
}

export function useFinanceSummary() {
  return useQuery({
    queryKey: ["finance-summary"],
    queryFn: () => apiRequest("/finance/summary", FinanceSummarySchema)
  });
}

export function useReportsSummary() {
  return useQuery({
    queryKey: ["reports-summary"],
    queryFn: () => apiRequest("/reports/summary", ReportsSummarySchema)
  });
}

export function useAuditLog() {
  return useQuery({
    queryKey: ["audit-log"],
    queryFn: () => apiRequest("/security/audit-log", AuditLogSchema.array())
  });
}

export async function previewLandedCost(payload: CustomsCostRequest) {
  const validatedPayload = CustomsCostRequestSchema.parse(payload);

  return apiRequest("/customs/landed-cost-preview", CustomsCostResponseSchema, {
    method: "POST",
    body: JSON.stringify(validatedPayload)
  });
}
