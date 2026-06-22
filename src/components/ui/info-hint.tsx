import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small eye icon that reveals a description on hover — keeps explanatory copy off
 * the component surface. Pure CSS (named group so it never fires on a parent's
 * `group` hover). Works in both server and client components.
 */
export function InfoHint({
  text,
  className,
  align = "left",
}: {
  text: string;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <span className={cn("group/hint relative inline-flex items-center", className)}>
      <Eye className="h-3.5 w-3.5 cursor-help text-ink-faint transition-colors hover:text-ink-muted" />
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-full z-50 mt-2 w-64 rounded-lg border border-line bg-base-300 p-3 text-[0.6875rem] font-normal normal-case leading-relaxed tracking-normal text-ink-muted opacity-0 shadow-xl transition-opacity duration-150 group-hover/hint:opacity-100",
          align === "right" ? "right-0" : "left-0"
        )}
      >
        {text}
      </span>
    </span>
  );
}
