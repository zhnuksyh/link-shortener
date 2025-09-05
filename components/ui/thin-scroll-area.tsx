"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

interface ThinScrollAreaProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  variant?: "default" | "ultra-thin" | "auto-hide" | "accent";
  orientation?: "vertical" | "horizontal" | "both";
}

const ThinScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ThinScrollAreaProps
>(
  (
    {
      className,
      children,
      variant = "default",
      orientation = "both",
      ...props
    },
    ref
  ) => {
    const scrollbarVariants = {
      default: "thin-scrollbar",
      "ultra-thin": "ultra-thin-scrollbar",
      "auto-hide": "auto-hide-scrollbar",
      accent: "accent-scrollbar",
    };

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          scrollbarVariants[variant],
          className
        )}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
          {children}
        </ScrollAreaPrimitive.Viewport>

        {orientation === "vertical" || orientation === "both" ? (
          <ThinScrollBar orientation="vertical" variant={variant} />
        ) : null}

        {orientation === "horizontal" || orientation === "both" ? (
          <ThinScrollBar orientation="horizontal" variant={variant} />
        ) : null}

        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  }
);
ThinScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

interface ThinScrollBarProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  variant?: "default" | "ultra-thin" | "auto-hide" | "accent";
}

const ThinScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ThinScrollBarProps
>(
  (
    { className, orientation = "vertical", variant = "default", ...props },
    ref
  ) => {
    const scrollbarVariants = {
      default: "thin-scrollbar",
      "ultra-thin": "ultra-thin-scrollbar",
      "auto-hide": "auto-hide-scrollbar",
      accent: "accent-scrollbar",
    };

    return (
      <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={cn(
          "flex touch-none select-none transition-colors",
          orientation === "vertical" &&
            "h-full w-2.5 border-l border-l-transparent p-[1px]",
          orientation === "horizontal" &&
            "h-2.5 flex-col border-t border-t-transparent p-[1px]",
          scrollbarVariants[variant],
          className
        )}
        {...props}
      >
        <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
      </ScrollAreaPrimitive.ScrollAreaScrollbar>
    );
  }
);
ThinScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ThinScrollArea, ThinScrollBar };
