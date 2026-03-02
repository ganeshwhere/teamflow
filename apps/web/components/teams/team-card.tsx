"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FolderKanban } from "lucide-react";
import type { TeamListItem } from "@repo/types";

import { TeamCardMenu } from "@/components/teams/team-card-menu";
import { AvatarGroup } from "@/components/ui/avatar-group";
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

function memberChipTone(index: number): string {
  if (index % 4 === 0) {
    return "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200";
  }
  if (index % 4 === 1) {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
  }
  if (index % 4 === 2) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
  }
  return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200";
}

function memberChipLabel(teamName: string, index: number): string {
  const base = teamInitials(teamName);
  const first = base[0] ?? "T";
  const second = base[1] ?? "F";
  if (index === 0) {
    return `${first}${second}`;
  }
  if (index === 1) {
    return `${second}${first}`;
  }
  return `${first}${index + 1}`;
}

export function TeamCard({ team }: { team: TeamListItem }) {
  const [error, setError] = useState<string | null>(null);

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
        <TeamCardMenu teamId={team.id} teamName={team.name} onErrorChange={setError} />
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{team.description ?? "No description provided."}</p>

      <div className="flex items-center justify-between gap-3">
        {team.memberCount > 0 ? (
          <AvatarGroup max={4} size={34}>
            {Array.from({ length: Math.min(team.memberCount, 4) }).map((_, index) => (
              <span
                key={`${team.id}-member-${index}`}
                className={`inline-flex h-full w-full items-center justify-center rounded-full border-2 border-card text-[10px] font-semibold ${memberChipTone(index)}`}
              >
                {memberChipLabel(team.name, index)}
              </span>
            ))}
          </AvatarGroup>
        ) : (
          <span className="text-xs text-muted-foreground">No members yet</span>
        )}

        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <FolderKanban className="h-3.5 w-3.5" />
          {team.projectCount} {team.projectCount === 1 ? "project" : "projects"}
        </span>
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
