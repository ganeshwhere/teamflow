import type { ButtonHTMLAttributes } from "react";

import { cn } from "./utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variantClassName =
    variant === "primary"
      ? "bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 active:bg-indigo-700"
      : variant === "secondary"
        ? "bg-gray-700 text-gray-200 hover:bg-gray-600 active:bg-gray-800"
        : variant === "danger"
          ? "bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700"
          : "bg-transparent text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5";

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClassName,
        className,
      )}
      {...props}
    />
  );
}
