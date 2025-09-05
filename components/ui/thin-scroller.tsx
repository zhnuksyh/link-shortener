"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ThinScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "ultra-thin" | "auto-hide" | "accent";
  children: React.ReactNode;
}

const ThinScroller = React.forwardRef<HTMLDivElement, ThinScrollerProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const scrollbarVariants = {
      default: "thin-scrollbar",
      "ultra-thin": "ultra-thin-scrollbar",
      "auto-hide": "auto-hide-scrollbar",
      accent: "accent-scrollbar",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-auto",
          scrollbarVariants[variant],
          "smooth-scroll",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ThinScroller.displayName = "ThinScroller";

export { ThinScroller };
