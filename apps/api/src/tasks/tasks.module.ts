import { Module } from "@nestjs/common";

import { MailModule } from "../mail/mail.module";
import { PrismaModule } from "../prisma/prisma.module";

import { ProjectMemberGuard } from "./guards/project-member.guard";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [TasksController],
  providers: [TasksService, ProjectMemberGuard],
  exports: [TasksService, ProjectMemberGuard]
})
export class TasksModule {}
