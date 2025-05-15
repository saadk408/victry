// File: /app/_components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils/utils";

/**
 * Input component based on ShadCN design system
 * Used for text inputs across the application
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Base styles
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        // Text and placeholder styles
        "text-gray-900 placeholder:text-gray-400",
        // Focus styles
        "focus:ring-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-1",
        // Disabled styles
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50",
        // File input specific styles
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Custom className passed to component
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
