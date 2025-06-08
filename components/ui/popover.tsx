// File: /components/ui/popover.tsx
"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils/utils";

/**
 * Root component for the Popover.
 * Manages the open state of the popover.
 *
 * @example
 * <Popover>
 *   <PopoverTrigger>Open</PopoverTrigger>
 *   <PopoverContent>Content</PopoverContent>
 * </Popover>
 */
const Popover = PopoverPrimitive.Root;

/**
 * Trigger for the popover.
 * This is the element that will trigger the popover when interacted with.
 */
const PopoverTrigger = PopoverPrimitive.Trigger;

/**
 * Anchor component for the popover.
 * Used for positioning the popover relative to another element
 * instead of the trigger.
 */
const PopoverAnchor = PopoverPrimitive.Anchor;

/**
 * Close button for the popover.
 * Provides a programmatic way to close the popover.
 *
 * @example
 * <PopoverContent>
 *   Content
 *   <PopoverClose>Close</PopoverClose>
 * </PopoverContent>
 */
const PopoverClose = PopoverPrimitive.Close;

interface PopoverContentProps extends 
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  /**
   * Whether to render the content in a portal.
   * Defaults to true.
   */
  withPortal?: boolean;
  /**
   * Container element to attach the portal to.
   * Only applicable when withPortal is true.
   */
  container?: HTMLElement;
  /**
   * Controls animation for the popover.
   * Set to false to disable animations.
   */
  animate?: boolean;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  withPortal = true,
  container,
  animate = true,
  ...props
}: PopoverContentProps) {
  const content = (
    <PopoverPrimitive.Content
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-white p-4 text-gray-900 shadow-md outline-none",
        animate &&
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        className,
      )}
      {...props}
    />
  );

  if (withPortal) {
    return (
      <PopoverPrimitive.Portal container={container}>
        {content}
      </PopoverPrimitive.Portal>
    );
  }

  return content;
}

interface PopoverArrowProps extends 
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow> {
  width?: number;
  height?: number;
}

function PopoverArrow({
  className,
  width = 10,
  height = 5,
  ...props
}: PopoverArrowProps) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      width={width}
      height={height}
      className={cn("fill-white dark:fill-gray-950", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverAnchor,
  PopoverArrow,
};