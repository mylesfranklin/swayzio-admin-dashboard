/**
 * Self-contained Swayzio OS read client for the eve agent.
 *
 * Deliberately NOT importing from src/server/os/* — eve's `lib/` is import-only and bundled with the
 * agent service, and a cross-agent-root import is an unverified bundling risk (PHASE-F-EVE.md §1).
 * Read-only by convention AND by role (F3): prefers SWAYZIO_OS_AGENT_RO_URL — the os_agent_ro
 * Postgres role with SELECT on api.* and EXECUTE on memory.recall only — so even a buggy or
 * compromised tool physically cannot write or read core/raw/ops. Falls back to the owner URL
 * only where the RO var isn't set (e.g. an env not yet migrated).
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function osSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const url = process.env.SWAYZIO_OS_AGENT_RO_URL ?? process.env.SWAYZIO_OS_DATABASE_URL;
  if (!url) throw new Error("SWAYZIO_OS_AGENT_RO_URL / SWAYZIO_OS_DATABASE_URL is not set — the agent cannot reach Swayzio OS.");
  _sql = neon(url);
  return _sql;
}
