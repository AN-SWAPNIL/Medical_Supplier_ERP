import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

export function connectDatabase(url: string) {
  const client = postgres(url, { max: 1, prepare: false, ssl: "require", connect_timeout: 10, idle_timeout: 20, connection: { statement_timeout: 15000 } });
  return { client, db: drizzle(client, { schema }) };
}
export type Database = ReturnType<typeof connectDatabase>["db"];
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
