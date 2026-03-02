import type { ButtonHTMLAttributes } from "react";

import { cn } from "./utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variantClassName =
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-sm hover:brightness-95"
      : variant === "secondary"
        ? "bg-secondary text-secondary-foreground hover:brightness-95"
        : "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground";

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClassName,
        className
      )}
      {...props}
    />
  );
}
