"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-red-500 text-white hover:bg-red-500/90 shadow-sm dark:bg-red-600 dark:hover:bg-red-600/90",
        outline:
          "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-white/20 dark:bg-transparent dark:hover:bg-white/10 dark:hover:text-white",
        secondary:
          "bg-secondary text-white hover:bg-secondary/80 shadow-sm",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white",
        link:
          "text-primary underline-offset-4 hover:underline",
        glowing:
          "bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_200%] animate-gradient-x text-white shadow-lg shadow-primary/25 hover:shadow-primary/40",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
