/**
 * Swayzio OS migration runner — plain SQL, zero ORM, agent-legible.
 *
 *   npx tsx scripts/os-migrate.ts            # apply pending migrations
 *   npx tsx scripts/os-migrate.ts --status   # list applied vs pending, no writes
 *   npx tsx scripts/os-migrate.ts --dry-run  # show what would run, no writes
 *
 * Connects to SWAYZIO_OS_DATABASE_URL (separate from the dashboard's DATABASE_URL).
 * Each file in db/swayzio-os/migrations/*.sql runs inside one transaction and is
 * recorded in ops.schema_migrations with a checksum. Files are immutable once applied;
 * editing an applied file is flagged as drift (regenerate as a new migration instead).
 *
 * No-friction workflow for risky changes: point SWAYZIO_OS_DATABASE_URL at a throwaway
 * Neon branch, run this, verify, then run against the primary branch.
 */
import { Pool, neonConfig } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "db", "swayzio-os", "migrations");

// Standalone tsx scripts don't get Next.js's .env loading; pull .env.local ourselves
// (Node >= 20.6 built-in, zero deps). Real env always wins (CI / Vercel).
try {
  process.loadEnvFile(".env.local");
} catch {
  /* no .env.local — rely on the ambient environment */
}

const args = new Set(process.argv.slice(2));
const STATUS = args.has("--status");
const DRY_RUN = args.has("--dry-run");

const url = process.env.SWAYZIO_OS_DATABASE_URL;
if (!url) {
  console.error("✗ SWAYZIO_OS_DATABASE_URL is not set. Add it to .env.local (see db/swayzio-os/README.md).");
  process.exit(1);
}

// Neon Pool/Client talk over WebSockets. Node >= 22 (this repo runs 24) has a global
// WebSocket, so no polyfill is needed; fall back to `ws` on older runtimes if present.
if (typeof (globalThis as { WebSocket?: unknown }).WebSocket === "undefined") {
  try {
    const ws = await import("ws");
    neonConfig.webSocketConstructor = ws.default;
  } catch {
    console.error("✗ No global WebSocket and `ws` is not installed. Use Node >= 22 or `npm i -D ws`.");
    process.exit(1);
  }
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);

const pool = new Pool({ connectionString: url });

try {
  // Bootstrap the ledger (decoupled from the migrations themselves to avoid a chicken/egg).
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ops;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ops.schema_migrations (
      id         text PRIMARY KEY,
      checksum   text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    );`);

  const applied = new Map<string, string>(
    (await pool.query<{ id: string; checksum: string }>(`SELECT id, checksum FROM ops.schema_migrations`)).rows.map(
      (r) => [r.id, r.checksum],
    ),
  );

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();

  let pending = 0;
  for (const file of files) {
    const id = file.replace(/\.sql$/, "");
    const text = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    const checksum = sha256(text);

    if (applied.has(id)) {
      if (applied.get(id) !== checksum) {
        console.warn(`⚠ ${id} was edited after it was applied (checksum drift). Add a new migration instead.`);
      } else if (STATUS) {
        console.log(`✓ ${id}  (applied)`);
      }
      continue;
    }

    pending++;
    if (STATUS || DRY_RUN) {
      console.log(`• ${id}  (pending)`);
      continue;
    }

    process.stdout.write(`→ applying ${id} … `);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(text); // runs the whole file, incl. dollar-quoted functions
      await client.query(`INSERT INTO ops.schema_migrations (id, checksum) VALUES ($1, $2)`, [id, checksum]);
      await client.query("COMMIT");
      console.log("done");
    } catch (err) {
      await client.query("ROLLBACK");
      console.log("failed");
      console.error(`✗ ${id} rolled back:`, err instanceof Error ? err.message : err);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  if (STATUS || DRY_RUN) console.log(`\n${pending} pending, ${applied.size} applied.`);
  else if (pending === 0) console.log("Nothing to apply — Swayzio OS schema is up to date.");
  else console.log(`\n✓ Applied ${pending} migration(s).`);
} finally {
  await pool.end();
}
