"use client";

import type { EveDynamicToolPart } from "eve/react";
import { Check, ChevronDown, CircleAlert, Clock3, Loader2, ShieldX, Wrench } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TOOL_LABELS: Record<string, string> = {
  app_snapshot: "App snapshot",
  company_catalog: "Company catalog",
  data_dictionary: "Data dictionary",
  facebook_ads: "Facebook ads",
  facebook_entity: "Facebook entity",
  facebook_posts: "Facebook posts",
  facebook_snapshot: "Facebook snapshot",
  freshness: "Data freshness",
  hubspot_snapshot: "HubSpot snapshot",
  identity_360: "Identity 360",
  instagram_entity: "Instagram entity",
  instagram_media: "Instagram media",
  instagram_snapshot: "Instagram snapshot",
  mercury_cash_snapshot: "Mercury cash",
  mercury_cashflow_monthly: "Mercury cashflow",
  mercury_entity: "Mercury entity",
  mercury_runway: "Mercury runway",
  mercury_spend: "Mercury spend",
  mercury_transactions: "Mercury transactions",
  mrr_trend: "MRR trend",
  recall_memory: "OS memory",
  revenue_health: "Revenue health",
  revenue_monthly: "Monthly revenue",
  stripe_snapshot: "Stripe snapshot",
  super_followers: "Super followers",
  top_accounts: "Top accounts",
  trigger_sync: "Sync request",
};

export function ToolActivity({ parts }: { parts: readonly EveDynamicToolPart[] }) {
  const [open, setOpen] = useState(false);
  const running = parts.some((part) => isRunning(part.state));
  const errored = parts.some((part) => part.state === "output-error");
  const denied = parts.some((part) => part.state === "output-denied");
  const completed = parts.filter((part) => part.state === "output-available").length;

  return (
    <div className="rounded-box border border-line bg-base-200">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
      >
        <span className="flex min-w-0 items-center gap-2 text-xs text-ink-muted">
          <StatusIcon running={running} errored={errored} denied={denied} />
          <span className="truncate">
            Eve checked {parts.length} {parts.length === 1 ? "source" : "sources"}
          </span>
          {completed ? <span className="text-ink-faint">({completed} complete)</span> : null}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-ink-faint", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="space-y-2 border-t border-line p-2">
          {parts.map((part) => (
            <ToolRow key={part.toolCallId} part={part} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ToolRow({ part }: { part: EveDynamicToolPart }) {
  const label = toolLabel(part);

  return (
    <div className="rounded border border-line/70 bg-base-100 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <StatusIcon
            denied={part.state === "output-denied"}
            errored={part.state === "output-error"}
            running={isRunning(part.state)}
          />
          <span className="truncate text-xs font-medium text-ink">{label}</span>
        </div>
        <span className="shrink-0 rounded-full border border-line bg-base-200 px-2 py-0.5 text-[0.6875rem] text-ink-faint">
          {statusLabel(part.state)}
        </span>
      </div>

      {"errorText" in part && part.errorText ? (
        <p className="mt-2 text-xs leading-5 text-error">{part.errorText}</p>
      ) : null}

      <div className="mt-2 grid gap-2 lg:grid-cols-2">
        <JsonBlock label="Input" value={"input" in part ? part.input : undefined} />
        <JsonBlock label="Output" value={"output" in part ? part.output : undefined} />
      </div>
    </div>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  if (value === undefined) return null;

  return (
    <div>
      <p className="mb-1 text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint">{label}</p>
      <pre className="max-h-48 overflow-auto rounded border border-line bg-base-200 p-2 font-mono text-[0.6875rem] leading-4 text-ink-muted">
        {formatJson(value)}
      </pre>
    </div>
  );
}

function StatusIcon({
  denied,
  errored,
  running,
}: {
  denied?: boolean;
  errored?: boolean;
  running?: boolean;
}) {
  if (running) return <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />;
  if (errored) return <CircleAlert className="h-3.5 w-3.5 shrink-0 text-error" />;
  if (denied) return <ShieldX className="h-3.5 w-3.5 shrink-0 text-warning" />;
  return <Check className="h-3.5 w-3.5 shrink-0 text-success" />;
}

function isRunning(state: EveDynamicToolPart["state"]) {
  return state === "input-streaming" || state === "input-available" || state === "approval-requested";
}

function statusLabel(state: EveDynamicToolPart["state"]) {
  switch (state) {
    case "approval-requested":
      return "approval";
    case "approval-responded":
      return "approved";
    case "input-available":
    case "input-streaming":
      return "running";
    case "output-available":
      return "complete";
    case "output-denied":
      return "denied";
    case "output-error":
      return "error";
  }
}

function toolLabel(part: EveDynamicToolPart) {
  const name = part.toolMetadata?.eve?.name ?? part.toolName;
  return TOOL_LABELS[name] ?? name.replaceAll("_", " ");
}

function formatJson(value: unknown) {
  const json = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  if (!json) return "";
  return json.length > 3000 ? `${json.slice(0, 3000)}\n... truncated` : json;
}
