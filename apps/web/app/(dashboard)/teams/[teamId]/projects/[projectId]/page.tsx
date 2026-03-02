import { Suspense } from "react";
import { ListChecks } from "lucide-react";
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
      <PageHeader
        eyebrow="Project Workspace"
        title={payload.project.name}
        description={payload.project.description ?? "No description"}
        actions={
          <>
            <Badge>{payload.project.status ?? "ACTIVE"}</Badge>
            <CreateTaskPanel
              projectId={projectId}
              assignees={assignees}
              label="Add Task"
              variant="primary"
              initialOpen={newTaskOnLoad}
            />
          </>
        }
      />

      <Card>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            <p className="text-[11px] uppercase tracking-wide">Todo</p>
            <p className="mt-1 text-base font-semibold text-foreground">{payload.taskCounts?.TODO ?? 0}</p>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            <p className="text-[11px] uppercase tracking-wide">In Progress</p>
            <p className="mt-1 text-base font-semibold text-foreground">{payload.taskCounts?.IN_PROGRESS ?? 0}</p>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            <p className="text-[11px] uppercase tracking-wide">In Review</p>
            <p className="mt-1 text-base font-semibold text-foreground">{payload.taskCounts?.IN_REVIEW ?? 0}</p>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            <p className="text-[11px] uppercase tracking-wide">Done</p>
            <p className="mt-1 text-base font-semibold text-foreground">{payload.taskCounts?.DONE ?? 0}</p>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          <ListChecks className="h-3.5 w-3.5" />
          Drag tasks across columns to update status instantly.
        </div>
      </Card>

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
