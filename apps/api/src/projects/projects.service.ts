import { Injectable, NotFoundException } from "@nestjs/common";
import { ProjectStatus, TaskStatus, type Project } from "@prisma/client";
import type { DeleteResult, ProjectItem, ProjectWithStatsResponse, UserSummary } from "@repo/types";

import { PrismaService } from "../prisma/prisma.service";

import type { CreateProjectDto } from "./dto/create-project.dto";
import type { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private toProjectItem(
    project: Project & {
      team?: {
        owner?: UserSummary | null;
      };
    }
  ): ProjectItem {
    const { team, ...baseProject } = project;

    return {
      ...baseProject,
      creator: team?.owner ?? null
    };
  }

  async listProjects(teamId: string): Promise<ProjectItem[]> {
    const projects = await this.prisma.project.findMany({
      where: { teamId },
      include: {
        team: {
          select: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return projects.map((project) => this.toProjectItem(project));
  }

  async createProject(teamId: string, dto: CreateProjectDto): Promise<ProjectItem> {
    const project = await this.prisma.project.create({
      data: {
        teamId,
        name: dto.name,
        description: dto.description
      },
      include: {
        team: {
          select: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    return this.toProjectItem(project);
  }

  async getProject(teamId: string, projectId: string): Promise<ProjectItem> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        teamId
      },
      include: {
        team: {
          select: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    return this.toProjectItem(project);
  }

  async updateProject(teamId: string, projectId: string, dto: UpdateProjectDto): Promise<ProjectItem> {
    await this.getProject(teamId, projectId);

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: dto.name,
        description: dto.description
      },
      include: {
        team: {
          select: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    return this.toProjectItem(project);
  }

  async deleteProject(teamId: string, projectId: string): Promise<DeleteResult> {
    await this.getProject(teamId, projectId);
    await this.prisma.project.delete({ where: { id: projectId } });
    return { deleted: true };
  }

  async getProjectWithStats(teamId: string, projectId: string): Promise<ProjectWithStatsResponse> {
    const project = await this.getProject(teamId, projectId);

    const grouped = await this.prisma.task.groupBy({
      by: ["status"],
      where: { projectId: project.id },
      _count: { _all: true }
    });

    const taskCounts: Record<TaskStatus, number> = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.IN_REVIEW]: 0,
      [TaskStatus.DONE]: 0
    };

    for (const group of grouped) {
      taskCounts[group.status as TaskStatus] = group._count._all;
    }

    return { project, taskCounts };
  }

  async archiveProject(teamId: string, projectId: string): Promise<Project> {
    await this.getProject(teamId, projectId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.ARCHIVED }
    });
  }
}
