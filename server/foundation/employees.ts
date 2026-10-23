import { Router } from "express";
import { and, asc, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { auditEvents, employees, sessions } from "../../database/schema.js";
import { canAssignRole, canGrantCapability, canGrantPermission, canManageEmployees, canManageTargetUser, canManageUserAccess, hasEffectivePermission, normalizePermissionOverrides } from "../../src/lib/permissions/effectiveAccess.js";
import { accessSchema, inviteSchema, profileSchema } from "./contracts.js";
import { audit, identity, toUser, type Context } from "./context.js";
import { assertAllowed, HttpError } from "./errors.js";

export function createEmployeeRouter(ctx: Context) {
  const router = Router();
  router.get("/me", (req, res) => {
    const actor = identity(res);
    res.json({ success: true, data: { token: actor.token, user: actor.user }, message: "Current access loaded" });
  });
  router.patch("/profile", async (req, res) => {
    const body = profileSchema.parse(req.body);
    const actor = identity(res);
    const row = await ctx.db.transaction(async (tx) => {
      const [row] = await tx.update(employees).set({ ...body, updatedAt: new Date(), version: sql`${employees.version} + 1` }).where(and(eq(employees.id, actor.user.id), eq(employees.status, "Active"))).returning();
      if (!row) throw new HttpError(401, "This employee account is inactive.");
      await audit(tx, actor.user.id, "Profile updated", "Employee", row.id);
      return row;
    });
    res.json({ success: true, data: toUser(row), message: "Profile updated" });
  });

  router.get("/employees", async (req, res) => {
    assertAllowed(hasEffectivePermission(identity(res).user, "users", "view"));
    const page = Math.max(1, Math.min(10000, Number(req.query.page) || 1));
    const rows = await ctx.db.select().from(employees).orderBy(asc(employees.name), asc(employees.id)).limit(100).offset((page - 1) * 100);
    res.json({ success: true, data: rows.map((row) => ({ ...toUser(row), version: row.version })), message: "Employees loaded", meta: { page, pageSize: 100 } });
  });

  router.post("/employees/invite", async (req, res) => {
    const input = inviteSchema.parse(req.body);
    const actor = identity(res);
    // Reserve the employee first. A failed mail send leaves a resumable Pending record, not an orphan privileged identity.
    const row = await ctx.db.transaction(async (tx) => {
      const [current] = await tx.select().from(employees).where(eq(employees.id, actor.user.id)).for("update");
      assertAllowed(current && canManageEmployees(toUser(current), "create") && canAssignRole(toUser(current), input.role));
      const [existing] = await tx.select().from(employees).where(eq(employees.email, input.email)).for("update");
      if (existing) throw new HttpError(409, "This employee already exists. Use its invitation retry action.");
      const [row] = await tx.insert(employees).values({ ...input, id: `emp-${randomUUID()}`, status: "Pending" }).returning();
      await audit(tx, current.id, "Employee invitation reserved", "Employee", row.id, { role: row.role });
      return row;
    });
    const sent = await sendInvitation(row.id);
    res.status(sent ? 201 : 202).json({ success: true, data: { id: row.id, invitationSent: sent }, message: sent ? "Employee invited" : "Employee saved as Pending; invitation delivery needs retry/configuration." });
  });

  async function sendInvitation(employeeId: string) {
    return ctx.db.transaction(async (tx) => {
      const [row] = await tx.select().from(employees).where(eq(employees.id, employeeId)).for("update");
      if (!row || row.status !== "Pending") throw new HttpError(409, "Only Pending employees can be invited.");
      if (row.authUserId) throw new HttpError(409, "Invitation already issued. Use the provider's recovery flow for a replacement link.");
      const { data, error } = await ctx.admin.auth.admin.inviteUserByEmail(row.email, { redirectTo: `${ctx.config.origin}/reset-password`, data: { name: row.name } });
      if (error || !data.user) {
        await audit(tx, null, "Invitation delivery failed", "Employee", row.id);
        return false;
      }
      await tx.update(employees).set({ authUserId: data.user.id, updatedAt: new Date() }).where(eq(employees.id, row.id));
      await audit(tx, null, "Invitation sent", "Employee", row.id);
      return true;
    });
  }

  router.post("/employees/:id/invite", async (req, res) => {
    const [row] = await ctx.db.select().from(employees).where(eq(employees.id, String(req.params.id)));
    assertAllowed(row && canManageEmployees(identity(res).user, "create") && canAssignRole(identity(res).user, row.role));
    const sent = await sendInvitation(row.id);
    res.status(sent ? 200 : 202).json({ success: true, data: { id: row.id, invitationSent: sent }, message: sent ? "Invitation sent" : "Invitation delivery failed; Pending employee preserved." });
  });

  router.patch("/employees/:id/access", async (req, res) => {
    const input = accessSchema.parse(req.body);
    const actor = identity(res);
    const updated = await ctx.db.transaction(async (tx) => {
      const [actorRow] = await tx.select().from(employees).where(eq(employees.id, actor.user.id)).for("update");
      if (!actorRow) throw new HttpError(401, "Employee not found.");
      const current = toUser(actorRow);
      assertAllowed(current.status === "Active" && canManageUserAccess(current));
      const [target] = await tx.select().from(employees).where(eq(employees.id, String(req.params.id))).for("update");
      if (!target) throw new HttpError(404, "Employee not found.");
      assertAllowed(canManageTargetUser(current, toUser(target)) && canAssignRole(current, input.role));
      assertAllowed(input.capabilities.every((capability) => canGrantCapability(current, capability)) && input.permissionOverrides.every((override) => canGrantPermission(current, override.permission, override.action, override.effect)));
      if (target.version !== input.version) throw new HttpError(409, "Access changed since this record was opened. Reload before saving.");
      const [row] = await tx.update(employees).set({ role: input.role, status: input.status, capabilities: [...new Set(input.capabilities)], permissionOverrides: normalizePermissionOverrides(input.permissionOverrides), version: target.version + 1, updatedAt: new Date() }).where(eq(employees.id, target.id)).returning();
      await tx.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.employeeId, target.id));
      await audit(tx, current.id, "Employee access changed", "Employee", target.id, { reason: input.reason, before: { role: target.role, status: target.status, capabilities: target.capabilities, permissionOverrides: target.permissionOverrides }, after: { role: row.role, status: row.status, capabilities: row.capabilities, permissionOverrides: row.permissionOverrides } });
      return row;
    });
    res.json({ success: true, data: { ...toUser(updated), version: updated.version }, message: "Access updated; existing sessions revoked" });
  });

  router.get("/audit", async (_req, res) => {
    const user = identity(res).user;
    assertAllowed(user.role === "Super Admin" && hasEffectivePermission(user, "reports", "view"));
    const rows = await ctx.db.select().from(auditEvents).orderBy(sql`${auditEvents.createdAt} desc`, sql`${auditEvents.id} desc`).limit(100);
    res.json({ success: true, data: rows, message: "Latest audit events loaded" });
  });
  return router;
}
