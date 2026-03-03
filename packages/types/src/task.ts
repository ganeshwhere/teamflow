import type { User } from "./user.js";

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  projectId: string;
  assigneeId?: string | null;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskWithRelations extends Task {
  assignee?: User;
  creator: User;
}
