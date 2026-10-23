import { loadEnvFile } from "node:process";
import { z } from "zod";

try { loadEnvFile(); } catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const schema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  DATABASE_URL: z.string().startsWith("postgres"),
  APP_URL: z.url().default("http://localhost:5173")
});

export function backendConfig() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) throw new Error(`Backend configuration missing/invalid: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  const value = parsed.data;
  const appUrl = new URL(value.APP_URL);
  if (process.env.VERCEL && (!process.env.APP_URL || appUrl.protocol !== "https:")) throw new Error("Vercel foundation deployments require an explicit HTTPS APP_URL");
  if (appUrl.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(appUrl.hostname)) throw new Error("APP_URL must use HTTPS outside localhost");
  return { ...value, origin: appUrl.origin, secureCookies: appUrl.protocol === "https:" };
}

export function isFoundationMode() {
  const mode = process.env.ERP_BACKEND_MODE ?? "mock";
  if (!["mock", "foundation"].includes(mode)) throw new Error("Invalid ERP_BACKEND_MODE");
  if (mode === "foundation" && (process.env.DEMO_MODE === "true" || process.env.VITE_DEMO_MODE === "true")) throw new Error("Foundation mode cannot enable demo identities");
  return mode === "foundation";
}
