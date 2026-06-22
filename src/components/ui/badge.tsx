import { cn } from "@/lib/utils";

/**
 * Shared badge vocabulary — maps to the DESIGN.md `badge-*` component tokens.
 * Semantic tones are solid color with dark text (uniform, WCAG-AA verified by
 * `design:lint`); `neutral` is the quiet base-300 chip.
 */
type Tone = "neutral" | "success" | "warning" | "error" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-base-300 text-ink-faint",
  success: "bg-success text-base-100",
  warning: "bg-warning text-warning-content",
  error: "bg-error text-base-100",
  info: "bg-info text-base-100",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[0.625rem] font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
