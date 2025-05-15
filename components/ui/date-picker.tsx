// File: /components/ui/date-picker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  /** Currently selected date */
  date?: Date;
  /** Callback when date changes */
  onDateChange?: (date: Date | undefined) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Optional CSS classes to apply to the component */
  className?: string;
  /** Format for displaying the selected date, using date-fns format patterns */
  dateFormat?: string;
  /** Disable the date picker */
  disabled?: boolean;
  /** Optional title attribute for the trigger button */
  title?: string;
  /** Minimum selectable date */
  fromDate?: Date;
  /** Maximum selectable date */
  toDate?: Date;
  /** Function to determine if a date should be disabled */
  disabledDates?: (date: Date) => boolean;
  /** Whether to automatically focus the calendar on open */
  initialFocus?: boolean;
}

/**
 * Date picker component for selecting a single date
 * Uses Radix UI Popover and the Calendar component
 */
export function DatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  className,
  dateFormat = "PPP", // Default format string from date-fns (e.g., "April 29, 2023")
  disabled = false,
  title,
  fromDate,
  toDate,
  disabledDates,
  initialFocus = true,
}: DatePickerProps) {
  // Internal state for selected date
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date,
  );

  // Update internal state when prop changes
  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  // Handle date selection
  const handleSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
          title={title}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, dateFormat)
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus={initialFocus}
          fromDate={fromDate}
          toDate={toDate}
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  );
}
