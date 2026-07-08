"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, AudioLines, CircleStop, Database, Loader2, Mic } from "lucide-react";
import type { UseEveAgentStatus } from "eve/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChatComposer({
  disabled,
  draft,
  isBusy,
  onChange,
  onSend,
  onStop,
  status,
}: {
  disabled?: boolean;
  draft: string;
  isBusy: boolean;
  onChange: (value: string) => void;
  onSend: (value: string) => void | Promise<void>;
  onStop: () => void;
  status: UseEveAgentStatus;
}) {
  const canSend = draft.trim().length > 0 && !isBusy && !disabled;
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceBaseRef = useRef("");
  const voiceFinalRef = useRef("");

  const stopVoice = useCallback((abort = false) => {
    const recognition = recognitionRef.current;
    if (recognition) {
      if (abort) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } else {
        recognition.stop();
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    setVoiceSupported(Boolean(getSpeechRecognitionConstructor()));
    return () => stopVoice(true);
  }, [stopVoice]);

  const sendDraft = () => {
    if (!canSend) return;
    stopVoice(true);
    void onSend(draft);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    sendDraft();
  };

  const toggleVoice = () => {
    if (isListening) {
      stopVoice();
      return;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition || disabled || isBusy) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    voiceBaseRef.current = draft.trim();
    voiceFinalRef.current = "";
    recognition.onresult = (event) => {
      let interim = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          voiceFinalRef.current = `${voiceFinalRef.current} ${transcript}`.trim();
        } else {
          interim = `${interim} ${transcript}`.trim();
        }
      }

      onChange([voiceBaseRef.current, voiceFinalRef.current, interim].filter(Boolean).join(" "));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  return (
    <div
      className={cn(
        "border border-line bg-base-200 transition-colors",
        "focus-within:border-brand/60 focus-within:bg-base-200",
        "rounded-box"
      )}
    >
      <textarea
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={disabled ? "Respond to Sway's approval request to continue." : "How can Sway help today?"}
        className={cn(
          "max-h-52 w-full resize-none bg-transparent text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          "min-h-24 rounded-box px-5 py-4 text-lg leading-7"
        )}
      />
      <div className="flex items-center justify-between gap-3 px-3 pb-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-ink-faint">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-base-100 px-2 py-1">
            <Database className="h-3 w-3" />
            Swayzio OS
          </span>
          <span className="hidden sm:inline">
            {isListening
              ? "Listening..."
              : status === "submitted"
                ? "Preparing..."
                : status === "streaming"
                  ? "Streaming..."
                  : "Enter to send"}
          </span>
        </div>

        {isBusy ? (
          <Button type="button" variant="ghost" size="sm" onClick={onStop} className="border border-line bg-base-300">
            {status === "submitted" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CircleStop className="h-3.5 w-3.5" />}
            Stop
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!voiceSupported || disabled}
              onClick={toggleVoice}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title={voiceSupported ? "Voice input" : "Voice input is not supported in this browser"}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border border-line bg-base-100 text-ink-muted transition-colors hover:bg-base-300 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50",
                isListening && "border-brand/50 bg-brand/15 text-primary"
              )}
            >
              {isListening ? <AudioLines className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              type="button"
              disabled={!canSend}
              onClick={sendDraft}
              aria-label="Send message"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-base-300 disabled:text-ink-faint"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechRecognitionLike = {
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0?: { transcript?: string };
  }>;
};

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}
