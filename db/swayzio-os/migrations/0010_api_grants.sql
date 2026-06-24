-- 0010_api_grants.sql — Data API access control for the `api` schema
-- Founders-only model: the Data API's `authenticated` role (valid Clerk JWT) gets read access to
-- the curated views; the `anonymous` role gets nothing. Views run with owner rights (PG default),
-- so authenticated needs SELECT on the views only, not on core/metrics. Idempotent.

GRANT USAGE ON SCHEMA api TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA api TO authenticated;          -- views count as tables here
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT SELECT ON TABLES TO authenticated;

-- Explicitly deny the unauthenticated role (defense in depth — it has no grant anyway).
REVOKE ALL ON SCHEMA api FROM anonymous;
