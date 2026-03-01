import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import type { AuthUser } from "../../auth/interfaces/auth-user.interface";

type ProjectScopedRequest = {
  params: { projectId: string };
  user: AuthUser;
};

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ProjectScopedRequest>();
    const projectId = request.params?.projectId;

    if (!projectId) {
      throw new NotFoundException("Project id not provided");
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { teamId: true }
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const membership = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId: request.user.sub
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException("You are not a member of this project team");
    }

    return true;
  }
}
