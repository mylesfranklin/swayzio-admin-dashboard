/**
 * Swayzio OS data-access client (the company brain — separate from the dashboard DB).
 *
 * Uses the Neon serverless driver's HTTP query function: ideal for serverless/edge,
 * one round-trip per call. Built against driver 1.x semantics (template-only `sql`,
 * with `.query()` for manual params and a `.transaction()` for batched writes).
 *
 * Reads SWAYZIO_OS_DATABASE_URL. Lazily initialized so importing this module never
 * throws in the dashboard (which doesn't set that env).
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

/** The Swayzio OS SQL tag. Usage: `await osSql()\`SELECT ...\``. */
export function osSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const url = process.env.SWAYZIO_OS_DATABASE_URL;
  if (!url) {
    throw new Error("SWAYZIO_OS_DATABASE_URL is not set — Swayzio OS is not provisioned yet. See db/swayzio-os/README.md.");
  }
  _sql = neon(url);
  return _sql;
}
