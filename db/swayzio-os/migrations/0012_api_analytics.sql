-- 0012_api_analytics.sql — Phase F2: views for the agent's composed analytical tools
-- api.stripe_trend (daily MRR/subs/collection series) + api.companies (labels/distributors by catalog).
-- Idempotent. Grants inherited: authenticated already has SELECT on all api.* (0010 + default privileges).

-- Daily Stripe series (grows one row per day as the feed runs). Oldest first.
CREATE OR REPLACE VIEW api.stripe_trend AS
SELECT day, mrr, active_subs, paying_subs, paying_mrr, collection_rate_pct,
       past_due_subs, past_due_mrr_at_risk, churn_rate_pct, customers
FROM metrics.stripe_daily
ORDER BY day;
COMMENT ON VIEW api.stripe_trend IS 'Daily Stripe metrics series (MRR, subs, collection rate, churn). Grows one row/day.';

-- Companies (business email domains) ranked by catalog size — labels, distributors, beat sellers.
-- Personal and internal domains excluded (mirrors the HubSpot catalog-scan logic).
CREATE OR REPLACE VIEW api.companies AS
WITH dom AS (
  SELECT nullif(split_part(lower(email::text), '@', 2), '') AS domain,
         tagged_tracks, subscribed, signed_to_deal
  FROM core.contact
  WHERE email IS NOT NULL
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
COMMENT ON VIEW api.companies IS 'Business email domains (labels/distributors) ranked by catalog size: contacts, tracks, subscribed, signed.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('api','stripe_trend','*', 'Daily Stripe metrics series (MRR/subs/collection/churn), oldest first. Grows one row/day.'),
  ('api','companies','*',    'Business email domains (labels/distributors) ranked by catalog size.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE SET description = EXCLUDED.description, updated_at = now();
