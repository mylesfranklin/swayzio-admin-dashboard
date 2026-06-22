import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared button vocabulary — maps to the DESIGN.md `button-*` component tokens.
 * primary = solid brand (deepens on hover); outline/ghost = quiet neutrals.
 */
type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-content shadow-glow-brand hover:bg-brand-hover",
  outline: "border border-line text-ink-muted hover:bg-base-300 hover:text-ink",
  ghost: "text-ink-muted hover:bg-base-300 hover:text-ink",
};
const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-9 gap-1.5 px-3.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
