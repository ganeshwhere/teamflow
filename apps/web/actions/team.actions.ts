"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@repo/types";

import { del, get, post } from "@/lib/api-client";

import { createTeamInputSchema } from "./schemas";
import { fail, ok } from "./utils";

const teamIdSchema = z.string().min(1);
const inviteSchema = z.object({
  teamId: z.string().min(1),
  email: z.string().email()
});
const joinTeamSchema = z.object({
  teamId: z.string().min(1),
  token: z.string().min(1)
});
const removeMemberSchema = z.object({
  teamId: z.string().min(1),
  userId: z.string().min(1)
});

export async function getMyTeams(): Promise<ActionResult<unknown[]>> {
  try {
    const data = await get<unknown[]>("/teams");
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function getTeam(teamId: string): Promise<ActionResult<unknown>> {
  try {
    const parsed = teamIdSchema.parse(teamId);
    const data = await get<unknown>(`/teams/${parsed}`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function createTeam(formData: { name: string; description?: string }): Promise<ActionResult<unknown>> {
  try {
    const parsed = createTeamInputSchema.parse(formData);
    const data = await post<unknown>("/teams", parsed);
    revalidatePath("/teams");
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function inviteMember(teamId: string, email: string): Promise<ActionResult<unknown>> {
  try {
    const parsed = inviteSchema.parse({ teamId, email });
    const data = await post<unknown>(`/teams/${parsed.teamId}/invite`, { email: parsed.email });
    revalidatePath(`/teams/${parsed.teamId}`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function joinTeam(teamId: string, token: string): Promise<ActionResult<unknown>> {
  try {
    const parsed = joinTeamSchema.parse({ teamId, token });
    const data = await post<unknown>(`/teams/${parsed.teamId}/join`, { token: parsed.token });
    revalidatePath(`/teams/${parsed.teamId}`);
    revalidatePath("/teams");
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function removeMember(teamId: string, userId: string): Promise<ActionResult<unknown>> {
  try {
    const parsed = removeMemberSchema.parse({ teamId, userId });
    const data = await del<unknown>(`/teams/${parsed.teamId}/members/${parsed.userId}`);
    revalidatePath(`/teams/${parsed.teamId}`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
