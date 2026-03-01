"use server";

import type { ActionResult } from "@repo/types";

import { get } from "@/lib/api-client";

import { fail, ok } from "./utils";

export async function getCurrentUser(): Promise<ActionResult<unknown>> {
  try {
    const data = await get<unknown>("/users/me");
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
