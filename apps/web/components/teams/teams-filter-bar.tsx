"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type TeamSortOption = "name" | "members" | "projects" | "recent";

type TeamsFilterBarProps = {
  query: string;
  sortBy: TeamSortOption;
  visibleCount: number;
  totalCount: number;
  onQueryChange: (value: string) => void;
  onSortChange: (value: TeamSortOption) => void;
};

export function TeamsFilterBar({
  query,
  sortBy,
  visibleCount,
  totalCount,
  onQueryChange,
  onSortChange
}: TeamsFilterBarProps) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search teams..."
            className="pl-9"
          />
        </div>

        <Select value={sortBy} onChange={(event) => onSortChange(event.target.value as TeamSortOption)}>
          <option value="recent">Sort: Most Recent</option>
          <option value="name">Sort: Name</option>
          <option value="members">Sort: Members</option>
          <option value="projects">Sort: Projects</option>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {visibleCount} of {totalCount} teams
      </p>
    </div>
  );
}
