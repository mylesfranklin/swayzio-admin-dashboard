/**
 * Swayzio OS sync orchestrator. Runs ELT feeds and prints the run ledger.
 *
 *   npx tsx scripts/os-sync.ts              # all feeds
 *   npx tsx scripts/os-sync.ts stripe       # just Stripe
 *   npx tsx scripts/os-sync.ts hubspot app  # a subset
 *
 * Loads .env.local (SWAYZIO_OS_DATABASE_URL, source creds). External scheduler entry point —
 * the same functions can be called from /api/cron/refresh later (see docs/COMPANY-OS.md §6).
 */
try {
  process.loadEnvFile(".env.local");
} catch {
  /* rely on ambient env */
}

import { syncStripe } from "@/server/os/feeds/stripe";
import { syncHubspot } from "@/server/os/feeds/hubspot";
import { syncApp } from "@/server/os/feeds/app";
import { syncMercury } from "@/server/os/feeds/mercury";
import { syncFacebook } from "@/server/os/feeds/facebook";
import { osSql } from "@/server/os/db";

const FEEDS: Record<string, () => Promise<void>> = {
  stripe: syncStripe,
  hubspot: syncHubspot,
  app: syncApp,
  mercury: syncMercury,
  facebook: syncFacebook,
};

const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const names = requested.length ? requested : Object.keys(FEEDS);

const unknown = names.filter((n) => !FEEDS[n]);
if (unknown.length) {
  console.error(`Unknown feed(s): ${unknown.join(", ")}. Valid: ${Object.keys(FEEDS).join(", ")}`);
  process.exit(1);
}

for (const name of names) {
  const t0 = Date.now();
  process.stdout.write(`→ syncing ${name} … `);
  try {
    await FEEDS[name]();
    console.log(`done (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  } catch (err) {
    console.log("failed");
    console.error(`✗ ${name}:`, err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}

// Print the freshness ledger
const sql = osSql();
const runs = (await sql`
  SELECT source, entity, status, rows_read, rows_written, duration_ms
  FROM ops.data_freshness ORDER BY source, entity
`) as Array<Record<string, unknown>>;
console.log("\nops.data_freshness:");
for (const r of runs) {
  console.log(`  ${r.source}/${r.entity}: ${r.status} · read ${r.rows_read} · wrote ${r.rows_written} · ${r.duration_ms}ms`);
}
