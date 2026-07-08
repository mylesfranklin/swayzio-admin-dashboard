"use client";

import type { EveMessage } from "eve/react";
import { MessageParts } from "@/components/agent/message-parts";
import { ResponseActions } from "@/components/agent/response-actions";

export function AgentMessage({ message }: { message: EveMessage }) {
  const text = messageText(message);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-box border border-brand/30 bg-brand/15 px-4 py-3 text-md leading-6 text-ink">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full">
      <MessageParts message={message} />
      <ResponseActions text={text} />
    </div>
  );
}

function messageText(message: EveMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n\n");
}
