"use server";

import type { ActionResult } from "@repo/types";
import type { User } from "@repo/types";

import { get } from "@/lib/api-client";

import { fail, ok } from "./utils";

export async function getCurrentUser(): Promise<ActionResult<User>> {
  try {
    const data = await get<User>("/users/me");
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
