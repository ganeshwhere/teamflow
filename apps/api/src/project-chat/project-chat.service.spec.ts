import { NotFoundException } from "@nestjs/common";

import { ProjectChatService } from "./project-chat.service";

describe("ProjectChatService", () => {
  it("creates a message and resolves mentions from content and explicit ids", async () => {
    const create = jest.fn().mockResolvedValue({ id: "msg_1" });
    const service = new ProjectChatService({
      project: {
        findUnique: jest.fn().mockResolvedValue({ teamId: "team_1" }),
      },
      teamMember: {
        findMany: jest.fn().mockResolvedValue([
          {
            userId: "user_1",
            user: {
              id: "user_1",
              email: "owner@example.com",
              name: "Owner",
              avatarUrl: null,
            },
          },
          {
            userId: "user_2",
            user: {
              id: "user_2",
              email: "alice@example.com",
              name: "Alice Johnson",
              avatarUrl: null,
            },
          },
        ]),
      },
      projectChatMessage: { create },
    } as never);

    await service.createMessage(
      "project_1",
      {
        content: "Hello @alice and @alice.johnson",
        mentionUserIds: ["user_2"],
      },
      {
        sub: "user_1",
        email: "owner@example.com",
        provider: "github",
      },
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: "project_1",
          authorId: "user_1",
          content: "Hello @alice and @alice.johnson",
          mentions: {
            create: [{ userId: "user_2" }],
          },
        }),
      }),
    );
  });

  it("does not create mentions for users outside project team", async () => {
    const create = jest.fn().mockResolvedValue({ id: "msg_1" });
    const service = new ProjectChatService({
      project: {
        findUnique: jest.fn().mockResolvedValue({ teamId: "team_1" }),
      },
      teamMember: {
        findMany: jest.fn().mockResolvedValue([
          {
            userId: "user_1",
            user: {
              id: "user_1",
              email: "owner@example.com",
              name: "Owner",
              avatarUrl: null,
            },
          },
        ]),
      },
      projectChatMessage: { create },
    } as never);

    await service.createMessage(
      "project_1",
      {
        content: "Hey @external",
        mentionUserIds: ["user_999"],
      },
      {
        sub: "user_1",
        email: "owner@example.com",
        provider: "github",
      },
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mentions: undefined,
        }),
      }),
    );
  });

  it("throws when project does not exist", async () => {
    const service = new ProjectChatService({
      project: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as never);

    await expect(
      service.createMessage(
        "missing_project",
        { content: "Message" },
        { sub: "user_1", email: "user@example.com", provider: "github" },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
