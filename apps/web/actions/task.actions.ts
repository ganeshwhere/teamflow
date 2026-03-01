"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult, DeleteResult, PriorityValue, TaskDetail, TaskItem, TaskStatusValue } from "@repo/types";

import { del, get, patch, post } from "@/lib/api-client";

import { fail, ok } from "./utils";

const taskInputSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional()
});

const taskUpdateSchema = taskInputSchema
  .partial()
  .extend({
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional()
  });

const taskFilterSchema = z
  .object({
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    assigneeId: z.string().optional()
  })
  .optional();

export async function getTasks(
  projectId: string,
  filters?: {
    status?: TaskStatusValue;
    priority?: PriorityValue;
    assigneeId?: string;
  }
): Promise<ActionResult<TaskItem[]>> {
  try {
    const parsedProjectId = z.string().min(1).parse(projectId);
    const parsedFilters = taskFilterSchema.parse(filters);
    const query = new URLSearchParams();

    if (parsedFilters?.status) query.set("status", parsedFilters.status);
    if (parsedFilters?.priority) query.set("priority", parsedFilters.priority);
    if (parsedFilters?.assigneeId) query.set("assigneeId", parsedFilters.assigneeId);

    const data = await get<TaskItem[]>(
      `/projects/${parsedProjectId}/tasks${query.toString() ? `?${query.toString()}` : ""}`
    );

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function createTask(
  projectId: string,
  formData: {
    title: string;
    description?: string;
    priority?: PriorityValue;
    dueDate?: string;
    assigneeId?: string;
  }
): Promise<ActionResult<TaskItem>> {
  try {
    const parsedProjectId = z.string().min(1).parse(projectId);
    const parsedData = taskInputSchema.parse(formData);
    const data = await post<TaskItem>(`/projects/${parsedProjectId}/tasks`, parsedData);
    revalidatePath(`/teams`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function getTask(projectId: string, taskId: string): Promise<ActionResult<TaskDetail>> {
  try {
    const parsedProjectId = z.string().min(1).parse(projectId);
    const parsedTaskId = z.string().min(1).parse(taskId);
    const data = await get<TaskDetail>(`/projects/${parsedProjectId}/tasks/${parsedTaskId}`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: {
    title?: string;
    description?: string;
    priority?: PriorityValue;
    dueDate?: string;
    assigneeId?: string;
    status?: TaskStatusValue;
  }
): Promise<ActionResult<TaskDetail>> {
  try {
    const parsedProjectId = z.string().min(1).parse(projectId);
    const parsedTaskId = z.string().min(1).parse(taskId);
    const parsedData = taskUpdateSchema.parse(data);
    const updated = await patch<TaskDetail>(`/projects/${parsedProjectId}/tasks/${parsedTaskId}`, parsedData);
    revalidatePath(`/teams`);
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}

export async function updateTaskStatus(
  projectId: string,
  taskId: string,
  status: TaskStatusValue
): Promise<ActionResult<TaskDetail>> {
  return updateTask(projectId, taskId, { status });
}

export async function assignTask(
  projectId: string,
  taskId: string,
  assigneeId: string
): Promise<ActionResult<TaskDetail>> {
  return updateTask(projectId, taskId, { assigneeId });
}

export async function deleteTask(projectId: string, taskId: string): Promise<ActionResult<DeleteResult>> {
  try {
    const parsedProjectId = z.string().min(1).parse(projectId);
    const parsedTaskId = z.string().min(1).parse(taskId);
    const data = await del<DeleteResult>(`/projects/${parsedProjectId}/tasks/${parsedTaskId}`);
    revalidatePath(`/teams`);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
