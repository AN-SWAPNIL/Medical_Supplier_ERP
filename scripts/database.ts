import "../server/config.js";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { connectDatabase } from "../database/client.js";
import { pathToFileURL } from "node:url";

export async function backupDatabase() {
  const url = process.env.DATABASE_MIGRATION_URL;
  if (!url) throw new Error("DATABASE_MIGRATION_URL is required");
  const { client } = connectDatabase(url);
  try {
    const payload = await client.begin("isolation level repeatable read read only", async (tx) => {
      const tables = await tx<{ tablename: string }[]>`select tablename from pg_catalog.pg_tables where schemaname = 'erp_private' order by tablename`;
      const records: Record<string, unknown[]> = {};
      for (const table of tables) records[table.tablename] = [...await tx`select * from erp_private.${tx(table.tablename)}`];
      return { format: "mipro-erp-backup-v1", capturedAt: new Date().toISOString(), projectRef: new URL(process.env.SUPABASE_URL!).hostname.split(".")[0], schema: "erp_private", records };
    });
    const text = JSON.stringify(payload, null, 2);
    const folder = new URL("../artifacts/backups/", import.meta.url);
    await mkdir(folder, { recursive: true });
    const path = new URL(`database-${Date.now()}.json`, folder);
    await writeFile(path, text, { flag: "wx", mode: 0o600 });
    await writeFile(new URL(`${path.href}.sha256`), createHash("sha256").update(text).digest("hex"), { flag: "wx", mode: 0o600 });
    console.log("ERP schema backup saved under artifacts/backups; tables:", Object.keys(payload.records).length);
    return path;
  } finally { await client.end({ timeout: 3 }); }
}

async function main() {
  const command = process.argv[2];
  if (command === "backup") { await backupDatabase(); return; }
  if (command !== "migrate" || !process.argv.includes("--apply")) throw new Error("Use database.ts backup or database.ts migrate --apply");
  // Always capture the existing destination before an additive migration. Never reset/truncate.
  await backupDatabase();
  const { client, db } = connectDatabase(process.env.DATABASE_MIGRATION_URL!);
  try {
    // This dedicated session-pooler connection holds the lock across Drizzle's own transaction.
    await client`select pg_advisory_lock(77612001)`;
    try {
      await migrate(db, { migrationsFolder: "database/migrations", migrationsSchema: "erp_migrations" });
    } finally { await client`select pg_advisory_unlock(77612001)`; }
    console.log("Reviewed migrations applied; existing destination was backed up first.");
  } finally { await client.end({ timeout: 3 }); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("Database operation failed", /^[A-Z0-9_]+$/.test(error?.code ?? "") ? error.code : "Check configuration and migration SQL; credentials withheld.");
    process.exitCode = 1;
  });
}
