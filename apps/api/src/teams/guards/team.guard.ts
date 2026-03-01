import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import type { AuthUser } from "../../auth/interfaces/auth-user.interface";

type TeamScopedRequest = {
  params: { id: string };
  user: AuthUser;
  teamRole?: string;
};

@Injectable()
export class TeamGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<TeamScopedRequest>();
    const teamId = request.params?.id;

    if (!teamId) {
      throw new NotFoundException("Team id not provided");
    }

    const membership = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: request.user.sub
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException("You are not a member of this team");
    }

    request.teamRole = membership.role;
    return true;
  }
}
