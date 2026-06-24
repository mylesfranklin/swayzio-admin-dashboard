/**
 * Swayzio-Core app ELT feed → Swayzio OS.  Reads the app DB read-only (SWAYZIO_APP_DATABASE_URL)
 * and lands billing_customers → core.app_customer (identity-resolved by email). This is the
 * authoritative app ↔ Stripe link (owner_id ↔ stripe_customer_id ↔ email) + metrics.app_daily.
 */
import { appDb } from "@/server/db/app";
import { osSql } from "../db";
import { withSyncRun } from "../sync";
import { chunk, resolveIdentities, landRaw } from "../load";

interface BillingRow {
  owner_id: string;
  email: string | null;
  stripe_customer_id: string | null;
  created_at: string | null;
}

export async function syncAppCustomers() {
  return withSyncRun("app_db", "billing_customer", async (ctx) => {
    const app = appDb();
    const os = osSql();
    const rows = (await app`
      SELECT owner_id, email, stripe_customer_id, created_at
      FROM billing_customers
      WHERE owner_id IS NOT NULL
    `) as BillingRow[];
    ctx.read(rows.length);

    // de-dup by owner_id (primary key in core.app_customer)
    const m = new Map<string, BillingRow>();
    for (const r of rows) m.set(r.owner_id, r);
    const deduped = [...m.values()];

    for (const batch of chunk(deduped, 500)) {
      await landRaw(os, "app_db", "billing_customer", ctx.runId, batch.map((r) => ({ sourceId: r.owner_id, payload: r })));
      await resolveIdentities(os, "app_db", batch.map((r) => ({ sourceId: r.owner_id, email: r.email, name: null })));
      await os`
        INSERT INTO core.app_customer (owner_id, email, stripe_customer_id, created_at, identity_id)
        SELECT u.owner_id, NULLIF(u.email,'')::citext, NULLIF(u.stripe_customer_id,''), u.created_at::timestamptz, i.id
        FROM unnest(
          ${batch.map((r) => r.owner_id)}::text[], ${batch.map((r) => r.email)}::text[],
          ${batch.map((r) => r.stripe_customer_id)}::text[], ${batch.map((r) => r.created_at)}::text[]
        ) AS u(owner_id, email, stripe_customer_id, created_at)
        LEFT JOIN core.identity i ON i.email = NULLIF(u.email,'')::citext
        ON CONFLICT (owner_id) DO UPDATE SET
          email=EXCLUDED.email, stripe_customer_id=EXCLUDED.stripe_customer_id,
          created_at=EXCLUDED.created_at, identity_id=EXCLUDED.identity_id, synced_at=now()
      `;
      ctx.wrote(batch.length);
    }
    ctx.setCursor(new Date().toISOString());
  });
}

/** metrics.app_daily — product snapshot read live from the app DB. */
export async function refreshAppDaily() {
  const app = appDb();
  const os = osSql();
  const [s] = (await app`
    SELECT
      (SELECT count(*) FROM billing_customers)                                   AS billing_customers,
      (SELECT count(DISTINCT owner_id) FROM tracks WHERE deleted_at IS NULL)      AS owners_with_tracks,
      (SELECT count(*) FROM tracks WHERE deleted_at IS NULL)                      AS live_tracks,
      (SELECT count(*) FROM tracks WHERE deleted_at IS NOT NULL)                  AS deleted_tracks
  `) as Array<Record<string, number>>;

  await os`
    INSERT INTO metrics.app_daily (day, billing_customers, owners_with_tracks, live_tracks, deleted_tracks)
    VALUES (current_date, ${Number(s.billing_customers)}, ${Number(s.owners_with_tracks)}, ${Number(s.live_tracks)}, ${Number(s.deleted_tracks)})
    ON CONFLICT (day) DO UPDATE SET
      billing_customers=EXCLUDED.billing_customers, owners_with_tracks=EXCLUDED.owners_with_tracks,
      live_tracks=EXCLUDED.live_tracks, deleted_tracks=EXCLUDED.deleted_tracks, computed_at=now()
  `;
}

export async function syncApp() {
  await syncAppCustomers();
  await refreshAppDaily();
}
