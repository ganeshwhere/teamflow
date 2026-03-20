"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TeamListItem } from "@repo/types";

import { TeamCard } from "@/components/teams/team-card";
import { TeamsFilterBar, type TeamSortOption } from "@/components/teams/teams-filter-bar";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 px-6 text-center">
        <h2 className="text-2xl font-bold mb-3 tracking-tight">No teams yet</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Create your first team to start organizing projects, tasks and collaborate with your
          colleagues.
        </p>
        <Link href="/teams/new">
          <Button className="font-semibold px-8 h-12">Create Team</Button>
        </Link>
      </div>
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
