"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps extends 
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

function Slider({ 
  className, 
  ...props 
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track 
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20"
      >
        <SliderPrimitive.Range 
          data-slot="slider-range"
          className="absolute h-full bg-primary" 
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb 
        data-slot="slider-thumb"
        className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" 
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };