import { neon } from "@neondatabase/serverless";

/**
 * Neon serverless SQL client (HTTP driver). One-shot queries over HTTP — ideal
 * for serverless route handlers. No ORM (see docs/DECISIONS.md); plain tagged-
 * template SQL with parameter binding.
 *
 *   const rows = await sql`SELECT * FROM t WHERE id = ${id}`;
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

export const sql = neon(getDatabaseUrl());
