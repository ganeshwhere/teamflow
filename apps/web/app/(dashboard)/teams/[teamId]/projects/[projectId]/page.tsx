import { Suspense } from "react";
import type { ProjectWithStatsResponse, TaskItem, UserSummary } from "@repo/types";

import { getProject } from "@/actions/project.actions";
import { getTasks } from "@/actions/task.actions";
import { getTeam } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { CreateTaskPanel } from "@/components/tasks/create-task-panel";
import { TaskBoard } from "@/components/tasks/task-board";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

async function ProjectOverview({
  teamId,
  projectId,
  newTaskOnLoad
}: {
  teamId: string;
  projectId: string;
  newTaskOnLoad: boolean;
}) {
  const [projectResult, tasksResult, teamResult] = await Promise.all([
    getProject(teamId, projectId),
    getTasks(projectId),
    getTeam(teamId)
  ]);

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
      <PageHeader
        eyebrow="Project Workspace"
        title={payload.project.name}
        description={payload.project.description ?? "No description provided."}
        actions={
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/70 p-1.5">
            <Badge>{payload.project.status ?? "ACTIVE"}</Badge>
            <CreateTaskPanel
              projectId={projectId}
              assignees={assignees}
              label="Add Task"
              variant="primary"
              initialOpen={newTaskOnLoad}
            />
          </div>
        }
      />

      <TaskBoard tasks={tasks} basePath={`/teams/${teamId}/projects/${projectId}`} projectId={projectId} />
    </div>
  );
}

export default async function ProjectPage({
  params,
  searchParams
}: {
  params: Promise<{ teamId: string; projectId: string }>;
  searchParams: Promise<{ newTask?: string }>;
}) {
  const { teamId, projectId } = await params;
  const { newTask } = await searchParams;
  const newTaskOnLoad = newTask === "1" || newTask === "true";

  return (
    <Suspense fallback={<SectionSkeleton />}>
      <ProjectOverview teamId={teamId} projectId={projectId} newTaskOnLoad={newTaskOnLoad} />
    </Suspense>
  );
}
