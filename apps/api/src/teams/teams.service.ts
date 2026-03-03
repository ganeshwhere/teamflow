import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TeamRole, type Team } from "@prisma/client";
import type { TeamDetail, TeamListItem } from "@repo/types";

import { getApiJwtIssuer, getTeamInviteJwtSecret } from "../auth/auth.config";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

import type { CreateTeamDto } from "./dto/create-team.dto";
import type { InviteMemberDto } from "./dto/invite-member.dto";
import type { UpdateTeamDto } from "./dto/update-team.dto";

const TEAM_INVITE_TOKEN_AUDIENCE = "teamflow-team-invite";

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async getMyTeams(userId: string): Promise<TeamListItem[]> {
    const memberships = await this.prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
      },
    });

    return memberships.map(({ team }) => ({
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description,
      createdAt: team.createdAt,
      ownerId: team.ownerId,
      memberCount: team._count.members,
      projectCount: team._count.projects,
    }));
  }

  async createTeam(dto: CreateTeamDto, user: AuthUser): Promise<Team> {
    const slugBase = this.slugify(dto.name);

    const created = await this.prisma.team.create({
      data: {
        name: dto.name,
        slug: `${slugBase}-${Date.now().toString(36)}`,
        description: dto.description,
        ownerId: user.sub,
        members: {
          create: {
            userId: user.sub,
            role: TeamRole.OWNER,
          },
        },
      },
    });

    return created;
  }

  async getTeam(teamId: string): Promise<TeamDetail> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException("Team not found");
    }

    return {
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description,
      createdAt: team.createdAt,
      ownerId: team.ownerId,
      members: team.members,
    };
  }

  async updateTeam(teamId: string, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException("Team not found");
    }

    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async deleteTeam(teamId: string, user: AuthUser): Promise<{ deleted: boolean }> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException("Team not found");
    }

    if (team.ownerId !== user.sub) {
      throw new ForbiddenException("Only team owner can delete this team");
    }

    await this.prisma.team.delete({ where: { id: teamId } });
    return { deleted: true };
  }

  async inviteMember(
    teamId: string,
    dto: InviteMemberDto,
    user: AuthUser,
  ): Promise<{ invited: boolean }> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException("Team not found");
    }

    const inviterMembership = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.sub,
        },
      },
    });

    if (
      !inviterMembership ||
      (inviterMembership.role !== TeamRole.ADMIN && inviterMembership.role !== TeamRole.OWNER)
    ) {
      throw new ForbiddenException("Only admins or owners can invite members");
    }

    const inviteToken = await this.jwtService.signAsync(
      {
        teamId,
        email: dto.email.toLowerCase(),
      },
      {
        secret: getTeamInviteJwtSecret(),
        expiresIn: "48h",
        issuer: getApiJwtIssuer(),
        audience: TEAM_INVITE_TOKEN_AUDIENCE,
      },
    );

    await this.mailService.sendTeamInviteEmail({
      to: dto.email,
      inviterName: user.name ?? "A teammate",
      teamName: team.name,
      inviteUrl: `${process.env.APP_URL ?? "http://localhost:3000"}/invite?token=${inviteToken}`,
    });

    return { invited: true };
  }

  async joinTeam(teamId: string, token: string, user: AuthUser): Promise<{ joined: boolean }> {
    let decoded: { teamId: string; email: string };
    try {
      decoded = await this.jwtService.verifyAsync<{ teamId: string; email: string }>(token, {
        secret: getTeamInviteJwtSecret(),
        issuer: getApiJwtIssuer(),
        audience: TEAM_INVITE_TOKEN_AUDIENCE,
      });
    } catch {
      throw new BadRequestException("Invalid or expired invite token");
    }

    if (!decoded.teamId || !decoded.email) {
      throw new BadRequestException("Invalid invite token");
    }

    if (decoded.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException("Invite token email does not match current user");
    }

    if (decoded.teamId !== teamId) {
      throw new BadRequestException("Invite token team mismatch");
    }

    await this.prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId: decoded.teamId,
          userId: user.sub,
        },
      },
      create: {
        teamId: decoded.teamId,
        userId: user.sub,
        role: TeamRole.MEMBER,
      },
      update: {},
    });

    return { joined: true };
  }

  async removeMember(teamId: string, memberUserId: string): Promise<{ removed: boolean }> {
    const membership = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException("Membership not found");
    }

    if (membership.role === TeamRole.OWNER) {
      throw new ForbiddenException("Owner cannot be removed from team");
    }

    await this.prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
    });

    return { removed: true };
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
  }
}
