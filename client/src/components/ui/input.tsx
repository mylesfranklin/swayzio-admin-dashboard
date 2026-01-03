import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded border border-linear-border bg-linear-card px-3 py-2 text-sm text-white placeholder:text-linear-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-linear-purple focus:ring-offset-2 focus:ring-offset-linear-base disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
