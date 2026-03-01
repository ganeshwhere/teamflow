"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@repo/types";

import { del, get, patch, post } from "@/lib/api-client";

import { fail, ok } from "./utils";

const teamIdSchema = z.string().min(1);
const projectInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});
const updateProjectSchema = projectInputSchema.partial();

export async function getProjects(teamId: string): Promise<ActionResult<unknown[]>> {
  try {
    const parsedTeamId = teamIdSchema.parse(teamId);
    const data = await get<unknown[]>(`/teams/${parsedTeamId}/projects`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function getProject(teamId: string, projectId: string): Promise<ActionResult<unknown>> {
  try {
    const parsedTeamId = teamIdSchema.parse(teamId);
    const parsedProjectId = z.string().min(1).parse(projectId);
    const data = await get<unknown>(`/teams/${parsedTeamId}/projects/${parsedProjectId}`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function createProject(teamId: string, formData: { name: string; description?: string }): Promise<ActionResult<unknown>> {
  try {
    const parsedTeamId = teamIdSchema.parse(teamId);
    const parsedData = projectInputSchema.parse(formData);
    const data = await post<unknown>(`/teams/${parsedTeamId}/projects`, parsedData);
    revalidatePath(`/teams/${parsedTeamId}`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function updateProject(
  teamId: string,
  projectId: string,
  data: { name?: string; description?: string }
): Promise<ActionResult<unknown>> {
  try {
    const parsedTeamId = teamIdSchema.parse(teamId);
    const parsedProjectId = z.string().min(1).parse(projectId);
    const parsedData = updateProjectSchema.parse(data);
    const updated = await patch<unknown>(`/teams/${parsedTeamId}/projects/${parsedProjectId}`, parsedData);
    revalidatePath(`/teams/${parsedTeamId}/projects/${parsedProjectId}`);
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}

export async function deleteProject(teamId: string, projectId: string): Promise<ActionResult<unknown>> {
  try {
    const parsedTeamId = teamIdSchema.parse(teamId);
    const parsedProjectId = z.string().min(1).parse(projectId);
    const result = await del<unknown>(`/teams/${parsedTeamId}/projects/${parsedProjectId}`);
    revalidatePath(`/teams/${parsedTeamId}`);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
