-- 0002_ops.sql — Swayzio OS control plane
-- The plumbing every feed and agent relies on. See docs/COMPANY-OS.md §5–§7.
-- Idempotent.

-- ── Raw landing zone ─────────────────────────────────────────────────────────
-- One append-only row per fetched source record. Never updated; the replayable
-- audit log. Transform steps read the latest payload per (source, entity, source_id).
CREATE TABLE IF NOT EXISTS raw.records (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source      text        NOT NULL,            -- 'stripe' | 'hubspot' | 'app_db' | ...
  entity      text        NOT NULL,            -- 'subscription' | 'contact' | 'track' | ...
  source_id   text        NOT NULL,            -- the id within that source
  payload     jsonb       NOT NULL,            -- the raw object, verbatim
  fetched_at  timestamptz NOT NULL DEFAULT now(),
  sync_run_id bigint                           -- FK-by-convention to ops.sync_runs.id
);
COMMENT ON TABLE raw.records IS 'Append-only landing zone: verbatim source payloads with provenance. Never mutated.';
-- "latest snapshot per source object" lookups + replay by run.
CREATE INDEX IF NOT EXISTS raw_records_latest_idx
  ON raw.records (source, entity, source_id, fetched_at DESC);
CREATE INDEX IF NOT EXISTS raw_records_run_idx ON raw.records (sync_run_id);

-- ── Sync runs (the heartbeat ledger) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ops.sync_runs (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source        text        NOT NULL,
  entity        text        NOT NULL,
  status        text        NOT NULL DEFAULT 'running'
                  CHECK (status IN ('running','ok','error')),
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz,
  duration_ms   integer GENERATED ALWAYS AS
                  (CASE WHEN finished_at IS NULL THEN NULL
                        ELSE (EXTRACT(EPOCH FROM (finished_at - started_at)) * 1000)::int END) STORED,
  rows_read     integer     NOT NULL DEFAULT 0,
  rows_written  integer     NOT NULL DEFAULT 0,
  cursor_before text,
  cursor_after  text,
  error         text,
  meta          jsonb       NOT NULL DEFAULT '{}'::jsonb
);
COMMENT ON TABLE ops.sync_runs IS 'One row per ELT run. Status/counts/cursor movement/duration. Driven by the external scheduler.';
CREATE INDEX IF NOT EXISTS sync_runs_recent_idx ON ops.sync_runs (source, entity, started_at DESC);

-- ── Sync state (incremental cursors) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ops.sync_state (
  source     text        NOT NULL,
  entity     text        NOT NULL,
  cursor     text,                              -- opaque to the control plane (timestamp, id, page token...)
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source, entity)
);
COMMENT ON TABLE ops.sync_state IS 'Per-feed incremental cursor so each run only pulls new/changed data.';

-- ── Outbox (atomic side-effect intent) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS ops.outbox (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  aggregate    text        NOT NULL,            -- what the event is about, e.g. 'identity:<uuid>'
  event_type   text        NOT NULL,
  payload      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz                      -- NULL until a relay ships it
);
COMMENT ON TABLE ops.outbox IS 'Side-effect intents committed in the same txn as the data write; a relay publishes later.';
CREATE INDEX IF NOT EXISTS outbox_unpublished_idx ON ops.outbox (created_at) WHERE published_at IS NULL;

-- ── Data dictionary (agent self-orientation; an llms.txt for our own schema) ──
CREATE TABLE IF NOT EXISTS ops.data_dictionary (
  schema_name  text NOT NULL,
  table_name   text NOT NULL,
  column_name  text NOT NULL DEFAULT '*',       -- '*' = the table itself
  description  text NOT NULL,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (schema_name, table_name, column_name)
);
COMMENT ON TABLE ops.data_dictionary IS 'Plain-English description of every table/column so an agent boots oriented in one query.';

-- ── Freshness view (one glance at "is the brain up to date") ──────────────────
CREATE OR REPLACE VIEW ops.data_freshness AS
SELECT DISTINCT ON (source, entity)
  source, entity, status, started_at, finished_at, duration_ms, rows_written,
  (now() - started_at) AS age
FROM ops.sync_runs
ORDER BY source, entity, started_at DESC;
COMMENT ON VIEW ops.data_freshness IS 'Most recent run per feed — staleness at a glance.';
