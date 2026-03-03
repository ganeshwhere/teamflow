"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ProjectItem } from "@repo/types";

import { ProjectOverviewCard } from "@/components/projects/project-overview-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type GlobalProjectItem = {
  teamId: string;
  teamName: string;
  project: ProjectItem;
};

type ProjectsSortOption = "recent" | "name" | "team";

export function ProjectsBrowser({ items }: { items: GlobalProjectItem[] }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<ProjectsSortOption>("recent");

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const target =
        `${item.project.name} ${item.project.description ?? ""} ${item.teamName}`.toLowerCase();
      return target.includes(normalizedQuery);
    });

    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.project.name.localeCompare(b.project.name);
      }

      if (sortBy === "team") {
        return a.teamName.localeCompare(b.teamName);
      }

      const aTime = new Date(a.project.createdAt).getTime();
      const bTime = new Date(b.project.createdAt).getTime();
      return bTime - aTime;
    });
  }, [items, query, sortBy]);

  if (items.length === 0) {
    return <Card className="text-sm text-muted-foreground">No projects available yet.</Card>;
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects..."
              className="pl-9"
            />
          </div>

          <Select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as ProjectsSortOption)}
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="name">Sort: Name</option>
            <option value="team">Sort: Team</option>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {visibleItems.length} of {items.length} projects
        </p>
      </div>

      {visibleItems.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {visibleItems.map((item) => (
            <ProjectOverviewCard
              key={item.project.id}
              teamId={item.teamId}
              project={item.project}
              teamName={item.teamName}
            />
          ))}
        </div>
      ) : (
        <Card className="text-sm text-muted-foreground">No projects match your search.</Card>
      )}
    </section>
  );
}
