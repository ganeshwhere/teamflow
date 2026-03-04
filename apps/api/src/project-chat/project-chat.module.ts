import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { ProjectMemberGuard } from "../tasks/guards/project-member.guard";

import { ProjectChatController } from "./project-chat.controller";
import { ProjectChatService } from "./project-chat.service";

@Module({
  imports: [PrismaModule],
  controllers: [ProjectChatController],
  providers: [ProjectChatService, ProjectMemberGuard],
  exports: [ProjectChatService],
})
export class ProjectChatModule {}
