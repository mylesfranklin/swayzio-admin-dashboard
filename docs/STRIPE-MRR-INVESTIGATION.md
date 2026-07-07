# Stripe MRR Investigation — The $17.9K vs $34.5K Reconciliation

**Date:** 2026-07-07 (builds on the 2026-06-20 investigation) · **Status:** root cause established, remediation quantified, pilot pending founder go-ahead
**Method:** every number below was computed live against the Stripe API (full-catalog sweeps, no sampling except where noted) and cross-checked against Swayzio OS (`core.subscription`). One-off analysis scripts are described in §9.

---

## TL;DR

The Stripe app shows **$17.9K MRR**. Our dashboard shows **$34.5K booked MRR**. Actual cash collected last full month was **$7.4K**. All three are correct answers to three different questions:

| Number | Question it answers | Definition |
|---|---|---|
| **$34.5K** (dashboard, "booked") | What have we sold? | Sum of list price across all `status=active` subscriptions |
| **$17.9K** (Stripe app) | What can our billing still collect? | Active + past-due subs whose collection is still *live* (latest invoice paid or open) — Stripe's analytics silently churns any sub once its invoice is voided |
| **$7.4K** (collected, June) | What cash actually arrived? | Paid charges net of refunds |

The gap between booked and collectible is **~$41K/mo of subscriptions with `pause_collection` set** — a deliberate old-app mechanism ("pause instead of cancel", built for retrying failed prepaid cards) whose **resume/retry half was never executed**. The parking lot filled continuously from mid-2024 and was never emptied.

Realistic recovery is **$2–4K/mo**, not the $13–14K previously estimated: 40% of the parked base *never paid once* (cancel, don't retry), and most of the rest is >12 months stale.

---

## 1. The trigger

Myles: *"On my Stripe app right now I'm seeing $17.9K MRR (June 10 – Today). What is the discrepancy?"* — against the dashboard/Eve figure of $34,517/mo booked MRR.

(Note: the date range on the Stripe tile is irrelevant — MRR is a point-in-time metric; the range only scopes the sparkline.)

## 2. Hypotheses tested and eliminated

Each candidate explanation was computed against the live API rather than assumed:

| Hypothesis | Test | Result |
|---|---|---|
| **Discounts/coupons** (Stripe MRR is net of permanent discounts) | Full sweep of 3,205 active subs with `discounts` expanded | **Eliminated.** Only 17 subs carry any discount; net $34,167 vs gross $34,462 — a $295 effect, not $16.6K |
| **Status scope** (Stripe MRR = active + past_due) | Gross MRR by status | **Eliminated — wrong direction.** active+past_due = $60.0K, further from $17.9K |
| **"First payment received" analytics config** (never-paid subs excluded) | Scanned all 28,360 paid invoices → MRR over ever-paid subs | **Eliminated.** Active-ever-paid = $25.0K; +past-due-ever-paid = $39.1K. Neither matches |
| **Voided-invoice exclusion** (analytics churns a sub once its invoice voids) | MRR over subs whose latest invoice is paid/open | **✅ Confirmed** — see §3 |

## 3. The reconciliation

Stripe's Billing analytics counts a subscriber until their subscription is canceled or `unpaid` — but in practice, once dunning ends with a **voided invoice**, the subscriber contributes $0 and is treated as (involuntarily) churned, even though the API status remains `active` or `past_due`. This account's configuration voids invoices rather than canceling subs, so the two systems diverge massively:

| Cohort (live, 2026-07-07) | Subs | MRR |
|---|---|---|
| Active, latest invoice **paid** (actually billing) | 915 | $7,567 |
| Active, latest invoice open/draft | 43 | $518 |
| Past-due, latest invoice **open** (in the ~30-day dunning window; 97% ≤30d old) | 1,237 | $10,630 |
| **≈ Stripe's MRR** | | **$18.7K vs the $17.9K tile** (~4% residual: drafts, trial/free exclusions, snapshot timing) |
| Active, latest invoice **voided** | 2,252 | $26,428 |
| Past-due, latest invoice **voided** | 1,021 | $14,865 |
| **≈ Dashboard booked MRR** (active statuses only) | 3,210 | **$34.5K** |

Stripe's own figure has drifted **$18.1K (Jun 20) → $17.9K (Jul 7)** — the collectible base is still shrinking, consistent with declining collections ($14.3K in Jul '25 → $7.4K in Jun '26).

## 4. Root cause: the `pause_collection` parking lot

**3,336 active/past-due subscriptions (~$42K/mo booked) have `pause_collection` set** — almost all `{behavior: "void", resumes_at: null}` (paused indefinitely). Stripe auto-voids each renewal invoice the moment it finalizes (~3,124 voids per 30 days), the subscription stays `active`, and the customer keeps full product access without being charged.

### 4.1 The rebuild theory — tested and disproven

The 2026-06-20 investigation attributed the mass pause to the app rebuild (Apr–May 2026). Forensics on 2026-07-07 disproved this:

- **First-void invoice month** (120-sub sample across the paused population, drawn from permanent invoice history): smeared continuously from **June 2024** onward, with the bulk in **Aug–Dec 2024** (57% of the sample) — and essentially *nothing* in Apr–May 2026 (0 and 1 respectively).
- **Last-paid months** smear identically: customers dropped off billing steadily for 18+ months, not in one event.
- **No sub created after March 2026 is paused**, and only **~6 pause-SET events occurred in the last 30 days** — the mechanism wound down around the rebuild era rather than being caused by it. (The residual trickle means the code path still exists somewhere in Swayzio-Core — worth a `grep pause_collection`.)

### 4.2 Design intent — confirmed

Myles (2026-07-07): pause-instead-of-cancel **was a deliberate old-app design**. Many subscribers paid with what appeared to be prepaid cards; when a card failed (e.g., insufficient funds), the app paused collection so the card could be **retried later** instead of canceling the customer.

**The gap: the retry/resume half never ran.** Every paused sub has `resumes_at: null`, voids continue for 12–18 months uninterrupted, and the parked base only ever grew. The parking lot was designed — emptying it wasn't built.

## 5. Quantifying the bet (funding × recency matrix)

Full sweep of all 3,336 paused subs: which card would a resume actually retry (`card.funding` of the sub's/customer's default payment method), by time since the sub last paid:

| Booked MRR | <3mo | 3–6mo | 6–12mo | >12mo | **never paid** | Total |
|---|---|---|---|---|---|---|
| **Debit** (2,045 subs) | $377 | $1,064 | $2,520 | $9,892 | $11,995 | **$25,848** |
| **Credit** (893) | $356 | $565 | $1,341 | $4,743 | $3,765 | **$10,770** |
| **Prepaid** (380) | $25 | $110 | $100 | $905 | $4,060 | **$5,200** |
| No card / unknown (18) | — | — | — | — | — | $152 |
| **Total (3,336)** | $763 | $1,749 | $3,993 | $15,550 | **$19,865** | **$41,970** |

Findings that reshape the recovery estimate:

1. **The prepaid theory covers a minority (12% of parked MRR).** The base is overwhelmingly ordinary debit and credit cards. Prepaid *is* concentrated exactly where the theory predicts — 72% of prepaid subs never paid once.
2. **40% of the parked base never paid a cent** — 1,345 subs, $19.9K/mo booked. First charge failed, parked forever. In cash terms these were never customers: **cancel, don't retry** (zero revenue loss, removes half the booked-MRR fiction instantly).
3. **The realistic recovery ceiling is the "warm" cohort**: real cards (debit+credit) that paid within the last 12 months — **~711 subs, $6.2K/mo booked**. At plausible retry success rates: **$2–4K/mo actual recovery**. The >12mo real-card tier ($14.6K booked) is largely expired cards plus customers with 18 months of free service — win-back email territory, not silent charges.

## 6. Recommendations

1. **Pilot** — resume collection on **debit+credit, last paid <6 months** (~271 subs, $2.4K/mo booked). Start with a batch of ~25, measure clear-rate and disputes over one cycle. Prepaid/NSF retries are low-risk by nature: a failed retry lands no charge, so no dispute surface.
2. **Expand** to the 6–12mo tier (440 subs, $3.9K booked) with a heads-up email before charging.
3. **Clean up** — cancel the never-paid cohort outright; after retries exhaust, **cancel rather than re-park** (otherwise the lot refills and booked MRR re-inflates). This is what converges booked ($34.5K) toward collectible (~$18K) so every dashboard tells one story.
4. **Find the trickle** — locate the surviving pause path in Swayzio-Core (~6 pauses/month) and decide deliberately whether it stays.
5. **Comms** for any cohort parked >6 months before their card is retried.

## 7. How the dashboard/OS should present this

No changes needed to the metrics themselves — the dashboard already leads with the honest triple (collected → paying → booked) plus the void-invoice count, and Swayzio OS carries the same reconciliation in `metrics.stripe_daily`. The framing for founders:

> **Booked $34.5K** = entitlement granted · **Collectible ~$18K** = billing still alive · **Collected $7.4K** = cash. The spread *is* the pause_collection remediation opportunity, now sized at $2–4K/mo realistic.

## 8. Timeline of the investigation

| Date | Finding |
|---|---|
| 2026-06-20 | Void-invoice crisis surfaced (dashboard rebuild): only 29% of active subs actually billing; `pause_collection` mechanism identified; cause misattributed to the Apr–May app rebuild |
| 2026-07-07 | Eve's first live answer surfaces the 21.5% collection rate; Myles asks the $17.9K question |
| 2026-07-07 | Discounts, status scope, and first-payment-config hypotheses eliminated; **Stripe's figure reproduced within ~4%** as the voided-invoice exclusion |
| 2026-07-07 | Forensics (first-void/last-paid histograms, 30-day event scan) **disprove the rebuild theory**: pausing ran continuously mid-2024 → early 2026, bulk Aug–Dec 2024 |
| 2026-07-07 | Myles confirms pause-instead-of-cancel was deliberate (prepaid-card retry strategy); the resume half was never built |
| 2026-07-07 | Bet quantified: funding × recency matrix; realistic recovery $2–4K/mo; pilot cohort identified |

## 9. Methodology & reproducibility

- All sweeps ran against the **live Stripe API** (read via `STRIPE_SECRET_KEY`) on 2026-07-07: full pagination of active (3,205) and past_due (2,266) subscriptions, all 28,360 paid invoices, and 30 days of `customer.subscription.updated` events. The first-void/last-paid analysis sampled 120 paused subs evenly across the population (invoice history is permanent; Stripe events only cover 30 days, which is why invoices were used to date events older than that).
- Monthly normalization matches `src/server/integrations/stripe.ts` (`monthlyCents`): USD recurring items only, `month/year/week/day` intervals normalized to monthly.
- Cross-checks against Swayzio OS `core.subscription` (fed every 6h by `.github/workflows/os-sync.yml`) matched the live API within normal drift (±5 subs / ±$50).
- Analysis scripts were session-local (`.context/`, gitignored): `mrr-reconcile.mts`, `mrr-firstpaid.mts`, `mrr-dunning.mts`, `pause-forensics.mts`, `pause-bet.mts`. They are one-shot reads (no writes to Stripe) and can be recreated from this document's definitions.
- Related standing docs: dashboard metric definitions in `docs/ARCHITECTURE.md`; the OS reconciliation lives in `metrics.stripe_daily` (verified field-by-field against `getSubscriptionMetrics()`); the Stripe SDK v20 gotcha (`current_period_end` moved to subscription items) is documented in the stripe-service.

---

*Prepared 2026-07-07 during the Eve agent launch. The investigation started as a metrics-discrepancy question and ended as a quantified revenue-recovery plan; the numbers above are the source of truth for the remediation pilot.*

## 10. Implementation status (appended 2026-07-07, same day)

- **Dashboard now shows the accurate view** (commit `fed6b14`): overview leads with Collected MRR;
  the Stripe page KPI row is Collected → Collectible → Booked → Collection Rate plus a "Billing
  reality" strip. `collectibleMrr` is computed from two additive service fields
  (`pastDueOpenSubscriptions/Mrr`) — live-verified against this report's sweeps before shipping.
- **Mirrored into Swayzio OS** (migration `0013_stripe_collectible.sql` + feed): `metrics.stripe_daily`
  now carries `past_due_open_subs/mrr` + `collectible_mrr`; `api.stripe_snapshot` recreated; Eve's
  `revenue_health` quotes collectible. Verified via the `os_agent_ro` role: $18,227 vs Stripe's $17.9K.
- **Still open**: the §6 recovery pilot (awaiting founder go — touches live billing) and the
  swayzio-core `pause_collection` trickle hunt. Tracked in `docs/HANDOFF.md`.
