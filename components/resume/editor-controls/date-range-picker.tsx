// File: /components/resume/editor-controls/date-range-picker.tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { format, isValid, parse } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

/**
 * Props for DateRangePicker component
 */
export interface DateRangePickerProps {
  /** Start date in ISO format */
  startDate: string;
  /** End date in ISO format, null if current position */
  endDate: string | null;
  /** Whether this is a current/ongoing position */
  isCurrent?: boolean;
  /** Function to call when dates change */
  onChange: (dates: {
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
  }) => void;
  /** Labels for the inputs */
  labels?: {
    startDate?: string;
    endDate?: string;
    current?: string;
  };
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** CSS class to apply to the container */
  className?: string;
  /** Whether to make the fields required */
  required?: boolean;
}

/**
 * DateRangePicker component for selecting date ranges with a "current" option
 * Used in resume work experience, education, and other date-based sections
 */
export function DateRangePicker({
  startDate,
  endDate,
  isCurrent = false,
  onChange,
  labels = {
    startDate: "Start Date",
    endDate: "End Date",
    current: "Current",
  },
  disabled = false,
  className,
  required = false,
}: DateRangePickerProps) {
  // Format used for displaying dates and input validation
  const dateFormat = "yyyy-MM-dd";

  // Local state for input values
  const [startValue, setStartValue] = useState<string>(
    startDate ? format(new Date(startDate), dateFormat) : "",
  );
  const [endValue, setEndValue] = useState<string>(
    endDate ? format(new Date(endDate), dateFormat) : "",
  );
  const [isCurrentPosition, setIsCurrentPosition] =
    useState<boolean>(isCurrent);

  // Month and year input for the date pickers
  const [startMonth, setStartMonth] = useState<string>("");
  const [startYear, setStartYear] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");

  // Validation state
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);

  // Update local state when props change
  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      if (isValid(date)) {
        setStartValue(format(date, dateFormat));
        setStartMonth((date.getMonth() + 1).toString());
        setStartYear(date.getFullYear().toString());
      }
    }

    if (endDate) {
      const date = new Date(endDate);
      if (isValid(date)) {
        setEndValue(format(date, dateFormat));
        setEndMonth((date.getMonth() + 1).toString());
        setEndYear(date.getFullYear().toString());
      }
    }

    setIsCurrentPosition(isCurrent);
  }, [startDate, endDate, isCurrent]);

  // Handle start date selection from calendar
  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const formattedDate = format(date, dateFormat);
    setStartValue(formattedDate);
    setStartMonth((date.getMonth() + 1).toString());
    setStartYear(date.getFullYear().toString());
    setStartDateError(null);

    onChange({
      startDate: formattedDate,
      endDate: isCurrentPosition ? null : endValue || null,
      isCurrent: isCurrentPosition,
    });
  };

  // Handle end date selection from calendar
  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const formattedDate = format(date, dateFormat);
    setEndValue(formattedDate);
    setEndMonth((date.getMonth() + 1).toString());
    setEndYear(date.getFullYear().toString());
    setEndDateError(null);

    onChange({
      startDate: startValue,
      endDate: isCurrentPosition ? null : formattedDate,
      isCurrent: isCurrentPosition,
    });
  };

  // Handle month selection for start date
  const handleStartMonthChange = (value: string) => {
    setStartMonth(value);
    if (startYear) {
      try {
        // Create a date from the month and year
        const date = new Date(parseInt(startYear), parseInt(value) - 1, 1);

        if (isValid(date)) {
          setStartValue(format(date, dateFormat));
          setStartDateError(null);

          onChange({
            startDate: format(date, dateFormat),
            endDate: isCurrentPosition ? null : endValue || null,
            isCurrent: isCurrentPosition,
          });
        }
      } catch {
        setStartDateError("Invalid date");
      }
    }
  };

  // Handle year selection for start date
  const handleStartYearChange = (value: string) => {
    setStartYear(value);
    if (startMonth) {
      try {
        // Create a date from the month and year
        const date = new Date(parseInt(value), parseInt(startMonth) - 1, 1);

        if (isValid(date)) {
          setStartValue(format(date, dateFormat));
          setStartDateError(null);

          onChange({
            startDate: format(date, dateFormat),
            endDate: isCurrentPosition ? null : endValue || null,
            isCurrent: isCurrentPosition,
          });
        }
      } catch {
        setStartDateError("Invalid date");
      }
    }
  };

  // Handle month selection for end date
  const handleEndMonthChange = (value: string) => {
    setEndMonth(value);
    if (isCurrentPosition) return;
    if (endYear) {
      try {
        // Create a date from the month and year
        const date = new Date(parseInt(endYear), parseInt(value) - 1, 1);

        // Validate that end date is after start date
        if (startValue) {
          const startDate = parse(startValue, dateFormat, new Date());
          if (date < startDate) {
            setEndDateError("End date must be after start date");
            return;
          }
        }

        if (isValid(date)) {
          setEndValue(format(date, dateFormat));
          setEndDateError(null);

          onChange({
            startDate: startValue,
            endDate: format(date, dateFormat),
            isCurrent: isCurrentPosition,
          });
        }
      } catch {
        setEndDateError("Invalid date");
      }
    }
  };

  // Handle year selection for end date
  const handleEndYearChange = (value: string) => {
    setEndYear(value);
    if (isCurrentPosition) return;
    if (endMonth) {
      try {
        // Create a date from the month and year
        const date = new Date(parseInt(value), parseInt(endMonth) - 1, 1);

        // Validate that end date is after start date
        if (startValue) {
          const startDate = parse(startValue, dateFormat, new Date());
          if (date < startDate) {
            setEndDateError("End date must be after start date");
            return;
          }
        }

        if (isValid(date)) {
          setEndValue(format(date, dateFormat));
          setEndDateError(null);

          onChange({
            startDate: startValue,
            endDate: format(date, dateFormat),
            isCurrent: isCurrentPosition,
          });
        }
      } catch {
        setEndDateError("Invalid date");
      }
    }
  };

  // Handle toggling of current position
  const handleCurrentToggle = (checked: boolean) => {
    setIsCurrentPosition(checked);

    onChange({
      startDate: startValue,
      endDate: checked ? null : endValue,
      isCurrent: checked,
    });
  };

  // Generate years for dropdown (last 100 years)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let year = currentYear; year >= currentYear - 100; year--) {
      years.push(year.toString());
    }

    return years;
  };

  // Months for dropdown
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Years for dropdown
  const years = generateYears();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Start Date Picker */}
      <div className="space-y-2">
        <Label htmlFor="start-date" className="flex items-center">
          {labels.startDate || "Start Date"}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>

        <div className="flex flex-col gap-2">
          {/* Month & Year Dropdown Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={startMonth}
              onValueChange={handleStartMonthChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={startYear}
              onValueChange={handleStartYearChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calendar Popup for Date Selection */}
          <div className="flex">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startValue && "text-muted-foreground",
                  )}
                  disabled={disabled}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {startValue
                    ? format(new Date(startValue), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startValue ? new Date(startValue) : undefined}
                  onSelect={handleStartDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {startDateError && (
          <p className="text-sm text-destructive">{startDateError}</p>
        )}
      </div>

      {/* Current Position Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="current-position"
          checked={isCurrentPosition}
          onCheckedChange={handleCurrentToggle}
          disabled={disabled}
        />
        <Label htmlFor="current-position">
          {labels.current || "Current Position"}
        </Label>
      </div>

      {/* End Date Picker (only shown if not current position) */}
      {!isCurrentPosition && (
        <div className="space-y-2">
          <Label htmlFor="end-date" className="flex items-center">
            {labels.endDate || "End Date"}
            {required && <span className="ml-1 text-destructive">*</span>}
          </Label>

          <div className="flex flex-col gap-2">
            {/* Month & Year Dropdown Selection */}
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={endMonth}
                onValueChange={handleEndMonthChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={endYear}
                onValueChange={handleEndYearChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar Popup for Date Selection */}
            <div className="flex">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endValue && "text-muted-foreground",
                    )}
                    disabled={disabled}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endValue
                      ? format(new Date(endValue), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endValue ? new Date(endValue) : undefined}
                    onSelect={handleEndDateSelect}
                    initialFocus
                    fromDate={startValue ? new Date(startValue) : undefined}
                    disabled={(date: Date) =>
                      startValue ? date < new Date(startValue) : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {endDateError && (
            <p className="text-sm text-destructive">{endDateError}</p>
          )}
        </div>
      )}
    </div>
  );
}
