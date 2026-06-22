import { appDb } from "@/server/db/app";

/**
 * Swayzio-Core database introspection for the "Neon Data Lake" page. Reads pg_stat_*
 * + size functions + light aggregates through the read-only dashboard_ro role. Cheap
 * (sub-second), so cached near-live. Read-only; never writes.
 */

// table → domain grouping (the 8 product domains of the app DB)
const DOMAIN: Record<string, string> = {
  tracks: "Catalog", assets: "Catalog", track_versions: "Catalog", upload_intents: "Catalog",
  track_audio_embeddings: "Intelligence", track_audio_embedding_failures: "Intelligence",
  track_retrieval_embeddings: "Intelligence", track_semantic_enrichment: "Intelligence",
  track_search_documents: "Intelligence", track_lyrics_sections: "Intelligence",
  track_lyrics_segments: "Intelligence", track_document_extractions: "Intelligence",
  media_intelligence_dispatches: "Intelligence",
  track_split_entries: "Rights", track_split_sheets: "Rights", track_split_publisher_collections: "Rights",
  track_split_sheet_share_links: "Rights", track_rights_entries: "Rights", track_rights_status: "Rights",
  collaborators: "Rights",
  packs: "Packs", pack_tracks: "Packs", pack_share_settings: "Packs", pack_access_grants: "Packs",
  pack_invitation_deliveries: "Packs", pack_media_assets: "Packs", pack_tracking_links: "Packs",
  saved_packs: "Packs", track_share_links: "Packs",
  libraries: "Libraries", library_tracks: "Libraries", library_shares: "Libraries",
  billing_subscriptions: "Billing", billing_customers: "Billing", billing_entitlements: "Billing", billing_events: "Billing",
  ingestion_runs: "Pipeline", ingestion_run_stages: "Pipeline", processing_jobs: "Pipeline",
  workflow_outbox: "Pipeline", workflow_runs: "Pipeline", agent_actions: "Pipeline",
  events: "Events",
  external_tracking_links: "Tracking", external_tracking_events: "Tracking",
  schema_migrations: "Meta",
};
const domainOf = (t: string) => DOMAIN[t] ?? "Other";

const n = (v: unknown) => Number(v ?? 0);

export interface TableStat {
  name: string;
  domain: string;
  rows: number;
  totalBytes: number;
  tableBytes: number;
  indexBytes: number;
}
export interface DbStats {
  overview: {
    dbBytes: number; dbSize: string; tables: number; indexes: number; foreignKeys: number;
    totalRows: number; extensions: string[]; pgVersion: string;
    owners: number; liveTracks: number; deletedTracks: number; embeddings: number;
    collaborators: number; packs: number; splitEntries: number; events: number;
    latestWrite: string | null;
  };
  tables: TableStat[];
  domains: Array<{ domain: string; rows: number; bytes: number; tables: number }>;
  pipeline: {
    processingJobs: Array<{ status: string; n: number }>;
    ingestionRuns: Array<{ status: string; n: number }>;
    embeddingCoveragePct: number;
  };
  schemaHub: Array<{ table: string; refs: number }>;
}

export async function getDbStats(): Promise<DbStats> {
  const sql = appDb();
  const [ov, tbl, depth, exts, pj, ir, hub, ver] = await Promise.all([
    sql`SELECT pg_database_size(current_database())::bigint AS db_bytes,
        pg_size_pretty(pg_database_size(current_database())) AS db_size,
        (SELECT count(*) FROM pg_stat_user_tables)::int AS tables,
        (SELECT count(*) FROM pg_indexes WHERE schemaname='public')::int AS indexes,
        (SELECT count(*) FROM pg_constraint WHERE contype='f')::int AS fks,
        (SELECT coalesce(sum(n_live_tup),0)::bigint FROM pg_stat_user_tables) AS total_rows`,
    sql`SELECT relname AS name, n_live_tup::int AS rows,
        pg_total_relation_size(relid)::bigint AS total_bytes,
        pg_relation_size(relid)::bigint AS table_bytes,
        pg_indexes_size(relid)::bigint AS index_bytes
        FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC`,
    sql`SELECT (SELECT count(DISTINCT owner_id) FROM tracks)::int AS owners,
        (SELECT count(*) FROM tracks WHERE deleted_at IS NULL)::int AS live_tracks,
        (SELECT count(*) FROM tracks WHERE deleted_at IS NOT NULL)::int AS deleted_tracks,
        (SELECT count(*) FROM track_audio_embeddings)::int AS embeddings,
        (SELECT count(*) FROM collaborators)::int AS collaborators,
        (SELECT count(*) FROM packs)::int AS packs,
        (SELECT count(*) FROM track_split_entries)::int AS splits,
        (SELECT max(created_at) FROM tracks) AS latest_write`,
    sql`SELECT extname FROM pg_extension WHERE extname <> 'plpgsql' ORDER BY extname`,
    sql`SELECT status, count(*)::int AS n FROM processing_jobs GROUP BY status ORDER BY 2 DESC`,
    sql`SELECT status, count(*)::int AS n FROM ingestion_runs GROUP BY status ORDER BY 2 DESC`,
    sql`SELECT confrelid::regclass::text AS table, count(*)::int AS refs FROM pg_constraint WHERE contype='f' GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
    sql`SELECT current_setting('server_version') AS v`,
  ]);

  const tables: TableStat[] = (tbl as Array<Record<string, unknown>>).map((r) => ({
    name: String(r.name), domain: domainOf(String(r.name)), rows: n(r.rows),
    totalBytes: n(r.total_bytes), tableBytes: n(r.table_bytes), indexBytes: n(r.index_bytes),
  }));

  const byDomain = new Map<string, { rows: number; bytes: number; tables: number }>();
  for (const t of tables) {
    const d = byDomain.get(t.domain) ?? { rows: 0, bytes: 0, tables: 0 };
    d.rows += t.rows; d.bytes += t.totalBytes; d.tables += 1;
    byDomain.set(t.domain, d);
  }
  const domains = [...byDomain.entries()]
    .map(([domain, v]) => ({ domain, ...v }))
    .sort((a, b) => b.bytes - a.bytes);

  const o = (ov as Array<Record<string, unknown>>)[0];
  const d = (depth as Array<Record<string, unknown>>)[0];
  const liveTracks = n(d.live_tracks);
  const embeddings = n(d.embeddings);

  return {
    overview: {
      dbBytes: n(o.db_bytes), dbSize: String(o.db_size), tables: n(o.tables), indexes: n(o.indexes),
      foreignKeys: n(o.fks), totalRows: n(o.total_rows),
      extensions: (exts as Array<{ extname: string }>).map((e) => e.extname),
      pgVersion: String((ver as Array<{ v: string }>)[0].v).split(" ")[0],
      owners: n(d.owners), liveTracks, deletedTracks: n(d.deleted_tracks), embeddings,
      collaborators: n(d.collaborators), packs: n(d.packs), splitEntries: n(d.splits),
      events: tables.find((t) => t.name === "events")?.rows ?? 0,
      latestWrite: d.latest_write ? new Date(d.latest_write as string).toISOString() : null,
    },
    tables,
    domains,
    pipeline: {
      processingJobs: (pj as Array<Record<string, unknown>>).map((r) => ({ status: String(r.status), n: n(r.n) })),
      ingestionRuns: (ir as Array<Record<string, unknown>>).map((r) => ({ status: String(r.status), n: n(r.n) })),
      embeddingCoveragePct: liveTracks > 0 ? Math.round((embeddings / liveTracks) * 1000) / 10 : 0,
    },
    schemaHub: (hub as Array<Record<string, unknown>>).map((r) => ({ table: String(r.table), refs: n(r.refs) })),
  };
}

// Catalog ingestion — tracks created per month (gap-filled, last 18 months).
export interface MonthlyIngest { month: string; tracks: number }
export async function getCatalogIngestion(): Promise<MonthlyIngest[]> {
  const sql = appDb();
  const rows = (await sql`
    SELECT to_char(m, 'Mon YY') AS month, coalesce(t.cnt, 0)::int AS tracks
    FROM generate_series(date_trunc('month', now()) - interval '17 months', date_trunc('month', now()), interval '1 month') AS m
    LEFT JOIN (SELECT date_trunc('month', created_at) AS mm, count(*) AS cnt FROM tracks
               WHERE created_at >= date_trunc('month', now()) - interval '17 months' GROUP BY 1) t ON t.mm = m
    ORDER BY m`) as Array<{ month: string; tracks: number }>;
  return rows.map((r) => ({ month: r.month, tracks: n(r.tracks) }));
}
