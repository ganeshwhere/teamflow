import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { TeamMemberGuard } from "./guards/team-member.guard";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, TeamMemberGuard],
  exports: [ProjectsService, TeamMemberGuard]
})
export class ProjectsModule {}
