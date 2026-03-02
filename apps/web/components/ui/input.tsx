"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm",
          "outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
