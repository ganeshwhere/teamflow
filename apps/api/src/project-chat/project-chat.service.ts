import { Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ProjectChatMessage } from "@repo/types";

import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { PrismaService } from "../prisma/prisma.service";

import type { CreateProjectChatMessageDto } from "./dto/create-project-chat-message.dto";

type TeamMemberWithUser = {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
};

const USER_SUMMARY_SELECT = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
} as const;

@Injectable()
export class ProjectChatService {
  constructor(private readonly prisma: PrismaService) {}

  async listMessages(projectId: string): Promise<ProjectChatMessage[]> {
    try {
      return await this.prisma.projectChatMessage.findMany({
        where: { projectId },
        include: {
          author: {
            select: USER_SUMMARY_SELECT,
          },
          mentions: {
            include: {
              user: {
                select: USER_SUMMARY_SELECT,
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    } catch (error) {
      this.rethrowPrismaRuntimeError(error);
    }
  }

  async createMessage(
    projectId: string,
    dto: CreateProjectChatMessageDto,
    currentUser: AuthUser,
  ): Promise<ProjectChatMessage> {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { teamId: true },
      });

      if (!project) {
        throw new NotFoundException("Project not found");
      }

      const teamMembers = await this.prisma.teamMember.findMany({
        where: { teamId: project.teamId },
        select: {
          userId: true,
          user: {
            select: USER_SUMMARY_SELECT,
          },
        },
      });

      const mentionUserIds = this.resolveMentionUserIds(dto, teamMembers, currentUser.sub);

      return await this.prisma.projectChatMessage.create({
        data: {
          projectId,
          authorId: currentUser.sub,
          content: dto.content.trim(),
          mentions:
            mentionUserIds.length > 0
              ? {
                  create: mentionUserIds.map((userId) => ({ userId })),
                }
              : undefined,
        },
        include: {
          author: {
            select: USER_SUMMARY_SELECT,
          },
          mentions: {
            include: {
              user: {
                select: USER_SUMMARY_SELECT,
              },
            },
          },
        },
      });
    } catch (error) {
      this.rethrowPrismaRuntimeError(error);
    }
  }

  private rethrowPrismaRuntimeError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2021/P2022 generally indicate the chat migration has not been applied in the running database.
      if (error.code === "P2021" || error.code === "P2022") {
        throw new ServiceUnavailableException(
          "Project chat storage is not ready. Run Prisma migrations and restart the API.",
        );
      }
    }

    throw error;
  }

  private resolveMentionUserIds(
    dto: CreateProjectChatMessageDto,
    teamMembers: TeamMemberWithUser[],
    currentUserId: string,
  ): string[] {
    const teamUserIds = new Set(teamMembers.map((member) => member.userId));
    const explicitUserIds = (dto.mentionUserIds ?? []).filter((userId) => teamUserIds.has(userId));

    const mentionsFromContent = this.findMentionedUsersByContent(dto.content, teamMembers);
    const resolved = [...new Set([...explicitUserIds, ...mentionsFromContent])];

    return resolved.filter((userId) => userId !== currentUserId);
  }

  private findMentionedUsersByContent(
    content: string,
    teamMembers: TeamMemberWithUser[],
  ): string[] {
    const tokens = this.extractMentionTokens(content);
    if (tokens.length === 0) {
      return [];
    }

    const mentionMap = new Map<string, string>();
    for (const member of teamMembers) {
      const handles = this.buildMentionHandles(member.user);
      for (const handle of handles) {
        mentionMap.set(handle, member.userId);
      }
    }

    const matchedUserIds = new Set<string>();
    for (const token of tokens) {
      const userId = mentionMap.get(token);
      if (userId) {
        matchedUserIds.add(userId);
      }
    }

    return Array.from(matchedUserIds);
  }

  private extractMentionTokens(content: string): string[] {
    const matches = content.match(/(^|\s)@([a-zA-Z0-9_.-]{2,50})/g) ?? [];
    return matches
      .map((match) => match.trim().slice(1).toLowerCase())
      .filter((value) => value.length > 1);
  }

  private buildMentionHandles(user: TeamMemberWithUser["user"]): string[] {
    const handles = new Set<string>();

    const emailHandle = user.email.split("@")[0]?.trim().toLowerCase();
    if (emailHandle) {
      handles.add(emailHandle);
    }

    const normalizedName = user.name?.trim().toLowerCase();
    if (normalizedName) {
      handles.add(normalizedName.replace(/\s+/g, ""));
      handles.add(normalizedName.replace(/\s+/g, "."));
      handles.add(normalizedName.replace(/\s+/g, "-"));

      const firstName = normalizedName.split(/\s+/)[0];
      if (firstName) {
        handles.add(firstName);
      }
    }

    return Array.from(handles);
  }
}
