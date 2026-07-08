"use client";

import { useMemo, useState } from "react";

export type AgentChatSummary = {
  id: string;
  title: string;
  updatedAt: number;
};

export const LOCAL_DEV_AGENT_PERSISTENCE_KEY = "swayzio:eve-agent:session:v1:local-dev";
export const AGENT_CHAT_HISTORY_CHANGED_EVENT = "swayzio:agent-chat-history-changed";

export function agentPersistenceKey(founderKey: string) {
  return `swayzio:eve-agent:session:v1:${founderKey}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readString(key: string) {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function removeStorage(key: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Best-effort cleanup only.
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

function writeString(key: string, value: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Chat history is a convenience layer; failure should not interrupt Eve.
  }
}

function notifyHistoryChanged(baseKey: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AGENT_CHAT_HISTORY_CHANGED_EVENT, { detail: { baseKey } }));
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

export function readAgentChatSummaries(baseKey: string, limit = 24) {
  const summaries = readJson<AgentChatSummary[]>(`${baseKey}:history`, []);
  return summaries
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
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
    const current = readString(keys.current);
    const id = current || createId();
    if (!current) writeString(keys.current, id);
    return id;
  });
  const [conversations, setConversations] = useState<AgentChatSummary[]>(() =>
    readAgentChatSummaries(baseKey)
  );

  const persistHistory = (next: AgentChatSummary[]) => {
    const trimmed = next
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 24);
    const trimmedIds = new Set(trimmed.map((conversation) => conversation.id));
    for (const conversation of next) {
      if (!trimmedIds.has(conversation.id)) removeStorage(keys.session(conversation.id));
    }
    setConversations(trimmed);
    writeJson(keys.history, trimmed);
    notifyHistoryChanged(baseKey);
  };

  return {
    activeConversationId,
    activeSessionKey: keys.session(activeConversationId),
    conversations,
    newConversation() {
      const id = createId();
      setActiveConversationId(id);
      writeString(keys.current, id);
    },
    selectConversation(id: string) {
      setActiveConversationId(id);
      writeString(keys.current, id);
      notifyHistoryChanged(baseKey);
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
