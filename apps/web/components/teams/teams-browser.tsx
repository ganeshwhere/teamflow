"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarClock, FolderKanban, Search, Users } from "lucide-react";
import type { TeamListItem } from "@repo/types";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type SortOption = "name" | "members" | "projects" | "recent";

function formatDate(value: TeamListItem["createdAt"]): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

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

function labelCount(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function TeamsBrowser({ teams }: { teams: TeamListItem[] }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const visibleTeams = useMemo(() => {
    const filtered = teams.filter((team) => {
      const target = `${team.name} ${team.description ?? ""} ${team.slug}`.toLowerCase();
      return target.includes(query.trim().toLowerCase());
    });

    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "members") {
        return b.memberCount - a.memberCount;
      }

      if (sortBy === "projects") {
        return b.projectCount - a.projectCount;
      }

      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [teams, query, sortBy]);

  if (teams.length === 0) {
    return (
      <Card className="grid gap-2">
        <p className="text-sm font-semibold text-foreground">No teams yet</p>
        <p className="text-sm text-muted-foreground">Create your first team to start organizing projects and tasks.</p>
        <div>
          <Link href="/teams/new" className="text-sm font-semibold text-primary hover:underline">
            Create team
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teams..."
            className="pl-9"
          />
        </div>

        <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
          <option value="recent">Sort: Most Recent</option>
          <option value="name">Sort: Name</option>
          <option value="members">Sort: Members</option>
          <option value="projects">Sort: Projects</option>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {visibleTeams.length} of {teams.length} teams
      </p>

      {visibleTeams.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {visibleTeams.map((team) => (
            <Card key={team.id} className="flex h-full flex-col gap-4 border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">
                  {teamInitials(team.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-foreground">{team.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {team.description ?? "No description provided yet."}
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit items-center overflow-hidden rounded-md border border-border bg-popover text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-medium text-foreground">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  {labelCount(team.memberCount, "member", "members")}
                </span>
                <span className="h-5 w-px bg-border" />
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-medium text-foreground">
                  <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                  {labelCount(team.projectCount, "project", "projects")}
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2">
                <Badge className="bg-muted text-muted-foreground">
                  <CalendarClock className="mr-1 h-3.5 w-3.5" />
                  {formatDate(team.createdAt)}
                </Badge>
                <span className="text-xs text-muted-foreground">{team.slug}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
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
                <Link
                  href={`/teams/${team.id}/edit`}
                  className="inline-flex items-center rounded-md border border-border bg-popover px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Edit Team
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-sm text-muted-foreground">No teams match your search.</Card>
      )}
    </section>
  );
}
