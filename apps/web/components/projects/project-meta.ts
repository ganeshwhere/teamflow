import type { ProjectStatusValue } from "@repo/types";

export function normalizeProjectStatus(status?: string | null): ProjectStatusValue {
  if (status === "COMPLETED" || status === "ARCHIVED") {
    return status;
  }
  return "ACTIVE";
}

export function projectStatusLabel(status?: string | null): string {
  return normalizeProjectStatus(status).replaceAll("_", " ");
}

export function projectStatusTone(status?: string | null): string {
  const normalized = normalizeProjectStatus(status);

  if (normalized === "COMPLETED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (normalized === "ARCHIVED") {
    return "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300";
  }

  return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
}
