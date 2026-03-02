"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, FolderKanban, MoreVertical, Trash2, Users } from "lucide-react";
import type { TeamListItem } from "@repo/types";
import { useRouter } from "next/navigation";

import { deleteTeam } from "@/actions/team.actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function teamInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "TF";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function TeamCard({ team }: { team: TeamListItem }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [menuOpen]);

  return (
    <Card className="grid h-full gap-4 border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">
          {teamInitials(team.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-foreground">{team.name}</p>
          <p className="truncate text-xs text-muted-foreground">{team.slug}</p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={`Open ${team.name} actions`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-popover text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-10 z-10 grid min-w-[180px] gap-1 rounded-lg border border-border bg-card p-1 shadow-lg">
              <Link
                href={`/teams/${team.id}/edit`}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
              >
                Edit team
              </Link>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-md px-3 py-2 text-left text-sm text-muted-foreground"
                title="Archive flow is not available yet."
              >
                Archive team
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setError(null);
                  if (!window.confirm(`Delete "${team.name}"? This cannot be undone.`)) {
                    return;
                  }

                  startDeleteTransition(async () => {
                    const result = await deleteTeam(team.id);
                    if (result.error) {
                      setError(result.error);
                      return;
                    }

                    setMenuOpen(false);
                    router.refresh();
                  });
                }}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete team"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{team.description ?? "No description provided."}</p>

      <div className="flex items-center gap-2 text-xs">
        <Badge className="bg-muted text-muted-foreground">
          <Users className="mr-1 h-3.5 w-3.5" />
          {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
        </Badge>
        <Badge className="bg-muted text-muted-foreground">
          <FolderKanban className="mr-1 h-3.5 w-3.5" />
          {team.projectCount} {team.projectCount === 1 ? "project" : "projects"}
        </Badge>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <div className="mt-auto flex items-center gap-2 text-sm">
        <Link
          href={`/teams/${team.id}`}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground transition-colors hover:brightness-95"
        >
          Open team
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={`/teams/${team.id}/projects`}
          className="inline-flex items-center rounded-md border border-border bg-popover px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Projects
        </Link>
      </div>
    </Card>
  );
}
