"use client";

import { useEveAgent } from "eve/react";
import { useAuth } from "@clerk/nextjs";
import { useRef, useEffect } from "react";
import { Send, Sparkles, Square } from "lucide-react";

const SUGGESTIONS = [
  "How's our revenue health — booked MRR vs cash collected?",
  "Who are our top 10 accounts across all systems?",
  "Which labels have the biggest catalogs?",
  "Is the data fresh right now?",
];

interface InputRequest {
  requestId: string;
  prompt?: string;
  options?: { optionId: string; label?: string }[];
}
interface MessagePart {
  type: string;
  text?: string;
  toolName?: string;
  toolMetadata?: { eve?: { inputRequest?: InputRequest } };
}
interface Message {
  id: string;
  role: string;
  parts: MessagePart[];
}

export function AgentChat() {
  const { getToken } = useAuth();
  const agent = useEveAgent({
    // The channel boundary verifies this Clerk token (clerkFounder AuthFn); localDev opens it in dev.
    // The "eve" JWT template mints tokens with aud + email + role claims — the channel's
    // clerkFounder() AuthFn verifies exactly those (default session tokens carry neither).
    auth: { bearer: async () => (await getToken({ template: "eve" })) ?? "" },
  });

  const messages = agent.data.messages as unknown as Message[];
  const isBusy = agent.status === "submitted" || agent.status === "streaming";

  // Human-in-the-loop: a pending approval/question rides on the latest message.
  const pending: InputRequest | undefined = (messages.at(-1)?.parts ?? [])
    .map((p) => p.toolMetadata?.eve?.inputRequest)
    .find(Boolean);
  const answer = (optionId: string) =>
    pending && void agent.send({ inputResponses: [{ requestId: pending.requestId, optionId }] });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, agent.status]);

  const ask = (message: string) => {
    if (message.trim()) void agent.send({ message: message.trim() });
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col rounded-box border border-line bg-base-200">
      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">Ask the OS</p>
              <p className="mt-1 text-sm text-ink-muted">
                Grounded in real Stripe, HubSpot &amp; product data — unified by identity.
              </p>
            </div>
            <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-box border border-line bg-base-300/40 p-3 text-left text-xs text-ink-muted transition-colors hover:border-brand/40 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-box bg-brand/15 px-4 py-2.5 text-sm text-ink"
                  : "max-w-[85%] space-y-2 rounded-box border border-line bg-base-300/40 px-4 py-2.5 text-sm text-ink"
              }
            >
              {m.parts.map((part, i) => {
                if (part.type === "text" && part.text) {
                  return (
                    <p key={i} className="whitespace-pre-wrap leading-relaxed">
                      {part.text}
                    </p>
                  );
                }
                const tool =
                  part.toolName ?? (part.type.startsWith("tool-") ? part.type.slice(5) : null);
                if (tool) {
                  return (
                    <div key={i} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-200 px-2 py-0.5 text-[0.625rem] text-ink-faint">
                      <span className="size-1.5 rounded-full bg-brand" />
                      {tool}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {isBusy && (
          <div className="flex items-center gap-2 text-xs text-ink-faint">
            <span className="size-1.5 animate-pulse rounded-full bg-brand" />
            {agent.status === "submitted" ? "Thinking…" : "Responding…"}
          </div>
        )}
        {agent.status === "error" && agent.error && (
          <div className="rounded-box border border-error/30 bg-error/10 p-3 text-xs text-error">
            {agent.error.message}
          </div>
        )}
      </div>

      {/* human-in-the-loop approval / question */}
      {pending && (
        <div className="border-t border-line bg-warning/5 p-3">
          <p className="mb-2 text-xs text-ink-muted">
            {pending.prompt ?? "The agent wants to take an action. Approve?"}
          </p>
          <div className="flex flex-wrap gap-2">
            {(pending.options ?? [
              { optionId: "approve", label: "Approve" },
              { optionId: "deny", label: "Deny" },
            ]).map((opt) => {
              const isPositive = /approve|yes|allow|confirm/i.test(`${opt.optionId} ${opt.label ?? ""}`);
              return (
                <button
                  key={opt.optionId}
                  onClick={() => answer(opt.optionId)}
                  className={
                    isPositive
                      ? "inline-flex h-8 items-center rounded-field bg-brand px-3 text-xs font-medium text-white hover:bg-brand-hover"
                      : "inline-flex h-8 items-center rounded-field border border-line px-3 text-xs text-ink-muted hover:text-ink"
                  }
                >
                  {opt.label ?? opt.optionId}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* composer */}
      <form
        className="flex items-center gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          ask(String(form.get("message") ?? ""));
          e.currentTarget.reset();
        }}
      >
        <input
          name="message"
          autoComplete="off"
          placeholder="Ask about MRR, churn, an account, a label…"
          className="flex-1 rounded-field border border-line bg-base-100 px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand/50 focus:outline-none"
        />
        {isBusy ? (
          <button
            type="button"
            onClick={() => agent.stop()}
            className="inline-flex h-9 items-center gap-1.5 rounded-field bg-base-300 px-3.5 text-sm text-ink-muted hover:text-ink"
          >
            <Square className="h-3.5 w-3.5" /> Stop
          </button>
        ) : (
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-field bg-brand px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <Send className="h-3.5 w-3.5" /> Send
          </button>
        )}
      </form>
    </div>
  );
}
