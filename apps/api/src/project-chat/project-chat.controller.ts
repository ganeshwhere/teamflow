import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import type { ProjectChatMessage } from "@repo/types";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { ProjectMemberGuard } from "../tasks/guards/project-member.guard";

import { CreateProjectChatMessageDto } from "./dto/create-project-chat-message.dto";
import { ProjectChatService } from "./project-chat.service";

@UseGuards(ProjectMemberGuard)
@Controller("projects/:projectId/chat/messages")
export class ProjectChatController {
  constructor(private readonly projectChatService: ProjectChatService) {}

  @Get()
  listMessages(@Param("projectId") projectId: string): Promise<ProjectChatMessage[]> {
    return this.projectChatService.listMessages(projectId);
  }

  @Post()
  createMessage(
    @Param("projectId") projectId: string,
    @Body() dto: CreateProjectChatMessageDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ProjectChatMessage> {
    return this.projectChatService.createMessage(projectId, dto, user);
  }
}
