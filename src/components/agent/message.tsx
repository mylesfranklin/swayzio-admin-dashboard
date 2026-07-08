"use client";

import type { EveMessage } from "eve/react";
import { UserRound } from "lucide-react";
import { MessageParts } from "@/components/agent/message-parts";

export function AgentMessage({ message }: { message: EveMessage }) {
  if (message.role === "user") {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");

    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-box border border-brand/30 bg-brand/15 px-3.5 py-2.5 text-sm leading-6 text-ink">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-base-200 text-primary">
        <UserRound className="h-4 w-4" />
      </div>
      <div className="min-w-0 pt-0.5">
        <MessageParts message={message} />
      </div>
    </div>
  );
}
