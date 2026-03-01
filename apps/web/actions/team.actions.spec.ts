import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const get = vi.fn();
const post = vi.fn();
const del = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath
}));

vi.mock("@/lib/api-client", () => ({
  get,
  post,
  del
}));

describe("team actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error for invalid create payload", async () => {
    const { createTeam } = await import("./team.actions");
    const result = await createTeam({ name: "A" });

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
    expect(post).not.toHaveBeenCalled();
  });

  it("normalizes API failure without throwing", async () => {
    post.mockRejectedValueOnce(new Error("api failed"));
    const { createTeam } = await import("./team.actions");

    const result = await createTeam({ name: "Platform", description: "Core" });

    expect(result).toEqual({ data: null, error: "api failed" });
  });

  it("revalidates team paths after invite", async () => {
    post.mockResolvedValueOnce({ invited: true });
    const { inviteMember } = await import("./team.actions");

    const result = await inviteMember("team_1", "member@example.com");

    expect(result.error).toBeNull();
    expect(revalidatePath).toHaveBeenCalledWith("/teams/team_1");
  });
});
