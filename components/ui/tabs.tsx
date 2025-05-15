// File: /components/ui/tabs.tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Root component for tabs. Manages the state of the tabs.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="account">
 *   <TabsList>
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsTrigger value="password">Password</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">Account settings...</TabsContent>
 *   <TabsContent value="password">Password settings...</TabsContent>
 * </Tabs>
 * ```
 */
const Tabs = TabsPrimitive.Root;

/**
 * Props for the tabs list component
 */
export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /**
   * Whether to use a vertical orientation
   * @default false
   */
  vertical?: boolean;
  /**
   * Whether tabs should fill the full width
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Additional class names to apply
   */
  className?: string;
}

/**
 * Component for containing the tab triggers.
 */
const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, vertical = false, fullWidth = false, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "flex items-center rounded-md bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
        vertical
          ? "w-full max-w-[200px] flex-col"
          : "inline-flex h-10 justify-center",
        fullWidth && "grid w-full grid-cols-2 gap-0",
        className,
      )}
      {...props}
      data-orientation={vertical ? "vertical" : "horizontal"}
    />
  ),
);
TabsList.displayName = TabsPrimitive.List.displayName || "TabsList";

/**
 * Props for the tabs trigger component
 */
export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /**
   * Optional icon to display in the tab trigger
   */
  icon?: React.ReactNode;
  /**
   * Badge content to display in the tab trigger (for notifications, etc.)
   */
  badge?: React.ReactNode;
  /**
   * Whether the trigger should use an underlined style
   * @default false
   */
  underlined?: boolean;
  /**
   * Whether the trigger should use a pill style
   * @default false
   */
  pill?: boolean;
  /**
   * Additional class names to apply
   */
  className?: string;
  /**
   * Child elements/content
   */
  children?: React.ReactNode;
}

/**
 * Component for the clickable tab buttons
 */
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    {
      className,
      underlined = false,
      pill = false,
      icon,
      badge,
      children,
      ...props
    },
    ref,
  ) => {
    // Base styles always applied
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300";

    // Style variants
    const styleVariants = {
      default:
        "rounded-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50",
      underlined:
        "border-b-2 border-transparent px-1 pb-3 pt-2 data-[state=active]:border-gray-950 data-[state=active]:text-gray-950 dark:data-[state=active]:border-gray-50 dark:data-[state=active]:text-gray-50",
      pill: "rounded-full bg-transparent px-3 py-1.5 hover:bg-gray-100 data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:hover:bg-gray-800 dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900",
    };

    // Determine which style to use
    const styleToUse = pill ? "pill" : underlined ? "underlined" : "default";

    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(baseStyles, styleVariants[styleToUse], className)}
        {...props}
      >
        {/* Icon if provided */}
        {icon && <span className="mr-2 inline-flex">{icon}</span>}

        {/* Tab text content */}
        <span>{children}</span>

        {/* Badge if provided */}
        {badge && <span className="ml-2 inline-flex">{badge}</span>}
      </TabsPrimitive.Trigger>
    );
  },
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName || "TabsTrigger";

/**
 * Props for the tabs content component
 */
export interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  /**
   * Whether to animate the tab content when it becomes active
   * @default true
   */
  animate?: boolean;
  /**
   * Whether the tab content is in a loading state
   * @default false
   */
  isLoading?: boolean;
  /**
   * Element to show when tab content is loading
   */
  loadingElement?: React.ReactNode;
  /**
   * Additional class names to apply
   */
  className?: string;
  /**
   * Child elements/content
   */
  children?: React.ReactNode;
}

/**
 * Component for the content displayed when a tab is selected
 */
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  (
    {
      className,
      animate = true,
      isLoading = false,
      loadingElement,
      children,
      ...props
    },
    ref,
  ) => {
    // If animate is true, wrap the content in motion.div for smooth transitions
    const content = animate ? (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    ) : (
      children
    );

    return (
      <TabsPrimitive.Content
        ref={ref}
        className={cn(
          "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
          className,
        )}
        {...props}
      >
        {isLoading ? loadingElement : content}
      </TabsPrimitive.Content>
    );
  },
);
TabsContent.displayName = TabsPrimitive.Content.displayName || "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
