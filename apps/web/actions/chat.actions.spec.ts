import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const get = vi.fn();
const post = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/api-client", () => ({
  get,
  post,
}));

describe("chat actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error for invalid chat payload", async () => {
    const { createProjectChatMessage } = await import("./chat.actions");
    const result = await createProjectChatMessage("project_1", { content: "" });

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
    expect(post).not.toHaveBeenCalled();
  });

  it("requests project chat messages", async () => {
    get.mockResolvedValueOnce([]);
    const { getProjectChatMessages } = await import("./chat.actions");

    await getProjectChatMessages("project_1");

    expect(get).toHaveBeenCalledWith("/projects/project_1/chat/messages");
  });

  it("revalidates teams path after creating a message", async () => {
    post.mockResolvedValueOnce({
      id: "msg_1",
      content: "Hello",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: "project_1",
      authorId: "user_1",
      author: {
        id: "user_1",
        email: "owner@example.com",
        name: "Owner",
        avatarUrl: null,
      },
      mentions: [],
    });
    const { createProjectChatMessage } = await import("./chat.actions");

    const result = await createProjectChatMessage("project_1", {
      content: "Hello world",
      mentionUserIds: ["user_2"],
    });

    expect(result.error).toBeNull();
    expect(revalidatePath).toHaveBeenCalledWith("/teams");
  });
});
