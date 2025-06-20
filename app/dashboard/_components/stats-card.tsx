import { ReactNode } from "react";
import { cn } from "@/lib/utils/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  colorVariant?: "default" | "success" | "warning" | "error";
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  colorVariant = "default",
  isLoading = false,
}: StatsCardProps) {
  // Color variants based on the design system - using semantic tokens
  const valueColorClasses = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    error: "text-destructive",
  };

  return (
    <div className="rounded-lg bg-surface p-6 shadow transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          {isLoading ? (
            <div className="mt-1 h-9 w-24 animate-pulse rounded bg-muted"></div>
          ) : (
            <p
              className={cn(
                "mt-1 text-3xl font-bold transition-colors",
                valueColorClasses[colorVariant],
              )}
              aria-label={`${title}: ${value}`}
            >
              {value}
            </p>
          )}

          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "text-muted-foreground transition-colors",
              isLoading && "opacity-50",
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
