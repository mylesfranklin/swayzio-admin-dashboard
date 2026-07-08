"use client";

import { useMemo } from "react";
import type { EveMessageData, UseEveAgentOptions, UseEveAgentSnapshot } from "eve/react";

type PersistedSession = {
  draft?: string;
  events?: UseEveAgentOptions<EveMessageData>["initialEvents"];
  session?: UseEveAgentOptions<EveMessageData>["initialSession"];
};

function readStorage(key: string): PersistedSession {
  if (typeof window === "undefined") return {};

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as PersistedSession) : {};
  } catch {
    return {};
  }
}

function writeStorage(key: string, value: PersistedSession) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Best-effort persistence should never interrupt chat.
  }
}

export function useAgentSessionPersistence(key: string) {
  return useMemo(() => {
    const initial = readStorage(key);

    return {
      initialEvents: initial.events,
      initialSession: initial.session,
      clear() {
        if (typeof window !== "undefined") window.localStorage.removeItem(key);
      },
      loadDraft() {
        return readStorage(key).draft ?? "";
      },
      persistFromSnapshot(snapshot?: UseEveAgentSnapshot<EveMessageData>) {
        if (!snapshot) return;
        const current = readStorage(key);
        writeStorage(key, {
          ...current,
          events: snapshot.events,
          session: snapshot.session,
        });
      },
      saveDraft(draft: string) {
        const current = readStorage(key);
        writeStorage(key, { ...current, draft });
      },
    };
  }, [key]);
}
