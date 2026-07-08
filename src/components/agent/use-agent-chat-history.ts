"use client";

import { useMemo, useState } from "react";

export type AgentChatSummary = {
  id: string;
  title: string;
  updatedAt: number;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Chat history is a convenience layer; failure should not interrupt Eve.
  }
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function titleFromMessage(message: string) {
  const title = message.replace(/\s+/g, " ").trim();
  return title.length > 56 ? `${title.slice(0, 53)}...` : title || "New chat";
}

export function useAgentChatHistory(baseKey: string) {
  const keys = useMemo(
    () => ({
      current: `${baseKey}:current`,
      history: `${baseKey}:history`,
      session: (id: string) => `${baseKey}:conversation:${id}`,
    }),
    [baseKey]
  );

  const [activeConversationId, setActiveConversationId] = useState(() => {
    const current = typeof window === "undefined" ? null : window.localStorage.getItem(keys.current);
    const id = current || createId();
    if (!current && typeof window !== "undefined") window.localStorage.setItem(keys.current, id);
    return id;
  });
  const [conversations, setConversations] = useState<AgentChatSummary[]>(() =>
    readJson<AgentChatSummary[]>(keys.history, [])
  );

  const persistHistory = (next: AgentChatSummary[]) => {
    const trimmed = next
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 24);
    setConversations(trimmed);
    writeJson(keys.history, trimmed);
  };

  return {
    activeConversationId,
    activeSessionKey: keys.session(activeConversationId),
    conversations,
    newConversation() {
      const id = createId();
      setActiveConversationId(id);
      if (typeof window !== "undefined") window.localStorage.setItem(keys.current, id);
    },
    selectConversation(id: string) {
      setActiveConversationId(id);
      if (typeof window !== "undefined") window.localStorage.setItem(keys.current, id);
    },
    touchConversation(message: string) {
      const now = Date.now();
      const existing = conversations.find((conversation) => conversation.id === activeConversationId);
      const next = [
        {
          id: activeConversationId,
          title: existing?.title || titleFromMessage(message),
          updatedAt: now,
        },
        ...conversations.filter((conversation) => conversation.id !== activeConversationId),
      ];
      persistHistory(next);
    },
  };
}
