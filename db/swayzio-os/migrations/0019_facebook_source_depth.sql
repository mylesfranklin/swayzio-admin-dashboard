-- 0019_facebook_source_depth.sql - Facebook organic + ads social feed for Swayzio OS.

CREATE TABLE IF NOT EXISTS core.facebook_page (
  id                              text PRIMARY KEY,
  name                            text,
  username                        text,
  category                        text,
  category_list                   jsonb NOT NULL DEFAULT '[]'::jsonb,
  fan_count                       bigint,
  followers_count                 bigint,
  link                            text,
  website                         text,
  phone                           text,
  emails                          jsonb NOT NULL DEFAULT '[]'::jsonb,
  location                        jsonb NOT NULL DEFAULT '{}'::jsonb,
  verification_status             text,
  rating_count                    bigint,
  overall_star_rating             numeric,
  is_published                    boolean,
  is_verified                     boolean,
  instagram_business_account_id   text,
  connected_instagram_account_id  text,
  raw                             jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at                       timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.facebook_page IS 'Facebook Pages visible to the configured Meta token. Source tokens are never stored.';

CREATE TABLE IF NOT EXISTS core.facebook_page_insight (
  id            text PRIMARY KEY,
  page_id       text NOT NULL REFERENCES core.facebook_page(id) ON DELETE CASCADE,
  metric_name   text NOT NULL,
  title         text,
  description   text,
  period        text,
  end_time      timestamptz,
  value         jsonb NOT NULL DEFAULT 'null'::jsonb,
  numeric_value numeric,
  raw           jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS facebook_page_insight_metric_idx ON core.facebook_page_insight(page_id, metric_name, end_time DESC);
COMMENT ON TABLE core.facebook_page_insight IS 'Facebook Page Insights metric values from the Graph API.';

CREATE TABLE IF NOT EXISTS core.facebook_post (
  id              text PRIMARY KEY,
  page_id         text NOT NULL REFERENCES core.facebook_page(id) ON DELETE CASCADE,
  message         text,
  story           text,
  created_time    timestamptz,
  updated_time    timestamptz,
  permalink_url   text,
  full_picture    text,
  status_type     text,
  type            text,
  is_published    boolean,
  shares_count    bigint,
  comments_count  bigint,
  likes_count     bigint,
  reactions_count bigint,
  raw             jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS facebook_post_page_created_idx ON core.facebook_post(page_id, created_time DESC);
COMMENT ON TABLE core.facebook_post IS 'Facebook Page posts and engagement summary counts.';

CREATE TABLE IF NOT EXISTS core.facebook_post_insight (
  id            text PRIMARY KEY,
  post_id       text NOT NULL REFERENCES core.facebook_post(id) ON DELETE CASCADE,
  page_id       text NOT NULL REFERENCES core.facebook_page(id) ON DELETE CASCADE,
  metric_name   text NOT NULL,
  title         text,
  description   text,
  period        text,
  end_time      timestamptz,
  value         jsonb NOT NULL DEFAULT 'null'::jsonb,
  numeric_value numeric,
  raw           jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS facebook_post_insight_metric_idx ON core.facebook_post_insight(post_id, metric_name, end_time DESC);
COMMENT ON TABLE core.facebook_post_insight IS 'Facebook post-level Insights metric values.';

CREATE TABLE IF NOT EXISTS core.facebook_ad_account (
  id              text PRIMARY KEY,
  account_id      text,
  name            text,
  account_status  int,
  currency        text,
  timezone_name   text,
  business        jsonb NOT NULL DEFAULT '{}'::jsonb,
  amount_spent    numeric,
  balance         numeric,
  raw             jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at       timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE core.facebook_ad_account IS 'Meta ad accounts visible to the configured token.';

CREATE TABLE IF NOT EXISTS core.facebook_campaign (
  id                text PRIMARY KEY,
  ad_account_id     text NOT NULL REFERENCES core.facebook_ad_account(id) ON DELETE CASCADE,
  name              text,
  status            text,
  effective_status  text,
  objective         text,
  buying_type       text,
  created_time      timestamptz,
  updated_time      timestamptz,
  start_time        timestamptz,
  stop_time         timestamptz,
  daily_budget      numeric,
  lifetime_budget   numeric,
  raw               jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS facebook_campaign_account_idx ON core.facebook_campaign(ad_account_id, effective_status);
COMMENT ON TABLE core.facebook_campaign IS 'Meta campaigns for Facebook/Meta ads reporting.';

CREATE TABLE IF NOT EXISTS core.facebook_ad_insight (
  id             text PRIMARY KEY,
  ad_account_id  text NOT NULL REFERENCES core.facebook_ad_account(id) ON DELETE CASCADE,
  campaign_id    text,
  campaign_name  text,
  date_start     date,
  date_stop      date,
  impressions    bigint,
  reach          bigint,
  clicks         bigint,
  spend          numeric,
  cpc            numeric,
  cpm            numeric,
  ctr            numeric,
  actions        jsonb NOT NULL DEFAULT '[]'::jsonb,
  action_values  jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw            jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS facebook_ad_insight_date_idx ON core.facebook_ad_insight(ad_account_id, date_start DESC);
CREATE INDEX IF NOT EXISTS facebook_ad_insight_campaign_idx ON core.facebook_ad_insight(campaign_id, date_start DESC);
COMMENT ON TABLE core.facebook_ad_insight IS 'Daily Meta Ads Insights rows, currently at campaign level.';

CREATE OR REPLACE VIEW api.facebook_pages AS
SELECT * FROM core.facebook_page ORDER BY name;
COMMENT ON VIEW api.facebook_pages IS 'Facebook Pages with follower counts, profile metadata, and sanitized raw payloads.';

CREATE OR REPLACE VIEW api.facebook_page_insights AS
SELECT * FROM core.facebook_page_insight ORDER BY end_time DESC NULLS LAST, metric_name;
COMMENT ON VIEW api.facebook_page_insights IS 'Facebook Page Insights metric values.';

CREATE OR REPLACE VIEW api.facebook_posts AS
SELECT
  p.*,
  pg.name AS page_name
FROM core.facebook_post p
JOIN core.facebook_page pg ON pg.id = p.page_id
ORDER BY p.created_time DESC NULLS LAST;
COMMENT ON VIEW api.facebook_posts IS 'Facebook Page posts with engagement summary counts.';

CREATE OR REPLACE VIEW api.facebook_post_insights AS
SELECT
  i.*,
  p.created_time AS post_created_time,
  p.permalink_url,
  p.message
FROM core.facebook_post_insight i
JOIN core.facebook_post p ON p.id = i.post_id
ORDER BY i.end_time DESC NULLS LAST, i.metric_name;
COMMENT ON VIEW api.facebook_post_insights IS 'Facebook post-level Insights metric values with post context.';

CREATE OR REPLACE VIEW api.facebook_ad_accounts AS
SELECT * FROM core.facebook_ad_account ORDER BY name;
COMMENT ON VIEW api.facebook_ad_accounts IS 'Meta ad accounts visible to the configured token.';

CREATE OR REPLACE VIEW api.facebook_campaigns AS
SELECT
  c.*,
  a.name AS ad_account_name,
  a.currency
FROM core.facebook_campaign c
JOIN core.facebook_ad_account a ON a.id = c.ad_account_id
ORDER BY c.updated_time DESC NULLS LAST;
COMMENT ON VIEW api.facebook_campaigns IS 'Meta campaigns with ad account context.';

CREATE OR REPLACE VIEW api.facebook_ad_insights AS
SELECT
  i.*,
  a.name AS ad_account_name,
  a.currency
FROM core.facebook_ad_insight i
JOIN core.facebook_ad_account a ON a.id = i.ad_account_id
ORDER BY i.date_start DESC NULLS LAST, i.spend DESC NULLS LAST;
COMMENT ON VIEW api.facebook_ad_insights IS 'Daily Meta Ads Insights at campaign level.';

CREATE OR REPLACE VIEW api.facebook_organic_snapshot AS
SELECT
  (SELECT count(*) FROM core.facebook_page)::int AS pages,
  (SELECT count(*) FROM core.facebook_post)::int AS posts,
  (SELECT coalesce(sum(followers_count), 0) FROM core.facebook_page)::bigint AS followers,
  (SELECT coalesce(sum(fan_count), 0) FROM core.facebook_page)::bigint AS fans,
  (SELECT max(created_time) FROM core.facebook_post)::timestamptz AS latest_post_at,
  (SELECT coalesce(sum(comments_count), 0) FROM core.facebook_post)::bigint AS comments,
  (SELECT coalesce(sum(likes_count), 0) FROM core.facebook_post)::bigint AS likes,
  (SELECT coalesce(sum(reactions_count), 0) FROM core.facebook_post)::bigint AS reactions,
  (SELECT coalesce(sum(shares_count), 0) FROM core.facebook_post)::bigint AS shares;
COMMENT ON VIEW api.facebook_organic_snapshot IS 'Facebook organic presence snapshot for Eve and dashboard summaries.';

CREATE OR REPLACE VIEW api.facebook_top_posts AS
SELECT
  id,
  page_id,
  page_name,
  created_time,
  permalink_url,
  left(coalesce(message, story, ''), 240) AS preview,
  coalesce(reactions_count, 0) AS reactions,
  coalesce(comments_count, 0) AS comments,
  coalesce(shares_count, 0) AS shares,
  coalesce(likes_count, 0) AS likes,
  (coalesce(reactions_count, 0) + coalesce(comments_count, 0) + coalesce(shares_count, 0)) AS engagement
FROM api.facebook_posts
ORDER BY (coalesce(reactions_count, 0) + coalesce(comments_count, 0) + coalesce(shares_count, 0)) DESC, created_time DESC NULLS LAST
LIMIT 500;
COMMENT ON VIEW api.facebook_top_posts IS 'Facebook posts ranked by visible engagement summary counts.';

CREATE OR REPLACE VIEW api.facebook_ads_daily AS
SELECT
  date_start,
  ad_account_id,
  ad_account_name,
  currency,
  sum(coalesce(impressions, 0))::bigint AS impressions,
  sum(coalesce(reach, 0))::bigint AS reach,
  sum(coalesce(clicks, 0))::bigint AS clicks,
  round(sum(coalesce(spend, 0)), 2) AS spend,
  CASE WHEN sum(coalesce(impressions, 0)) > 0 THEN round((sum(coalesce(clicks, 0))::numeric / sum(coalesce(impressions, 0))) * 100, 4) END AS ctr,
  CASE WHEN sum(coalesce(clicks, 0)) > 0 THEN round(sum(coalesce(spend, 0)) / sum(coalesce(clicks, 0)), 4) END AS cpc,
  CASE WHEN sum(coalesce(impressions, 0)) > 0 THEN round((sum(coalesce(spend, 0)) / sum(coalesce(impressions, 0))) * 1000, 4) END AS cpm
FROM api.facebook_ad_insights
GROUP BY date_start, ad_account_id, ad_account_name, currency
ORDER BY date_start DESC NULLS LAST;
COMMENT ON VIEW api.facebook_ads_daily IS 'Daily Meta Ads performance rollup by ad account.';

CREATE OR REPLACE VIEW api.facebook_campaign_summary AS
SELECT
  campaign_id,
  coalesce(campaign_name, c.name) AS campaign_name,
  i.ad_account_id,
  max(i.ad_account_name) AS ad_account_name,
  max(i.currency) AS currency,
  min(date_start) AS first_seen_date,
  max(date_stop) AS last_seen_date,
  sum(coalesce(impressions, 0))::bigint AS impressions,
  sum(coalesce(reach, 0))::bigint AS reach,
  sum(coalesce(clicks, 0))::bigint AS clicks,
  round(sum(coalesce(spend, 0)), 2) AS spend,
  CASE WHEN sum(coalesce(impressions, 0)) > 0 THEN round((sum(coalesce(clicks, 0))::numeric / sum(coalesce(impressions, 0))) * 100, 4) END AS ctr,
  CASE WHEN sum(coalesce(clicks, 0)) > 0 THEN round(sum(coalesce(spend, 0)) / sum(coalesce(clicks, 0)), 4) END AS cpc,
  CASE WHEN sum(coalesce(impressions, 0)) > 0 THEN round((sum(coalesce(spend, 0)) / sum(coalesce(impressions, 0))) * 1000, 4) END AS cpm
FROM api.facebook_ad_insights i
LEFT JOIN core.facebook_campaign c ON c.id = i.campaign_id
GROUP BY campaign_id, coalesce(campaign_name, c.name), i.ad_account_id
ORDER BY spend DESC NULLS LAST;
COMMENT ON VIEW api.facebook_campaign_summary IS 'Meta Ads campaign performance summary over the synced lookback window.';

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
  UNION ALL
  SELECT 'facebook', 'page',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='facebook' AND entity='page') r)::bigint,
         (SELECT count(*) FROM core.facebook_page)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'facebook', 'page_insight',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='facebook' AND entity='page_insight') r)::bigint,
         (SELECT count(*) FROM core.facebook_page_insight)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'facebook', 'post',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='facebook' AND entity='post') r)::bigint,
         (SELECT count(*) FROM core.facebook_post)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'facebook', 'post_insight',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='facebook' AND entity='post_insight') r)::bigint,
         (SELECT count(*) FROM core.facebook_post_insight)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'facebook', 'ad_account',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='facebook' AND entity='ad_account') r)::bigint,
         (SELECT count(*) FROM core.facebook_ad_account)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'facebook', 'campaign',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='facebook' AND entity='campaign') r)::bigint,
         (SELECT count(*) FROM core.facebook_campaign)::bigint,
         0::bigint,
         0::bigint
  UNION ALL
  SELECT 'facebook', 'ad_insight',
         (SELECT count(*) FROM (SELECT DISTINCT source_id FROM raw.records WHERE source='facebook' AND entity='ad_insight') r)::bigint,
         (SELECT count(*) FROM core.facebook_ad_insight)::bigint,
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
  ('core','facebook_page','*','Facebook Pages visible to the configured Meta token. Source tokens are never stored.'),
  ('core','facebook_page_insight','*','Facebook Page Insights metric values from the Graph API.'),
  ('core','facebook_post','*','Facebook Page posts and engagement summary counts.'),
  ('core','facebook_post_insight','*','Facebook post-level Insights metric values.'),
  ('core','facebook_ad_account','*','Meta ad accounts visible to the configured token.'),
  ('core','facebook_campaign','*','Meta campaigns for Facebook/Meta ads reporting.'),
  ('core','facebook_ad_insight','*','Daily Meta Ads Insights rows, currently at campaign level.'),
  ('api','facebook_pages','*','Facebook Pages with follower counts, profile metadata, and sanitized raw payloads.'),
  ('api','facebook_page_insights','*','Facebook Page Insights metric values.'),
  ('api','facebook_posts','*','Facebook Page posts with engagement summary counts.'),
  ('api','facebook_post_insights','*','Facebook post-level Insights metric values with post context.'),
  ('api','facebook_ad_accounts','*','Meta ad accounts visible to the configured token.'),
  ('api','facebook_campaigns','*','Meta campaigns with ad account context.'),
  ('api','facebook_ad_insights','*','Daily Meta Ads Insights at campaign level.'),
  ('api','facebook_organic_snapshot','*','Facebook organic presence snapshot for Eve and dashboard summaries.'),
  ('api','facebook_top_posts','*','Facebook posts ranked by visible engagement summary counts.'),
  ('api','facebook_ads_daily','*','Daily Meta Ads performance rollup by ad account.'),
  ('api','facebook_campaign_summary','*','Meta Ads campaign performance summary over the synced lookback window.')
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
