import type { TaskStatus } from "./task.js";

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  createdAt: Date;
  teamId: string;
}

export interface ProjectWithStats extends Project {
  taskCounts: Record<TaskStatus, number>;
}
