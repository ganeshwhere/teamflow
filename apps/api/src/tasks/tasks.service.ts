import { Injectable, NotFoundException } from "@nestjs/common";
import type { TaskDetail, TaskItem } from "@repo/types";

import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

import type { CreateTaskDto } from "./dto/create-task.dto";
import type { ListTasksQueryDto } from "./dto/list-tasks-query.dto";
import type { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

  async listTasks(projectId: string, query: ListTasksQueryDto): Promise<TaskItem[]> {
    return this.prisma.task.findMany({
      where: {
        projectId,
        status: query.status,
        priority: query.priority,
        assigneeId: query.assigneeId
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }]
    });
  }

  async createTask(projectId: string, dto: CreateTaskDto, user: AuthUser): Promise<TaskItem> {
    return this.prisma.task.create({
      data: {
        projectId,
        creatorId: user.sub,
        assigneeId: dto.assigneeId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async getTask(projectId: string, taskId: string): Promise<TaskDetail> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        projectId
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    return task;
  }

  async updateTask(projectId: string, taskId: string, dto: UpdateTaskDto): Promise<TaskDetail> {
    const existingTask = await this.getTask(projectId, taskId);
    const normalizedAssigneeId = dto.assigneeId === "" ? null : dto.assigneeId;

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        assigneeId: normalizedAssigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : dto.dueDate === undefined ? undefined : null
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true
          }
        },
        project: {
          include: {
            team: true
          }
        }
      }
    });

    const assigneeChanged = dto.assigneeId !== undefined && normalizedAssigneeId !== existingTask.assigneeId;
    if (assigneeChanged && updatedTask.assignee?.email) {
      try {
        await this.mailService.sendTaskAssignedEmail({
          to: updatedTask.assignee.email,
          assigneeName: updatedTask.assignee.name ?? updatedTask.assignee.email,
          taskTitle: updatedTask.title,
          projectName: updatedTask.project.name,
          teamName: updatedTask.project.team.name,
          taskUrl: `${process.env.APP_URL ?? "http://localhost:3000"}/projects/${projectId}/tasks/${taskId}`,
          priority: updatedTask.priority
        });
      } catch {
        // Mail should never break API flow.
      }
    }

    const { project, ...task } = updatedTask;
    return task;
  }

  async deleteTask(projectId: string, taskId: string): Promise<{ deleted: boolean }> {
    await this.getTask(projectId, taskId);
    await this.prisma.task.delete({ where: { id: taskId } });
    return { deleted: true };
  }
}
