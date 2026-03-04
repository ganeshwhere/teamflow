"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult, ProjectChatMessage } from "@repo/types";

import { get, post } from "@/lib/api-client";

import { fail, ok } from "./utils";

const projectIdSchema = z.string().min(1);
const createProjectChatMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  mentionUserIds: z.array(z.string().min(1)).max(20).optional(),
});

export async function getProjectChatMessages(
  projectId: string,
): Promise<ActionResult<ProjectChatMessage[]>> {
  try {
    const parsedProjectId = projectIdSchema.parse(projectId);
    const data = await get<ProjectChatMessage[]>(`/projects/${parsedProjectId}/chat/messages`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function createProjectChatMessage(
  projectId: string,
  message: { content: string; mentionUserIds?: string[] },
): Promise<ActionResult<ProjectChatMessage>> {
  try {
    const parsedProjectId = projectIdSchema.parse(projectId);
    const parsedPayload = createProjectChatMessageSchema.parse(message);
    const data = await post<ProjectChatMessage>(
      `/projects/${parsedProjectId}/chat/messages`,
      parsedPayload,
    );
    revalidatePath("/teams");
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
