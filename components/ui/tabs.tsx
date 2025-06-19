// File: /components/ui/tabs.tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

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
function TabsList({ 
  className, 
  vertical = false, 
  fullWidth = false, 
  ...props 
}: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
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
  );
}

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
function TabsTrigger({
  className,
  underlined = false,
  pill = false,
  icon,
  badge,
  children,
  ...props
}: TabsTriggerProps) {
  // Debug logging
  React.useEffect(() => {
    console.log('[TabsTrigger Debug] Mounted:', { 
      value: props.value, 
      children, 
      disabled: props.disabled 
    });
  }, [props.value, children, props.disabled]);

  // Base styles always applied
  const baseStyles =
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300";

  // Style variants
  const styleVariants = {
    default:
      "rounded-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-xs dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50",
    underlined:
      "border-b-2 border-transparent px-1 pb-3 pt-2 data-[state=active]:border-gray-950 data-[state=active]:text-gray-950 dark:data-[state=active]:border-gray-50 dark:data-[state=active]:text-gray-50",
    pill: "rounded-full bg-transparent px-3 py-1.5 hover:bg-gray-100 data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:hover:bg-gray-800 dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900",
  };

  // Determine which style to use
  const styleToUse = pill ? "pill" : underlined ? "underlined" : "default";

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(baseStyles, styleVariants[styleToUse], className)}
      onClick={(e) => {
        console.log('[TabsTrigger Debug] Click event:', {
          value: props.value,
          currentTarget: e.currentTarget,
          defaultPrevented: e.defaultPrevented,
          propagationStopped: e.isPropagationStopped()
        });
      }}
      {...props}
    >
      {/* Icon if provided */}
      {icon && <span data-slot="tabs-trigger-icon" className="mr-2 inline-flex">{icon}</span>}

      {/* Tab text content */}
      <span data-slot="tabs-trigger-content">{children}</span>

      {/* Badge if provided */}
      {badge && <span data-slot="tabs-trigger-badge" className="ml-2 inline-flex">{badge}</span>}
    </TabsPrimitive.Trigger>
  );
}

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
function TabsContent({
  className,
  animate = false, // CSS animations are used when true
  isLoading = false,
  loadingElement,
  children,
  ...props
}: TabsContentProps) {
  // If animate is true, add CSS animation classes
  const animationClasses = animate ? "animate-fade-in" : "";

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300",
        animationClasses,
        className,
      )}
      {...props}
    >
      {isLoading ? 
        <div data-slot="tabs-content-loading">{loadingElement}</div> : 
        children
      }
    </TabsPrimitive.Content>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };