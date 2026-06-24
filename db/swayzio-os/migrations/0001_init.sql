-- 0001_init.sql — Swayzio OS: namespaces + extensions
-- The agent-native company brain. See docs/COMPANY-OS.md.
-- Idempotent: safe to re-run. Target: Neon Postgres 18.

-- ── Extensions ───────────────────────────────────────────────────────────────
-- pgcrypto: gen_random_uuid() for identity keys.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- citext: case-insensitive email columns (identity resolution hinges on this).
CREATE EXTENSION IF NOT EXISTS citext;
-- pg_trgm: fuzzy matching for domains / names during identity resolution.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- vector (pgvector >= 0.8.1 on PG18): memory.* embeddings, HNSW + halfvec.
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Schemas (the five namespaces) ────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS raw;      -- landing zone: append-only source snapshots + provenance
CREATE SCHEMA IF NOT EXISTS core;     -- canonical normalized entities, conformed across sources
CREATE SCHEMA IF NOT EXISTS metrics;  -- materialized rollups (instant aggregates for agents + dashboard)
CREATE SCHEMA IF NOT EXISTS memory;   -- agent-native: embeddings, facts/lessons, event log
CREATE SCHEMA IF NOT EXISTS ops;      -- control plane: sync runs, cursors, dictionary, outbox

COMMENT ON SCHEMA raw     IS 'Landing zone. Append-only raw payloads per source per sync. Replayable + provenance.';
COMMENT ON SCHEMA core    IS 'Canonical normalized entities, conformed across sources and unified by core.identity.';
COMMENT ON SCHEMA metrics IS 'Materialized daily/monthly rollups so agents and the dashboard never recompute.';
COMMENT ON SCHEMA memory  IS 'Agent-native layer: pgvector embeddings, provenance-gated facts/lessons, event log.';
COMMENT ON SCHEMA ops     IS 'Control plane: sync_runs, sync_state cursors, data_dictionary, outbox, freshness.';
