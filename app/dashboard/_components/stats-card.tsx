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
  // Color variants based on the design system
  const valueColorClasses = {
    default: "text-blue-900",
    success: "text-green-600",
    warning: "text-amber-600",
    error: "text-red-600",
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>

          {isLoading ? (
            <div className="mt-1 h-9 w-24 animate-pulse rounded bg-gray-200"></div>
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
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "text-gray-400 transition-colors",
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
