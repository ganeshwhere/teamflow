import type { PriorityValue, ProjectItem, TaskItem, TaskStatusValue, TeamListItem, User } from "@repo/types";

import { getProjects } from "@/actions/project.actions";
import { getTasks } from "@/actions/task.actions";
import { getMyTeams } from "@/actions/team.actions";
import { getCurrentUser } from "@/actions/user.actions";

export type TaskWithContext = TaskItem & {
  teamId: string;
  teamName: string;
  projectName: string;
};

export type TeamWithMyTaskCount = TeamListItem & {
  myTaskCount: number;
};

export type DashboardData = {
  user: User | null;
  teams: TeamListItem[];
  totalProjects: number;
  assignedTasks: TaskWithContext[];
  taskByStatus: Record<TaskStatusValue, number>;
  activeTaskCount: number;
  completedTaskCount: number;
  completionRate: number;
  urgentTaskCount: number;
  overdueTasks: TaskWithContext[];
  dueSoonTasks: TaskWithContext[];
  reviewTasks: TaskWithContext[];
  teamSummaries: TeamWithMyTaskCount[];
};

const PRIORITY_WEIGHT: Record<PriorityValue, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4
};

const DEFAULT_TASK_STATUS_COUNTS: Record<TaskStatusValue, number> = {
  TODO: 0,
  IN_PROGRESS: 0,
  IN_REVIEW: 0,
  DONE: 0
};

function toDate(value?: Date | string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sortTasksByAttention(a: TaskWithContext, b: TaskWithContext): number {
  const priorityDelta = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  const dueA = toDate(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const dueB = toDate(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;

  if (dueA !== dueB) {
    return dueA - dueB;
  }

  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export async function loadDashboardData(): Promise<DashboardData> {
  const [teamsResult, userResult] = await Promise.all([getMyTeams(), getCurrentUser()]);

  const teams: TeamListItem[] = teamsResult.data ?? [];
  const user: User | null = userResult.data;

  const projectsByTeam = await Promise.all(
    teams.map(async (team) => {
      const projectsResult = await getProjects(team.id);
      return {
        team,
        projects: projectsResult.data ?? []
      };
    })
  );

  const projectEntries = projectsByTeam.flatMap((entry) =>
    entry.projects.map((project: ProjectItem) => ({
      team: entry.team,
      project
    }))
  );

  const tasksByProject = await Promise.all(
    projectEntries.map(async ({ team, project }) => {
      const tasksResult = await getTasks(project.id, user?.id ? { assigneeId: user.id } : undefined);
      const tasks: TaskItem[] = tasksResult.data ?? [];

      return tasks.map<TaskWithContext>((task) => ({
        ...task,
        teamId: team.id,
        teamName: team.name,
        projectName: project.name
      }));
    })
  );

  const assignedTasks = tasksByProject.flat().sort(sortTasksByAttention);

  const taskByStatus = { ...DEFAULT_TASK_STATUS_COUNTS };
  for (const task of assignedTasks) {
    taskByStatus[task.status] += 1;
  }

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const overdueTasks = assignedTasks.filter((task) => {
    const dueDate = toDate(task.dueDate);
    return Boolean(dueDate && dueDate < now && task.status !== "DONE");
  });

  const dueSoonTasks = assignedTasks.filter((task) => {
    const dueDate = toDate(task.dueDate);
    return Boolean(dueDate && dueDate >= now && dueDate <= nextWeek && task.status !== "DONE");
  });

  const reviewTasks = assignedTasks.filter((task) => task.status === "IN_REVIEW");
  const urgentTaskCount = assignedTasks.filter((task) => task.priority === "URGENT" && task.status !== "DONE").length;

  const activeTaskCount = taskByStatus.TODO + taskByStatus.IN_PROGRESS + taskByStatus.IN_REVIEW;
  const completedTaskCount = taskByStatus.DONE;
  const completionRate = assignedTasks.length > 0 ? Math.round((completedTaskCount / assignedTasks.length) * 100) : 0;

  const taskCountByTeamId = new Map<string, number>();
  for (const task of assignedTasks) {
    taskCountByTeamId.set(task.teamId, (taskCountByTeamId.get(task.teamId) ?? 0) + 1);
  }

  const teamSummaries = teams
    .map<TeamWithMyTaskCount>((team) => ({
      ...team,
      myTaskCount: taskCountByTeamId.get(team.id) ?? 0
    }))
    .sort((a, b) => b.myTaskCount - a.myTaskCount || b.projectCount - a.projectCount);

  return {
    user,
    teams,
    totalProjects: projectEntries.length,
    assignedTasks,
    taskByStatus,
    activeTaskCount,
    completedTaskCount,
    completionRate,
    urgentTaskCount,
    overdueTasks,
    dueSoonTasks,
    reviewTasks,
    teamSummaries
  };
}
