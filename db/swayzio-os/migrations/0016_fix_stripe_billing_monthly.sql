-- 0016_fix_stripe_billing_monthly.sql — avoid charge/refund fan-out in monthly ledger.
-- 0014 introduced api.stripe_billing_monthly. Recreate it so charges, refunds, and
-- balance movements are aggregated independently by month.

CREATE OR REPLACE VIEW api.stripe_billing_monthly AS
WITH charge_months AS (
  SELECT
    date_trunc('month', ch.created_at)::date AS month_start,
    count(*)::int AS charge_count,
    sum(ch.amount)::numeric AS gross_charged
  FROM core.stripe_charge ch
  WHERE ch.status = 'succeeded' AND ch.paid IS TRUE
  GROUP BY 1
),
refund_months AS (
  SELECT
    date_trunc('month', r.created_at)::date AS month_start,
    count(*)::int AS refund_count,
    sum(r.amount)::numeric AS refunded
  FROM core.stripe_refund r
  WHERE r.status = 'succeeded'
  GROUP BY 1
),
balance_months AS (
  SELECT
    date_trunc('month', bt.created_at)::date AS month_start,
    sum(bt.fee)::numeric AS stripe_fees,
    sum(bt.net)::numeric AS net_after_fees
  FROM core.stripe_balance_transaction bt
  WHERE bt.status = 'available'
  GROUP BY 1
),
months AS (
  SELECT month_start FROM charge_months
  UNION
  SELECT month_start FROM refund_months
  UNION
  SELECT month_start FROM balance_months
)
SELECT
  m.month_start,
  coalesce(c.charge_count, 0)::int AS charge_count,
  coalesce(r.refund_count, 0)::int AS refund_count,
  round(coalesce(c.gross_charged, 0) / 100, 2) AS gross_charged,
  round(coalesce(r.refunded, 0) / 100, 2) AS refunded,
  round((coalesce(c.gross_charged, 0) - coalesce(r.refunded, 0)) / 100, 2) AS net_collected,
  round(coalesce(b.stripe_fees, 0) / 100, 2) AS stripe_fees,
  round(coalesce(b.net_after_fees, 0) / 100, 2) AS net_after_fees
FROM months m
LEFT JOIN charge_months c ON c.month_start = m.month_start
LEFT JOIN refund_months r ON r.month_start = m.month_start
LEFT JOIN balance_months b ON b.month_start = m.month_start
ORDER BY m.month_start;

COMMENT ON VIEW api.stripe_billing_monthly IS
  'Monthly Stripe ledger from independently aggregated succeeded charges, succeeded refunds, and available balance transactions.';
