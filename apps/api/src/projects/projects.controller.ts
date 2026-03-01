import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import type { DeleteResult, ProjectItem, ProjectWithStatsResponse } from "@repo/types";

import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { TeamMemberGuard } from "./guards/team-member.guard";
import { ProjectsService } from "./projects.service";

@UseGuards(TeamMemberGuard)
@Controller("teams/:teamId/projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  listProjects(@Param("teamId") teamId: string): Promise<ProjectItem[]> {
    return this.projectsService.listProjects(teamId);
  }

  @Post()
  createProject(@Param("teamId") teamId: string, @Body() dto: CreateProjectDto): Promise<ProjectItem> {
    return this.projectsService.createProject(teamId, dto);
  }

  @Get(":id")
  getProject(@Param("teamId") teamId: string, @Param("id") id: string): Promise<ProjectWithStatsResponse> {
    return this.projectsService.getProjectWithStats(teamId, id);
  }

  @Patch(":id")
  updateProject(
    @Param("teamId") teamId: string,
    @Param("id") id: string,
    @Body() dto: UpdateProjectDto
  ): Promise<ProjectItem> {
    return this.projectsService.updateProject(teamId, id, dto);
  }

  @Delete(":id")
  deleteProject(@Param("teamId") teamId: string, @Param("id") id: string): Promise<DeleteResult> {
    return this.projectsService.deleteProject(teamId, id);
  }
}
