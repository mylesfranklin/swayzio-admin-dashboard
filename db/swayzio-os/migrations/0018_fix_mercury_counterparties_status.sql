-- Keep Mercury counterparty totals aligned with cash-moving transaction views.

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
WHERE status IN ('sent', 'pending')
GROUP BY counterparty_id, coalesce(counterparty_name, counterparty_nickname, bank_description, 'Unknown')
ORDER BY greatest(abs(coalesce(sum(amount) FILTER (WHERE amount > 0), 0)), abs(coalesce(sum(amount) FILTER (WHERE amount < 0), 0))) DESC;

COMMENT ON VIEW api.mercury_counterparties IS 'Mercury counterparties ranked by cash-moving transactions.';
