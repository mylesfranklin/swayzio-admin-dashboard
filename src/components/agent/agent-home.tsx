"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function AgentHome({
  composer,
  firstName,
  historyMenu,
}: {
  composer: ReactNode;
  firstName?: string | null;
  historyMenu: ReactNode;
}) {
  const headline = firstName ? `Yoo ${firstName}` : "Yoo";

  return (
    <div className="relative flex flex-1 items-center px-4 py-10 sm:px-6">
      <div className="absolute right-4 top-4 sm:right-6">{historyMenu}</div>

      <div className="mx-auto flex w-full max-w-4xl -translate-y-10 flex-col items-center text-center">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-base-200 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="mb-8 text-3xl font-semibold tracking-normal text-ink sm:text-[2.5rem]">
          {headline}
        </h1>

        <div className="w-full max-w-3xl">{composer}</div>
      </div>
    </div>
  );
}
