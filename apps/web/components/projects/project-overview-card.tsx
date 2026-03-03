import Link from "next/link";
import { CalendarClock } from "lucide-react";
import type { ProjectItem } from "@repo/types";

import { projectStatusLabel, projectStatusTone } from "@/components/projects/project-meta";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";

function formatDate(value: ProjectItem["createdAt"]): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function ProjectOverviewCard({ teamId, project }: { teamId: string; project: ProjectItem }) {
  return (
    <Link
      href={`/teams/${teamId}/projects/${project.id}`}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <article className="grid h-full gap-3 rounded-lg border border-border bg-popover p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{project.name}</h3>
          <Badge className={projectStatusTone(project.status)}>{projectStatusLabel(project.status)}</Badge>
        </div>

        <p className="line-clamp-3 text-xs text-muted-foreground">{project.description ?? "No description provided."}</p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserAvatar
              name={project.creator?.name}
              email={project.creator?.email}
              avatarUrl={project.creator?.avatarUrl}
              className="h-5 w-5 text-[10px]"
            />
            <span className="truncate">{project.creator?.name ?? project.creator?.email ?? "Unknown creator"}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDate(project.createdAt)}
          </span>
        </div>
      </article>
    </Link>
  );
}
