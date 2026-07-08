"use client";

import type { EveMessageInputRequest } from "eve/react";
import { ShieldQuestion } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HitlCard({
  disabled,
  onAnswer,
  request,
}: {
  disabled?: boolean;
  onAnswer: (answer: { optionId?: string; text?: string }) => void | Promise<void>;
  request: EveMessageInputRequest;
}) {
  const [text, setText] = useState("");

  return (
    <div className="rounded-box border border-warning/40 bg-warning/10 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-warning/30 bg-base-100 text-warning">
          <ShieldQuestion className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">Eve needs approval</p>
          <p className="mt-1 text-xs leading-5 text-ink-muted">{request.prompt}</p>

          {request.display === "text" || request.allowFreeform ? (
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={2}
              placeholder="Add context for Eve..."
              className="mt-3 w-full resize-none rounded-field border border-line bg-base-100 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none"
            />
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {(request.options ?? defaultOptions).map((option) => (
              <Button
                key={option.id}
                type="button"
                size="sm"
                variant={option.style === "primary" ? "primary" : "outline"}
                disabled={disabled}
                onClick={() => void onAnswer({ optionId: option.id })}
                className={cn(option.style === "danger" && "border-error/40 text-error hover:text-error")}
              >
                {option.label}
              </Button>
            ))}
            {request.allowFreeform ? (
              <Button
                type="button"
                size="sm"
                disabled={disabled || text.trim().length === 0}
                onClick={() => void onAnswer({ text: text.trim() })}
              >
                Send note
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const defaultOptions = [
  { id: "approve", label: "Approve", style: "primary" as const },
  { id: "deny", label: "Deny", style: "default" as const },
];
