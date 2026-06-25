import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

/**
 * The ONE write/action tool. It does not touch the database directly — it dispatches the existing
 * GitHub Actions sync workflow (.github/workflows/os-sync.yml) that re-pulls Stripe/HubSpot/app into
 * Swayzio OS. So the agent stays read-only over the data; the only side-effect is kicking the pipeline,
 * and it is gated behind human approval (needsApproval: always()). Non-blocking — the sync runs in CI.
 *
 * Requires SYNC_DISPATCH_TOKEN (a GitHub token with `actions:write`); fail-closed without it.
 */
export default defineTool({
  description:
    "Trigger a fresh sync of Swayzio OS — re-pull Stripe/HubSpot/app data into the brain — by dispatching " +
    "the background sync workflow. Use only when the founder explicitly wants up-to-the-minute data and " +
    "`freshness` shows it's stale. This is a WRITE/action: it requires approval and runs in the background " +
    "(~6 min); it does not block. After dispatching, tell the user to re-check in a few minutes.",
  inputSchema: z.object({
    feeds: z
      .string()
      .optional()
      .describe("space-separated feeds to sync: stripe, hubspot, app. Blank = all feeds."),
  }),
  needsApproval: always(),
  async execute({ feeds }) {
    const token = process.env.SYNC_DISPATCH_TOKEN ?? process.env.GITHUB_TOKEN;
    const repo = process.env.SYNC_REPO ?? "mylesfranklin/swayzio-admin-dashboard";
    if (!token) {
      return { error: "Sync dispatch is not configured (SYNC_DISPATCH_TOKEN missing). Ask an admin to set it." };
    }

    const res = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/os-sync.yml/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ ref: "main", inputs: feeds ? { feeds } : {} }),
    });

    if (res.status === 204) {
      return {
        summary: `Sync dispatched${feeds ? ` for: ${feeds}` : " (all feeds)"}. It runs in the background (~6 min) — re-check \`freshness\` shortly.`,
        dispatched: true,
        actions_url: `https://github.com/${repo}/actions/workflows/os-sync.yml`,
      };
    }
    return { error: `Dispatch failed (HTTP ${res.status}): ${(await res.text()).slice(0, 200)}` };
  },
});
