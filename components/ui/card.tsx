// File: /components/ui/card.tsx
import * as React from "react";

import { cn } from "@/lib/utils/utils";

interface CardProps extends React.ComponentProps<"div"> {}

function Card({ 
  className, 
  ...props 
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-lg border bg-white text-gray-950 shadow-xs dark:bg-gray-950 dark:text-gray-50",
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps extends React.ComponentProps<"div"> {}

function CardHeader({ 
  className, 
  ...props 
}: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

interface CardTitleProps extends React.ComponentProps<"h3"> {}

function CardTitle({ 
  className, 
  ...props 
}: CardTitleProps) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

interface CardDescriptionProps extends React.ComponentProps<"p"> {}

function CardDescription({ 
  className, 
  ...props 
}: CardDescriptionProps) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    />
  );
}

interface CardContentProps extends React.ComponentProps<"div"> {}

function CardContent({ 
  className, 
  ...props 
}: CardContentProps) {
  return (
    <div 
      data-slot="card-content" 
      className={cn("p-6 pt-0", className)} 
      {...props} 
    />
  );
}

interface CardFooterProps extends React.ComponentProps<"div"> {}

function CardFooter({ 
  className, 
  ...props 
}: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};