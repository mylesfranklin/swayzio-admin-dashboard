"use client";

import type { EveMessage } from "eve/react";
import { MessageParts } from "@/components/agent/message-parts";

export function AgentMessage({ message }: { message: EveMessage }) {
  if (message.role === "user") {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");

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
    </div>
  );
}
