import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared surface — maps to the DESIGN.md `card` component token
 * (base-200 fill, hairline border, box radius). Hierarchy comes from the
 * surface ladder + border, not shadow (see design system: Elevation & Depth).
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-box border border-line bg-base-200", className)} {...props} />;
}
