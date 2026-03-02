"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TeamListItem } from "@repo/types";

import { TeamCard } from "@/components/teams/team-card";
import { TeamsFilterBar, type TeamSortOption } from "@/components/teams/teams-filter-bar";
import { Card } from "@/components/ui/card";

export function TeamsBrowser({ teams }: { teams: TeamListItem[] }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<TeamSortOption>("recent");

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
      <TeamsFilterBar
        query={query}
        sortBy={sortBy}
        visibleCount={visibleTeams.length}
        totalCount={teams.length}
        onQueryChange={setQuery}
        onSortChange={setSortBy}
      />

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
