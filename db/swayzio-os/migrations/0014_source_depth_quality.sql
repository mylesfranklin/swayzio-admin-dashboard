-- 0014_source_depth_quality.sql — deeper Stripe/HubSpot coverage + quality views.
-- Keeps the existing OS shape: raw landing records, normalized core tables, metrics/api views.
-- HubSpot expands to contacts + companies only; deals are intentionally excluded.
-- Idempotent.

-- ── HubSpot: full contacts + companies ─────────────────────────────────────
ALTER TABLE core.contact
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS company_id text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS jobtitle text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS company_type text,
  ADD COLUMN IF NOT EXISTS acquisition_channel text,
  ADD COLUMN IF NOT EXISTS last_login timestamptz,
  ADD COLUMN IF NOT EXISTS raw_properties jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS contact_created_idx ON core.contact(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_company_id_idx ON core.contact(company_id);

CREATE TABLE IF NOT EXISTS core.hubspot_company (
  id             text PRIMARY KEY,
  domain         text,
  name           text,
  website        text,
  industry       text,
  city           text,
  state          text,
  country        text,
  created_at     timestamptz,
  updated_at     timestamptz,
  raw_properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at      timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.hubspot_company IS 'HubSpot companies. Deals are intentionally out of scope for this dashboard.';
CREATE INDEX IF NOT EXISTS hubspot_company_domain_idx ON core.hubspot_company(domain);

CREATE TABLE IF NOT EXISTS core.hubspot_contact_company (
  contact_id text NOT NULL REFERENCES core.contact(id) ON DELETE CASCADE,
  company_id text NOT NULL REFERENCES core.hubspot_company(id) ON DELETE CASCADE,
  association_type text NOT NULL DEFAULT 'company',
  is_primary boolean NOT NULL DEFAULT false,
  synced_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, company_id, association_type)
);
COMMENT ON TABLE core.hubspot_contact_company IS 'HubSpot contact-company associations. Deals intentionally excluded.';
CREATE INDEX IF NOT EXISTS hubspot_contact_company_company_idx ON core.hubspot_contact_company(company_id);

ALTER TABLE metrics.hubspot_daily
  ADD COLUMN IF NOT EXISTS companies int,
  ADD COLUMN IF NOT EXISTS contacts_missing_email int;

-- ── Stripe: source-depth entities ───────────────────────────────────────────
ALTER TABLE core.subscription
  ADD COLUMN IF NOT EXISTS price_id text;

CREATE TABLE IF NOT EXISTS core.stripe_product (
  id          text PRIMARY KEY,
  name        text,
  active      boolean,
  created_at  timestamptz,
  updated_at  timestamptz,
  raw         jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at   timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.stripe_product IS 'Stripe products, normalized from the catalog API.';

CREATE TABLE IF NOT EXISTS core.stripe_price (
  id             text PRIMARY KEY,
  product_id     text REFERENCES core.stripe_product(id) ON DELETE SET NULL,
  active         boolean,
  currency       text,
  unit_amount    bigint,
  recurring_interval text,
  interval_count int,
  nickname       text,
  created_at     timestamptz,
  raw            jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at      timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.stripe_price IS 'Stripe prices/plans, linked to products when available.';
CREATE INDEX IF NOT EXISTS stripe_price_product_idx ON core.stripe_price(product_id);

CREATE TABLE IF NOT EXISTS core.stripe_coupon (
  id              text PRIMARY KEY,
  name            text,
  percent_off     numeric,
  amount_off      bigint,
  currency        text,
  duration        text,
  valid           boolean,
  created_at      timestamptz,
  raw             jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at       timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.stripe_coupon IS 'Stripe coupons/discount instruments.';

CREATE TABLE IF NOT EXISTS core.stripe_invoice (
  id                text PRIMARY KEY,
  customer_id       text REFERENCES core.customer(id) ON DELETE SET NULL,
  subscription_id   text REFERENCES core.subscription(id) ON DELETE SET NULL,
  identity_id       uuid REFERENCES core.identity(id) ON DELETE SET NULL,
  status            text,
  currency          text,
  amount_due        bigint,
  amount_paid       bigint,
  amount_remaining  bigint,
  total             bigint,
  subtotal          bigint,
  created_at        timestamptz,
  finalized_at      timestamptz,
  paid_at           timestamptz,
  hosted_invoice_url text,
  raw               jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at         timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.stripe_invoice IS 'Stripe invoices with customer/subscription/identity links.';
CREATE INDEX IF NOT EXISTS stripe_invoice_customer_idx ON core.stripe_invoice(customer_id);
CREATE INDEX IF NOT EXISTS stripe_invoice_created_idx ON core.stripe_invoice(created_at DESC);

CREATE TABLE IF NOT EXISTS core.stripe_charge (
  id                     text PRIMARY KEY,
  customer_id             text REFERENCES core.customer(id) ON DELETE SET NULL,
  invoice_id              text REFERENCES core.stripe_invoice(id) ON DELETE SET NULL,
  balance_transaction_id  text,
  identity_id             uuid REFERENCES core.identity(id) ON DELETE SET NULL,
  status                  text,
  currency                text,
  amount                  bigint,
  amount_refunded         bigint,
  refunded                boolean,
  paid                    boolean,
  created_at              timestamptz,
  raw                     jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at               timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.stripe_charge IS 'Stripe charges; amount fields are minor units.';
CREATE INDEX IF NOT EXISTS stripe_charge_customer_idx ON core.stripe_charge(customer_id);
CREATE INDEX IF NOT EXISTS stripe_charge_created_idx ON core.stripe_charge(created_at DESC);

CREATE TABLE IF NOT EXISTS core.stripe_refund (
  id                     text PRIMARY KEY,
  charge_id               text REFERENCES core.stripe_charge(id) ON DELETE SET NULL,
  balance_transaction_id  text,
  status                  text,
  currency                text,
  amount                  bigint,
  reason                  text,
  created_at              timestamptz,
  raw                     jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at               timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.stripe_refund IS 'Stripe refunds linked to charges when available.';
CREATE INDEX IF NOT EXISTS stripe_refund_charge_idx ON core.stripe_refund(charge_id);
CREATE INDEX IF NOT EXISTS stripe_refund_created_idx ON core.stripe_refund(created_at DESC);

CREATE TABLE IF NOT EXISTS core.stripe_balance_transaction (
  id           text PRIMARY KEY,
  source_id    text,
  type         text,
  reporting_category text,
  currency     text,
  amount       bigint,
  fee          bigint,
  net          bigint,
  status       text,
  available_on timestamptz,
  created_at   timestamptz,
  raw          jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.stripe_balance_transaction IS 'Stripe balance transactions for reconciliation/cash movement analysis.';
CREATE INDEX IF NOT EXISTS stripe_balance_transaction_created_idx ON core.stripe_balance_transaction(created_at DESC);
CREATE INDEX IF NOT EXISTS stripe_balance_transaction_source_idx ON core.stripe_balance_transaction(source_id);

-- ── Quality + health views ─────────────────────────────────────────────────
CREATE OR REPLACE VIEW api.sync_health AS
SELECT
  source,
  entity,
  status,
  started_at,
  finished_at,
  duration_ms,
  rows_read,
  rows_written,
  age,
  (status <> 'ok') AS has_error,
  (finished_at IS NULL OR finished_at < now() - interval '8 hours') AS stale_8h
FROM ops.data_freshness
ORDER BY source, entity;
COMMENT ON VIEW api.sync_health IS 'Feed health with stale/error flags. Default stale threshold is 8 hours.';

CREATE OR REPLACE VIEW api.data_quality AS
WITH checks AS (
  SELECT 'stripe'::text AS source, 'subscription'::text AS entity,
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='stripe' AND entity='subscription') r)::bigint AS source_rows,
         (SELECT count(*) FROM core.subscription)::bigint AS neon_rows,
         (SELECT count(*) FROM core.subscription WHERE identity_id IS NULL)::bigint AS null_identity_rows,
         0::bigint AS null_email_rows
  UNION ALL
  SELECT 'stripe', 'customer',
         (SELECT count(*) FROM core.customer)::bigint,
         (SELECT count(*) FROM core.customer)::bigint,
         (SELECT count(*) FROM core.customer WHERE identity_id IS NULL)::bigint,
         (SELECT count(*) FROM core.customer WHERE email IS NULL)::bigint
  UNION ALL
  SELECT 'stripe', 'invoice',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='stripe' AND entity='invoice') r)::bigint,
         (SELECT count(*) FROM core.stripe_invoice)::bigint,
         (SELECT count(*) FROM core.stripe_invoice WHERE identity_id IS NULL AND customer_id IS NOT NULL)::bigint,
         0::bigint
  UNION ALL
  SELECT 'stripe', 'charge',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='stripe' AND entity='charge') r)::bigint,
         (SELECT count(*) FROM core.stripe_charge)::bigint,
         (SELECT count(*) FROM core.stripe_charge WHERE identity_id IS NULL AND customer_id IS NOT NULL)::bigint,
         0::bigint
  UNION ALL
  SELECT 'hubspot', 'contact',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='hubspot' AND entity='contact') r)::bigint,
         (SELECT count(*) FROM core.contact)::bigint,
         (SELECT count(*) FROM core.contact WHERE identity_id IS NULL)::bigint,
         (SELECT count(*) FROM core.contact WHERE email IS NULL)::bigint
  UNION ALL
  SELECT 'hubspot', 'company',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='hubspot' AND entity='company') r)::bigint,
         (SELECT count(*) FROM core.hubspot_company)::bigint,
         0::bigint,
         0::bigint
),
dictionary AS (
  SELECT 'schema'::text AS source, 'dictionary'::text AS entity,
         count(*)::bigint AS source_rows,
         count(d.*)::bigint AS neon_rows,
         (count(*) - count(d.*))::bigint AS null_identity_rows,
         0::bigint AS null_email_rows
  FROM information_schema.tables t
  LEFT JOIN ops.data_dictionary d
    ON d.schema_name = t.table_schema
   AND d.table_name = t.table_name
   AND d.column_name = '*'
  WHERE t.table_schema IN ('core','metrics','api')
    AND t.table_type IN ('BASE TABLE','VIEW')
)
SELECT
  source,
  entity,
  source_rows,
  neon_rows,
  (source_rows - neon_rows) AS row_delta,
  null_identity_rows,
  CASE WHEN neon_rows > 0 THEN round((null_identity_rows::numeric / neon_rows) * 100, 2) ELSE 0 END AS null_identity_pct,
  null_email_rows,
  CASE WHEN neon_rows > 0 THEN round((null_email_rows::numeric / neon_rows) * 100, 2) ELSE 0 END AS null_email_pct
FROM checks
UNION ALL
SELECT
  source,
  entity,
  source_rows,
  neon_rows,
  (source_rows - neon_rows),
  null_identity_rows,
  CASE WHEN source_rows > 0 THEN round((null_identity_rows::numeric / source_rows) * 100, 2) ELSE 0 END,
  null_email_rows,
  0::numeric
FROM dictionary
ORDER BY source, entity;
COMMENT ON VIEW api.data_quality IS 'Source-vs-Neon row coverage, identity/email gaps, and data dictionary coverage.';

CREATE OR REPLACE VIEW api.stripe_finance_snapshot AS
SELECT
  (SELECT count(*) FROM core.stripe_invoice)::int AS invoices,
  (SELECT count(*) FROM core.stripe_charge)::int AS charges,
  (SELECT count(*) FROM core.stripe_refund)::int AS refunds,
  (SELECT count(*) FROM core.stripe_balance_transaction)::int AS balance_transactions,
  (SELECT coalesce(sum(amount_paid),0) FROM core.stripe_invoice WHERE status='paid')::numeric / 100 AS paid_invoice_total,
  (SELECT coalesce(sum(amount - amount_refunded),0) FROM core.stripe_charge WHERE status='succeeded')::numeric / 100 AS net_charge_total,
  (SELECT coalesce(sum(amount),0) FROM core.stripe_refund WHERE status='succeeded')::numeric / 100 AS refunded_total;
COMMENT ON VIEW api.stripe_finance_snapshot IS 'Stripe source-depth counts and cash totals from normalized invoices/charges/refunds/balance transactions.';

CREATE OR REPLACE VIEW api.stripe_subscription_mix AS
SELECT
  status,
  interval,
  count(*)::int AS subscriptions,
  round(coalesce(sum(monthly_cents),0) / 100, 2) AS mrr
FROM core.subscription
GROUP BY status, interval
ORDER BY subscriptions DESC, status, interval;
COMMENT ON VIEW api.stripe_subscription_mix IS 'Stripe subscriptions grouped by status and billing interval.';

CREATE OR REPLACE VIEW api.stripe_top_subscriptions AS
SELECT
  s.id,
  coalesce(c.name, c.email::text, s.customer_id) AS customer,
  s.plan,
  s.status,
  round(s.monthly_cents / 100, 2) AS amount,
  s.current_period_end AS next_billing_date
FROM core.subscription s
LEFT JOIN core.customer c ON c.id = s.customer_id
WHERE s.status = 'active'
ORDER BY s.monthly_cents DESC
LIMIT 100;
COMMENT ON VIEW api.stripe_top_subscriptions IS 'Top active Stripe subscriptions by normalized monthly value.';

CREATE OR REPLACE VIEW api.stripe_billing_monthly AS
SELECT
  date_trunc('month', coalesce(bt.created_at, ch.created_at))::date AS month_start,
  count(DISTINCT ch.id)::int AS charge_count,
  count(DISTINCT r.id)::int AS refund_count,
  round(coalesce(sum(ch.amount),0)::numeric / 100, 2) AS gross_charged,
  round(coalesce(sum(ch.amount_refunded),0)::numeric / 100, 2) AS refunded,
  round(coalesce(sum(ch.amount - ch.amount_refunded),0)::numeric / 100, 2) AS net_collected,
  round(coalesce(sum(bt.fee),0)::numeric / 100, 2) AS stripe_fees,
  round(coalesce(sum(bt.net),0)::numeric / 100, 2) AS net_after_fees
FROM core.stripe_charge ch
LEFT JOIN core.stripe_refund r ON r.charge_id = ch.id
LEFT JOIN core.stripe_balance_transaction bt ON bt.id = ch.balance_transaction_id
GROUP BY 1
ORDER BY 1;
COMMENT ON VIEW api.stripe_billing_monthly IS 'Monthly Stripe ledger: gross charges, refunds, fees, and net cash.';

CREATE OR REPLACE VIEW api.stripe_product_catalog AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  p.active AS product_active,
  pr.id AS price_id,
  pr.active AS price_active,
  pr.currency,
  round(pr.unit_amount::numeric / 100, 2) AS unit_amount,
  pr.recurring_interval,
  pr.interval_count,
  pr.nickname,
  count(s.*) FILTER (WHERE s.status = 'active')::int AS active_subscriptions
FROM core.stripe_product p
LEFT JOIN core.stripe_price pr ON pr.product_id = p.id
LEFT JOIN core.subscription s ON s.price_id = pr.id
GROUP BY p.id, p.name, p.active, pr.id, pr.active, pr.currency, pr.unit_amount,
         pr.recurring_interval, pr.interval_count, pr.nickname
ORDER BY p.active DESC, p.name, pr.active DESC, pr.unit_amount;
COMMENT ON VIEW api.stripe_product_catalog IS 'Stripe products and prices. Active subscription count is best-effort where price metadata is available.';

CREATE OR REPLACE VIEW api.hubspot_companies AS
SELECT
  hc.id,
  hc.domain,
  hc.name,
  hc.website,
  hc.industry,
  count(ct.*)::int AS contacts,
  coalesce(sum(ct.tagged_tracks),0)::bigint AS tagged_tracks,
  count(ct.*) FILTER (WHERE ct.subscribed)::int AS subscribed_contacts,
  max(ct.last_modified) AS last_contact_activity
FROM core.hubspot_company hc
LEFT JOIN core.contact ct ON ct.company_id = hc.id
GROUP BY hc.id, hc.domain, hc.name, hc.website, hc.industry
ORDER BY tagged_tracks DESC, contacts DESC, name;
COMMENT ON VIEW api.hubspot_companies IS 'HubSpot companies with contact/catalog rollups. Deals intentionally excluded.';

CREATE OR REPLACE VIEW api.hubspot_contacts AS
SELECT
  ct.id AS hubspot_contact_id,
  ct.identity_id,
  ct.email,
  coalesce(ct.artist_name, i.display_name, split_part(ct.email::text, '@', 1)) AS display_name,
  ct.artist_name,
  ct.company_id AS hubspot_company_id,
  coalesce(hc.name, ct.company_name) AS company_name,
  hc.domain AS company_domain,
  ct.jobtitle,
  ct.role,
  ct.company_type,
  ct.acquisition_channel,
  ct.subscribed,
  ct.signed_to_deal,
  ct.pro,
  ct.tagged_tracks,
  ct.untagged_tracks,
  ct.last_login,
  ct.created_at,
  ct.last_modified,
  EXISTS (SELECT 1 FROM core.customer c WHERE c.identity_id = ct.identity_id) AS in_stripe,
  EXISTS (SELECT 1 FROM core.app_customer a WHERE a.identity_id = ct.identity_id) AS in_app,
  (SELECT count(*)::int FROM core.subscription s WHERE s.identity_id = ct.identity_id AND s.status='active') AS active_subs,
  (SELECT round(coalesce(sum(monthly_cents),0)/100) FROM core.subscription s WHERE s.identity_id = ct.identity_id AND s.status='active') AS mrr
FROM core.contact ct
LEFT JOIN core.identity i ON i.id = ct.identity_id
LEFT JOIN core.hubspot_company hc ON hc.id = ct.company_id
ORDER BY coalesce(ct.tagged_tracks,0) DESC, ct.last_modified DESC NULLS LAST;
COMMENT ON VIEW api.hubspot_contacts IS 'Full HubSpot CRM contacts enriched with company, Stripe, and app identity context. Deals excluded.';

CREATE OR REPLACE VIEW api.companies AS
WITH dom AS (
  SELECT nullif(split_part(lower(email::text), '@', 2), '') AS domain,
         tagged_tracks, subscribed, signed_to_deal
  FROM core.contact
  WHERE email IS NOT NULL AND tagged_tracks > 0
)
SELECT
  domain,
  count(*)::int                                   AS contacts,
  sum(tagged_tracks)::bigint                       AS tracks,
  count(*) FILTER (WHERE subscribed)::int          AS subscribed,
  count(*) FILTER (WHERE signed_to_deal)::int      AS signed_to_deal
FROM dom
WHERE domain IS NOT NULL
  AND domain <> 'swayzio.com'
  AND NOT core.is_personal_domain(domain)
GROUP BY domain
ORDER BY tracks DESC;
COMMENT ON VIEW api.companies IS 'Business email domains (labels/distributors) ranked by catalog size; only contacts with tagged tracks.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('core','hubspot_company','*','HubSpot companies with basic CRM properties. Deals intentionally excluded.'),
  ('core','hubspot_contact_company','*','HubSpot contact-company associations. Deals intentionally excluded.'),
  ('core','stripe_product','*','Stripe product catalog.'),
  ('core','stripe_price','*','Stripe prices/plans linked to products.'),
  ('core','stripe_coupon','*','Stripe coupons/discount instruments.'),
  ('core','stripe_invoice','*','Stripe invoices linked to customers, subscriptions, and identities.'),
  ('core','stripe_charge','*','Stripe charges linked to customers, invoices, and identities. Amounts are minor units.'),
  ('core','stripe_refund','*','Stripe refunds linked to charges. Amounts are minor units.'),
  ('core','stripe_balance_transaction','*','Stripe balance transactions for reconciliation. Amounts are minor units.'),
  ('api','sync_health','*','Feed freshness with stale/error flags.'),
  ('api','data_quality','*','Source-vs-Neon row coverage, identity/email gaps, and data dictionary coverage.'),
  ('api','stripe_finance_snapshot','*','Stripe source-depth counts and cash totals from normalized financial entities.'),
  ('api','stripe_subscription_mix','*','Stripe subscriptions grouped by status and billing interval.'),
  ('api','stripe_top_subscriptions','*','Top active Stripe subscriptions by normalized monthly value.'),
  ('api','stripe_billing_monthly','*','Monthly Stripe ledger: gross charges, refunds, fees, and net cash.'),
  ('api','stripe_product_catalog','*','Stripe products and prices, with best-effort active subscription count.'),
  ('api','hubspot_companies','*','HubSpot companies with contact/catalog rollups; no deal coverage.'),
  ('api','hubspot_contacts','*','Full HubSpot CRM contacts enriched with company, Stripe, and app identity context.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE
  SET description = EXCLUDED.description, updated_at = now();

GRANT SELECT ON ALL TABLES IN SCHEMA api TO authenticated;
