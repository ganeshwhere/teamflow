import Link from "next/link";
import { ArrowLeft, CirclePlus, Paperclip } from "lucide-react";
import type { TaskDetail, UserSummary } from "@repo/types";

import { getTask } from "@/actions/task.actions";
import { getTeam } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
import { TaskCommentBox } from "@/components/tasks/task-comment-box";
import { TaskEditForm } from "@/components/tasks/task-edit-form";
import {
  taskPriorityLabel,
  taskPriorityTone,
  taskStatusLabel,
  taskStatusTone
} from "@/components/tasks/task-meta";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";

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
                <UserAvatar
                  name={task.creator?.name}
                  email={task.creator?.email}
                  avatarUrl={task.creator?.avatarUrl}
                  className="h-7 w-7 text-xs"
                />
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
                <Badge className={`${taskPriorityTone(task.priority)} w-fit`}>{taskPriorityLabel(task.priority)}</Badge>
              </div>
              <div className="grid gap-1 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</p>
                <Badge className={`${taskStatusTone(task.status)} w-fit`}>{taskStatusLabel(task.status)}</Badge>
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
