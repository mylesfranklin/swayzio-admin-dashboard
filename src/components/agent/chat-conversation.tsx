"use client";

import type { EveMessage, UseEveAgentStatus } from "eve/react";
import type { ReactNode } from "react";
import { ArrowDown, Plus } from "lucide-react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { AgentMessage } from "@/components/agent/message";
import { Button } from "@/components/ui/button";

export function ChatConversation({
  error,
  historyMenu,
  isBusy,
  messages,
  onNewChat,
  status,
}: {
  error?: Error;
  historyMenu: ReactNode;
  isBusy: boolean;
  messages: readonly EveMessage[];
  onNewChat: () => void;
  status: UseEveAgentStatus;
}) {
  return (
    <StickToBottom className="relative flex min-h-0 flex-1 flex-col" initial="instant" resize="smooth">
      <div className="bg-base-100/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-ink">Eve</h1>
            <p className="text-xs text-ink-muted">
              {status === "submitted" ? "Preparing a run" : status === "streaming" ? "Reading the OS" : "Ready"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {historyMenu}
            <Button type="button" variant="ghost" size="sm" onClick={onNewChat} className="border border-line bg-base-200">
              <Plus className="h-3.5 w-3.5" />
              New chat
            </Button>
          </div>
        </div>
      </div>

      <StickToBottom.Content
        scrollClassName="flex-1 overflow-y-auto"
        className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-6 sm:px-6"
      >
        {messages.map((message) => (
          <AgentMessage key={message.id} message={message} />
        ))}

        {isBusy ? (
          <div className="flex items-center gap-2 pb-2 text-xs text-ink-faint">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {status === "submitted" ? "Starting Eve..." : "Streaming response..."}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-box border border-error/30 bg-error/10 p-3 text-xs text-error">
            {error.message}
          </div>
        ) : null}
      </StickToBottom.Content>

      <ScrollToLatest />
    </StickToBottom>
  );
}

function ScrollToLatest() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;

  return (
    <button
      type="button"
      onClick={() => void scrollToBottom({ animation: "smooth" })}
      className="absolute bottom-4 left-1/2 z-10 flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-full border border-line bg-base-200 px-3 text-xs text-ink-muted shadow-linear hover:bg-base-300 hover:text-ink"
    >
      <ArrowDown className="h-3.5 w-3.5" />
      Latest
    </button>
  );
}
