-- 0013_stripe_collectible.sql — mirror the dashboard's collectible-MRR metric into the OS.
-- Collectible = paying subs + past-due subs whose latest invoice is still OPEN (dunning live).
-- This ≈ Stripe's own MRR tile: their analytics churns a sub once its invoice is voided, even
-- though the API status stays active/past_due. Full story: docs/STRIPE-MRR-INVESTIGATION.md.
-- Idempotent.

ALTER TABLE metrics.stripe_daily
  ADD COLUMN IF NOT EXISTS past_due_open_subs int,
  ADD COLUMN IF NOT EXISTS past_due_open_mrr  numeric,
  ADD COLUMN IF NOT EXISTS collectible_mrr    numeric;

COMMENT ON COLUMN metrics.stripe_daily.past_due_open_subs IS 'past_due subs whose latest invoice is OPEN — dunning still live.';
COMMENT ON COLUMN metrics.stripe_daily.past_due_open_mrr  IS '$/mo of that slice.';
COMMENT ON COLUMN metrics.stripe_daily.collectible_mrr    IS 'paying_mrr + past_due_open_mrr ≈ the MRR the Stripe app shows (billing still live).';

-- Views freeze their column list at creation, so SELECT * views must be recreated to pick up
-- the new (appended) columns. OR REPLACE is legal because the new columns land at the end.
CREATE OR REPLACE VIEW api.stripe_snapshot AS SELECT * FROM metrics.stripe_daily ORDER BY day DESC LIMIT 1;
COMMENT ON VIEW api.stripe_snapshot IS 'Latest metrics.stripe_daily row — collected/collectible/booked MRR, paying/void/past-due, churn.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('metrics','stripe_daily','collectible_mrr',    'paying_mrr + past_due_open_mrr ≈ the Stripe app''s MRR tile (billing still live). See docs/STRIPE-MRR-INVESTIGATION.md.'),
  ('metrics','stripe_daily','past_due_open_subs', 'past_due subs with an OPEN latest invoice (dunning still live).'),
  ('metrics','stripe_daily','past_due_open_mrr',  '$/mo of past_due subs still in live dunning.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE SET description = EXCLUDED.description, updated_at = now();
