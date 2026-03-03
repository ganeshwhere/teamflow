import type { Project } from "./project.js";
import type { Task } from "./task.js";
import type { Team, TeamMember } from "./team.js";
import type { User } from "./user.js";
import { ProjectStatus } from "./project.js";
import { Priority, TaskStatus } from "./task.js";
import { TeamRole } from "./team.js";

export type PrismaUser = User;
export type PrismaTeam = Team;
export type PrismaTeamMember = TeamMember;
export type PrismaProject = Project;
export type PrismaTask = Task;

export const PrismaTeamRole = TeamRole;
export const PrismaProjectStatus = ProjectStatus;
export const PrismaTaskStatus = TaskStatus;
export const PrismaPriority = Priority;
