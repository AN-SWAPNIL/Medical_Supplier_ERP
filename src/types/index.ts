export const roles = [
  "Super Admin",
  "Managing Director",
  "Accounts",
  "Import Officer",
  "Warehouse Manager",
  "Sales Manager",
  "Sales Executive"
] as const;

export type Role = (typeof roles)[number];

export type PermissionAction = "view" | "create" | "edit" | "delete" | "approve" | "post" | "export";

export type PermissionKey =
  | "dashboard"
  | "users"
  | "roles"
  | "master-data"
  | "suppliers"
  | "customers"
  | "products"
  | "procurement"
  | "import"
  | "shipments"
  | "customs"
  | "warehouse"
  | "inventory"
  | "sales"
  | "accounts"
  | "expenses"
  | "hr"
  | "transport"
  | "reports"
  | "ai"
  | "audit"
  | "settings"
  | "print";

export type RecordValue = string | number | boolean | string[] | null | undefined;

export type EntityRecord = {
  id: string;
  status?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: RecordValue;
};

export type ApiMeta = {
  total?: number;
  page?: number;
  pageSize?: number;
  role?: Role;
  scoped?: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  department: string;
  phone: string;
  avatarUrl: string;
  status: "Active" | "Pending" | "Inactive";
  territory?: string;
};

export type Session = {
  token: string;
  user: User;
};

export type FieldType = "text" | "number" | "date" | "select" | "textarea" | "boolean" | "tags";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  readOnly?: boolean;
};

export type ModuleConfig = {
  key: string;
  title: string;
  subtitle: string;
  entityName: string;
  route: string;
  endpoint: string;
  permission: PermissionKey;
  fields: FieldConfig[];
  tableColumns: string[];
  searchable: string[];
  filterKey?: string;
  statusKey?: string;
  descriptionKey?: string;
  printTemplate?: "quotation" | "purchase-order" | "challan" | "invoice" | "receipt" | "grn" | "payslip" | "report";
};

export type DashboardSummary = {
  role: Role;
  metrics: EntityRecord[];
  importPipeline: EntityRecord[];
  salesByTerritory: EntityRecord[];
  salesByProduct: EntityRecord[];
  salesByCustomer: EntityRecord[];
  targetVsAchievement: EntityRecord[];
  expiryAlerts: EntityRecord[];
  aiSummary: EntityRecord;
};

export type AiRecommendation = {
  id: string;
  agent: string;
  title: string;
  confidence: number;
  reason: string;
  sourceData: string;
  recommendedAction: string;
  status: "Pending" | "Approved" | "Rejected";
};

export type AiChatMessage = {
  id: string;
  sender: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: string[];
};

export type AiChatResponse = {
  answer: string;
  role: Role;
  sources: string[];
  suggestions: string[];
};
