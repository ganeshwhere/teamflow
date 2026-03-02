import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const get = vi.fn();
const post = vi.fn();
const patch = vi.fn();
const del = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath
}));

vi.mock("@/lib/api-client", () => ({
  get,
  post,
  patch,
  del
}));

describe("task actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error for invalid create payload", async () => {
    const { createTask } = await import("./task.actions");
    const result = await createTask("project_1", { title: "A" });

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
    expect(post).not.toHaveBeenCalled();
  });

  it("builds filter query params when listing tasks", async () => {
    get.mockResolvedValueOnce([]);
    const { getTasks } = await import("./task.actions");

    await getTasks("project_1", { status: "TODO", priority: "HIGH", assigneeId: "user_1" });

    expect(get).toHaveBeenCalledWith("/projects/project_1/tasks?status=TODO&priority=HIGH&assigneeId=user_1");
  });

  it("revalidates teams path on status update", async () => {
    patch.mockResolvedValueOnce({
      id: "task_1",
      title: "Fix",
      status: "DONE",
      priority: "MEDIUM",
      projectId: "project_1",
      creatorId: "user_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const { updateTaskStatus } = await import("./task.actions");

    const result = await updateTaskStatus("project_1", "task_1", "DONE");

    expect(result.error).toBeNull();
    expect(revalidatePath).toHaveBeenCalledWith("/teams");
  });

  it("normalizes delete API errors", async () => {
    del.mockRejectedValueOnce(new Error("task delete failed"));
    const { deleteTask } = await import("./task.actions");

    const result = await deleteTask("project_1", "task_1");

    expect(result).toEqual({ data: null, error: "task delete failed" });
  });
});
