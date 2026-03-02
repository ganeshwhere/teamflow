import Link from "next/link";
import { Suspense } from "react";
import { CalendarClock, CircleAlert, CircleCheckBig, FolderKanban, ListTodo, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { StatTile } from "@/components/layout/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { loadDashboardData } from "./_lib/dashboard-data";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric"
});

function formatDueDate(value?: Date | string | null): string {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return DATE_FORMATTER.format(date);
}

function statusLabel(value: string): string {
  return value.replaceAll("_", " ");
}

async function DashboardSummary() {
  const data = await loadDashboardData();
  const nextTasks = data.assignedTasks.slice(0, 5);
  const deadlines = [...data.overdueTasks, ...data.dueSoonTasks]
    .filter((task, index, tasks) => tasks.findIndex((current) => current.id === task.id) === index)
    .slice(0, 5);
  const dashboardCardTone = "border-border bg-card";
  const dashboardRowTone = "border-border bg-popover";

  return (
    <section className="grid gap-6 pb-10">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back${data.user?.name ? `, ${data.user.name}` : ""}`}
        description="Your key numbers, next tasks, and deadlines."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Teams"
          value={data.teams.length}
          icon={<Users className="h-4 w-4" />}
          hint="Active teams"
          className={dashboardCardTone}
        />
        <StatTile
          label="Projects"
          value={data.totalProjects}
          icon={<FolderKanban className="h-4 w-4" />}
          hint="Across all teams"
          className={dashboardCardTone}
        />
        <StatTile
          label="Active Tasks"
          value={data.activeTaskCount}
          icon={<ListTodo className="h-4 w-4" />}
          hint="Assigned to you"
          className={dashboardCardTone}
        />
        <StatTile
          label="Completion"
          value={`${data.completionRate}%`}
          icon={<CircleCheckBig className="h-4 w-4" />}
          hint={`${data.completedTaskCount} done`}
          className={dashboardCardTone}
        />
      </div>

      <Card className={`grid gap-3 ${dashboardCardTone}`}>
        <p className="text-sm font-semibold text-foreground">At a glance</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1">Overdue: {data.overdueTasks.length}</span>
          <span className="rounded-full bg-muted px-3 py-1">Due soon: {data.dueSoonTasks.length}</span>
          <span className="rounded-full bg-muted px-3 py-1">In review: {data.reviewTasks.length}</span>
          <span className="rounded-full bg-muted px-3 py-1">Urgent: {data.urgentTaskCount}</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={`grid gap-4 ${dashboardCardTone}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">My next tasks</h2>
              <p className="text-sm text-muted-foreground">Top priority items for you.</p>
            </div>
            <Link
              href="/dashboard/notifications"
              className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Notifications
            </Link>
          </div>

          {nextTasks.length > 0 ? (
            <div className="grid gap-2">
              {nextTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/teams/${task.teamId}/projects/${task.projectId}/tasks/${task.id}`}
                  className={`rounded-lg border px-3 py-2 transition-colors hover:bg-accent ${dashboardRowTone}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
                    <Badge className="bg-muted text-muted-foreground">{statusLabel(task.status)}</Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {task.teamName} / {task.projectName}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No assigned tasks yet.</p>
          )}
        </Card>

        <Card className={`grid gap-4 ${dashboardCardTone}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Upcoming deadlines</h2>
              <p className="text-sm text-muted-foreground">What needs attention next.</p>
            </div>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </div>

          {deadlines.length > 0 ? (
            <div className="grid gap-2">
              {deadlines.map((task) => {
                const isOverdue = data.overdueTasks.some((overdueTask) => overdueTask.id === task.id);

                return (
                  <Link
                    key={task.id}
                    href={`/teams/${task.teamId}/projects/${task.projectId}/tasks/${task.id}`}
                    className={`rounded-lg border px-3 py-2 transition-colors hover:bg-accent ${dashboardRowTone}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
                      <Badge className={isOverdue ? "border-destructive/30 bg-destructive/10 text-destructive" : ""}>
                        {isOverdue ? "Overdue" : formatDueDate(task.dueDate)}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {task.teamName} / {task.projectName}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <CircleAlert className="h-4 w-4" />
              No upcoming deadlines.
            </p>
          )}
        </Card>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <DashboardSummary />
    </Suspense>
  );
}
