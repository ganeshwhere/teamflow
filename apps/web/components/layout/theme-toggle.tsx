"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "teamflow-theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

type ThemeToggleProps = {
  className?: string;
  showLabel?: boolean;
  iconClassName?: string;
};

export function ThemeToggle({ className, showLabel = false, iconClassName }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const preferredTheme = getPreferredTheme();
    applyTheme(preferredTheme);
    setTheme(preferredTheme);
    setMounted(true);
  }, []);

  const resolvedTheme: Theme = mounted ? theme : "light";
  const Icon = resolvedTheme === "dark" ? Sun : Moon;
  const iconSizeClass = showLabel ? "h-4 w-4" : "h-5 w-5";

  return (
    <Button
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      className={cn(
        showLabel ? "h-9 rounded-md px-3" : "h-10 w-10 rounded-full p-0",
        "gap-2",
        className
      )}
      onClick={() => {
        if (!mounted) {
          return;
        }

        const nextTheme: Theme = theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        setTheme(nextTheme);
      }}
      type="button"
      variant="ghost"
      disabled={!mounted}
    >
      <Icon className={cn(iconSizeClass, iconClassName)} strokeWidth={2.4} />
      {showLabel ? <span className="text-xs font-semibold">{resolvedTheme === "dark" ? "Dark" : "Light"}</span> : null}
    </Button>
  );
}
