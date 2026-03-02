"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FolderKanban, Users } from "lucide-react";
import type { TeamListItem } from "@repo/types";

import { TeamCardMenu } from "@/components/teams/team-card-menu";
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
