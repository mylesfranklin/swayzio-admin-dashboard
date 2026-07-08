"use client";

import { Clock3, MessageSquareText, Plus } from "lucide-react";
import { useState } from "react";
import type { AgentChatSummary } from "@/components/agent/use-agent-chat-history";
import { cn } from "@/lib/utils";

export function ChatHistoryMenu({
  activeConversationId,
  conversations,
  onNewChat,
  onSelectConversation,
}: {
  activeConversationId: string;
  conversations: readonly AgentChatSummary[];
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-base-200 px-3.5 text-sm font-medium text-ink-muted transition-colors hover:bg-base-300 hover:text-ink"
      >
        <Clock3 className="h-3.5 w-3.5" />
        Chats
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-box border border-line bg-base-200 p-2 shadow-linear-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onNewChat();
            }}
            className="mb-2 flex w-full items-center gap-2 rounded-field px-2.5 py-2 text-left text-sm text-ink hover:bg-base-300"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            New chat
          </button>

          <div className="max-h-72 overflow-y-auto border-t border-line pt-2">
            {conversations.length === 0 ? (
              <p className="px-2.5 py-3 text-xs text-ink-faint">No saved chats yet.</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSelectConversation(conversation.id);
                  }}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-field px-2.5 py-2 text-left transition-colors hover:bg-base-300",
                    conversation.id === activeConversationId && "bg-base-300"
                  )}
                >
                  <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">{conversation.title}</span>
                    <span className="mt-0.5 block text-[0.6875rem] text-ink-faint">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(conversation.updatedAt))}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
