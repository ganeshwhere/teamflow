import Link from "next/link";
import { ArrowLeft, CirclePlus, Paperclip } from "lucide-react";
import type { TaskDetail, UserSummary } from "@repo/types";

import { getTask } from "@/actions/task.actions";
import { getTeam } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
import { TaskCommentBox } from "@/components/tasks/task-comment-box";
import { TaskEditForm } from "@/components/tasks/task-edit-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function formatStatus(status: TaskDetail["status"]): string {
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "IN_REVIEW") return "In Review";
  if (status === "TODO") return "Todo";
  return "Done";
}

function formatPriority(priority: TaskDetail["priority"]): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function formatDate(value: TaskDetail["dueDate"]): string {
  if (!value) {
    return "Not set";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function formatRelativeTime(value: TaskDetail["createdAt"]): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "just now";
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function isOverdue(value: TaskDetail["dueDate"]): boolean {
  if (!value) {
    return false;
  }

  const dueDate = new Date(value);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate.getTime() < today.getTime();
}

function statusTone(status: TaskDetail["status"]): string {
  if (status === "DONE") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (status === "IN_PROGRESS") return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  if (status === "IN_REVIEW") return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300";
}

function priorityTone(priority: TaskDetail["priority"]): string {
  if (priority === "URGENT") return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300";
  if (priority === "HIGH") return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (priority === "LOW") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
}

export default async function TaskDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ teamId: string; projectId: string; taskId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { teamId, projectId, taskId } = await params;
  const { mode } = await searchParams;
  const result = await getTask(projectId, taskId);
  const teamResult = await getTeam(teamId);
  const task: TaskDetail | null = result.data;
  const assignees: UserSummary[] = (teamResult.data?.members ?? []).map((member) => member.user);
  const taskPath = `/teams/${teamId}/projects/${projectId}/tasks/${taskId}`;
  const isEditing = mode === "edit";

  if (!task) {
    return (
      <Card>
        <p className="text-sm text-red-600">Unable to load task.</p>
      </Card>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-4xl gap-5">
      <PageHeader
        eyebrow="Task"
        title={isEditing ? task.title : "Task Details"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <Link
                href={taskPath}
                className="inline-flex h-9 items-center rounded-md border border-border bg-popover px-3 text-sm text-foreground transition-colors hover:bg-accent"
              >
                View task
              </Link>
            ) : (
              <Link
                href={`${taskPath}?mode=edit`}
                className="inline-flex h-9 items-center rounded-md border border-border bg-popover px-3 text-sm text-foreground transition-colors hover:bg-accent"
              >
                Edit task
              </Link>
            )}
            <Link
              href={`/teams/${teamId}/projects/${projectId}`}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-popover px-3 text-sm text-foreground transition-colors hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to board
            </Link>
          </div>
        }
      />

      {isEditing ? (
        <Card className="p-5">
          <TaskEditForm projectId={projectId} task={task} assignees={assignees} />
        </Card>
      ) : (
        <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="grid self-start gap-6 p-5">
            <div className="grid gap-1">
              <p className="text-2xl font-semibold tracking-tight text-foreground">{task.title}</p>
            </div>

            <div className="grid gap-1">
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                {task.description?.trim() ? task.description : "No task description has been added yet."}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 text-muted-foreground">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-foreground"
              >
                <CirclePlus className="h-4 w-4" />
                Add sub-issues
              </button>
              <button type="button" className="inline-flex items-center transition-colors hover:text-foreground">
                <Paperclip className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 border-t border-border pt-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-foreground">Activity</h3>
                <button type="button" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Unsubscribe
                </button>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {task.creator?.avatarUrl ? (
                  <img
                    src={task.creator.avatarUrl}
                    alt={task.creator.name ?? task.creator.email ?? "User"}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted font-semibold text-foreground">
                    {(task.creator?.name ?? task.creator?.email ?? "U").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <p>
                  {(task.creator?.name ?? task.creator?.email ?? "A member")} created this task • {formatRelativeTime(task.createdAt)}
                </p>
              </div>

              <TaskCommentBox />
            </div>
          </Card>

          <Card className="h-fit self-start p-5">
            <div className="divide-y divide-border">
              <div className="grid gap-1 py-3 first:pt-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Priority</p>
                <Badge className={`${priorityTone(task.priority)} w-fit`}>{formatPriority(task.priority)}</Badge>
              </div>
              <div className="grid gap-1 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</p>
                <Badge className={`${statusTone(task.status)} w-fit`}>{formatStatus(task.status)}</Badge>
              </div>
              <div className="grid gap-1 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Due Date</p>
                <p className={`text-sm ${isOverdue(task.dueDate) ? "text-destructive" : "text-foreground"}`}>
                  {formatDate(task.dueDate)}
                </p>
              </div>
              <div className="grid gap-1 py-3 last:pb-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Assignee</p>
                <p className="text-sm text-foreground">{task.assignee?.name ?? task.assignee?.email ?? "Unassigned"}</p>
              </div>
            </div>
          </Card>
        </section>
      )}
    </main>
  );
}
