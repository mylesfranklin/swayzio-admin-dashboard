/**
 * withSyncRun — the reusable ELT primitive. Every feed (Stripe, HubSpot, app DB)
 * wraps its work in this so the heartbeat ledger (ops.sync_runs) and incremental
 * cursor (ops.sync_state) are handled identically and for free.
 *
 *   await withSyncRun("stripe", "subscription", async (ctx) => {
 *     const since = ctx.cursor;                 // last cursor, or null on first run
 *     const rows = await fetchFromStripe(since);
 *     ctx.read(rows.length);
 *     for (const r of rows) { ...upsert raw→core→metrics...; ctx.wrote(1); }
 *     ctx.setCursor(newCursor);                 // advances ops.sync_state on success
 *   });
 *
 * On success the run is marked 'ok' and the cursor is persisted; on throw it's marked
 * 'error' (with the message) and the cursor is left untouched so the next run retries.
 */
import { osSql } from "./db";

export interface SyncCtx {
  /** The cursor stored for this (source, entity) before the run, or null. */
  readonly runId: number;
  cursor: string | null;
  /** Add to rows_read. */
  read(n: number): void;
  /** Add to rows_written. */
  wrote(n: number): void;
  /** Stage the new cursor; persisted to ops.sync_state only if the run succeeds. */
  setCursor(next: string | null): void;
}

export async function withSyncRun(
  source: string,
  entity: string,
  fn: (ctx: SyncCtx) => Promise<void>,
  meta: Record<string, unknown> = {},
): Promise<{ runId: number; rowsRead: number; rowsWritten: number }> {
  const sql = osSql();

  const stateRows = (await sql`
    SELECT cursor FROM ops.sync_state WHERE source = ${source} AND entity = ${entity}
  `) as { cursor: string | null }[];
  const cursorBefore = stateRows[0]?.cursor ?? null;

  const insertRows = (await sql`
    INSERT INTO ops.sync_runs (source, entity, cursor_before, meta)
    VALUES (${source}, ${entity}, ${cursorBefore}, ${JSON.stringify(meta)}::jsonb)
    RETURNING id
  `) as { id: number }[];
  const runId = insertRows[0].id;

  let rowsRead = 0;
  let rowsWritten = 0;
  let nextCursor: string | null = cursorBefore ?? null;

  const ctx: SyncCtx = {
    runId,
    cursor: cursorBefore ?? null,
    read: (n) => { rowsRead += n; },
    wrote: (n) => { rowsWritten += n; },
    setCursor: (next) => { nextCursor = next; },
  };

  try {
    await fn(ctx);

    await sql`
      UPDATE ops.sync_runs
      SET status = 'ok', finished_at = now(),
          rows_read = ${rowsRead}, rows_written = ${rowsWritten}, cursor_after = ${nextCursor}
      WHERE id = ${runId}
    `;
    await sql`
      INSERT INTO ops.sync_state (source, entity, cursor, updated_at)
      VALUES (${source}, ${entity}, ${nextCursor}, now())
      ON CONFLICT (source, entity) DO UPDATE SET cursor = EXCLUDED.cursor, updated_at = now()
    `;
    return { runId, rowsRead, rowsWritten };
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    await sql`
      UPDATE ops.sync_runs
      SET status = 'error', finished_at = now(),
          rows_read = ${rowsRead}, rows_written = ${rowsWritten}, error = ${message}
      WHERE id = ${runId}
    `;
    throw err;
  }
}
