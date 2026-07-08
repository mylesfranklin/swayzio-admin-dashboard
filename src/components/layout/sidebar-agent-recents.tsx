"use client";

import { useUser } from "@clerk/nextjs";
import { MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AgentChatSummary } from "@/components/agent/use-agent-chat-history";
import {
  agentPersistenceKey,
  AGENT_CHAT_HISTORY_CHANGED_EVENT,
  LOCAL_DEV_AGENT_PERSISTENCE_KEY,
  readAgentChatSummaries,
} from "@/components/agent/use-agent-chat-history";
import { isClerkConfigured } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function SidebarAgentRecents() {
  return isClerkConfigured ? <ClerkAgentRecents /> : <AgentRecents baseKey={LOCAL_DEV_AGENT_PERSISTENCE_KEY} />;
}

function ClerkAgentRecents() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) return null;

  const founderKey = user?.id ?? user?.primaryEmailAddress?.emailAddress ?? "unknown-founder";
  return <AgentRecents baseKey={agentPersistenceKey(founderKey)} />;
}

function AgentRecents({ baseKey }: { baseKey: string }) {
  const [conversations, setConversations] = useState<AgentChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setConversations(readAgentChatSummaries(baseKey, 5));
      setActiveChatId(new URLSearchParams(window.location.search).get("chat"));
    };

    const onHistoryChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ baseKey?: string }>).detail;
      if (!detail?.baseKey || detail.baseKey === baseKey) refresh();
    };

    refresh();
    window.addEventListener("popstate", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener(AGENT_CHAT_HISTORY_CHANGED_EVENT, onHistoryChanged);

    return () => {
      window.removeEventListener("popstate", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(AGENT_CHAT_HISTORY_CHANGED_EVENT, onHistoryChanged);
    };
  }, [baseKey]);

  if (conversations.length === 0) return null;

  return (
    <div className="mt-1 space-y-0.5 border-l border-line/60 pl-3">
      {conversations.map((conversation) => {
        const active = activeChatId === conversation.id;

        return (
          <Link
            key={conversation.id}
            href={`/agent?chat=${encodeURIComponent(conversation.id)}`}
            className={cn(
              "flex min-w-0 items-center gap-2 rounded-field px-2 py-1.5 text-ink-muted transition-colors hover:bg-base-300 hover:text-ink",
              active && "bg-brand/10 text-ink"
            )}
            title={conversation.title}
          >
            <MessageSquareText className={cn("h-3.5 w-3.5 shrink-0 text-ink-faint", active && "text-brand")} />
            <span className="truncate text-xs">{conversation.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
