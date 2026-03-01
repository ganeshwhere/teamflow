"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variantClassName =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-700"
      : variant === "secondary"
        ? "bg-blue-600 text-white hover:bg-blue-500"
        : "bg-transparent text-slate-700 hover:bg-slate-100";

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClassName,
        className
      )}
      {...props}
    />
  );
}
