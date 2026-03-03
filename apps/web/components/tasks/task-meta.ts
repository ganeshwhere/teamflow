import type { PriorityValue, TaskStatusValue } from "@repo/types";

export function taskStatusLabel(status: TaskStatusValue): string {
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "IN_REVIEW") return "In Review";
  if (status === "TODO") return "Todo";
  return "Done";
}

export function taskStatusTone(status: TaskStatusValue): string {
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

export function taskPriorityLabel(priority: PriorityValue): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

export function taskPriorityTone(priority: PriorityValue): string {
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
