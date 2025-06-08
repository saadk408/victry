"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0-100) */
  value?: number;
  /** Whether progress is indeterminate/loading */
  indeterminate?: boolean;
  /** Max progress value */
  max?: number;
  /** Height of the progress bar */
  height?: string;
  /** Color variant of the progress bar */
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

function Progress({
  className,
  value = 0,
  indeterminate = false,
  max = 100,
  height = "h-2",
  variant = "default",
  ...props
}: ProgressProps) {
  // Calculate completion percentage
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  // Determine variant classes
  const variantClasses = {
    default: "bg-gray-900 dark:bg-gray-50",
    primary: "bg-blue-600 dark:bg-blue-500",
    success: "bg-green-600 dark:bg-green-500",
    warning: "bg-amber-600 dark:bg-amber-500",
    danger: "bg-red-600 dark:bg-red-500",
  };

  return (
    <div
      data-slot="progress"
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
        height,
        className,
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all",
          indeterminate ? "animate-indeterminate-progress" : "",
          variantClasses[variant],
        )}
        style={{
          transform: indeterminate
            ? "translateX(0)"
            : `translateX(-${100 - percentage}%)`,
        }}
      />
    </div>
  );
}

export { Progress };