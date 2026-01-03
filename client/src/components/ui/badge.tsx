import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-linear-purple/20 text-linear-purple",
        secondary: "bg-linear-border text-linear-text-secondary",
        destructive: "bg-linear-error/20 text-linear-error",
        success: "bg-linear-success/20 text-linear-success",
        warning: "bg-linear-warning/20 text-linear-warning",
        info: "bg-linear-info/20 text-linear-info",
        outline: "border border-linear-border text-linear-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
