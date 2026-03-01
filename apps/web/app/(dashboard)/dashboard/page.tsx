import { Suspense } from "react";

import { getCurrentUser } from "@/actions/user.actions";
import { getProjects } from "@/actions/project.actions";
import { getTasks } from "@/actions/task.actions";
import { getMyTeams } from "@/actions/team.actions";
import { SectionSkeleton } from "@/components/layout/section-skeleton";
import { Card } from "@/components/ui/card";

async function DashboardSummary(): Promise<JSX.Element> {
  const teamsResult = await getMyTeams();
  const userResult = await getCurrentUser();

  const teams = (teamsResult.data as Array<{ id: string; name: string }> | null) ?? [];
  const user = (userResult.data as { id: string; name?: string | null } | null) ?? null;

  let totalProjects = 0;
  const taskByStatus = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0
  };

  for (const team of teams) {
    const projectsResult = await getProjects(team.id);
    const projects = (projectsResult.data as Array<{ id: string }> | null) ?? [];
    totalProjects += projects.length;

    for (const project of projects) {
      const tasksResult = await getTasks(project.id, { assigneeId: user?.id });
      const tasks =
        (tasksResult.data as Array<{ status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" }> | null) ?? [];

      for (const task of tasks) {
        taskByStatus[task.status] += 1;
      }
    }
  }

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total Teams</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{teams.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total Projects</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalProjects}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Assigned to Me</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700">
            <span>TODO: {taskByStatus.TODO}</span>
            <span>IN_PROGRESS: {taskByStatus.IN_PROGRESS}</span>
            <span>IN_REVIEW: {taskByStatus.IN_REVIEW}</span>
            <span>DONE: {taskByStatus.DONE}</span>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default function DashboardPage(): JSX.Element {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      {/* @ts-expect-error Async server component */}
      <DashboardSummary />
    </Suspense>
  );
}
