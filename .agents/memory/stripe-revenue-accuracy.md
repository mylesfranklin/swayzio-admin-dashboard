---
name: Stripe revenue accuracy & speed
description: How to compute Stripe revenue accurately without making the dashboard hang.
---

# Stripe revenue: accuracy + speed

## Rule 1 — Never bundle the 12-month charge history into the core dashboard stats fetch
**Why:** charge volume is enormous because ~2,250 past_due subscriptions generate repeated
*failed* charges. A plain `charges.list` pagination over 12 months runs 10+ minutes with no
error, which previously blocked ALL core subscription metrics (MRR, active subs, churn, the
active-subscriptions table) from ever caching — the dashboard appeared permanently empty.
**How to apply:** keep revenue in its own cache key (`stripe`/`revenue`), fetched/merged
separately (stale-while-revalidate, returns zeros on a cold cache while it warms). The core
`getDashboardStats()` must not fetch charges. Both the Stripe analytics route and the main
aggregate dashboard route must merge revenue from the `stripe:revenue` cache, or one of them
shows $0.

## Rule 2 — Fetch revenue with the Search API filtered to succeeded charges
**Why:** revenue only counts successful charges. `charges.list` has no status filter, so it
paginates the huge failed-charge volume. `stripe.charges.search({ query: "status:'succeeded'
AND created>=GTE AND created<LT" })` skips all failed charges, shrinking the result set so the
whole 12-month fetch completes in ~1 minute instead of 10+. Paginate via `next_page`/`has_more`.
**How to apply:** one search per calendar month, run a few months in parallel (concurrency ~4 —
Search API has a lower rate limit than list endpoints). This is also MORE accurate than summing
all charges and filtering client-side.

## MRR note
Standard MRR (sum of active subscriptions' normalized monthly amounts) computes to ~$34.7K for
this account and is mathematically correct. Do NOT fabricate a filter to force a different
number; if a stakeholder expects a different figure, it's a definition mismatch (e.g. their
Stripe billing-dashboard view) — confirm the intended definition rather than hard-coding.
