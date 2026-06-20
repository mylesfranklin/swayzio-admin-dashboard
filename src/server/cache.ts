import { sql } from "./db";

/**
 * Two-tier, stale-while-revalidate cache (see docs/ARCHITECTURE.md §5).
 *   L1: in-memory (per serverless instance; resets on cold start)
 *   L2: Neon `integration_cache` table (persists across instances/cold starts)
 *
 * Heavy integration fetches (Stripe pagination ~30s) never run in a user request:
 *  - fresh  → served instantly
 *  - stale  → served instantly, refreshed in the background
 *  - missing→ computed once (first hit only), then cached
 * Concurrent callers for the same key share one in-flight computation.
 */

export interface CacheMeta {
  fromCache: boolean;
  stale: boolean;
  updatedAt: string | null;
}

export interface Cached<T> {
  data: T;
  meta: CacheMeta;
}

type Entry = { data: unknown; updatedAt: number; expiresAt: number };

const memory = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

// data is considered "stale" (triggers background refresh) this long before expiry
const STALE_LEAD_MS = 5 * 60 * 1000;

async function readL2(key: string): Promise<Entry | null> {
  try {
    const rows = (await sql`
      SELECT data, extract(epoch from updated_at) * 1000 AS updated_ms,
             extract(epoch from expires_at) * 1000 AS expires_ms
      FROM integration_cache WHERE cache_key = ${key}
    `) as Array<{ data: unknown; updated_ms: number; expires_ms: number }>;
    if (!rows.length) return null;
    // Neon returns numeric/double (epoch ms) as strings — coerce so Date math and
    // new Date(...).toISOString() don't blow up ("Invalid time value").
    return { data: rows[0].data, updatedAt: Number(rows[0].updated_ms), expiresAt: Number(rows[0].expires_ms) };
  } catch (err) {
    console.error(`[cache] L2 read failed for ${key}:`, (err as Error).message);
    return null;
  }
}

async function writeL2(key: string, entry: Entry): Promise<void> {
  try {
    await sql`
      INSERT INTO integration_cache (cache_key, data, updated_at, expires_at)
      VALUES (${key}, ${JSON.stringify(entry.data)}::jsonb,
              to_timestamp(${entry.updatedAt / 1000}), to_timestamp(${entry.expiresAt / 1000}))
      ON CONFLICT (cache_key) DO UPDATE
        SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at, expires_at = EXCLUDED.expires_at
    `;
  } catch (err) {
    console.error(`[cache] L2 write failed for ${key}:`, (err as Error).message);
  }
}

function compute<T>(key: string, fn: () => Promise<T>, ttlMs: number): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = (async () => {
    const data = await fn();
    const now = Date.now();
    const entry: Entry = { data, updatedAt: now, expiresAt: now + ttlMs };
    memory.set(key, entry);
    await writeL2(key, entry);
    return data;
  })().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export async function getOrCompute<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number
): Promise<Cached<T>> {
  const now = Date.now();

  let entry = memory.get(key);
  if (!entry) {
    const l2 = await readL2(key);
    if (l2) {
      entry = l2;
      memory.set(key, l2);
    }
  }

  if (entry) {
    const stale = now >= entry.expiresAt - STALE_LEAD_MS;
    if (stale && !inflight.has(key)) {
      // refresh in the background; don't block the response
      void compute(key, fn, ttlMs).catch((e) =>
        console.error(`[cache] background refresh failed for ${key}:`, (e as Error).message)
      );
    }
    return {
      data: entry.data as T,
      meta: { fromCache: true, stale, updatedAt: new Date(entry.updatedAt).toISOString() },
    };
  }

  // cold miss — compute once
  const data = await compute(key, fn, ttlMs);
  return {
    data,
    meta: { fromCache: false, stale: false, updatedAt: new Date().toISOString() },
  };
}

/** Force a refresh now (used by the cron/refresh route). */
export async function refresh<T>(key: string, fn: () => Promise<T>, ttlMs: number): Promise<void> {
  await compute(key, fn, ttlMs);
}
