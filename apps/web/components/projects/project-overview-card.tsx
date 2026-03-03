import Link from "next/link";
import { CalendarClock } from "lucide-react";
import type { ProjectItem } from "@repo/types";

import { Badge } from "@/components/ui/badge";

function formatDate(value: ProjectItem["createdAt"]): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function projectStatusTone(status?: string): string {
  if (status === "COMPLETED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (status === "ARCHIVED") {
    return "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300";
  }
  return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
}

function statusLabel(status?: string): string {
  return (status ?? "ACTIVE").replaceAll("_", " ");
}

function creatorInitial(project: ProjectItem): string {
  const label = project.creator?.name ?? project.creator?.email ?? "U";
  return label.slice(0, 1).toUpperCase();
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
          <Badge className={projectStatusTone(project.status)}>{statusLabel(project.status)}</Badge>
        </div>

        <p className="line-clamp-3 text-xs text-muted-foreground">{project.description ?? "No description provided."}</p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            {project.creator?.avatarUrl ? (
              <img
                src={project.creator.avatarUrl}
                alt={project.creator.name ?? project.creator.email ?? "Project creator"}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                {creatorInitial(project)}
              </span>
            )}
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
