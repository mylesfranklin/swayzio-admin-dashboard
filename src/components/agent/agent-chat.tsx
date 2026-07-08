"use client";

import { useAuth, useUser } from "@clerk/nextjs";
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
import { useAgentChatHistory } from "@/components/agent/use-agent-chat-history";
import { useAgentSessionPersistence } from "@/components/agent/use-agent-session-persistence";
import { isClerkConfigured } from "@/lib/auth";
import { cn } from "@/lib/utils";

const LOCAL_DEV_PERSISTENCE_KEY = "swayzio:eve-agent:session:v1:local-dev";
const NOOP_BEARER = async () => "";

export function AgentChat() {
  // Same keyless-dev pattern as sidebar-user/greeting: never call Clerk hooks without
  // ClerkProvider. Keyless dev sends no bearer and relies on localDev loopback auth.
  return isClerkConfigured ? (
    <ClerkAgentChat />
  ) : (
    <AgentChatInner bearer={NOOP_BEARER} persistenceKey={LOCAL_DEV_PERSISTENCE_KEY} />
  );
}

function ClerkAgentChat() {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();
  const bearer = useCallback(async () => (await getToken({ template: "eve" })) ?? "", [getToken]);

  if (!isLoaded) return <div className="min-h-[calc(100vh-4rem)] bg-base-100" />;

  const founderKey = user?.id ?? user?.primaryEmailAddress?.emailAddress ?? "unknown-founder";
  return <AgentChatInner bearer={bearer} persistenceKey={`swayzio:eve-agent:session:v1:${founderKey}`} />;
}

function AgentChatInner({
  bearer,
  persistenceKey,
}: {
  bearer: () => Promise<string>;
  persistenceKey: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-[calc(100vh-4rem)] bg-base-100" />;

  return <AgentChatWorkspace bearer={bearer} persistenceBaseKey={persistenceKey} />;
}

function AgentChatWorkspace({
  bearer,
  persistenceBaseKey,
}: {
  bearer: () => Promise<string>;
  persistenceBaseKey: string;
}) {
  const history = useAgentChatHistory(persistenceBaseKey);

  return (
    <AgentChatSession
      key={history.activeConversationId}
      activeConversationId={history.activeConversationId}
      bearer={bearer}
      conversations={history.conversations}
      onNewChat={history.newConversation}
      onSelectConversation={history.selectConversation}
      onTouchConversation={history.touchConversation}
      persistenceKey={history.activeSessionKey}
    />
  );
}

function AgentChatSession({
  activeConversationId,
  bearer,
  conversations,
  onNewChat,
  onSelectConversation,
  onTouchConversation,
  persistenceKey,
}: {
  activeConversationId: string;
  bearer: () => Promise<string>;
  conversations: readonly { id: string; title: string; updatedAt: number }[];
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onTouchConversation: (message: string) => void;
  persistenceKey: string;
}) {
  const persistence = useAgentSessionPersistence(persistenceKey);
  const [draft, setDraft] = useState(() => persistence.loadDraft());
  const agentRef = useRef<UseEveAgentSnapshot<EveMessageData> | undefined>(undefined);

  const options = useMemo<UseEveAgentOptions<EveMessageData>>(
    () => ({
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
        },
      }),
    }),
    [bearer, persistence]
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
    <div className={cn("flex min-h-[calc(100vh-4rem)] flex-col bg-base-100", hasMessages && "pb-52")}>
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
                variant="hero"
              />
            </>
          }
          historyMenu={historyMenu}
        />
      )}

      {hasMessages ? (
        <div className="fixed bottom-[4.75rem] left-0 right-0 z-40 px-4 py-3 sm:px-6 md:bottom-6 md:left-[15.25rem]">
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
