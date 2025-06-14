// File: /app/_components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils/utils";

/**
 * Input component based on ShadCN design system
 * Updated for React 19 compatibility using data-slot pattern
 * Used for text inputs across the application
 */
function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
        // Text and placeholder styles
        "text-foreground placeholder:text-muted-foreground",
        // Focus styles
        "focus:ring-ring focus:border-ring focus:outline-none focus:ring-2 focus:ring-offset-1",
        // Disabled styles
        "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50",
        // File input specific styles
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Custom className passed to component
        className,
      )}
      {...props}
    />
  );
}

export { Input };