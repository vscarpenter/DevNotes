import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "manuscript-button inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium manuscript-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 ease-smooth",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-0.5 border border-manuscript-shadow/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-0.5 border border-manuscript-shadow/20",
        outline:
          "border-2 border-dark-teal/30 bg-transparent hover:bg-dark-teal/10 hover:border-dark-teal hover-glow-teal",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-elevation-1 hover:shadow-elevation-2 border border-manuscript-shadow/20",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground hover:scale-105",
        link: "text-manuscript-gold underline-offset-4 hover:underline hover:text-primary",
        gradient: "bg-gradient-teal text-white shadow-elevation-2 hover:shadow-elevation-3 hover:-translate-y-1 hover-glow-teal border-none",
        "gradient-gold": "bg-gradient-gold text-gray-900 shadow-elevation-2 hover:shadow-elevation-3 hover:-translate-y-1 hover-glow-gold border-none font-semibold",
        glass: "glass-panel text-dark-text hover:bg-dark-teal/20 shadow-elevation-2 hover:shadow-elevation-3",
      },
      size: {
        xs: "h-8 px-2 text-xs",
        sm: "h-9 px-3 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-11 px-8 text-lg",
        xl: "h-12 px-10 text-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
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

export { Button }