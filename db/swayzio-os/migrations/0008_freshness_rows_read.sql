-- 0008_freshness_rows_read.sql — expose rows_read in the freshness view
-- The original ops.data_freshness (0002) omitted rows_read; the sync orchestrator selects it.
-- Recreate with both row counters. Idempotent.

DROP VIEW IF EXISTS ops.data_freshness;
CREATE VIEW ops.data_freshness AS
SELECT DISTINCT ON (source, entity)
  source, entity, status, started_at, finished_at, duration_ms, rows_read, rows_written,
  (now() - started_at) AS age
FROM ops.sync_runs
ORDER BY source, entity, started_at DESC;
COMMENT ON VIEW ops.data_freshness IS 'Most recent run per feed (incl. row counts) — staleness at a glance.';
