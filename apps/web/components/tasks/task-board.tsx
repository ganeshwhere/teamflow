"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { TaskStatusValue } from "@repo/types";

import { updateTaskStatus } from "@/actions/task.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Kanban, KanbanBoard, KanbanColumn, KanbanItem } from "@/components/ui/kanban";
import { groupTasksByStatus, taskStatuses, type TaskBoardItem } from "./task-board.utils";

function AssigneePill({ task }: { task: TaskBoardItem }) {
  const label = task.assignee?.name ?? task.assignee?.email ?? "Unassigned";
  const initial = label.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {task.assignee?.avatarUrl ? (
        <img alt={label} className="h-5 w-5 rounded-full object-cover" src={task.assignee.avatarUrl} />
      ) : (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted font-semibold text-foreground">
          {initial}
        </span>
      )}
      <span className="truncate">{label}</span>
    </div>
  );
}

function isTaskStatus(status: string): status is TaskBoardItem["status"] {
  return taskStatuses.includes(status as TaskBoardItem["status"]);
}

function statusLabel(status: TaskBoardItem["status"]): string {
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "IN_REVIEW") return "In Review";
  if (status === "TODO") return "Todo";
  return "Done";
}

function formatDueDate(value: TaskBoardItem["dueDate"]): string {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function isOverdue(value: TaskBoardItem["dueDate"]): boolean {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

function priorityLabel(priority: TaskBoardItem["priority"]): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function priorityTone(priority: TaskBoardItem["priority"]): string {
  if (priority === "URGENT") {
    return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300";
  }
  if (priority === "HIGH") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  if (priority === "LOW") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
}

function statusTone(status: TaskBoardItem["status"]): string {
  if (status === "DONE") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (status === "IN_PROGRESS") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }
  if (status === "IN_REVIEW") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  return "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300";
}

function resolveDestinationStatus(
  over: {
    id?: unknown;
    data?: { current?: { sortable?: { containerId?: unknown } } };
  } | null | undefined,
  columns: Record<TaskBoardItem["status"], TaskBoardItem[]>
): TaskBoardItem["status"] | null {
  if (!over) {
    return null;
  }

  const overId = String(over.id ?? "");
  if (isTaskStatus(overId)) {
    return overId;
  }

  const containerId = String(over.data?.current?.sortable?.containerId ?? "");
  if (isTaskStatus(containerId)) {
    return containerId;
  }

  for (const status of taskStatuses) {
    if (columns[status].some((task) => task.id === overId)) {
      return status;
    }
  }

  return null;
}

function resolveSourceStatus(
  activeTaskId: string,
  columns: Record<TaskBoardItem["status"], TaskBoardItem[]>
): TaskBoardItem["status"] | null {
  for (const status of taskStatuses) {
    if (columns[status].some((task) => task.id === activeTaskId)) {
      return status;
    }
  }

  return null;
}

export function TaskBoard({
  tasks,
  basePath,
  projectId
}: {
  tasks: TaskBoardItem[];
  basePath: string;
  projectId: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const grouped = useMemo(() => groupTasksByStatus(tasks), [tasks]);
  const [kanbanColumns, setKanbanColumns] = useState(grouped);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dragSourceStatusRef = useRef<TaskBoardItem["status"] | null>(null);
  const doneCount = tasks.filter((task) => task.status === "DONE").length;

  useEffect(() => {
    setKanbanColumns(grouped);
  }, [grouped]);

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/70 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Board</span>
          <span className="h-3.5 w-px bg-border" />
          <p className="text-xs text-muted-foreground">
            {tasks.length} total {tasks.length === 1 ? "task" : "tasks"} • {doneCount} done
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card/70 p-1">
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            className="h-8 px-3 text-xs"
            onClick={() => setView("kanban")}
          >
            Kanban
          </Button>
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            className="h-8 px-3 text-xs"
            onClick={() => setView("table")}
          >
            Table
          </Button>
        </div>
      </div>

      {view === "kanban" ? (
        <Kanban
          value={kanbanColumns}
          onValueChange={(value) => setKanbanColumns(value)}
          onDragStart={(event) => {
            const activeTaskId = String(event.active.id);
            if (isTaskStatus(activeTaskId)) {
              dragSourceStatusRef.current = null;
              return;
            }

            dragSourceStatusRef.current = resolveSourceStatus(activeTaskId, kanbanColumns);
          }}
          onDragCancel={() => {
            dragSourceStatusRef.current = null;
          }}
          onDragEnd={(event) => {
            const activeTaskId = String(event.active.id);
            if (isTaskStatus(activeTaskId)) {
              dragSourceStatusRef.current = null;
              return;
            }

            const destinationStatus = resolveDestinationStatus(event.over, kanbanColumns);
            if (!destinationStatus) {
              dragSourceStatusRef.current = null;
              return;
            }

            const sourceStatus = dragSourceStatusRef.current ?? resolveSourceStatus(activeTaskId, kanbanColumns);
            dragSourceStatusRef.current = null;
            if (!sourceStatus || sourceStatus === destinationStatus) {
              return;
            }

            setMoveError(null);
            startTransition(async () => {
              const result = await updateTaskStatus(projectId, activeTaskId, destinationStatus as TaskStatusValue);
              if (result.error) {
                setMoveError(result.error);
                setKanbanColumns(grouped);
                return;
              }

              router.refresh();
            });
          }}
          getItemValue={(item) => item.id}
        >
          <KanbanBoard className="w-full items-start overflow-x-auto pb-2">
            {taskStatuses.map((status) => (
              <KanbanColumn
                key={status}
                value={status}
                className="h-fit w-[280px] min-h-[260px] border border-border bg-card"
              >
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{statusLabel(status)}</h3>
                  <span className="rounded-full border border-border bg-popover px-2 py-0.5 text-[11px] text-muted-foreground">
                    {kanbanColumns[status].length}
                  </span>
                </div>
                {kanbanColumns[status].length === 0 ? (
                  <div className="rounded-md border border-dashed border-border bg-popover px-3 py-4 text-xs text-muted-foreground">
                    No tasks in this stage.
                  </div>
                ) : null}
                {kanbanColumns[status].map((task) => (
                  <KanbanItem key={task.id} value={task.id} asChild asHandle>
                    <Link
                      href={`${basePath}/tasks/${task.id}`}
                      className="rounded-md border border-border bg-popover p-3 text-card-foreground transition-colors hover:bg-accent"
                    >
                      <p className="line-clamp-2 text-sm font-medium">{task.title}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <Badge className={priorityTone(task.priority)}>{priorityLabel(task.priority)}</Badge>
                        <span className={isOverdue(task.dueDate) ? "text-destructive" : undefined}>{formatDueDate(task.dueDate)}</span>
                      </div>
                      <div className="mt-2">
                        <AssigneePill task={task} />
                      </div>
                    </Link>
                  </KanbanItem>
                ))}
              </KanbanColumn>
            ))}
          </KanbanBoard>
        </Kanban>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-border transition-colors hover:bg-accent/40 last:border-b-0">
                  <td className="px-4 py-3">
                    <Link href={`${basePath}/tasks/${task.id}`} className="font-medium text-primary hover:underline">
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusTone(task.status)}>{statusLabel(task.status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={priorityTone(task.priority)}>{priorityLabel(task.priority)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <AssigneePill task={task} />
                  </td>
                  <td className={`px-4 py-3 ${isOverdue(task.dueDate) ? "text-destructive" : ""}`}>{formatDueDate(task.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {view === "kanban" && isPending ? <p className="text-xs text-muted-foreground">Updating task status...</p> : null}
      {moveError ? <p className="text-xs text-red-600">{moveError}</p> : null}
    </section>
  );
}
