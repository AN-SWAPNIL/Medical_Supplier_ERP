export type PublicProductCategory =
  | "Hemodialysis"
  | "Puncture & Access"
  | "Catheter & Airway"
  | "Protective Products";

export type PublicProductSpecification = {
  label: string;
  value: string;
};

export type PublicProduct = {
  slug: string;
  legacySlug: string;
  name: string;
  category: PublicProductCategory;
  shortDescription: string;
  description: string;
  brand: string;
  manufacturer?: string;
  intendedApplication: string;
  images: string[];
  imageAlt: string;
  features: string[];
  variants: string[];
  specifications: PublicProductSpecification[];
  certificateIds: string[];
  featured: boolean;
  published: boolean;
};

export type PublicProductCategoryRecord = {
  name: PublicProductCategory;
  description: string;
  image: string;
};

export type PublicCertificate = {
  id: string;
  title: string;
  type: string;
  documentOwner: string;
  manufacturer: string;
  scope: string;
  summary: string;
  relatedProducts: string[];
  relatedProductSlugs: string[];
  status: "Current" | "Expired" | "Historical reference";
  issuedOn?: string;
  validUntil?: string;
  statusNote: string;
  file: {
    url: string;
    mediaType: "image/jpeg";
    alt: string;
    downloadName: string;
    sourceUrl: string;
  };
};

export type PublicResource = {
  slug: string;
  kind: "Clinical resource" | "Product guide" | "Company update";
  title: string;
  summary: string;
  body: string[];
  image: string;
};

export type PublicInquiryInput = {
  name: string;
  organization?: string;
  phone: string;
  email?: string;
  subject?: string;
  productInterest?: string;
  message: string;
};

export type PublicInquiryReceipt = {
  inquiryId: string;
  receivedAt: string;
  status: "Received";
};
