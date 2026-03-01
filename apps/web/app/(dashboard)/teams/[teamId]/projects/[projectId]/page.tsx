import Link from "next/link";
import { Suspense } from "react";

import { getProject } from "@/actions/project.actions";
import { getTasks } from "@/actions/task.actions";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
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

  const payload =
    (projectResult.data as {
      project: { id: string; name: string; status?: string; description?: string | null };
      taskCounts?: Record<string, number>;
    } | null) ?? null;
  const tasks =
    (tasksResult.data as Array<{
      id: string;
      title: string;
      status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
      priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      dueDate?: string | null;
    }> | null) ?? [];

  if (!payload?.project) {
    return (
      <Card>
        <p className="text-sm text-red-600">Project not found.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">{payload.project.name}</h1>
            <p className="text-sm text-slate-600">{payload.project.description ?? "No description"}</p>
          </div>
          <Badge>{payload.project.status ?? "ACTIVE"}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
          <span>TODO: {payload.taskCounts?.TODO ?? 0}</span>
          <span>IN_PROGRESS: {payload.taskCounts?.IN_PROGRESS ?? 0}</span>
          <span>IN_REVIEW: {payload.taskCounts?.IN_REVIEW ?? 0}</span>
          <span>DONE: {payload.taskCounts?.DONE ?? 0}</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <TaskBoard tasks={tasks} basePath={`/teams/${teamId}/projects/${projectId}`} />
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Add Task</h2>
            <Link href={`/teams/${teamId}/projects/${projectId}/tasks`} className="text-xs text-blue-700 hover:underline">
              All tasks
            </Link>
          </div>
          <CreateTaskForm projectId={projectId} />
        </Card>
      </div>
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
