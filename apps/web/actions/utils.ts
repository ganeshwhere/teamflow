import type { ActionResult } from "@repo/types";

type ApiLikeError = {
  message?: string | string[];
};

function extractStructuredError(raw: string): string | null {
  const value = raw.trim();
  if (!value.startsWith("{") && !value.startsWith("[")) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as ApiLikeError;

    if (Array.isArray(parsed.message)) {
      return parsed.message.join(", ");
    }

    if (typeof parsed.message === "string" && parsed.message.trim().length > 0) {
      return parsed.message;
    }

    return null;
  } catch {
    return null;
  }
}

export function normalizeActionError(error: unknown): string {
  if (error instanceof Error) {
    const structured = extractStructuredError(error.message);
    return structured ?? error.message;
  }

  return "Unexpected error";
}

export function ok<T>(data: T): ActionResult<T> {
  return { data, error: null };
}

export function fail<T = never>(error: unknown): ActionResult<T> {
  return { data: null, error: normalizeActionError(error) };
}
