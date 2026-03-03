"use client";

import { Badge } from "@/components/ui/badge";
import type { TaskBoardItem } from "./task-board.utils";

export function TaskAssigneePill({ task }: { task: TaskBoardItem }) {
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

export function formatTaskDueDate(value: TaskBoardItem["dueDate"]): string {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export function isTaskOverdue(value: TaskBoardItem["dueDate"]): boolean {
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

export function taskPriorityLabel(priority: TaskBoardItem["priority"]): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

export function taskPriorityTone(priority: TaskBoardItem["priority"]): string {
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

export function TaskCardContent({ task }: { task: TaskBoardItem }) {
  return (
    <>
      <p className="line-clamp-2 text-sm font-medium">{task.title}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <Badge className={taskPriorityTone(task.priority)}>{taskPriorityLabel(task.priority)}</Badge>
        <span className={isTaskOverdue(task.dueDate) ? "text-destructive" : undefined}>{formatTaskDueDate(task.dueDate)}</span>
      </div>
      <div className="mt-2">
        <TaskAssigneePill task={task} />
      </div>
    </>
  );
}
