"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-950",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-white hover:bg-secondary/80",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-500/80 dark:bg-red-600 dark:hover:bg-red-600/80",
        outline:
          "border-gray-200 text-gray-700 dark:border-white/20 dark:text-gray-300",
        gold:
          "border-transparent bg-amber-500 text-white hover:bg-amber-500/80",
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
