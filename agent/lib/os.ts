/**
 * Self-contained Swayzio OS read client for the eve agent.
 *
 * Deliberately NOT importing from src/server/os/* — eve's `lib/` is import-only and bundled with the
 * agent service, and a cross-agent-root import is an unverified bundling risk (PHASE-F-EVE.md §1).
 * This is ~6 lines of the same logic, reading the same SWAYZIO_OS_DATABASE_URL. Read-only by
 * convention: tools only ever SELECT from the `api.*` views and call `memory.recall`.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function osSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const url = process.env.SWAYZIO_OS_DATABASE_URL;
  if (!url) throw new Error("SWAYZIO_OS_DATABASE_URL is not set — the agent cannot reach Swayzio OS.");
  _sql = neon(url);
  return _sql;
}
