import { Suspense } from "react";
import type { ProjectWithStatsResponse, TaskItem, UserSummary } from "@repo/types";

import { getProject } from "@/actions/project.actions";
import { getTasks } from "@/actions/task.actions";
import { getTeam } from "@/actions/team.actions";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { CreateTaskPanel } from "@/components/tasks/create-task-panel";
import { TaskBoard } from "@/components/tasks/task-board";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

async function ProjectOverview({
  teamId,
  projectId
}: {
  teamId: string;
  projectId: string;
}) {
  const projectResult = await getProject(teamId, projectId);
  const tasksResult = await getTasks(projectId);
  const teamResult = await getTeam(teamId);

  const payload: ProjectWithStatsResponse | null = projectResult.data;
  const tasks: TaskItem[] = tasksResult.data ?? [];
  const assignees: UserSummary[] = (teamResult.data?.members ?? []).map((member) => member.user);

  if (!payload?.project) {
    return (
      <Card>
        <p className="text-sm text-red-600">Project not found.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <nav className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Project Workspace</p>
          <h1 className="text-2xl font-semibold text-slate-900">{payload.project.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{payload.project.status ?? "ACTIVE"}</Badge>
          <CreateTaskPanel projectId={projectId} assignees={assignees} label="Add Task" variant="primary" />
        </div>
      </nav>

      <Card>
        <p className="text-sm text-slate-600">{payload.project.description ?? "No description"}</p>
        <div className="mt-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-4">
          <div className="rounded-md bg-white px-3 py-2 text-xs text-slate-600">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Todo</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{payload.taskCounts?.TODO ?? 0}</p>
          </div>
          <div className="rounded-md bg-white px-3 py-2 text-xs text-slate-600">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">In Progress</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{payload.taskCounts?.IN_PROGRESS ?? 0}</p>
          </div>
          <div className="rounded-md bg-white px-3 py-2 text-xs text-slate-600">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">In Review</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{payload.taskCounts?.IN_REVIEW ?? 0}</p>
          </div>
          <div className="rounded-md bg-white px-3 py-2 text-xs text-slate-600">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Done</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{payload.taskCounts?.DONE ?? 0}</p>
          </div>
        </div>
      </Card>

      <TaskBoard tasks={tasks} basePath={`/teams/${teamId}/projects/${projectId}`} projectId={projectId} />
    </div>
  );
}

export default async function ProjectPage({
  params
}: {
  params: Promise<{ teamId: string; projectId: string }>;
}) {
  const { teamId, projectId } = await params;

  return (
    <Suspense fallback={<SectionSkeleton />}>
      <ProjectOverview teamId={teamId} projectId={projectId} />
    </Suspense>
  );
}
