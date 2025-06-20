// File: /components/resume/editor-controls/sortable-list.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  Reorder,
  useDragControls,
} from "framer-motion";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import * as React from "react";

/**
 * Generic reorderable list component with drag-and-drop functionality
 * Allows users to add, remove, reorder, and edit list items
 *
 * @template T - The type of items in the list
 */
export interface SortableListProps<T> {
  /**
   * Array of items to be rendered and reordered
   */
  items: T[];

  /**
   * Function to render each item in the list
   * @param item - The item to render
   * @param index - The index of the item in the list
   * @param provided - Drag handle props for the item
   */
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;

  /**
   * Function called when items are reordered
   * @param newItems - The reordered items array
   */
  onReorder: (newItems: T[]) => void;

  /**
   * Function called when an item is added
   * If not provided, the add button will not be shown
   */
  onAdd?: () => void;

  /**
   * Function called when an item is removed
   * @param index - The index of the item to remove
   * If not provided, remove buttons will not be shown
   */
  onRemove?: (index: number) => void;

  /**
   * Function to get a unique key for each item
   * @param item - The item to get the key for
   * @default (item, index) => index
   */
  getItemKey?: (item: T, index: number) => string | number;

  /**
   * If true, adds animation and styling to indicate the list is being edited
   * @default false
   */
  isEditing?: boolean;

  /**
   * If true, disables all interactions (drag, add, remove)
   * @default false
   */
  disabled?: boolean;

  /**
   * Optional className for the container element
   */
  className?: string;

  /**
   * Optional className for each item container
   */
  itemClassName?: string;

  /**
   * Optional placeholder text when the list is empty
   * @default "No items"
   */
  emptyPlaceholder?: React.ReactNode;

  /**
   * Optional text for the add button
   * @default "Add Item"
   */
  addButtonText?: string;

  /**
   * Optional aria-label for the list
   */
  ariaLabel?: string;
}

// Define SortableListItem component to manage drag controls correctly
// Explicitly define props needed by the item component
interface SortableListItemProps<T>
  extends Omit<
    SortableListProps<T>,
    | "items"
    | "onReorder"
    | "addButtonText"
    | "ariaLabel"
    | "className"
    | "emptyPlaceholder"
  > {
  item: T;
  index: number;
  activeItem: number | null;
  setActiveItem: (index: number | null) => void;
}

function SortableListItem<T>({
  item,
  index,
  renderItem,
  getItemKey,
  onRemove,
  isEditing,
  disabled,
  itemClassName,
  activeItem,
  setActiveItem,
}: SortableListItemProps<T>) {
  const dragControls = useDragControls();
  const key = getItemKey ? getItemKey(item, index) : index;
  const isDragging = activeItem === index;

  /**
   * Animation variants for sortable list items.
   * Note: Due to Framer Motion limitations with CSS variables in boxShadow,
   * we use RGB equivalents here. These values match our semantic tokens:
   * - boxShadow: matches var(--shadow-md) with slightly higher opacity for emphasis
   * - backgroundColor: matches var(--color-surface) / oklch(1 0 0)
   * 
   * This is similar to OAuth brand colors - a technical requirement that
   * prevents full semantic token usage. Consider migrating to CSS-first
   * drag-and-drop in future optimization efforts.
   */
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    dragging: {
      // Framer Motion limitation: CSS variables not supported in boxShadow
      // Using RGB equivalent of var(--shadow-md) from globals.css
      boxShadow: "0 4px 6px -1px rgb(23 23 23 / 0.15), 0 2px 4px -2px rgb(23 23 23 / 0.15)",
      scale: 1.02,
      zIndex: 2,
      // RGB equivalent of oklch(1 0 0) / var(--color-surface)
      backgroundColor: "rgb(255 255 255)",
    },
  };

  return (
    <Reorder.Item
      key={key}
      value={item}
      dragListener={false}
      dragControls={dragControls}
      onPointerDown={(e: React.PointerEvent) =>
        !disabled && dragControls.start(e)
      }
      onDragStart={() => setActiveItem(index)}
      onDragEnd={() => setActiveItem(null)}
      layoutId={key.toString()}
      initial="initial"
      animate={isDragging ? "dragging" : "animate"}
      exit="exit"
      variants={itemVariants}
      transition={{
        duration: 0.2,
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className={cn(
        "group relative",
        isEditing ? "hover:bg-muted/30" : "",
        itemClassName,
      )}
    >
      <div className="flex items-start">
        {!disabled && (
          <div
            onPointerDown={(e: React.PointerEvent) => dragControls.start(e)}
            className={cn(
              "flex h-full w-6 flex-shrink-0 cursor-grab items-center justify-center pt-2 opacity-50 group-hover:opacity-100",
              isEditing ? "opacity-80" : "",
            )}
          >
            <DragHandleDots2Icon className="h-4 w-4" />
          </div>
        )}
        <div className="flex-grow">{renderItem(item, index, isDragging)}</div>
        {onRemove && !disabled && (
          <div
            className={cn(
              "flex-shrink-0 p-1",
              isEditing ? "opacity-80" : "opacity-0 group-hover:opacity-100",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="h-6 w-6 rounded-full p-0 text-muted-foreground hover:text-destructive"
              aria-label={`Remove item ${index + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

/**
 * Sortable list component with drag and drop reordering
 */
export function SortableList<T>(props: SortableListProps<T>) {
  const {
    items,
    onReorder,
    onAdd,
    addButtonText,
    className,
    emptyPlaceholder,
    isEditing,
    ariaLabel,
    renderItem,
    getItemKey,
    onRemove,
    disabled,
    itemClassName,
  } = props;
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  // Setup portal container for drag overlay
  useEffect(() => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.zIndex = "1000";
    container.style.top = "0";
    container.style.left = "0";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);

    setPortalContainer(container);

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  // If items is null or undefined, use empty array
  const safeItems = items || [];

  // Handle empty state
  if (safeItems.length === 0) {
    return (
      <div
        className={cn(
          "relative",
          isEditing
            ? "rounded-md border-2 border-dashed border-border p-4"
            : "",
          className,
        )}
      >
        <div className="py-4 text-center text-muted-foreground">{emptyPlaceholder}</div>

        {onAdd && !disabled && (
          <div className="mt-2 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAdd}
              className="flex items-center"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {addButtonText}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative",
        isEditing
          ? "rounded-md border-2 border-dashed border-border p-4"
          : "",
        className,
      )}
      aria-label={ariaLabel}
    >
      <Reorder.Group
        axis="y"
        values={safeItems}
        onReorder={onReorder}
        className={cn(
          "space-y-2",
          disabled ? "pointer-events-none opacity-80" : "",
        )}
      >
        <AnimatePresence>
          {safeItems.map((item, index) => (
            <SortableListItem
              key={getItemKey ? getItemKey(item, index) : index}
              item={item}
              index={index}
              renderItem={renderItem}
              getItemKey={getItemKey}
              onRemove={onRemove}
              isEditing={isEditing}
              disabled={disabled}
              itemClassName={itemClassName}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add button */}
      {onAdd && !disabled && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="flex items-center"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {addButtonText}
          </Button>
        </div>
      )}

      {/* Drag overlay portal */}
      {activeItem !== null &&
        portalContainer &&
        safeItems[activeItem] &&
        createPortal(
          <div className="pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none rounded-md border bg-surface p-2 shadow-lg"
            >
              {renderItem(safeItems[activeItem], activeItem, true)}
            </motion.div>
          </div>,
          portalContainer,
        )}
    </div>
  );
}
