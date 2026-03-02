import Link from "next/link";
import { Suspense } from "react";
import { BellRing, CalendarClock, CircleAlert, CircleCheckBig, Clock3 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { loadDashboardData, type TaskWithContext } from "../_lib/dashboard-data";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

function formatDate(value?: Date | string | null): string {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return DATE_FORMATTER.format(date);
}

function NotificationList({
  title,
  description,
  items,
  emptyText,
  tone = "default"
}: {
  title: string;
  description: string;
  items: TaskWithContext[];
  emptyText: string;
  tone?: "default" | "critical";
}) {
  return (
    <Card className="grid gap-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-2">
          {items.map((task) => (
            <Link
              key={task.id}
              href={`/teams/${task.teamId}/projects/${task.projectId}/tasks/${task.id}`}
              className="rounded-lg border border-border bg-background px-3 py-2 transition-colors hover:bg-accent"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
                <Badge className={tone === "critical" ? "border-destructive/30 bg-destructive/10 text-destructive" : ""}>
                  {task.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {task.teamName} / {task.projectName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Due {formatDate(task.dueDate)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </Card>
  );
}

async function NotificationsContent() {
  const data = await loadDashboardData();
  const attentionItems = [...data.overdueTasks, ...data.assignedTasks.filter((task) => task.priority === "URGENT" && task.status !== "DONE")]
    .filter((task, index, list) => list.findIndex((item) => item.id === task.id) === index)
    .slice(0, 8);

  const reviewItems = data.reviewTasks.slice(0, 8);
  const dueSoonItems = data.dueSoonTasks.slice(0, 8);

  return (
    <section className="grid gap-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Prioritized alerts for your assigned tasks and delivery flow."
        actions={<Badge>{attentionItems.length + reviewItems.length + dueSoonItems.length} active alerts</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="grid gap-1">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Overdue</p>
          <p className="text-2xl font-semibold text-foreground">{data.overdueTasks.length}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CircleAlert className="h-3.5 w-3.5" />
            Requires immediate attention
          </p>
        </Card>
        <Card className="grid gap-1">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">In Review</p>
          <p className="text-2xl font-semibold text-foreground">{data.reviewTasks.length}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            Waiting for final checks
          </p>
        </Card>
        <Card className="grid gap-1">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Due Soon</p>
          <p className="text-2xl font-semibold text-foreground">{data.dueSoonTasks.length}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            Due within 7 days
          </p>
        </Card>
        <Card className="grid gap-1">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Completed</p>
          <p className="text-2xl font-semibold text-foreground">{data.completedTaskCount}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CircleCheckBig className="h-3.5 w-3.5" />
            Great execution pace
          </p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <NotificationList
          title="Needs Attention"
          description="Overdue or urgent tasks to triage first."
          items={attentionItems}
          emptyText="No critical alerts."
          tone="critical"
        />
        <NotificationList
          title="Review Queue"
          description="Tasks currently waiting in review."
          items={reviewItems}
          emptyText="No reviews pending."
        />
        <NotificationList
          title="Upcoming Deadlines"
          description="Assignments due this week."
          items={dueSoonItems}
          emptyText="No deadlines in the next 7 days."
        />
      </div>

      <Card className="flex items-center justify-between gap-3 bg-muted/60">
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <BellRing className="h-4 w-4" />
          Notification feed updates automatically from your assigned tasks.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Back to Dashboard
        </Link>
      </Card>
    </section>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <NotificationsContent />
    </Suspense>
  );
}
