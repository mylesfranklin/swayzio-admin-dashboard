"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEveAgent,
  type EveMessageData,
  type UseEveAgentOptions,
  type UseEveAgentSnapshot,
} from "eve/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgentHome } from "@/components/agent/agent-home";
import { ChatComposer } from "@/components/agent/chat-composer";
import { ChatConversation } from "@/components/agent/chat-conversation";
import { ChatHistoryMenu } from "@/components/agent/chat-history-menu";
import { HitlCard } from "@/components/agent/hitl-card";
import { getPendingInputRequest } from "@/components/agent/message-parts";
import {
  agentPersistenceKey,
  LOCAL_DEV_AGENT_PERSISTENCE_KEY,
  useAgentChatHistory,
} from "@/components/agent/use-agent-chat-history";
import { useAgentSessionPersistence } from "@/components/agent/use-agent-session-persistence";
import { isClerkConfigured } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NOOP_BEARER = async () => "";

export function AgentChat() {
  // Same keyless-dev pattern as sidebar-user/greeting: never call Clerk hooks without
  // ClerkProvider. Keyless dev sends no bearer and relies on localDev loopback auth.
  return isClerkConfigured ? (
    <ClerkAgentChat />
  ) : (
    <AgentChatInner bearer={NOOP_BEARER} firstName="Myles" persistenceKey={LOCAL_DEV_AGENT_PERSISTENCE_KEY} />
  );
}

function ClerkAgentChat() {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();
  const bearer = useCallback(async () => (await getToken({ template: "eve" })) ?? "", [getToken]);

  if (!isLoaded) return <div className="min-h-[calc(100vh-4rem)] bg-base-100" />;

  const founderKey = user?.id ?? user?.primaryEmailAddress?.emailAddress ?? "unknown-founder";
  const firstName = user?.firstName ?? user?.fullName?.split(/\s+/)[0] ?? null;
  return <AgentChatInner bearer={bearer} firstName={firstName} persistenceKey={agentPersistenceKey(founderKey)} />;
}

function AgentChatInner({
  bearer,
  firstName,
  persistenceKey,
}: {
  bearer: () => Promise<string>;
  firstName?: string | null;
  persistenceKey: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-[calc(100vh-4rem)] bg-base-100" />;

  return <AgentChatWorkspace bearer={bearer} firstName={firstName} persistenceBaseKey={persistenceKey} />;
}

function AgentChatWorkspace({
  bearer,
  firstName,
  persistenceBaseKey,
}: {
  bearer: () => Promise<string>;
  firstName?: string | null;
  persistenceBaseKey: string;
}) {
  const history = useAgentChatHistory(persistenceBaseKey);
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");
  const pendingRouteChatIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (pendingRouteChatIdRef.current !== undefined) {
      if (chatId === pendingRouteChatIdRef.current) {
        pendingRouteChatIdRef.current = undefined;
      }
      return;
    }

    if (
      chatId &&
      chatId !== history.activeConversationId &&
      history.conversations.some((conversation) => conversation.id === chatId)
    ) {
      history.selectConversation(chatId);
    }
  }, [chatId, history]);

  const handleNewChat = useCallback(() => {
    pendingRouteChatIdRef.current = null;
    router.replace("/agent", { scroll: false });
    history.newConversation();
  }, [history, router]);

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      pendingRouteChatIdRef.current = conversationId;
      router.replace(`/agent?chat=${encodeURIComponent(conversationId)}`, { scroll: false });
      history.selectConversation(conversationId);
    },
    [history, router]
  );

  return (
    <AgentChatSession
      key={history.activeConversationId}
      activeConversationId={history.activeConversationId}
      bearer={bearer}
      conversations={history.conversations}
      firstName={firstName}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
      onTouchConversation={history.touchConversation}
      persistenceKey={history.activeSessionKey}
    />
  );
}

function AgentChatSession({
  activeConversationId,
  bearer,
  conversations,
  firstName,
  onNewChat,
  onSelectConversation,
  onTouchConversation,
  persistenceKey,
}: {
  activeConversationId: string;
  bearer: () => Promise<string>;
  conversations: readonly { id: string; title: string; updatedAt: number }[];
  firstName?: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onTouchConversation: (message: string) => void;
  persistenceKey: string;
}) {
  const persistence = useAgentSessionPersistence(persistenceKey);
  const [draft, setDraft] = useState(() => persistence.loadDraft());
  const agentRef = useRef<UseEveAgentSnapshot<EveMessageData> | undefined>(undefined);

  const options = useMemo<UseEveAgentOptions<EveMessageData>>(
    () => {
      const recentChats = conversations.slice(0, 5).map((conversation) => ({
        title: conversation.title,
        updatedAt: new Date(conversation.updatedAt).toISOString(),
      }));

      return {
        auth: { bearer },
        initialEvents: persistence.initialEvents,
        initialSession: persistence.initialSession,
        maxReconnectAttempts: 3,
        onEvent: () => persistence.persistFromSnapshot(agentRef.current),
        onFinish: (snapshot) => persistence.persistFromSnapshot(snapshot),
        onSessionChange: () => persistence.persistFromSnapshot(agentRef.current),
        prepareSend: (input) => ({
          ...input,
          clientContext: {
            surface: "swayzio-admin-agent",
            route: "/agent",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localTime: new Date().toISOString(),
            ...(firstName ? { founderFirstName: firstName } : {}),
            recentChats,
          },
        }),
      };
    },
    [bearer, conversations, firstName, persistence]
  );

  const agent = useEveAgent(options);
  agentRef.current = agent;

  const messages = agent.data.messages;
  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const pending = getPendingInputRequest(messages);
  const hasMessages = messages.length > 0;

  const ask = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || isBusy) return;
      setDraft("");
      persistence.saveDraft("");
      onTouchConversation(trimmed);
      await agent.send({ message: trimmed });
    },
    [agent, isBusy, onTouchConversation, persistence]
  );

  const answer = useCallback(
    async ({ optionId, text }: { optionId?: string; text?: string }) => {
      if (!pending || isBusy) return;
      await agent.send({ inputResponses: [{ requestId: pending.requestId, optionId, text }] });
    },
    [agent, isBusy, pending]
  );

  const updateDraft = useCallback(
    (value: string) => {
      setDraft(value);
      persistence.saveDraft(value);
    },
    [persistence]
  );

  const historyMenu = (
    <ChatHistoryMenu
      activeConversationId={activeConversationId}
      conversations={conversations}
      onNewChat={onNewChat}
      onSelectConversation={onSelectConversation}
    />
  );

  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-4rem)] flex-col bg-base-100",
        hasMessages && (pending ? "pb-80" : "pb-52")
      )}
    >
      {hasMessages ? (
        <ChatConversation
          error={agent.status === "error" ? agent.error : undefined}
          historyMenu={historyMenu}
          isBusy={isBusy}
          messages={messages}
          onNewChat={onNewChat}
          status={agent.status}
        />
      ) : (
        <AgentHome
          composer={
            <>
              {pending ? <HitlCard disabled={isBusy} request={pending} onAnswer={answer} /> : null}
              <ChatComposer
                draft={draft}
                isBusy={isBusy}
                onChange={updateDraft}
                onSend={ask}
                onStop={agent.stop}
                status={agent.status}
              />
            </>
          }
          firstName={firstName}
          historyMenu={historyMenu}
        />
      )}

      {hasMessages ? (
        <div className="fixed bottom-[4.75rem] left-0 right-0 z-40 bg-base-100/95 px-4 py-3 backdrop-blur sm:px-6 md:bottom-6 md:left-[var(--dashboard-sidebar-offset)]">
          <div className="mx-auto max-w-5xl space-y-3">
            {pending ? <HitlCard disabled={isBusy} request={pending} onAnswer={answer} /> : null}
            <ChatComposer
              disabled={Boolean(pending)}
              draft={draft}
              isBusy={isBusy}
              onChange={updateDraft}
              onSend={ask}
              onStop={agent.stop}
              status={agent.status}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
