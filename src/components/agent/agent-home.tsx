"use client";

import { BarChart3, Banknote, DatabaseZap, MessageSquareText, Send, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROMPT_ICONS = [BarChart3, Banknote, UsersRound, MessageSquareText, DatabaseZap, Sparkles];

export function AgentHome({
  suggestions,
  onAsk,
}: {
  suggestions: readonly string[];
  onAsk: (message: string) => void | Promise<void>;
}) {
  return (
    <div className="flex flex-1 items-center px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-base-200 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-normal text-ink sm:text-[2rem]">
          What should Eve look into?
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted">
          Ask the company OS about revenue, cash, customers, socials, freshness, and the data behind each answer.
        </p>

        <div className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {suggestions.map((suggestion, index) => {
            const Icon = PROMPT_ICONS[index % PROMPT_ICONS.length];

            return (
              <button
                key={suggestion}
                onClick={() => void onAsk(suggestion)}
                className="group flex min-h-16 items-start gap-3 rounded-box border border-line bg-base-200 px-3.5 py-3 text-left text-sm text-ink-muted transition-colors hover:border-brand/50 hover:bg-base-300 hover:text-ink"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-base-100 text-ink-faint group-hover:text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="leading-5">{suggestion}</span>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          className="mt-5 border border-line bg-base-200"
          onClick={() => void onAsk("Give me a founder brief across revenue, cash, customers, socials, and stale data.")}
        >
          <Send className="h-3.5 w-3.5" />
          Founder brief
        </Button>
      </div>
    </div>
  );
}
