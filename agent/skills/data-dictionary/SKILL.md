---
name: data-dictionary
description: How Swayzio OS is laid out and what every metric means. Load when you need definitions or to map a question to the right tool.
---

# Swayzio OS — data map & definitions

## The shape
Swayzio OS is one Postgres unifying three sources by **email-resolved identity**:
- **Stripe** → billing (subscriptions, revenue)
- **HubSpot** → artist CRM (contacts, PRO, catalog size)
- **Swayzio-Core app** → product (billing customers, tracks)

You read it through curated `api.*` views (exposed as tools). You never touch raw tables.

## Tool → question map
| Question | Tool |
|---|---|
| Revenue health, cash vs MRR, are we healthy | `revenue_health` |
| MRR, active/paying subs, churn, collection rate | `stripe_snapshot` |
| Contacts, artists, subscribed, catalog totals | `hubspot_snapshot` |
| Billing customers, track owners, live tracks | `app_snapshot` |
| MRR / revenue trend over time | `mrr_trend` |
| Collected revenue by month | `revenue_monthly` (12mo) |
| Who is X / cohort of people | `identity_360` |
| Biggest accounts / people | `top_accounts` |
| Biggest labels / distributors / companies | `company_catalog` |
| A definition / architecture / past lesson | `recall_memory` |
| What data exists / field meaning | `data_dictionary` |
| Is the data current? | `freshness` |
| Refresh / re-sync the data (needs approval) | `trigger_sync` |

Every metric tool returns a `summary` (plain-English headline) — lead with it.

## Definitions (say it this way)
- **MRR** — USD booked monthly run-rate from *active* subscriptions at list price. Not cash.
- **Paying subs** — active AND latest invoice `paid`. The real billing base (many active subs have
  `void` invoices = broken billing).
- **Collection rate** — collected-last-full-month ÷ MRR. The true revenue-health signal.
- **MRR at risk** — booked MRR of `past_due` subscriptions.
- **Churn %** — subscriptions canceled in last 30d ÷ active-at-window-start.
- **Tagged tracks** — an artist's catalog size (HubSpot). Upload *timing* lives in the app DB.
- **identity_360 flags** — `in_stripe` / `in_hubspot` / `in_app`: which systems a person appears in.

## Caveat to always surface
When asked about revenue, distinguish **booked MRR** (`stripe_snapshot.mrr`) from **collected revenue**
(`revenue_monthly`, `stripe_snapshot.collected_last_full_month`). The gap is the story.
