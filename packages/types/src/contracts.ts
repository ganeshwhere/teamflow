import type { Priority, TaskStatus } from "./task.js";
import type { ProjectStatus } from "./project.js";
import type { TeamRole } from "./team.js";

export type DateValue = Date | string;
export type TeamRoleValue = `${TeamRole}`;
export type ProjectStatusValue = `${ProjectStatus}`;
export type TaskStatusValue = `${TaskStatus}`;
export type PriorityValue = `${Priority}`;

export interface UserSummary {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface TeamListItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: DateValue;
  ownerId: string;
  memberCount: number;
  projectCount: number;
}

export interface TeamMemberItem {
  id: string;
  role: TeamRoleValue;
  joinedAt: DateValue;
  user: UserSummary;
}

export interface TeamDetail {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: DateValue;
  ownerId: string;
  members: TeamMemberItem[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatusValue;
  createdAt: DateValue;
  teamId: string;
  creator?: UserSummary | null;
}

export interface ProjectWithStatsResponse {
  project: ProjectItem;
  taskCounts: Record<TaskStatusValue, number>;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatusValue;
  priority: PriorityValue;
  dueDate?: DateValue | null;
  createdAt: DateValue;
  updatedAt: DateValue;
  projectId: string;
  assigneeId?: string | null;
  creatorId: string;
  assignee?: UserSummary | null;
}

export interface TaskDetail extends TaskItem {
  creator?: UserSummary;
}

export interface DeleteResult {
  deleted: boolean;
}

export interface InviteResult {
  invited: boolean;
}

export interface JoinResult {
  joined: boolean;
}

export interface RemoveResult {
  removed: boolean;
}
