import { defineAgent } from "eve";

// The founders' analytics agent for Swayzio OS. Model is a Vercel AI Gateway string
// (resolved via `eve link` — no separate provider key). See docs/PHASE-F-EVE.md.
export default defineAgent({
  model: "anthropic/claude-opus-4.8",
});
