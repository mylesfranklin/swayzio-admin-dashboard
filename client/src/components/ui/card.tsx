import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border text-white transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "border-linear-border bg-linear-card shadow-linear",
        glass: "glass-card glass-border shadow-linear-md",
        elevated: "border-linear-border bg-linear-card shadow-linear-lg gradient-border",
        interactive: "border-linear-border bg-linear-card shadow-linear card-interactive",
        stat: "border-linear-border bg-linear-card shadow-linear stat-card",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      padding: {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 md:p-5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-sm md:text-base font-semibold leading-tight tracking-tight text-white",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs md:text-sm text-linear-text-secondary leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 md:p-5 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 md:p-5 pt-0 border-t border-linear-border mt-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  accentColor?: "purple" | "success" | "warning" | "error"
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, change, changeLabel, icon, trend, accentColor = "purple", ...props }, ref) => {
    const accentColors = {
      purple: "from-linear-purple/20 to-transparent",
      success: "from-linear-success/20 to-transparent",
      warning: "from-linear-warning/20 to-transparent",
      error: "from-linear-error/20 to-transparent",
    }

    const trendColors = {
      up: "text-linear-success",
      down: "text-linear-error",
      neutral: "text-linear-text-secondary",
    }

    return (
      <Card
        ref={ref}
        variant="stat"
        className={cn("relative overflow-hidden group", className)}
        {...props}
      >
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          accentColors[accentColor]
        )} />
        <CardContent className="p-4 md:p-5 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-linear-text-tertiary">
              {title}
            </span>
            {icon && (
              <div className="p-2 rounded-lg bg-linear-hover/50 text-linear-text-secondary group-hover:text-linear-purple transition-colors">
                {icon}
              </div>
            )}
          </div>
          <div className="flex items-end justify-between gap-2">
            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {value}
            </span>
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend ? trendColors[trend] : (change >= 0 ? trendColors.up : trendColors.down)
              )}>
                <span>{change >= 0 ? "+" : ""}{change}%</span>
                {changeLabel && (
                  <span className="text-linear-text-tertiary">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)
StatCard.displayName = "StatCard"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, StatCard, cardVariants }
