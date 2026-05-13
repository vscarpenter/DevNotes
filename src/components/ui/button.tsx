import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Button is mapped to Inkwell's intent system:
 *   default     → btn-primary (accent fill)
 *   destructive → btn-danger  (rust fill)
 *   outline     → btn-secondary (paper + gray-300 border)
 *   secondary   → btn-secondary (gray-100 fill)
 *   ghost       → btn-ghost
 *
 * The base utilities here only set layout, focus, and motion; color and
 * border come from the .btn-* classes in inkwell-components.css. This
 * keeps Inkwell as the single source of truth for button surfaces.
 */
const buttonVariants = cva(
  "btn focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:     "btn-primary",
        destructive: "btn-danger",
        outline:     "btn-secondary",
        secondary:   "btn-secondary",
        ghost:       "btn-ghost",
      },
      size: {
        xs:         "h-8 px-2 text-xs",
        sm:         "h-9 px-3 text-sm",
        default:    "",
        lg:         "h-11 px-8 text-base",
        xl:         "h-12 px-10 text-lg",
        icon:       "h-10 w-10 px-0",
        "icon-sm":  "h-8 w-8 px-0",
        "icon-lg":  "h-12 w-12 px-0",
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
