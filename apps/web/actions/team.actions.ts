"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult, DeleteResult, InviteResult, JoinResult, RemoveResult, Team, TeamDetail, TeamListItem } from "@repo/types";

import { del, get, patch, post } from "@/lib/api-client";

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

export async function getMyTeams(): Promise<ActionResult<TeamListItem[]>> {
  try {
    const data = await get<TeamListItem[]>("/teams");
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function getTeam(teamId: string): Promise<ActionResult<TeamDetail>> {
  try {
    const parsed = teamIdSchema.parse(teamId);
    const data = await get<TeamDetail>(`/teams/${parsed}`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function createTeam(formData: { name: string; description?: string }): Promise<ActionResult<Team>> {
  try {
    const parsed = createTeamInputSchema.parse(formData);
    const data = await post<Team>("/teams", parsed);
    revalidatePath("/teams");
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function updateTeam(teamId: string, formData: { name: string; description?: string }): Promise<ActionResult<Team>> {
  try {
    const parsedTeamId = teamIdSchema.parse(teamId);
    const parsed = createTeamInputSchema.parse(formData);
    const data = await patch<Team>(`/teams/${parsedTeamId}`, parsed);
    revalidatePath("/teams");
    revalidatePath(`/teams/${parsedTeamId}`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function inviteMember(teamId: string, email: string): Promise<ActionResult<InviteResult>> {
  try {
    const parsed = inviteSchema.parse({ teamId, email });
    const data = await post<InviteResult>(`/teams/${parsed.teamId}/invite`, { email: parsed.email });
    revalidatePath(`/teams/${parsed.teamId}`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function joinTeam(teamId: string, token: string): Promise<ActionResult<JoinResult>> {
  try {
    const parsed = joinTeamSchema.parse({ teamId, token });
    const data = await post<JoinResult>(`/teams/${parsed.teamId}/join`, { token: parsed.token });
    revalidatePath(`/teams/${parsed.teamId}`);
    revalidatePath("/teams");
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function removeMember(teamId: string, userId: string): Promise<ActionResult<RemoveResult>> {
  try {
    const parsed = removeMemberSchema.parse({ teamId, userId });
    const data = await del<RemoveResult>(`/teams/${parsed.teamId}/members/${parsed.userId}`);
    revalidatePath(`/teams/${parsed.teamId}`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function deleteTeam(teamId: string): Promise<ActionResult<DeleteResult>> {
  try {
    const parsed = teamIdSchema.parse(teamId);
    const data = await del<DeleteResult>(`/teams/${parsed}`);
    revalidatePath("/teams");
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
