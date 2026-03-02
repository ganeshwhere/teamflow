"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, FolderKanban, Pencil, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TeamQuickActionsMenu({ teamId }: { teamId: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((previous) => !previous)}
        className="h-9 rounded-lg border border-border bg-popover px-3 text-sm font-medium text-foreground hover:bg-accent"
      >
        Quick actions
        <ChevronDown className="ml-1.5 h-4 w-4" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-11 z-20 grid min-w-[210px] gap-1 rounded-lg border border-border bg-card p-1 shadow-lg">
          <Link
            href={`/teams/${teamId}/projects/new`}
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
            Create project
          </Link>
          <Link
            href={`/teams/${teamId}/projects`}
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            Manage projects
          </Link>
          <Link
            href={`/teams/${teamId}/edit`}
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
            Edit team
          </Link>
        </div>
      ) : null}
    </div>
  );
}
