"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Copy-to-clipboard button. Inline (icon-only) for table cells, or labeled for
 * "copy all". Shows a transient check on success.
 */
export function CopyButton({
  value,
  label,
  className,
  title,
}: {
  value: string;
  label?: string;
  className?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={title ?? (label ? undefined : "Copy")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md text-ink-faint transition-colors hover:text-ink",
        label ? "border border-line px-2.5 py-1 text-xs hover:bg-base-300" : "p-1",
        copied && "text-success",
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {label && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}
