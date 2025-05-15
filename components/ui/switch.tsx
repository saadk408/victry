// File: /components/ui/switch.tsx
"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Define switch variants using class-variance-authority
const switchVariants = cva(
  "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-900 data-[state=unchecked]:bg-gray-200 dark:focus-visible:ring-gray-300 dark:focus-visible:ring-offset-gray-950 dark:data-[state=checked]:bg-gray-50 dark:data-[state=unchecked]:bg-gray-800",
  {
    variants: {
      size: {
        sm: "h-[18px] w-[36px]",
        default: "h-[24px] w-[44px]",
        lg: "h-[30px] w-[56px]",
      },
      variant: {
        default:
          "data-[state=checked]:bg-gray-900 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-gray-50 dark:data-[state=unchecked]:bg-gray-800",
        primary:
          "data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-800",
        success:
          "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-gray-800",
        danger:
          "data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-red-500 dark:data-[state=unchecked]:bg-gray-800",
        warning:
          "data-[state=checked]:bg-amber-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-amber-500 dark:data-[state=unchecked]:bg-gray-800",
      },
      hasError: {
        true: "ring-2 ring-red-500 dark:ring-red-500",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
      hasError: false,
    },
  },
);

// Define thumb variants
const thumbVariants = cva(
  "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 dark:bg-gray-950",
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-[18px]",
        default: "h-5 w-5 data-[state=checked]:translate-x-5",
        lg: "h-6 w-6 data-[state=checked]:translate-x-[26px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

// Add our own props to the switch
interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {
  /** Optional className for styling the switch */
  className?: string;
  /** Optional label to display next to the switch */
  label?: React.ReactNode;
  /** Position of the label */
  labelPosition?: "left" | "right";
  /** Additional class for the thumb element */
  thumbClassName?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(props, ref) {
    const {
      className,
      size,
      variant,
      hasError,
      label,
      labelPosition = "right",
      thumbClassName,
      ...switchProps
    } = props;

    // Generate a unique ID for label association
    const id = React.useId();

    // Switch component with variants applied
    const switchComponent = (
      <SwitchPrimitives.Root
        className={cn(switchVariants({ size, variant, hasError }), className)}
        {...switchProps}
        id={id}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(thumbVariants({ size }), thumbClassName)}
        />
      </SwitchPrimitives.Root>
    );

    // If no label provided, return just the switch
    if (!label) {
      return switchComponent;
    }

    // Return switch with label
    return (
      <div className="flex items-center gap-2">
        {labelPosition === "left" && (
          <label
            htmlFor={id}
            className="cursor-pointer select-none text-sm font-medium"
          >
            {label}
          </label>
        )}

        {switchComponent}

        {labelPosition === "right" && (
          <label
            htmlFor={id}
            className="cursor-pointer select-none text-sm font-medium"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
