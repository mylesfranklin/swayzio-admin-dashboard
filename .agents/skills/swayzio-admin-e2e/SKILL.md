---
name: swayzio-admin-e2e
description: End-to-end smoke-test harness for the live Swayzio Admin Dashboard (admin.swayzio.com) — act as a signed-in founder via a Browser Use cloud browser, pull Clerk verification codes from an AgentMail inbox, and verify the founders-only gate plus that the Stripe / HubSpot / app-DB analytics pages and data APIs load with real data. Use when asked to run an E2E test, smoke-test the admin dashboard in production, verify founder sign-in, reproduce a dashboard bug, or confirm the analytics pages/APIs work against admin.swayzio.com.
allowed-tools: Bash, Read, Edit, Write
---

# Swayzio Admin Dashboard — E2E Harness

A persistent **founder** test identity for `admin.swayzio.com`, so an agent can sign in,
load the dashboards, and assert the data APIs return real, founder-scoped data. Adapted
from the `swayzio-e2e` harness (which targets the *product* app); this one targets the
*admin* dashboard, which is read-only analytics — so there are **no uploads**, just
sign-in + page loads + API assertions + the auth-gate check.

## Auth model (read this first — founders-only)

`admin.swayzio.com` is gated three ways: Clerk session (middleware) **+** the founder
allowlist (`FOUNDER_EMAILS`) enforced on **both** pages (`(dashboard)/layout.tsx`) and
data APIs (`requireFounder` in the route handlers) **+** an **Internal** Google consent
screen (only `swayzio.com` Workspace accounts can OAuth).

The QA identity clears the gate without a real founder Google account by:
- being a **Clerk user with `public_metadata.role = "founder"`** → passes `isFounder()`
  via the role check, independent of the email allowlist;
- signing in with **email verification code** (delivered to the AgentMail inbox), not
  Google SSO — so enable **Email code** as a sign-in method on the prod Clerk instance.

The Browser Use **persistent profile** holds the signed-in session, so re-login is rare.

## Standing assets (secrets in gitignored `.e2e/env`)

Source it, never print it: `set -a; source .e2e/env; set +a`

| Asset | Value / location |
| --- | --- |
| Test email + inbox | `swayzio-qa@agentmail.to` (`SWAYZIO_E2E_INBOX_ID`, AgentMail) |
| Clerk QA user (prod) | `SWAYZIO_E2E_CLERK_USER_ID`, instance `SWAYZIO_E2E_PROD_INSTANCE_ID`, `public_metadata.role = "founder"` |
| Browser session | Browser Use cloud **persistent profile** `SWAYZIO_E2E_BROWSER_PROFILE_ID` |
| App | `SWAYZIO_E2E_APP_URL` = https://admin.swayzio.com |
| API keys | `BROWSER_USE_API_KEY`, `AGENTMAIL_API_KEY` |
| Helper | `.agents/skills/swayzio-admin-e2e/lib/admin_e2e.py` |

CLIs are global: `agentmail` (npm), `browser-use` (cloud), `clerk`. Add to PATH each session:
```bash
export PATH="$HOME/.browser-use-env/bin:$HOME/.local/bin:$PATH"
```

## Three capabilities

### 1. Act as the founder (Browser Use cloud)
```bash
browser-use cloud connect                 # reattach persistent profile → already signed in
browser-use open https://admin.swayzio.com
browser-use state                         # element indices (works through shadow DOM)
browser-use click <i> / input <i> "text" / screenshot .e2e/artifacts/x.png
browser-use close                         # stop the cloud browser (ends billing)
```
If `state` shows the sign-in page (session expired), re-auth once via the code loop
(section 2), then the profile carries the session forward again.

> **Gotcha (verified 2026-06-22):** drive sign-in with the **connected-session** model
> (`browser-use cloud connect` + `open`/`state`/`click`/`input`) — all steps share one
> persistent browser, so the email→password→**code** loop works across steps. Do **not**
> use the Cloud **v2 tasks API** (`cloud v2 POST /tasks`) for the code loop: each task
> **stops its browser session on completion** ("Browser session is stopped"), so you can't
> read the AgentMail code and re-enter it on the same session. Sessions also cap at 240s.
> First admin sign-in always needs an email code (new browser = new device); once the
> profile is signed in, subsequent runs reuse it codelessly.

### 2. Receive Clerk codes (AgentMail)
```bash
python3 .agents/skills/swayzio-admin-e2e/lib/admin_e2e.py inbox-codes   # newest 6-digit Clerk codes
python3 .agents/skills/swayzio-admin-e2e/lib/admin_e2e.py inbox-list 10 # recent messages (sanitized)
```
Codes can lag a few seconds — poll.

### 3. Verify in-app (data APIs with the live Clerk token)
The signed-in browser calls the dashboard's own APIs with the live Clerk token — the
truest assertion surface (founder-scoped, real DTOs). `eval` is async-unfriendly, so
stash on `window` then re-read:
```bash
browser-use eval "(async()=>{const t=await window.Clerk.session.getToken();
const j=await(await fetch('/api/hubspot/metrics',{headers:{authorization:'Bearer '+t}})).json();
window.__r='contacts='+j.totalContacts+' activeSubs30='+(j.activeSubscribers&&j.activeSubscribers.last30);})();'go'"
browser-use eval "window.__r"
```
Endpoints: `/api/hubspot/metrics` (totalContacts, subscribed, activeSubscribers, reacquire,
companies…), `/api/stripe/metrics` (mrr, payingSubscriptions, activeSubscriptions, churn…).

**Gate check** — confirm founders-only actually holds: a fetch with **no** Authorization
header (or as a non-founder) must NOT return data:
```bash
browser-use eval "(async()=>{const r=await fetch('/api/hubspot/metrics');window.__g=r.status;})();'go'"
browser-use eval "window.__g"   # expect 401/403/404, never 200 with data
```

## Standard smoke run
1. `browser-use cloud connect && browser-use open $SWAYZIO_E2E_APP_URL`; confirm the
   dashboard loads (not `/sign-in`, not `/not-authorized`).
2. Open `/analytics/stripe` and `/analytics/hubspot`; screenshot; confirm KPIs render.
3. `eval` `/api/hubspot/metrics` → assert `totalContacts > 0` and `activeSubscribers` present.
4. `eval` `/api/stripe/metrics` → assert `payingSubscriptions` present and `mrr > 0`.
5. Gate check → unauthenticated fetch returns 401/403/404 (founders-only holds).
6. `browser-use close`.

## Safety
- `.e2e/` is gitignored — never commit it, never paste its contents.
- Never print Clerk tokens, the `sk_live` key, or raw provider payloads.
- QA account is read-only; the admin dashboard has no destructive writes. Verification
  reads are safe against production.

## Provisioning (once `.e2e/env` is filled — see env.example)
1. **AgentMail**: create the inbox `swayzio-qa@agentmail.to` (`AGENTMAIL_API_KEY`).
2. **Browser Use**: `browser-use cloud login` → `browser-use cloud connect` (creates the
   persistent profile → record `SWAYZIO_E2E_BROWSER_PROFILE_ID`).
3. **Clerk QA user**: create on the prod instance with email `swayzio-qa@agentmail.to`,
   set `public_metadata.role = "founder"` (via `clerk` CLI — needs `clerk auth login` on
   the host — or the Clerk Backend API with `sk_live`). Enable **Email code** sign-in on
   the instance.
4. First sign-in via the browser, reading the code from the inbox; the profile then
   carries the session forward.
5. Record all ids in `.e2e/env`.
