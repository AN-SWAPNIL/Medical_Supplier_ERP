import type { ApiResponse } from "../../types";
import { z } from "zod";
import { publicCertificates, publicProductCategories, publicProducts, publicResources } from "./public.content";
import type { PublicInquiryInput, PublicInquiryReceipt, PublicProductCategory } from "./public.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const publicInquiryReceiptSchema = z.object({ inquiryId: z.string().startsWith("INQ-"), receivedAt: z.string().datetime(), status: z.literal("Received") });

async function post<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !body?.success) throw new Error(body?.message || "Unable to submit the inquiry.");
  return body.data;
}

export const publicSiteService = {
  async categories() {
    return publicProductCategories;
  },
  async products(filters?: { category?: PublicProductCategory; search?: string; featured?: boolean }) {
    const query = filters?.search?.trim().toLowerCase();
    return publicProducts.filter((product) => {
      if (!product.published) return false;
      if (filters?.category && product.category !== filters.category) return false;
      if (filters?.featured !== undefined && product.featured !== filters.featured) return false;
      if (query && !`${product.name} ${product.category} ${product.shortDescription}`.toLowerCase().includes(query)) return false;
      return true;
    });
  },
  async product(slug: string) {
    return publicProducts.find((product) => product.published && product.slug === slug) ?? null;
  },
  async certificates() {
    return publicCertificates;
  },
  async resources() {
    return publicResources;
  },
  async submitInquiry(payload: PublicInquiryInput) {
    return publicInquiryReceiptSchema.parse(await post<PublicInquiryReceipt>("/api/public/contact", payload));
  }
};
