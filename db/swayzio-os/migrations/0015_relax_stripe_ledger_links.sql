-- 0015_relax_stripe_ledger_links.sql — Stripe ledger links are soft source references.
-- Invoices/charges/refunds can reference deleted customers, canceled subscriptions, or objects
-- outside the configured backfill window. Keep ids for joins, but do not let FK enforcement make
-- ingestion fail.

ALTER TABLE core.stripe_invoice
  DROP CONSTRAINT IF EXISTS stripe_invoice_customer_id_fkey,
  DROP CONSTRAINT IF EXISTS stripe_invoice_subscription_id_fkey;

ALTER TABLE core.stripe_charge
  DROP CONSTRAINT IF EXISTS stripe_charge_customer_id_fkey,
  DROP CONSTRAINT IF EXISTS stripe_charge_invoice_id_fkey;

ALTER TABLE core.stripe_refund
  DROP CONSTRAINT IF EXISTS stripe_refund_charge_id_fkey;

CREATE INDEX IF NOT EXISTS stripe_invoice_subscription_idx ON core.stripe_invoice(subscription_id);
CREATE INDEX IF NOT EXISTS stripe_charge_invoice_idx ON core.stripe_charge(invoice_id);
