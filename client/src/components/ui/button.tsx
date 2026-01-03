import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-linear-purple focus-visible:ring-offset-2 focus-visible:ring-offset-linear-base disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default: "bg-linear-purple text-white shadow-sm hover:bg-linear-purple-hover hover:shadow-glow-purple hover:-translate-y-px active:translate-y-0 active:scale-[0.98] active:shadow-none",
        destructive: "bg-linear-error text-white shadow-sm hover:bg-linear-error/90 hover:shadow-[0_0_20px_rgba(235,87,87,0.15)] active:scale-[0.98]",
        outline: "border border-linear-border bg-transparent text-white hover:bg-linear-hover hover:border-linear-text-tertiary active:scale-[0.98]",
        secondary: "bg-linear-hover text-white hover:bg-linear-border active:scale-[0.98]",
        ghost: "text-linear-text-secondary hover:bg-linear-hover hover:text-white active:scale-[0.98]",
        link: "text-linear-purple underline-offset-4 hover:underline",
        success: "bg-linear-success text-white shadow-sm hover:bg-linear-success/90 hover:shadow-glow-success active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5",
        xl: "h-12 px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
