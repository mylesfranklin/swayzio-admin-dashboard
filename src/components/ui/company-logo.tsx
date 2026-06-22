"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Company logo from a domain — uses Google's favicon service (free, no auth,
 * resolves for ~any domain). Falls back to a monogram chip if the icon fails.
 */
export function CompanyLogo({ domain, className }: { domain: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const clean = domain.replace(/^www\./, "");
  const letter = clean.charAt(0).toUpperCase();

  if (failed) {
    return (
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded bg-base-300 text-[0.625rem] font-semibold text-ink-muted",
          className
        )}
      >
        {letter}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${clean}&sz=64`}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("h-5 w-5 shrink-0 rounded bg-base-300 object-contain", className)}
    />
  );
}
