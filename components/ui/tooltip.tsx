// File: /components/ui/tooltip.tsx
"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils/utils";

/**
 * Provider component for tooltips.
 * Should wrap the section of your app that uses tooltips.
 * 
 * @example
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent>Tooltip content</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Root component for the Tooltip.
 * Manages the open state of the tooltip.
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>Helpful information</TooltipContent>
 * </Tooltip>
 */
const Tooltip = TooltipPrimitive.Root;

/**
 * Trigger for the tooltip.
 * This is the element that will show the tooltip when hovered or focused.
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

// Note: @radix-ui/react-tooltip does not export Anchor component
// Use TooltipTrigger for positioning instead

interface TooltipContentProps extends 
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
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
   * Controls animation for the tooltip.
   * Set to false to disable animations.
   */
  animate?: boolean;
}

function TooltipContent({
  className,
  sideOffset = 4,
  withPortal = true,
  container,
  animate = true,
  ...props
}: TooltipContentProps) {
  const content = (
    <TooltipPrimitive.Content
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md outline-none",
        animate &&
          "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  );

  if (withPortal) {
    return (
      <TooltipPrimitive.Portal container={container}>
        {content}
      </TooltipPrimitive.Portal>
    );
  }

  return content;
}

interface TooltipArrowProps extends 
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow> {
  width?: number;
  height?: number;
}

function TooltipArrow({
  className,
  width = 10,
  height = 5,
  ...props
}: TooltipArrowProps) {
  return (
    <TooltipPrimitive.Arrow
      data-slot="tooltip-arrow"
      width={width}
      height={height}
      className={cn("fill-popover", className)}
      {...props}
    />
  );
}

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
};