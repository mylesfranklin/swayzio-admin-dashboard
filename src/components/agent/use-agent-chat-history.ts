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

const TITLE_FALLBACK = "New Chat";
const TITLE_WORD_LIMIT = 2;

const WEAK_TITLE_WORDS = new Set([
  "",
  "gm",
  "good morning",
  "hello",
  "hey",
  "hi",
  "new chat",
  "sup",
  "yo",
  "yoo",
]);

const TITLE_STOP_WORDS = new Set([
  "a",
  "about",
  "actually",
  "again",
  "all",
  "also",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "can",
  "check",
  "could",
  "do",
  "does",
  "for",
  "from",
  "get",
  "give",
  "go",
  "have",
  "help",
  "how",
  "i",
  "in",
  "into",
  "is",
  "it",
  "lets",
  "look",
  "make",
  "me",
  "my",
  "need",
  "of",
  "on",
  "our",
  "please",
  "show",
  "so",
  "take",
  "tell",
  "that",
  "the",
  "these",
  "this",
  "to",
  "up",
  "us",
  "want",
  "we",
  "what",
  "when",
  "where",
  "with",
  "would",
  "you",
]);

const TITLE_TOPIC_WORDS = new Map([
  ["arr", "ARR"],
  ["cash", "Cash"],
  ["charge", "Charges"],
  ["charges", "Charges"],
  ["churn", "Churn"],
  ["comment", "Comments"],
  ["comments", "Comments"],
  ["companies", "Companies"],
  ["company", "Companies"],
  ["contact", "Contacts"],
  ["contacts", "Contacts"],
  ["coupon", "Coupons"],
  ["coupons", "Coupons"],
  ["customer", "Customers"],
  ["customers", "Customers"],
  ["dashboard", "Dashboard"],
  ["database", "Database"],
  ["deal", "Deals"],
  ["deals", "Deals"],
  ["dm", "DMs"],
  ["dms", "DMs"],
  ["engagement", "Engagement"],
  ["export", "Export"],
  ["facebook", "Facebook"],
  ["follower", "Followers"],
  ["followers", "Followers"],
  ["github", "GitHub"],
  ["hubspot", "HubSpot"],
  ["insight", "Insights"],
  ["insights", "Insights"],
  ["instagram", "Instagram"],
  ["invoice", "Invoices"],
  ["invoices", "Invoices"],
  ["kit", "Kit"],
  ["markdown", "Markdown"],
  ["mercury", "Mercury"],
  ["mrr", "MRR"],
  ["neon", "Neon"],
  ["pdf", "PDF"],
  ["post", "Posts"],
  ["posts", "Posts"],
  ["price", "Prices"],
  ["prices", "Prices"],
  ["product", "Products"],
  ["products", "Products"],
  ["refund", "Refunds"],
  ["refunds", "Refunds"],
  ["revenue", "Revenue"],
  ["seo", "SEO"],
  ["settings", "Settings"],
  ["social", "Socials"],
  ["socials", "Socials"],
  ["stripe", "Stripe"],
  ["sway", "Sway"],
  ["sync", "Sync"],
  ["tiktok", "TikTok"],
  ["transactions", "Transactions"],
  ["youtube", "YouTube"],
]);

const TITLE_PHRASES = [
  { match: /\b(super[-\s]?followers?|top engaged)\b/i, title: "Top Engaged" },
  { match: /\bhigh[-\s]?impact\b/i, title: "High Impact" },
  { match: /\bbusiness accounts?\b/i, title: "Business Accounts" },
  { match: /\bleft nav(?:igation)?(?: bar)?\b/i, title: "Left Nav" },
  { match: /\bnew chats?\b.*\b(broken|doesnt|doesn't|fail|failing|not|work|working)\b/i, title: "Chat Bug" },
  { match: /\bsync status\b/i, title: "Sync Status" },
  { match: /\bkit newsletter\b/i, title: "Kit Newsletter" },
  { match: /\bbalance transactions?\b/i, title: "Balance Txns" },
];

function normalizedTitleValue(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isReplaceableTitle(title: string) {
  return WEAK_TITLE_WORDS.has(normalizedTitleValue(title));
}

function toTitleWord(word: string) {
  const normalized = normalizedTitleValue(word);
  const known = TITLE_TOPIC_WORDS.get(normalized);
  if (known) return known;
  return normalized ? `${normalized[0]?.toUpperCase() ?? ""}${normalized.slice(1)}` : "";
}

function compactTitleWords(words: string[]) {
  const title = words.filter(Boolean).slice(0, TITLE_WORD_LIMIT).join(" ").trim();
  return title || TITLE_FALLBACK;
}

function titleFromMessage(message: string) {
  const compact = message.replace(/\s+/g, " ").trim();
  if (!compact) return TITLE_FALLBACK;

  for (const phrase of TITLE_PHRASES) {
    if (phrase.match.test(compact)) return phrase.title;
  }

  const normalized = normalizedTitleValue(compact)
    .replace(/^(hi|hey|hello|yo|yoo|sup|gm|good morning|good afternoon|good evening)\s+/, "")
    .replace(/^(can|could|would)\s+you\s+/, "")
    .replace(/^(please|pls)\s+/, "")
    .trim();

  if (!normalized || WEAK_TITLE_WORDS.has(normalized)) return TITLE_FALLBACK;

  const topicWords = normalized
    .split(" ")
    .map((word) => TITLE_TOPIC_WORDS.get(word))
    .filter((word): word is string => Boolean(word));

  if (topicWords.length > 0) {
    return compactTitleWords([...new Set(topicWords)]);
  }

  const fallbackWords = normalized
    .split(" ")
    .filter((word) => !TITLE_STOP_WORDS.has(word))
    .map(toTitleWord);

  return compactTitleWords(fallbackWords);
}

export function readAgentChatSummaries(baseKey: string, limit = 24) {
  const summaries = readJson<AgentChatSummary[]>(`${baseKey}:history`, []);
  return summaries
    .map((summary) => ({ ...summary, title: titleFromMessage(summary.title) }))
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
      const title = titleFromMessage(message);
      const next = [
        {
          id: activeConversationId,
          title: !existing?.title || isReplaceableTitle(existing.title) ? title : existing.title,
          updatedAt: now,
        },
        ...conversations.filter((conversation) => conversation.id !== activeConversationId),
      ];
      persistHistory(next);
    },
  };
}
