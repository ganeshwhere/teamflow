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

describe("project actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error for invalid create payload", async () => {
    const { createProject } = await import("./project.actions");
    const result = await createProject("team_1", { name: "A" });

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
    expect(post).not.toHaveBeenCalled();
  });

  it("revalidates project detail path after update", async () => {
    patch.mockResolvedValueOnce({
      id: "project_1",
      name: "Updated",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      teamId: "team_1"
    });
    const { updateProject } = await import("./project.actions");

    const result = await updateProject("team_1", "project_1", { name: "Updated" });

    expect(result.error).toBeNull();
    expect(revalidatePath).toHaveBeenCalledWith("/teams/team_1/projects/project_1");
  });

  it("normalizes delete API errors", async () => {
    del.mockRejectedValueOnce(new Error("delete failed"));
    const { deleteProject } = await import("./project.actions");

    const result = await deleteProject("team_1", "project_1");

    expect(result).toEqual({ data: null, error: "delete failed" });
  });
});
