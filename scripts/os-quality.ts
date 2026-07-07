/**
 * Data-quality gate for Swayzio OS.
 *
 *   npm run os:quality
 */
try {
  process.loadEnvFile(".env.local");
} catch {
  /* rely on ambient env */
}

import { osSql } from "@/server/os/db";

const sql = osSql();
let failures = 0;

const health = (await sql`
  SELECT source, entity, status, stale_8h, rows_read, rows_written, finished_at::text AS finished_at
  FROM api.sync_health
`) as Array<{ source: string; entity: string; status: string; stale_8h: boolean; rows_read: number; rows_written: number; finished_at: string | null }>;

const quality = (await sql`
  SELECT source, entity, source_rows, neon_rows, row_delta, null_identity_rows, null_identity_pct,
         null_email_rows, null_email_pct
  FROM api.data_quality
`) as Array<{
  source: string;
  entity: string;
  source_rows: number;
  neon_rows: number;
  row_delta: number;
  null_identity_rows: number;
  null_identity_pct: number;
  null_email_rows: number;
  null_email_pct: number;
}>;

console.log("Sync health:");
for (const row of health) {
  const ok = row.status === "ok" && !row.stale_8h;
  if (!ok) failures++;
  console.log(
    `  ${ok ? "✓" : "✗"} ${row.source}/${row.entity} ${row.status} ` +
      `read=${row.rows_read} wrote=${row.rows_written} finished=${row.finished_at ?? "never"}`,
  );
}

console.log("\nData quality:");
for (const row of quality) {
  const dictionaryGap = row.source === "schema" && row.entity === "dictionary" && row.null_identity_rows > 0;
  const impossibleCoverage = row.source !== "schema" && Math.abs(Number(row.row_delta)) > Math.max(25, Number(row.source_rows) * 0.05);
  const ok = !dictionaryGap && !impossibleCoverage;
  if (!ok) failures++;
  console.log(
    `  ${ok ? "✓" : "✗"} ${row.source}/${row.entity} ` +
      `source=${row.source_rows} neon=${row.neon_rows} delta=${row.row_delta} ` +
      `identity_gap=${row.null_identity_rows} (${row.null_identity_pct}%) email_gap=${row.null_email_rows} (${row.null_email_pct}%)`,
  );
}

console.log(failures === 0 ? "\n✓ QUALITY CHECKS PASSED" : `\n✗ ${failures} quality check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
