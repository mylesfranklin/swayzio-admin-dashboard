# HubSpot Integration

> Built 2026-06-21. Music-catalog / artist CRM intelligence, surfaced on `/analytics/hubspot`.

## Tooling decision
**CRM API v3 via `@hubspot/api-client` + a private-app token** (`HUBSPOT_ACCESS_TOKEN`,
scope `crm.objects.contacts.read`). Same pattern as Stripe: server service → SWR cache → route.
This **de-Replits** the old auth (legacy used the Replit connector — dead off-Replit).
The Remote HubSpot MCP (`mcp.hubspot.com`, OAuth/PKCE) is reserved for the eve.dev agent later;
the HubSpot CLI / Developer-MCP are CMS/app-dev tools, not relevant here.

## Data model (verified live)
Contacts carry custom properties: `artist_name` (text), `tagged_tracks`/`untagged_tracks`
(number), `pro` (enum: BMI/ASCAP/PRS/SOCAN/SESAC/Other), `subscribed`/`signed_to_deal` (bool).
~25.4k contacts; only engaged artists have populated custom props.

**Reality checks that shaped the spec:**
- HubSpot product-interaction fields (`hs_analytics_num_page_views`, etc.) are **~all zero** — so
  "power users" rank by `tagged_tracks` (usage) + `lastmodifieddate` (recency), not web analytics.
  True in-app engagement would come from the app's own DB later.
- ~92% of emails are personal (B2C). The **company** breakdown is meaningful **by tracks**, not
  user count — it surfaces real labels/distributors (dayonemusic, blapkits, hrdrv, beatstars…).
  Personal + internal (`swayzio.com`) domains are excluded.

## Metrics surfaced (live values 2026-06-21)
| Metric | Value | Source |
|---|---|---|
| Total contacts | 25,445 | Search `total` |
| Artists (`artist_name` set) | 23,820 | Search `HAS_PROPERTY` |
| Subscribed | 1,109 (4.7% of artists) | Search `subscribed=true` |
| Signed to deal | 3,062 | Search `signed_to_deal=true` |
| PRO-registered | 1,110 | Search `pro HAS_PROPERTY` |
| Tagged tracks (catalog) | 111,690 across 9,088 artists | Pagination sum |
| PRO mix | BMI 579 · ASCAP 352 · PRS 98 · SOCAN 65 · SESAC 9 | Search per value |
| Contact growth | new/month (12 mo) from `createdate` | Search `BETWEEN` ×12 |

## Components (`/analytics/hubspot`)
KPI row (Contacts/Subscribed/Signed/Tagged-tracks) · **PRO donut** · **Contact-growth area** ·
**Power Users** table (artist · email + 📋copy · tracks · PRO · subscribed · last activity, with
"copy all emails") · **Top Companies** table (domain · tracks · users · subscribed · signed).
Email copy via `src/components/ui/copy-button.tsx`.

## Code map
- `src/server/integrations/hubspot.ts` — service (counts/pro/growth/power-users/catalog-scan).
  Global search limiter (`MAX_CONCURRENT_SEARCHES=2`) + 6 retries keep under HubSpot's ~5/s search cap.
- `src/server/integrations/hubspot-dashboard.ts` — cached aggregator (TTLs 15m–6h).
- `src/app/api/hubspot/metrics/route.ts` — route handler. `/api/cron/refresh` warms hubspot caches.
- `src/app/(dashboard)/analytics/hubspot/` — page; `src/components/hubspot/hubspot-client.tsx` — view.
- Re-verify / re-warm: `npx tsx scripts/verify-hubspot.ts`.

## Later
- Wire real in-app engagement (logins/sessions/actions) from the app DB for a truthful "power user" score.
- HubSpot `subscribed` (1,109) vs Stripe paying (~949) are different systems' views — keep both honest.
- Add a HubSpot Contacts / Tagged-tracks tile to the main dashboard overview.
