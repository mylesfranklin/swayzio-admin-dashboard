-- 0017_mercury_source_depth.sql - Mercury banking feed, analytics views, and quality coverage.
-- Read-only source coverage: accounts, transactions, recipients, categories, cards,
-- statements, credit, treasury, organization, users, events, and webhooks.

CREATE TABLE IF NOT EXISTS core.mercury_organization (
  id                  text PRIMARY KEY,
  kind                text,
  ein                 text,
  legal_business_name text,
  dbas                jsonb NOT NULL DEFAULT '[]'::jsonb,
  subscription_tier   text,
  billing_cadence     text,
  raw                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at           timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_organization IS 'Mercury organization profile from the read-only API.';

CREATE TABLE IF NOT EXISTS core.mercury_account (
  id                  text PRIMARY KEY,
  account_number      text,
  routing_number      text,
  name                text,
  status              text,
  type                text,
  kind                text,
  nickname            text,
  legal_business_name text,
  available_balance   numeric,
  current_balance     numeric,
  created_at          timestamptz,
  dashboard_link      text,
  raw                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at           timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_account IS 'Mercury depository accounts with balances and source payload.';
CREATE INDEX IF NOT EXISTS mercury_account_status_idx ON core.mercury_account(status);

CREATE TABLE IF NOT EXISTS core.mercury_category (
  id                         text PRIMARY KEY,
  name                       text,
  visible_for_reimbursements boolean,
  visible_for_card_spend     boolean,
  visible_for_other          boolean,
  raw                        jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at                  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_category IS 'Mercury custom expense categories.';

CREATE TABLE IF NOT EXISTS core.mercury_recipient (
  id                     text PRIMARY KEY,
  status                 text,
  name                   text,
  default_payment_method text,
  emails                 jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_address        jsonb,
  electronic_routing_info jsonb,
  attachments            jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at              timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_recipient IS 'Mercury payment recipients/counterparties; read-only in Swayzio OS.';
CREATE INDEX IF NOT EXISTS mercury_recipient_name_idx ON core.mercury_recipient(name);

CREATE TABLE IF NOT EXISTS core.mercury_transaction (
  id                             text PRIMARY KEY,
  account_id                     text REFERENCES core.mercury_account(id) ON DELETE SET NULL,
  fee_id                         text,
  card_id                        text,
  amount                         numeric,
  created_at                     timestamptz,
  posted_at                      timestamptz,
  estimated_delivery_date        timestamptz,
  status                         text,
  note                           text,
  bank_description               text,
  external_memo                  text,
  counterparty_id                text,
  counterparty_name              text,
  counterparty_nickname          text,
  kind                           text,
  mercury_category               text,
  category_id                    text,
  category_name                  text,
  general_ledger_code_name       text,
  compliant_with_receipt_policy  boolean,
  has_generated_receipt          boolean,
  credit_account_period_id       text,
  request_id                     text,
  check_number                   text,
  tracking_number                text,
  reason_for_failure             text,
  failed_at                      timestamptz,
  dashboard_link                 text,
  details                        jsonb,
  currency_exchange_info         jsonb,
  gl_allocations                 jsonb NOT NULL DEFAULT '[]'::jsonb,
  attachments                    jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_transactions           jsonb NOT NULL DEFAULT '[]'::jsonb,
  merchant                       jsonb,
  raw                            jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at                      timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_transaction IS 'Mercury transactions across all accounts. Amounts are Mercury decimal dollar amounts.';
CREATE INDEX IF NOT EXISTS mercury_transaction_account_idx ON core.mercury_transaction(account_id);
CREATE INDEX IF NOT EXISTS mercury_transaction_posted_idx ON core.mercury_transaction(posted_at DESC);
CREATE INDEX IF NOT EXISTS mercury_transaction_counterparty_idx ON core.mercury_transaction(counterparty_id);
CREATE INDEX IF NOT EXISTS mercury_transaction_category_idx ON core.mercury_transaction(category_id);

CREATE TABLE IF NOT EXISTS core.mercury_card (
  card_id          text PRIMARY KEY,
  account_id       text REFERENCES core.mercury_account(id) ON DELETE SET NULL,
  name_on_card     text,
  last_four_digits text,
  network          text,
  status           text,
  type             text,
  user_id          text,
  spend_limit      jsonb,
  created_at       timestamptz,
  updated_at       timestamptz,
  raw              jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at        timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_card IS 'Mercury debit/credit card metadata linked to accounts.';
CREATE INDEX IF NOT EXISTS mercury_card_account_idx ON core.mercury_card(account_id);

CREATE TABLE IF NOT EXISTS core.mercury_statement (
  account_id            text REFERENCES core.mercury_account(id) ON DELETE SET NULL,
  id                    text NOT NULL,
  start_date            date,
  end_date              date,
  account_number        text,
  routing_number        text,
  company_legal_name    text,
  company_legal_address jsonb,
  ein                   text,
  ending_balance        numeric,
  download_url          text,
  transactions          jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at             timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, id)
);
COMMENT ON TABLE core.mercury_statement IS 'Mercury monthly statements and statement transaction summaries.';
CREATE INDEX IF NOT EXISTS mercury_statement_period_idx ON core.mercury_statement(start_date DESC, end_date DESC);

CREATE TABLE IF NOT EXISTS core.mercury_credit_account (
  id           text PRIMARY KEY,
  name         text,
  status       text,
  current_balance numeric,
  available_balance numeric,
  raw          jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_credit_account IS 'Mercury credit accounts when available on the organization.';

CREATE TABLE IF NOT EXISTS core.mercury_treasury_account (
  id           text PRIMARY KEY,
  name         text,
  status       text,
  current_balance numeric,
  available_balance numeric,
  raw          jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_treasury_account IS 'Mercury treasury accounts when available on the organization.';

CREATE TABLE IF NOT EXISTS core.mercury_treasury_transaction (
  id                  text PRIMARY KEY,
  treasury_account_id text REFERENCES core.mercury_treasury_account(id) ON DELETE SET NULL,
  amount              numeric,
  created_at          timestamptz,
  posted_at           timestamptz,
  status              text,
  kind                text,
  description         text,
  raw                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at           timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_treasury_transaction IS 'Mercury treasury account transactions when treasury is enabled.';
CREATE INDEX IF NOT EXISTS mercury_treasury_transaction_account_idx ON core.mercury_treasury_transaction(treasury_account_id);

CREATE TABLE IF NOT EXISTS core.mercury_user (
  user_id           text PRIMARY KEY,
  first_name        text,
  last_name         text,
  email             citext,
  organization_role text,
  raw               jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at         timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_user IS 'Mercury organization users visible to the API.';

CREATE TABLE IF NOT EXISTS core.mercury_event (
  id               text PRIMARY KEY,
  resource_type    text,
  resource_id      text,
  operation_type   text,
  resource_version text,
  occurred_at      timestamptz,
  changed_paths    jsonb NOT NULL DEFAULT '[]'::jsonb,
  merge_patch      jsonb,
  raw              jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at        timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_event IS 'Mercury audit/events feed for source changes.';
CREATE INDEX IF NOT EXISTS mercury_event_occurred_idx ON core.mercury_event(occurred_at DESC);

CREATE TABLE IF NOT EXISTS core.mercury_webhook (
  id        text PRIMARY KEY,
  url       text,
  status    text,
  event_types jsonb,
  raw       jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.mercury_webhook IS 'Mercury webhook registrations visible to the API.';

-- Curated read surface. These views intentionally include raw payloads so Eve can answer
-- detailed Mercury questions without direct access to raw.records or write-capable tables.
CREATE OR REPLACE VIEW api.mercury_organization AS
SELECT * FROM core.mercury_organization;
COMMENT ON VIEW api.mercury_organization IS 'Mercury organization profile, including raw source payload.';

CREATE OR REPLACE VIEW api.mercury_accounts AS
SELECT * FROM core.mercury_account ORDER BY status, name;
COMMENT ON VIEW api.mercury_accounts IS 'Mercury accounts with balances, routing/account details, and raw source payload.';

CREATE OR REPLACE VIEW api.mercury_transactions AS
SELECT * FROM core.mercury_transaction ORDER BY coalesce(posted_at, created_at) DESC NULLS LAST;
COMMENT ON VIEW api.mercury_transactions IS 'Mercury transactions with counterparty, category, card, merchant, attachment, and raw metadata.';

CREATE OR REPLACE VIEW api.mercury_recipients AS
SELECT * FROM core.mercury_recipient ORDER BY name;
COMMENT ON VIEW api.mercury_recipients IS 'Mercury payment recipients/counterparties, including routing metadata where Mercury exposes it.';

CREATE OR REPLACE VIEW api.mercury_categories AS
SELECT * FROM core.mercury_category ORDER BY name;
COMMENT ON VIEW api.mercury_categories IS 'Mercury custom expense categories.';

CREATE OR REPLACE VIEW api.mercury_cards AS
SELECT c.*, a.name AS account_name
FROM core.mercury_card c
LEFT JOIN core.mercury_account a ON a.id = c.account_id
ORDER BY c.status, c.name_on_card;
COMMENT ON VIEW api.mercury_cards IS 'Mercury card metadata linked to account names.';

CREATE OR REPLACE VIEW api.mercury_statements AS
SELECT s.*, a.name AS account_name
FROM core.mercury_statement s
LEFT JOIN core.mercury_account a ON a.id = s.account_id
ORDER BY s.start_date DESC NULLS LAST;
COMMENT ON VIEW api.mercury_statements IS 'Mercury statements with download URLs and source transaction summaries.';

CREATE OR REPLACE VIEW api.mercury_credit_accounts AS
SELECT * FROM core.mercury_credit_account ORDER BY name;
COMMENT ON VIEW api.mercury_credit_accounts IS 'Mercury credit accounts when available.';

CREATE OR REPLACE VIEW api.mercury_treasury_accounts AS
SELECT * FROM core.mercury_treasury_account ORDER BY name;
COMMENT ON VIEW api.mercury_treasury_accounts IS 'Mercury treasury accounts when available.';

CREATE OR REPLACE VIEW api.mercury_treasury_transactions AS
SELECT * FROM core.mercury_treasury_transaction ORDER BY coalesce(posted_at, created_at) DESC NULLS LAST;
COMMENT ON VIEW api.mercury_treasury_transactions IS 'Mercury treasury transactions when available.';

CREATE OR REPLACE VIEW api.mercury_users AS
SELECT * FROM core.mercury_user ORDER BY organization_role, email;
COMMENT ON VIEW api.mercury_users IS 'Mercury organization users visible to the API.';

CREATE OR REPLACE VIEW api.mercury_events AS
SELECT * FROM core.mercury_event ORDER BY occurred_at DESC NULLS LAST;
COMMENT ON VIEW api.mercury_events IS 'Mercury events/audit log visible to the API.';

CREATE OR REPLACE VIEW api.mercury_webhooks AS
SELECT * FROM core.mercury_webhook ORDER BY id;
COMMENT ON VIEW api.mercury_webhooks IS 'Mercury webhook registrations visible to the API.';

CREATE OR REPLACE VIEW api.mercury_cash_snapshot AS
SELECT
  now() AS computed_at,
  (SELECT count(*) FROM core.mercury_account)::int AS accounts,
  (SELECT count(*) FROM core.mercury_account WHERE status = 'active')::int AS active_accounts,
  round(coalesce((SELECT sum(available_balance) FROM core.mercury_account), 0), 2) AS available_balance,
  round(coalesce((SELECT sum(current_balance) FROM core.mercury_account), 0), 2) AS current_balance,
  round(coalesce((SELECT sum(current_balance) FROM core.mercury_treasury_account), 0), 2) AS treasury_balance,
  round(coalesce((SELECT sum(current_balance) FROM core.mercury_credit_account), 0), 2) AS credit_balance,
  (SELECT count(*) FROM core.mercury_transaction)::int AS transactions,
  (SELECT max(coalesce(posted_at, created_at)) FROM core.mercury_transaction) AS latest_transaction_at;
COMMENT ON VIEW api.mercury_cash_snapshot IS 'Mercury cash/balance snapshot across accounts, treasury, credit, and transaction freshness.';

CREATE OR REPLACE VIEW api.mercury_cashflow_monthly AS
SELECT
  date_trunc('month', coalesce(posted_at, created_at))::date AS month_start,
  count(*)::int AS transactions,
  round(coalesce(sum(amount) FILTER (WHERE amount > 0), 0), 2) AS inflow,
  round(abs(coalesce(sum(amount) FILTER (WHERE amount < 0), 0)), 2) AS outflow,
  round(coalesce(sum(amount), 0), 2) AS net_cashflow
FROM core.mercury_transaction
WHERE coalesce(posted_at, created_at) IS NOT NULL
  AND status IN ('sent', 'pending')
GROUP BY 1
ORDER BY 1;
COMMENT ON VIEW api.mercury_cashflow_monthly IS 'Monthly Mercury inflow, outflow, net cashflow, and transaction count.';

CREATE OR REPLACE VIEW api.mercury_spend_by_category AS
SELECT
  coalesce(category_name, mercury_category, 'Uncategorized') AS category,
  count(*)::int AS transactions,
  round(abs(coalesce(sum(amount), 0)), 2) AS spend,
  max(coalesce(posted_at, created_at)) AS last_transaction_at
FROM core.mercury_transaction
WHERE amount < 0
  AND status IN ('sent', 'pending')
GROUP BY 1
ORDER BY spend DESC;
COMMENT ON VIEW api.mercury_spend_by_category IS 'Mercury outbound spend grouped by Mercury/custom category.';

CREATE OR REPLACE VIEW api.mercury_counterparties AS
SELECT
  counterparty_id,
  coalesce(counterparty_name, counterparty_nickname, bank_description, 'Unknown') AS counterparty,
  count(*)::int AS transactions,
  round(coalesce(sum(amount) FILTER (WHERE amount > 0), 0), 2) AS inflow,
  round(abs(coalesce(sum(amount) FILTER (WHERE amount < 0), 0)), 2) AS outflow,
  round(coalesce(sum(amount), 0), 2) AS net,
  max(coalesce(posted_at, created_at)) AS last_transaction_at
FROM core.mercury_transaction
GROUP BY counterparty_id, coalesce(counterparty_name, counterparty_nickname, bank_description, 'Unknown')
ORDER BY greatest(abs(coalesce(sum(amount) FILTER (WHERE amount > 0), 0)), abs(coalesce(sum(amount) FILTER (WHERE amount < 0), 0))) DESC;
COMMENT ON VIEW api.mercury_counterparties IS 'Mercury counterparties ranked by cash movement.';

CREATE OR REPLACE VIEW api.mercury_recent_transactions AS
SELECT
  id,
  account_id,
  amount,
  coalesce(posted_at, created_at) AS transaction_at,
  status,
  kind,
  coalesce(counterparty_name, counterparty_nickname, bank_description) AS counterparty,
  coalesce(category_name, mercury_category) AS category,
  bank_description,
  note,
  dashboard_link
FROM core.mercury_transaction
ORDER BY coalesce(posted_at, created_at) DESC NULLS LAST
LIMIT 500;
COMMENT ON VIEW api.mercury_recent_transactions IS 'Most recent Mercury transactions for dashboard and Eve summaries.';

CREATE OR REPLACE VIEW api.mercury_runway_inputs AS
WITH recent AS (
  SELECT amount
  FROM core.mercury_transaction
  WHERE coalesce(posted_at, created_at) >= now() - interval '90 days'
    AND status = 'sent'
),
cash AS (
  SELECT coalesce(sum(available_balance), 0)::numeric AS available_balance
  FROM core.mercury_account
)
SELECT
  round(c.available_balance, 2) AS available_balance,
  round(coalesce(sum(amount) FILTER (WHERE amount > 0), 0), 2) AS inflow_90d,
  round(abs(coalesce(sum(amount) FILTER (WHERE amount < 0), 0)), 2) AS outflow_90d,
  round(coalesce(sum(amount), 0), 2) AS net_cashflow_90d,
  round(greatest(-coalesce(sum(amount), 0) / 3, 0), 2) AS estimated_monthly_burn,
  CASE
    WHEN greatest(-coalesce(sum(amount), 0) / 3, 0) > 0
    THEN round(c.available_balance / greatest(-coalesce(sum(amount), 0) / 3, 0), 1)
    ELSE NULL
  END AS runway_months
FROM cash c
LEFT JOIN recent ON true
GROUP BY c.available_balance;
COMMENT ON VIEW api.mercury_runway_inputs IS 'Simple runway inputs from Mercury available cash and last 90 days net cashflow.';

-- Extend quality coverage with Mercury while preserving the existing OS checks.
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
  UNION ALL
  SELECT 'mercury', 'account',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='account') r)::bigint,
         (SELECT count(*) FROM core.mercury_account)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'transaction',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='transaction') r)::bigint,
         (SELECT count(*) FROM core.mercury_transaction)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'recipient',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='recipient') r)::bigint,
         (SELECT count(*) FROM core.mercury_recipient)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'category',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='category') r)::bigint,
         (SELECT count(*) FROM core.mercury_category)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'card',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='card') r)::bigint,
         (SELECT count(*) FROM core.mercury_card)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'statement',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='statement') r)::bigint,
         (SELECT count(*) FROM core.mercury_statement)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'credit',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='credit') r)::bigint,
         (SELECT count(*) FROM core.mercury_credit_account)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'treasury',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='treasury') r)::bigint,
         (SELECT count(*) FROM core.mercury_treasury_account)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'treasury_transaction',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='treasury_transaction') r)::bigint,
         (SELECT count(*) FROM core.mercury_treasury_transaction)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'organization',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='organization') r)::bigint,
         (SELECT count(*) FROM core.mercury_organization)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'user',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='user') r)::bigint,
         (SELECT count(*) FROM core.mercury_user)::bigint,
         0::bigint,
         (SELECT count(*) FROM core.mercury_user WHERE email IS NULL)::bigint
  UNION ALL
  SELECT 'mercury', 'event',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='event') r)::bigint,
         (SELECT count(*) FROM core.mercury_event)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'mercury', 'webhook',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='mercury' AND entity='webhook') r)::bigint,
         (SELECT count(*) FROM core.mercury_webhook)::bigint,
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

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('core','mercury_organization','*','Mercury organization profile from the read-only API.'),
  ('core','mercury_account','*','Mercury depository accounts with balances and source payload.'),
  ('core','mercury_category','*','Mercury custom expense categories.'),
  ('core','mercury_recipient','*','Mercury payment recipients/counterparties.'),
  ('core','mercury_transaction','*','Mercury transactions across all accounts. Amounts are decimal dollar amounts.'),
  ('core','mercury_card','*','Mercury card metadata linked to accounts.'),
  ('core','mercury_statement','*','Mercury monthly statements and statement transaction summaries.'),
  ('core','mercury_credit_account','*','Mercury credit accounts when available.'),
  ('core','mercury_treasury_account','*','Mercury treasury accounts when available.'),
  ('core','mercury_treasury_transaction','*','Mercury treasury transactions when available.'),
  ('core','mercury_user','*','Mercury organization users visible to the API.'),
  ('core','mercury_event','*','Mercury events/audit log visible to the API.'),
  ('core','mercury_webhook','*','Mercury webhook registrations visible to the API.'),
  ('api','mercury_organization','*','Mercury organization profile, including raw source payload.'),
  ('api','mercury_accounts','*','Mercury accounts with balances, routing/account details, and raw source payload.'),
  ('api','mercury_transactions','*','Mercury transactions with counterparty, category, card, merchant, attachment, and raw metadata.'),
  ('api','mercury_recipients','*','Mercury payment recipients/counterparties.'),
  ('api','mercury_categories','*','Mercury custom expense categories.'),
  ('api','mercury_cards','*','Mercury card metadata linked to account names.'),
  ('api','mercury_statements','*','Mercury statements with download URLs and transaction summaries.'),
  ('api','mercury_credit_accounts','*','Mercury credit accounts when available.'),
  ('api','mercury_treasury_accounts','*','Mercury treasury accounts when available.'),
  ('api','mercury_treasury_transactions','*','Mercury treasury transactions when available.'),
  ('api','mercury_users','*','Mercury organization users visible to the API.'),
  ('api','mercury_events','*','Mercury events/audit log visible to the API.'),
  ('api','mercury_webhooks','*','Mercury webhook registrations visible to the API.'),
  ('api','mercury_cash_snapshot','*','Mercury cash/balance snapshot across accounts, treasury, credit, and transaction freshness.'),
  ('api','mercury_cashflow_monthly','*','Monthly Mercury inflow, outflow, net cashflow, and transaction count.'),
  ('api','mercury_spend_by_category','*','Mercury outbound spend grouped by Mercury/custom category.'),
  ('api','mercury_counterparties','*','Mercury counterparties ranked by cash movement.'),
  ('api','mercury_recent_transactions','*','Most recent Mercury transactions for dashboard and Eve summaries.'),
  ('api','mercury_runway_inputs','*','Simple runway inputs from Mercury available cash and last 90 days net cashflow.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE
  SET description = EXCLUDED.description, updated_at = now();

GRANT SELECT ON ALL TABLES IN SCHEMA api TO authenticated;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'os_agent_ro') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA api TO os_agent_ro';
    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA api TO os_agent_ro';
  END IF;
END $$;
