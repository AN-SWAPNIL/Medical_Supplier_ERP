import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgSchema, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type { Capability } from "../src/domains/erp.types.js";
import type { Role, UserPermissionOverride } from "../src/types/index.js";

export const erp = pgSchema("erp_private");
export const employees = erp.table("employees", {
  id: text("id").primaryKey(),
  authUserId: uuid("auth_user_id").unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").$type<Role>().notNull(),
  status: text("status").$type<"Active" | "Pending" | "Inactive">().notNull().default("Pending"),
  title: text("title").notNull().default(""),
  department: text("department").notNull().default(""),
  phone: text("phone").notNull().default(""),
  territory: text("territory").notNull().default(""),
  employeeCode: text("employee_code").notNull().unique(),
  capabilities: jsonb("capabilities").$type<Capability[]>().notNull().default([]),
  permissionOverrides: jsonb("permission_overrides").$type<UserPermissionOverride[]>().notNull().default([]),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [
  uniqueIndex("employee_email_lower_unique").on(sql`lower(${t.email})`),
  check("employee_role", sql`${t.role} in ('Super Admin','Managing Director','Accounts','Import Officer','Warehouse Manager','Sales Manager','Sales Executive')`),
  check("employee_status", sql`${t.status} in ('Active','Pending','Inactive')`),
  check("employee_json_arrays", sql`jsonb_typeof(${t.capabilities}) = 'array' and jsonb_typeof(${t.permissionOverrides}) = 'array'`)
]);

export const auditEvents = erp.table("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: text("actor_id").references(() => employees.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("audit_entity_created_idx").on(t.entityType, t.entityId, t.createdAt)]);

export const sessions = erp.table("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: text("employee_id").notNull().references(() => employees.id),
  tokenHash: text("token_hash").notNull().unique(),
  purpose: text("purpose").$type<"login" | "recovery">().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("session_employee_idx").on(t.employeeId)]);

export const documents = erp.table("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: text("employee_id").notNull().references(() => employees.id),
  uploadedBy: text("uploaded_by").notNull().references(() => employees.id),
  purpose: text("purpose").$type<"employee-avatar" | "employee-evidence">().notNull(),
  bucket: text("bucket").notNull().default("erp-documents"),
  objectPath: text("object_path").notNull().unique(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  status: text("status").$type<"Pending" | "Attached">().notNull().default("Pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attachedAt: timestamp("attached_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [check("document_size", sql`${t.sizeBytes} > 0 and ${t.sizeBytes} <= 10485760`)]);

export const rateLimits = erp.table("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
});
