import type { Project } from "./project";
import type { Task } from "./task";
import type { Team, TeamMember } from "./team";
import type { User } from "./user";
import { ProjectStatus } from "./project";
import { Priority, TaskStatus } from "./task";
import { TeamRole } from "./team";

export type PrismaUser = User;
export type PrismaTeam = Team;
export type PrismaTeamMember = TeamMember;
export type PrismaProject = Project;
export type PrismaTask = Task;

export const PrismaTeamRole = TeamRole;
export const PrismaProjectStatus = ProjectStatus;
export const PrismaTaskStatus = TaskStatus;
export const PrismaPriority = Priority;
