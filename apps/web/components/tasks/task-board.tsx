"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
  return status.charAt(0) + status.slice(1).toLowerCase();
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
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const grouped = useMemo(() => groupTasksByStatus(tasks), [tasks]);
  const [kanbanColumns, setKanbanColumns] = useState(grouped);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setKanbanColumns(grouped);
  }, [grouped]);

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <div className="flex items-center gap-2">
          <Button variant={view === "kanban" ? "secondary" : "ghost"} onClick={() => setView("kanban")}>
            Kanban
          </Button>
          <Button variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}>
            Table
          </Button>
        </div>
      </div>

      {view === "kanban" ? (
        <Kanban
          value={kanbanColumns}
          onValueChange={(value) => setKanbanColumns(value)}
          onMove={(event) => {
            const activeTaskId = String(event.active.id);
            const fromColumn = String(event.active.data.current?.sortable?.containerId ?? "");
            const overColumn =
              String(event.over?.data.current?.sortable?.containerId ?? "") || String(event.over?.id ?? "");

            if (!isTaskStatus(fromColumn) || !isTaskStatus(overColumn) || fromColumn === overColumn) {
              return;
            }

            setMoveError(null);
            startTransition(async () => {
              const result = await updateTaskStatus(projectId, activeTaskId, overColumn as TaskStatusValue);
              if (result.error) {
                setMoveError(result.error);
              }
            });
          }}
          getItemValue={(item) => item.id}
        >
          <KanbanBoard className="w-full items-start overflow-x-auto pb-2">
            {taskStatuses.map((status) => (
              <KanbanColumn key={status} value={status} className="min-h-[280px] min-w-[260px] bg-muted">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{statusLabel(status)}</h3>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                    {kanbanColumns[status].length}
                  </span>
                </div>
                {kanbanColumns[status].length === 0 ? <p className="text-xs text-muted-foreground">No tasks</p> : null}
                {kanbanColumns[status].map((task) => (
                  <KanbanItem key={task.id} value={task.id} asChild asHandle>
                    <a
                      href={`${basePath}/tasks/${task.id}`}
                      className="rounded-md border border-border bg-card p-3 text-card-foreground transition hover:border-primary"
                    >
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <Badge>{task.priority}</Badge>
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                      </div>
                      <div className="mt-2">
                        <AssigneePill task={task} />
                      </div>
                    </a>
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
                <tr key={task.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <a href={`${basePath}/tasks/${task.id}`} className="font-medium text-primary hover:underline">
                      {task.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">{task.status}</td>
                  <td className="px-4 py-3">{task.priority}</td>
                  <td className="px-4 py-3">
                    <AssigneePill task={task} />
                  </td>
                  <td className="px-4 py-3">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>
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
