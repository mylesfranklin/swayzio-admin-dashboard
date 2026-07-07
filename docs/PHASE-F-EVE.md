# Phase F — Eve Agent Historical Build Log

> **Status:** Historical record. Phase F is complete and live. Current operational state lives in
> `docs/HANDOFF.md`; current architecture lives in `docs/ARCHITECTURE.md`; current paths are listed in
> `docs/CODEMAP.md`.

## Final State

- Eve is pinned at `0.19.0`.
- The model is `anthropic/claude-sonnet-5` through Vercel AI Gateway.
- The agent lives at repo-root `agent/`, not `src/agent/`, because eve CLI commands require
  `agent/agent.ts` at the project root.
- `next.config.ts` uses `withEve(nextConfig)` with the default root `agent/`.
- The dashboard page at `/agent` renders `src/components/agent/agent-chat.tsx`.
- `/eve/v1/*` is same-origin and excluded from Clerk middleware; `agent/channels/eve.ts` is the
  bearer-token/founder boundary.
- Tools read Swayzio OS through `SWAYZIO_OS_AGENT_RO_URL` where configured.
- The only action tool is `trigger_sync`, which requires human approval and dispatches
  `.github/workflows/os-sync.yml`.

## Implemented Agent Surface

Agent files:

- `agent/agent.ts`
- `agent/channels/eve.ts`
- `agent/instructions.md`
- `agent/lib/os.ts`
- `agent/lib/format.ts`
- `agent/tools/*.ts`
- `agent/skills/data-dictionary/SKILL.md`

Dashboard files:

- `src/app/(dashboard)/agent/page.tsx`
- `src/components/agent/agent-chat.tsx`
- `src/proxy.ts`
- `next.config.ts`

## Key Lessons Preserved

- Eve is a fast-moving beta. Read `node_modules/eve/CHANGELOG.md` before any upgrade.
- `needsApproval` became `approval`; this repo uses `approval: always()` for `trigger_sync`.
- Tool output must be JSON-safe. Use `agent/lib/format.ts` and cast SQL date/interval values to text
  where needed.
- `memory.recall(query, embedding, scope, k)` uses `scope` as an exact scope/source matcher, not a
  kind filter.
- Local `eve dev` accepts loopback traffic through `localDev()`. Production auth must be verified on a
  non-loopback origin.
- `/eve/v1/*` must remain outside Clerk middleware. Clerk middleware 500s on non-Clerk bearer tokens;
  the eve channel is the correct boundary.

## Remaining Follow-Ups

Tracked in `docs/HANDOFF.md`:

- Add Eve evals, especially for revenue-health caveats.
- Add `churned_accounts` after the Stripe feed ingests canceled subscriptions and a new
  `api.churned_accounts` view exists.
- Optionally add a Monday digest schedule.
- Confirm Vercel Agent Runs observability availability for the team.

## Superseded Planning Notes

Earlier implementation notes referenced `src/agent/`, `withEve(nextConfig, { eveRoot: "./src/agent" })`,
and pending F0-F6 checklist items. Those notes are intentionally removed from the active doc because
they no longer match the shipped implementation. Use the final-state sections above plus the current
code for future work.
