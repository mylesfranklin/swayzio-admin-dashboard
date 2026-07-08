"use client";

import type {
  EveAuthorizationPart,
  EveDynamicToolPart,
  EveMessage,
  EveMessageInputRequest,
  EveMessagePart,
} from "eve/react";
import { ChevronDown, ExternalLink, LockKeyhole, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Markdown } from "@/components/agent/markdown";
import { ToolActivity } from "@/components/agent/tool-activity";

export function getPendingInputRequest(messages: readonly EveMessage[]) {
  for (const message of [...messages].reverse()) {
    for (const part of [...message.parts].reverse()) {
      if (part.type !== "dynamic-tool") continue;
      if (part.state !== "approval-requested") continue;
      const request = part.toolMetadata?.eve?.inputRequest;
      if (request) return request;
    }
  }
  return undefined;
}

export function MessageParts({ message }: { message: EveMessage }) {
  const grouped = useMemo(() => groupParts(message.parts), [message.parts]);

  return (
    <div className="space-y-4">
      {grouped.map((group, index) => {
        if (group.type === "text") {
          return (
            <Markdown key={index} streaming={group.streaming}>
              {group.text}
            </Markdown>
          );
        }

        if (group.type === "reasoning") {
          return <ReasoningBlock key={index} text={group.text} streaming={group.streaming} />;
        }

        if (group.type === "tools") {
          return <ToolActivity key={index} parts={group.parts} />;
        }

        if (group.type === "authorization") {
          return <AuthorizationCard key={index} part={group.part} />;
        }

        return null;
      })}
    </div>
  );
}

type PartGroup =
  | { type: "authorization"; part: EveAuthorizationPart }
  | { type: "reasoning"; streaming: boolean; text: string }
  | { type: "text"; streaming: boolean; text: string }
  | { type: "tools"; parts: EveDynamicToolPart[] };

function groupParts(parts: readonly EveMessagePart[]): PartGroup[] {
  const groups: PartGroup[] = [];

  for (const part of parts) {
    if (part.type === "step-start") continue;

    const last = groups.at(-1);

    if (part.type === "text") {
      if (last?.type === "text") {
        last.text = `${last.text}\n${part.text}`;
        last.streaming = last.streaming || part.state === "streaming";
      } else {
        groups.push({ type: "text", text: part.text, streaming: part.state === "streaming" });
      }
      continue;
    }

    if (part.type === "reasoning") {
      if (last?.type === "reasoning") {
        last.text = `${last.text}\n${part.text}`;
        last.streaming = last.streaming || part.state === "streaming";
      } else {
        groups.push({ type: "reasoning", text: part.text, streaming: part.state === "streaming" });
      }
      continue;
    }

    if (part.type === "dynamic-tool") {
      if (last?.type === "tools") {
        last.parts.push(part);
      } else {
        groups.push({ type: "tools", parts: [part] });
      }
      continue;
    }

    if (part.type === "authorization") {
      groups.push({ type: "authorization", part });
    }
  }

  return groups;
}

function ReasoningBlock({ streaming, text }: { streaming?: boolean; text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-box border border-line bg-base-200">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs text-ink-muted hover:text-ink"
      >
        <span className="inline-flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary" />
          {streaming ? "Thinking" : "Reasoning"}
        </span>
        <ChevronDown className={open ? "h-3.5 w-3.5 rotate-180" : "h-3.5 w-3.5"} />
      </button>
      {open ? (
        <div className="border-t border-line px-3 py-2 text-xs text-ink-muted">
          <Markdown streaming={streaming}>{text}</Markdown>
        </div>
      ) : null}
    </div>
  );
}

function AuthorizationCard({ part }: { part: EveAuthorizationPart }) {
  const required = part.state === "required";

  return (
    <div className="rounded-box border border-line bg-base-200 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-base-100 text-primary">
          {required ? <LockKeyhole className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{part.displayName}</p>
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            {required ? part.authorization?.instructions ?? part.description : "Authorization completed."}
          </p>
          {required && part.authorization?.url ? (
            <a
              href={part.authorization.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-content transition-colors hover:bg-brand-hover"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Connect
            </a>
          ) : null}
          {required && part.authorization?.userCode ? (
            <p className="mt-2 font-mono text-xs text-ink-faint">Code: {part.authorization.userCode}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export type { EveMessageInputRequest };
