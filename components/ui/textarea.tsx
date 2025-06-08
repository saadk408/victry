// File: components/ui/textarea.tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400",
  {
    variants: {
      variant: {
        default:
          "border-gray-200 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300",
        error:
          "border-red-500 text-red-600 focus-visible:ring-red-500 dark:focus-visible:ring-red-500",
        success:
          "border-green-500 text-green-600 focus-visible:ring-green-500 dark:focus-visible:ring-green-500",
      },
      size: {
        default: "min-h-[80px] py-2",
        sm: "min-h-[60px] py-1.5 text-xs",
        lg: "min-h-[120px] py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /**
   * Whether to automatically resize the textarea based on content
   */
  autoResize?: boolean;
  /**
   * Whether to show character count
   */
  showCount?: boolean;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Helper text to display below the textarea
   */
  helperText?: React.ReactNode;
}

function Textarea({
  className,
  variant,
  size,
  autoResize = false,
  showCount = false,
  error,
  helperText,
  maxLength,
  value,
  defaultValue,
  onChange,
  ...props
}: TextareaProps) {
  // Use internal ref for autoResize
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Track input value for character count
  const [inputVal, setInputVal] = React.useState(
    value !== undefined
      ? String(value)
      : defaultValue !== undefined
        ? String(defaultValue)
        : "",
  );

  // Calculate character count and percentage for visualization
  const charCount = inputVal.length;
  const maxPercent = maxLength
    ? Math.min(100, Math.round((charCount / maxLength) * 100))
    : 0;

  // Auto-resize function
  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    // Reset height to get the correct scrollHeight
    textarea.style.height = "auto";
    // Set the height to the scrollHeight to expand the textarea
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [autoResize]);

  // Handle changes for controlled and uncontrolled components
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) onChange(e);
      if (value === undefined) setInputVal(e.target.value);
      if (autoResize) setTimeout(adjustHeight, 0);
    },
    [onChange, adjustHeight, autoResize, value],
  );

  // Update internal value when the controlled value changes
  React.useEffect(() => {
    if (value !== undefined) setInputVal(String(value));
  }, [value]);

  // Handle auto-resize on mount and when content changes
  React.useEffect(() => {
    if (autoResize) adjustHeight();
  }, [autoResize, adjustHeight, inputVal]);

  // Determine variant based on error prop
  const resolvedVariant = error ? "error" : variant;

  return (
    <div data-slot="textarea-container" className="w-full">
      <textarea
        data-slot="textarea"
        ref={textareaRef}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        maxLength={maxLength}
        className={cn(
          textareaVariants({ variant: resolvedVariant, size }),
          autoResize && "resize-none overflow-hidden",
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={
          error || helperText || showCount
            ? `${props.id || ""}-description`
            : undefined
        }
        {...props}
      />

      {/* Helper text, error message and character count */}
      {(error || helperText || (showCount && maxLength)) && (
        <div
          data-slot="textarea-description"
          id={`${props.id || ""}-description`}
          className={cn(
            "mt-1 flex justify-between text-xs",
            error ? "text-red-500" : "text-gray-500",
          )}
        >
          <div>
            {error && <p data-slot="textarea-error" className="text-red-500">{error}</p>}
            {!error && helperText && <p data-slot="textarea-helper">{helperText}</p>}
          </div>

          {showCount && maxLength && (
            <div data-slot="textarea-count" className="flex items-center">
              <div className="mr-2 h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                <div
                  data-slot="textarea-count-indicator"
                  className={cn(
                    "h-full rounded-full",
                    maxPercent < 80
                      ? "bg-green-500"
                      : maxPercent < 95
                        ? "bg-amber-500"
                        : "bg-red-500",
                  )}
                  style={{ width: `${maxPercent}%` }}
                />
              </div>
              <span>
                {charCount}/{maxLength}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { Textarea };