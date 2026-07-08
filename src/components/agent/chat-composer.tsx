"use client";

import type { KeyboardEvent } from "react";
import { ArrowUp, CircleStop, Database, Loader2 } from "lucide-react";
import type { UseEveAgentStatus } from "eve/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChatComposer({
  disabled,
  draft,
  isBusy,
  onChange,
  onSend,
  onStop,
  status,
}: {
  disabled?: boolean;
  draft: string;
  isBusy: boolean;
  onChange: (value: string) => void;
  onSend: (value: string) => void | Promise<void>;
  onStop: () => void;
  status: UseEveAgentStatus;
}) {
  const canSend = draft.trim().length > 0 && !isBusy && !disabled;

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (canSend) void onSend(draft);
  };

  return (
    <div
      className={cn(
        "rounded-box border border-line bg-base-200 transition-colors",
        "focus-within:border-brand/60 focus-within:bg-base-200"
      )}
    >
      <textarea
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={disabled ? "Respond to Eve's approval request to continue." : "Ask Eve about the company..."}
        className="max-h-40 min-h-16 w-full resize-none rounded-box bg-transparent px-4 py-3 text-sm leading-6 text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-ink-faint">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-100 px-2 py-1">
            <Database className="h-3 w-3" />
            Swayzio OS
          </span>
          <span className="hidden sm:inline">
            {status === "submitted" ? "Preparing..." : status === "streaming" ? "Streaming..." : "Enter to send"}
          </span>
        </div>

        {isBusy ? (
          <Button type="button" variant="ghost" size="sm" onClick={onStop} className="border border-line bg-base-300">
            {status === "submitted" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CircleStop className="h-3.5 w-3.5" />}
            Stop
          </Button>
        ) : (
          <button
            type="button"
            disabled={!canSend}
            onClick={() => void onSend(draft)}
            aria-label="Send message"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-base-300 disabled:text-ink-faint"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
