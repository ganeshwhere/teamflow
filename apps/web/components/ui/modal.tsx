"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "dialog" | "sheet";
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  variant = "dialog"
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-900/45"
        onClick={onClose}
        type="button"
      />
      <div
        className={cn(
          "absolute",
          variant === "dialog"
            ? "left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2"
            : "right-0 top-0 h-full w-full max-w-xl"
        )}
      >
        <div
          className={cn(
            "grid gap-4 bg-white shadow-xl",
            variant === "dialog" ? "rounded-xl border border-slate-200 p-5" : "h-full border-l border-slate-200 p-6"
          )}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              {description ? <p className="text-sm text-slate-600">{description}</p> : null}
            </div>
            <button
              aria-label="Close"
              className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
