import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
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

export function ProjectOverviewCard({ teamId, project }: { teamId: string; project: ProjectItem }) {
  return (
    <Link href={`/teams/${teamId}/projects/${project.id}`} className="group block h-full">
      <article className="grid h-full gap-3 rounded-lg border border-border bg-popover p-4 transition-colors hover:bg-accent">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{project.name}</h3>
          <Badge className={projectStatusTone(project.status)}>{statusLabel(project.status)}</Badge>
        </div>

        <p className="line-clamp-3 text-xs text-muted-foreground">{project.description ?? "No description provided."}</p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            Created {formatDate(project.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-foreground/80 group-hover:text-foreground">
            Open project
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}
