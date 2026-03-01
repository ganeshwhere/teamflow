import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import type { DeleteResult, TaskDetail, TaskItem } from "@repo/types";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";

import { CreateTaskDto } from "./dto/create-task.dto";
import { ListTasksQueryDto } from "./dto/list-tasks-query.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { ProjectMemberGuard } from "./guards/project-member.guard";
import { TasksService } from "./tasks.service";

@UseGuards(ProjectMemberGuard)
@Controller("projects/:projectId/tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  listTasks(@Param("projectId") projectId: string, @Query() query: ListTasksQueryDto): Promise<TaskItem[]> {
    return this.tasksService.listTasks(projectId, query);
  }

  @Post()
  createTask(
    @Param("projectId") projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthUser
  ): Promise<TaskItem> {
    return this.tasksService.createTask(projectId, dto, user);
  }

  @Get(":id")
  getTask(@Param("projectId") projectId: string, @Param("id") id: string): Promise<TaskDetail> {
    return this.tasksService.getTask(projectId, id);
  }

  @Patch(":id")
  updateTask(
    @Param("projectId") projectId: string,
    @Param("id") id: string,
    @Body() dto: UpdateTaskDto
  ): Promise<TaskDetail> {
    return this.tasksService.updateTask(projectId, id, dto);
  }

  @Delete(":id")
  deleteTask(@Param("projectId") projectId: string, @Param("id") id: string): Promise<DeleteResult> {
    return this.tasksService.deleteTask(projectId, id);
  }
}
