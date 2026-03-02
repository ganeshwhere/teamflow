"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { TeamListItem } from "@repo/types";

import { TeamCard } from "@/components/teams/team-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type SortOption = "name" | "members" | "projects" | "recent";

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
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <Card className="text-sm text-muted-foreground">No teams match your search.</Card>
      )}
    </section>
  );
}
