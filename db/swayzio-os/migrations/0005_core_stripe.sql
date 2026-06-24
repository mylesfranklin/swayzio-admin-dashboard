-- 0005_core_stripe.sql — Phase B: Stripe entities + daily metrics
-- Fed by src/server/os/feeds/stripe.ts. Math ported verbatim from
-- src/server/integrations/stripe.ts (monthly_cents = normalized monthly, USD only; 0 for non-USD).
-- Idempotent.

CREATE TABLE IF NOT EXISTS core.customer (
  id          text PRIMARY KEY,                                   -- stripe customer id (cus_…)
  identity_id uuid REFERENCES core.identity(id) ON DELETE SET NULL,
  email       citext,
  name        text,
  currency    text,
  created_at  timestamptz,
  synced_at   timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.customer IS 'Stripe customers (those with subscriptions), linked to core.identity by email.';
CREATE INDEX IF NOT EXISTS customer_identity_idx ON core.customer(identity_id);

CREATE TABLE IF NOT EXISTS core.subscription (
  id                   text PRIMARY KEY,                          -- stripe subscription id (sub_…)
  customer_id          text REFERENCES core.customer(id) ON DELETE SET NULL,
  identity_id          uuid REFERENCES core.identity(id) ON DELETE SET NULL,
  status               text NOT NULL,
  currency             text,
  monthly_cents        numeric NOT NULL DEFAULT 0,                -- normalized monthly (USD; 0 if non-USD)
  interval             text,
  interval_count       int,
  plan                 text,
  latest_invoice_status text,                                     -- 'paid' = real biller; 'void' = broken billing
  current_period_end   timestamptz,
  created_at           timestamptz,
  canceled_at          timestamptz,
  synced_at            timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.subscription IS 'Stripe subscriptions. monthly_cents = list-price normalized to monthly, USD only (matches stripe.ts).';
CREATE INDEX IF NOT EXISTS subscription_identity_idx ON core.subscription(identity_id);
CREATE INDEX IF NOT EXISTS subscription_status_idx ON core.subscription(status);

-- Daily headline snapshot — one row per day. Mirrors getStripeDashboard() exactly; the dashboard
-- can read this instead of recomputing. mrr/active/paying/etc. are derived from core.subscription.
CREATE TABLE IF NOT EXISTS metrics.stripe_daily (
  day                       date PRIMARY KEY,
  mrr                       numeric,
  mrr_annualized            numeric,
  active_subs               int,
  paying_subs               int,
  paying_mrr                numeric,
  paying_rate_pct           numeric,
  void_invoice_subs         int,
  past_due_subs             int,
  past_due_mrr_at_risk      numeric,
  paused_subs               int,
  non_usd_active            int,
  customers                 int,
  collected_last_full_month numeric,
  collection_rate_pct       numeric,
  revenue_12mo              numeric,
  canceled_30d              int,
  churn_rate_pct            numeric,
  computed_at               timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE metrics.stripe_daily IS 'Daily Stripe headline snapshot (one row/day). Mirrors getStripeDashboard(); read instead of recompute.';

-- Real collected revenue per month (succeeded charges − refunds), 12-month trailing. From getRevenueMetrics().
CREATE TABLE IF NOT EXISTS metrics.stripe_revenue_monthly (
  month_start date PRIMARY KEY,
  label       text NOT NULL,                                      -- "Jun 26"
  revenue     numeric NOT NULL,                                   -- $ net
  charges     int NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE metrics.stripe_revenue_monthly IS 'Real collected revenue per month (net of refunds), trailing 12 months.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('core',   'customer',                '*', 'Stripe customers (with subs), linked to core.identity by email.'),
  ('core',   'subscription',            '*', 'Stripe subscriptions. monthly_cents = monthly-normalized list price (USD only).'),
  ('metrics','stripe_daily',            '*', 'Daily Stripe headline snapshot — mrr/active/paying/past_due/collection/churn. One row/day.'),
  ('metrics','stripe_revenue_monthly',  '*', 'Real collected revenue per month (charges − refunds), trailing 12 months.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE SET description = EXCLUDED.description, updated_at = now();
