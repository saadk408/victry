import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";
import { getStatusClasses, type StatusType, type StatusVariant } from "@/lib/utils/status-colors";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Status type for semantic status badges
   * When provided, overrides the variant prop and uses status-based styling
   */
  status?: StatusType;
  /**
   * Style variant when using status prop
   * @default "solid"
   */
  statusVariant?: StatusVariant;
}

function Badge({ className, variant, status, statusVariant = "solid", ...props }: BadgeProps) {
  // If status is provided, use status utilities; otherwise use regular variants
  if (status) {
    return (
      <div 
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "border-transparent shadow",
          getStatusClasses(status, statusVariant, true),
          className
        )} 
        {...props} 
      />
    );
  }
  
  // Fallback to existing variant system
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
