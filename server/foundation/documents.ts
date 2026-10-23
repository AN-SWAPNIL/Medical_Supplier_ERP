import { Router } from "express";
import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { documents, employees } from "../../database/schema.js";
import { canManageTargetUser } from "../../src/lib/permissions/effectiveAccess.js";
import { uploadSchema } from "./contracts.js";
import { audit, identity, toUser, type Context } from "./context.js";
import { assertAllowed, HttpError } from "./errors.js";

export function matchesFileSignature(mime: string, bytes: Uint8Array) {
  const starts = (...values: number[]) => values.every((value, i) => bytes[i] === value);
  if (mime === "application/pdf") return starts(37, 80, 68, 70, 45);
  if (mime === "image/png") return starts(137, 80, 78, 71, 13, 10, 26, 10);
  if (mime === "image/jpeg") return starts(255, 216, 255);
  if (mime === "image/webp") return starts(82, 73, 70, 70) && [87, 69, 66, 80].every((v, i) => bytes[i + 8] === v);
  return false;
}

export function createDocumentRouter(ctx: Context) {
  const router = Router();
  async function requireOwnerAccess(actor: ReturnType<typeof identity>["user"], employeeId: string) {
    const [employee] = await ctx.db.select().from(employees).where(eq(employees.id, employeeId));
    if (!employee) throw new HttpError(404, "Employee not found.");
    assertAllowed(actor.id === employee.id || canManageTargetUser(actor, toUser(employee)));
  }

  router.post("/uploads", async (req, res) => {
    const input = uploadSchema.parse(req.body);
    const actor = identity(res).user;
    await requireOwnerAccess(actor, input.employeeId);
    const id = randomUUID();
    const objectPath = `employees/${input.employeeId}/${id}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await ctx.db.transaction(async (tx) => {
      await tx.insert(documents).values({ ...input, id, uploadedBy: actor.id, objectPath, expiresAt });
      await audit(tx, actor.id, "Upload authorized", "Document", id, { employeeId: input.employeeId, purpose: input.purpose });
    });
    const { data, error } = await ctx.admin.storage.from("erp-documents").createSignedUploadUrl(objectPath, { upsert: false });
    if (error) throw new HttpError(502, "Storage upload authorization is unavailable. Retry with a new upload request.");
    res.status(201).json({ success: true, data: { id, bucket: "erp-documents", path: objectPath, token: data.token, signedUrl: data.signedUrl, expiresAt }, message: "Upload directly to Storage, then complete this upload" });
  });

  router.post("/uploads/:id/complete", async (req, res) => {
    const actor = identity(res).user;
    const [row] = await ctx.db.select().from(documents).where(eq(documents.id, String(req.params.id)));
    if (!row) throw new HttpError(404, "Upload not found.");
    await requireOwnerAccess(actor, row.employeeId);
    assertAllowed(actor.id === row.uploadedBy, "Only the authorized uploader can complete this upload.");
    if (row.status === "Attached") return res.json({ success: true, data: { id: row.id }, message: "Upload already attached" });
    if (row.expiresAt < new Date()) throw new HttpError(409, "Upload authorization expired. Create a new upload request.");
    const bucket = ctx.admin.storage.from(row.bucket);
    const { data: file, error } = await bucket.download(row.objectPath);
    if (error || !file) throw new HttpError(409, "The authorized file has not been uploaded.");
    if (file.size !== row.sizeBytes || file.type.split(";")[0] !== row.mimeType || !matchesFileSignature(row.mimeType, new Uint8Array(await file.slice(0, 16).arrayBuffer()))) {
      throw new HttpError(422, "Uploaded file size, type or signature does not match the authorization.");
    }
    await ctx.db.transaction(async (tx) => {
      const [attached] = await tx.update(documents).set({ status: "Attached", attachedAt: new Date() })
        .where(and(eq(documents.id, row.id), eq(documents.status, "Pending"))).returning();
      if (attached) await audit(tx, actor.id, "Document attached", "Document", row.id);
    });
    res.json({ success: true, data: { id: row.id }, message: "Document attached" });
  });

  router.get("/documents/:id", async (req, res) => {
    const actor = identity(res).user;
    const [row] = await ctx.db.select().from(documents).where(and(eq(documents.id, String(req.params.id)), eq(documents.status, "Attached")));
    if (!row) throw new HttpError(404, "Document not found.");
    await requireOwnerAccess(actor, row.employeeId);
    const { data, error } = await ctx.admin.storage.from(row.bucket).createSignedUrl(row.objectPath, 60);
    if (error) throw new HttpError(502, "Document access is temporarily unavailable.");
    await audit(ctx.db, actor.id, "Document opened", "Document", row.id);
    res.json({ success: true, data: { id: row.id, fileName: row.fileName, mimeType: row.mimeType, sizeBytes: row.sizeBytes, url: data.signedUrl, expiresIn: 60 }, message: "Temporary document access granted" });
  });

  router.get("/profile/avatar", async (_req, res) => {
    const actor = identity(res).user;
    const [row] = await ctx.db.select().from(documents).where(and(eq(documents.employeeId, actor.id), eq(documents.purpose, "employee-avatar"), eq(documents.status, "Attached"))).orderBy(sql`${documents.attachedAt} desc`).limit(1);
    if (!row) return res.json({ success: true, data: null, message: "No profile photo" });
    const { data, error } = await ctx.admin.storage.from(row.bucket).createSignedUrl(row.objectPath, 60);
    if (error) throw new HttpError(502, "Profile photo is temporarily unavailable.");
    res.json({ success: true, data: { url: data.signedUrl, expiresIn: 60 }, message: "Profile photo loaded" });
  });
  return router;
}
