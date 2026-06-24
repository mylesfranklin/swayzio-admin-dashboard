-- 0009_api_views.sql — Phase D: the curated agent/Data-API query surface
-- Canonical PostgREST pattern: a dedicated `api` schema of read-only views over core/metrics.
-- The Neon Data API exposes ONLY this schema; agents query documented views, never raw tables.
-- Views are SECURITY INVOKER off (PG default) → they run with the owner's rights, so the
-- `authenticated` role needs SELECT on the views only, not on core/metrics. Idempotent.

CREATE SCHEMA IF NOT EXISTS api;
COMMENT ON SCHEMA api IS 'Curated read-only surface exposed via the Neon Data API. Agents query here, not core/*.';

-- ── identity_360: one row per person, unified across Stripe + HubSpot + app ───
-- The company brain's headline view. Scalar subqueries keep it 1 row/identity.
CREATE OR REPLACE VIEW api.identity_360 AS
SELECT
  i.id                                                                              AS identity_id,
  i.email,
  i.display_name,
  i.primary_domain,
  i.is_personal,
  EXISTS (SELECT 1 FROM core.customer c     WHERE c.identity_id  = i.id)            AS in_stripe,
  EXISTS (SELECT 1 FROM core.contact ct     WHERE ct.identity_id = i.id)            AS in_hubspot,
  EXISTS (SELECT 1 FROM core.app_customer a WHERE a.identity_id  = i.id)            AS in_app,
  (SELECT min(c.id)        FROM core.customer c     WHERE c.identity_id  = i.id)    AS stripe_customer_id,
  (SELECT count(*)::int    FROM core.subscription s WHERE s.identity_id = i.id AND s.status = 'active')                       AS active_subs,
  (SELECT round(coalesce(sum(monthly_cents),0)/100) FROM core.subscription s WHERE s.identity_id = i.id AND s.status = 'active') AS mrr,
  (SELECT ct.artist_name   FROM core.contact ct     WHERE ct.identity_id = i.id ORDER BY ct.tagged_tracks DESC LIMIT 1)      AS artist_name,
  (SELECT max(ct.tagged_tracks)::int FROM core.contact ct WHERE ct.identity_id = i.id)                                       AS tagged_tracks,
  (SELECT ct.pro           FROM core.contact ct     WHERE ct.identity_id = i.id AND ct.pro IS NOT NULL LIMIT 1)              AS pro,
  (SELECT bool_or(ct.subscribed)     FROM core.contact ct WHERE ct.identity_id = i.id)                                       AS hubspot_subscribed,
  (SELECT bool_or(ct.signed_to_deal) FROM core.contact ct WHERE ct.identity_id = i.id)                                       AS signed_to_deal,
  (SELECT min(a.owner_id)  FROM core.app_customer a WHERE a.identity_id  = i.id)    AS app_owner_id
FROM core.identity i;
COMMENT ON VIEW api.identity_360 IS 'One row per person unified across Stripe/HubSpot/app: in_* flags, mrr, active_subs, tracks, pro, etc.';

-- ── High-value accounts (payers and/or catalog builders), ranked ──────────────
CREATE OR REPLACE VIEW api.top_accounts AS
SELECT * FROM api.identity_360
WHERE coalesce(mrr,0) > 0 OR coalesce(tagged_tracks,0) > 0
ORDER BY coalesce(mrr,0) DESC, coalesce(tagged_tracks,0) DESC;
COMMENT ON VIEW api.top_accounts IS 'identity_360 filtered to payers/catalog-builders, ranked by MRR then tracks.';

-- ── Latest daily snapshots (instant headline reads) ───────────────────────────
CREATE OR REPLACE VIEW api.stripe_snapshot  AS SELECT * FROM metrics.stripe_daily  ORDER BY day DESC LIMIT 1;
CREATE OR REPLACE VIEW api.hubspot_snapshot AS SELECT * FROM metrics.hubspot_daily ORDER BY day DESC LIMIT 1;
CREATE OR REPLACE VIEW api.app_snapshot     AS SELECT * FROM metrics.app_daily     ORDER BY day DESC LIMIT 1;
COMMENT ON VIEW api.stripe_snapshot  IS 'Latest metrics.stripe_daily row — MRR/active/paying/collection/churn.';
COMMENT ON VIEW api.hubspot_snapshot IS 'Latest metrics.hubspot_daily row — contacts/artists/subscribed/catalog.';
COMMENT ON VIEW api.app_snapshot     IS 'Latest metrics.app_daily row — billing customers/track owners/live tracks.';

-- ── Time series ───────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW api.revenue_monthly AS
SELECT month_start, label, revenue, charges FROM metrics.stripe_revenue_monthly ORDER BY month_start;
COMMENT ON VIEW api.revenue_monthly IS 'Real collected revenue per month (net of refunds), trailing 12 months.';

-- ── Self-orientation: the dictionary, queryable over the Data API ─────────────
CREATE OR REPLACE VIEW api.data_dictionary AS
SELECT schema_name, table_name, column_name, description FROM ops.data_dictionary
ORDER BY schema_name, table_name, column_name;
COMMENT ON VIEW api.data_dictionary IS 'Plain-English description of every table/column so an agent boots oriented.';

-- ── Freshness, exposed ────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW api.freshness AS
SELECT source, entity, status, finished_at, rows_written, age FROM ops.data_freshness;
COMMENT ON VIEW api.freshness IS 'Most recent sync per feed — how fresh the brain is.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('api','identity_360',    '*', 'One row per person unified across Stripe/HubSpot/app. THE company-brain view.'),
  ('api','top_accounts',    '*', 'identity_360 filtered to payers/catalog-builders, ranked.'),
  ('api','stripe_snapshot', '*', 'Latest Stripe daily snapshot (MRR/active/paying/collection/churn).'),
  ('api','hubspot_snapshot','*', 'Latest HubSpot daily snapshot (contacts/artists/subscribed/catalog).'),
  ('api','app_snapshot',    '*', 'Latest Swayzio-Core daily snapshot (customers/owners/tracks).'),
  ('api','revenue_monthly', '*', 'Collected revenue per month, trailing 12 months.'),
  ('api','data_dictionary', '*', 'This dictionary, exposed over the Data API.'),
  ('api','freshness',       '*', 'Most recent sync per feed.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE SET description = EXCLUDED.description, updated_at = now();
