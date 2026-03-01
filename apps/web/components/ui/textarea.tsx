"use client";

import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>): JSX.Element {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2",
        className
      )}
      {...props}
    />
  );
}
