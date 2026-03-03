"use client";

import { Badge } from "@/components/ui/badge";
import { UserAvatar, getUserDisplayName } from "@/components/ui/user-avatar";
import { taskPriorityLabel, taskPriorityTone } from "@/components/tasks/task-meta";
import type { TaskBoardItem } from "./task-board.utils";

export function TaskAssigneePill({ task }: { task: TaskBoardItem }) {
  const label = getUserDisplayName({
    name: task.assignee?.name,
    email: task.assignee?.email
  });
  const isAssigned = Boolean(task.assignee?.id);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <UserAvatar
        name={isAssigned ? task.assignee?.name : "Unassigned"}
        email={isAssigned ? task.assignee?.email : undefined}
        avatarUrl={isAssigned ? task.assignee?.avatarUrl : undefined}
        className="h-5 w-5 text-[10px]"
      />
      <span className="truncate">{isAssigned ? label : "Unassigned"}</span>
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
