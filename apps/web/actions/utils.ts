import type { ActionResult } from "@repo/types";

export function normalizeActionError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

export function ok<T>(data: T): ActionResult<T> {
  return { data, error: null };
}

export function fail<T = never>(error: unknown): ActionResult<T> {
  return { data: null, error: normalizeActionError(error) };
}
