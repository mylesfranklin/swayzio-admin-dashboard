/**
 * Bulk-load helpers for ELT feeds. Everything is SET-BASED via `unnest($arrays)` so a batch of
 * N rows costs a handful of round-trips, not N. Identity resolution happens in SQL (upsert by
 * email, link each source record) — the scalable form of core.resolve_identity().
 */
import type { NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export interface IdentityRow {
  sourceId: string;
  email: string | null;
  name: string | null;
}

/**
 * Resolve + link a batch to core.identity (by email) and maintain core.company. After this,
 * a projection upsert can set identity_id by joining core.identity on email.
 * Input must be de-duplicated by sourceId (build rows from a Map keyed by id).
 */
export async function resolveIdentities(sql: Sql, source: string, rows: IdentityRow[]): Promise<void> {
  if (rows.length === 0) return;
  const sourceIds = rows.map((r) => r.sourceId);
  const emails = rows.map((r) => r.email);
  const names = rows.map((r) => r.name);

  // 1. Identities from distinct emails in the batch (DISTINCT ON avoids "affect row twice").
  await sql`
    INSERT INTO core.identity (email, display_name, primary_domain, is_personal)
    SELECT DISTINCT ON (lower(u.email))
           u.email::citext,
           u.name,
           NULLIF(split_part(lower(u.email), '@', 2), ''),
           core.is_personal_domain(NULLIF(split_part(lower(u.email), '@', 2), ''))
    FROM unnest(${emails}::text[], ${names}::text[]) AS u(email, name)
    WHERE u.email IS NOT NULL AND u.email <> ''
    ORDER BY lower(u.email)
    ON CONFLICT (email) DO UPDATE
      SET last_seen_at   = now(),
          display_name   = COALESCE(core.identity.display_name, EXCLUDED.display_name),
          primary_domain = COALESCE(core.identity.primary_domain, EXCLUDED.primary_domain)
  `;

  // 2. Companies for non-personal, non-internal domains.
  await sql`
    INSERT INTO core.company (domain)
    SELECT DISTINCT d FROM (
      SELECT NULLIF(split_part(lower(email), '@', 2), '') AS d
      FROM unnest(${emails}::text[]) AS u(email)
      WHERE email IS NOT NULL AND email <> ''
    ) s
    WHERE d IS NOT NULL AND d <> 'swayzio.com' AND NOT core.is_personal_domain(d)
    ON CONFLICT (domain) DO UPDATE SET last_seen_at = now()
  `;

  // 3. Link each source record to its identity (by email).
  await sql`
    INSERT INTO core.identity_link (source, source_id, identity_id, source_email)
    SELECT ${source}, u.source_id, i.id, u.email::citext
    FROM unnest(${sourceIds}::text[], ${emails}::text[]) AS u(source_id, email)
    JOIN core.identity i ON i.email = u.email::citext
    WHERE u.email IS NOT NULL AND u.email <> ''
    ON CONFLICT (source, source_id) DO UPDATE
      SET identity_id = EXCLUDED.identity_id, source_email = EXCLUDED.source_email, linked_at = now()
  `;
}

/** Land verbatim payloads in the raw zone (append-only) with provenance. */
export async function landRaw(
  sql: Sql,
  source: string,
  entity: string,
  runId: number,
  records: { sourceId: string; payload: unknown }[],
): Promise<void> {
  if (records.length === 0) return;
  const ids = records.map((r) => r.sourceId);
  const payloads = records.map((r) => JSON.stringify(r.payload));
  await sql`
    INSERT INTO raw.records (source, entity, source_id, payload, sync_run_id)
    SELECT ${source}, ${entity}, u.id, u.payload::jsonb, ${runId}
    FROM unnest(${ids}::text[], ${payloads}::text[]) AS u(id, payload)
  `;
}
