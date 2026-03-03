import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { TeamRole } from "@prisma/client";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";

import { TeamsService } from "./teams.service";

describe("TeamsService", () => {
  const originalApiJwtSecret = process.env.API_JWT_SECRET;
  const originalTeamInviteSecret = process.env.TEAM_INVITE_JWT_SECRET;
  const user: AuthUser = {
    sub: "user_1",
    email: "owner@example.com",
    name: "Owner",
    provider: "github",
  };

  beforeEach(() => {
    process.env.API_JWT_SECRET = "a".repeat(32);
    process.env.TEAM_INVITE_JWT_SECRET = "i".repeat(32);
  });

  afterAll(() => {
    if (originalApiJwtSecret === undefined) {
      delete process.env.API_JWT_SECRET;
    } else {
      process.env.API_JWT_SECRET = originalApiJwtSecret;
    }

    if (originalTeamInviteSecret === undefined) {
      delete process.env.TEAM_INVITE_JWT_SECRET;
      return;
    }

    process.env.TEAM_INVITE_JWT_SECRET = originalTeamInviteSecret;
  });

  it("creates a team with owner membership", async () => {
    const create = jest.fn().mockResolvedValue({ id: "team_1" });
    const service = new TeamsService(
      { team: { create } } as never,
      { signAsync: jest.fn() } as never,
      { sendTeamInviteEmail: jest.fn() } as never,
    );

    await service.createTeam({ name: "Core Team" }, user);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerId: "user_1",
        }),
      }),
    );
  });

  it("allows only admin and owner to invite", async () => {
    const service = new TeamsService(
      {
        team: { findUnique: jest.fn().mockResolvedValue({ id: "team_1", name: "Core" }) },
        teamMember: { findUnique: jest.fn().mockResolvedValue({ role: TeamRole.MEMBER }) },
      } as never,
      { signAsync: jest.fn() } as never,
      { sendTeamInviteEmail: jest.fn() } as never,
    );

    await expect(
      service.inviteMember("team_1", { email: "new@example.com" }, user),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("joins a team when token matches user email", async () => {
    const upsert = jest.fn().mockResolvedValue({});
    const service = new TeamsService(
      {
        teamMember: { upsert },
      } as never,
      {
        verifyAsync: jest.fn().mockResolvedValue({ teamId: "team_1", email: user.email }),
      } as never,
      { sendTeamInviteEmail: jest.fn() } as never,
    );

    await service.joinTeam("team_1", "token", user);

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          teamId_userId: {
            teamId: "team_1",
            userId: "user_1",
          },
        },
      }),
    );
  });

  it("allows only owner to delete team", async () => {
    const service = new TeamsService(
      {
        team: {
          findUnique: jest.fn().mockResolvedValue({ id: "team_1", ownerId: "owner_user" }),
          delete: jest.fn(),
        },
      } as never,
      { verifyAsync: jest.fn() } as never,
      { sendTeamInviteEmail: jest.fn() } as never,
    );

    await expect(service.deleteTeam("team_1", user)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects join when token team does not match route team", async () => {
    const service = new TeamsService(
      {
        teamMember: { upsert: jest.fn() },
      } as never,
      {
        verifyAsync: jest.fn().mockResolvedValue({ teamId: "team_2", email: user.email }),
      } as never,
      { sendTeamInviteEmail: jest.fn() } as never,
    );

    await expect(service.joinTeam("team_1", "token", user)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("rejects join when invite token is invalid or expired", async () => {
    const service = new TeamsService(
      {
        teamMember: { upsert: jest.fn() },
      } as never,
      {
        verifyAsync: jest.fn().mockRejectedValue(new Error("jwt expired")),
      } as never,
      { sendTeamInviteEmail: jest.fn() } as never,
    );

    await expect(service.joinTeam("team_1", "token", user)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("accepts invite when token email casing differs from user email", async () => {
    const upsert = jest.fn().mockResolvedValue({});
    const service = new TeamsService(
      {
        teamMember: { upsert },
      } as never,
      {
        verifyAsync: jest.fn().mockResolvedValue({ teamId: "team_1", email: "OWNER@EXAMPLE.COM" }),
      } as never,
      { sendTeamInviteEmail: jest.fn() } as never,
    );

    await expect(service.joinTeam("team_1", "token", user)).resolves.toEqual({ joined: true });
    expect(upsert).toHaveBeenCalled();
  });
});
