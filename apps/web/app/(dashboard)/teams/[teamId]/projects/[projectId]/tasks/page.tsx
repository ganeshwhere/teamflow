import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { TaskItem, UserSummary } from "@repo/types";

import { getTeam } from "@/actions/team.actions";
import { getTasks } from "@/actions/task.actions";
import { PageHeader } from "@/components/layout/page-header";
import { CreateTaskPanel } from "@/components/tasks/create-task-panel";
import { TaskCardContent } from "@/components/tasks/task-card-content";

export default async function ProjectTasksPage({
  params
}: {
  params: Promise<{ teamId: string; projectId: string }>;
}) {
  const { teamId, projectId } = await params;
  const [tasksResult, teamResult] = await Promise.all([getTasks(projectId), getTeam(teamId)]);
  const tasks: TaskItem[] = tasksResult.data ?? [];
  const assignees: UserSummary[] = (teamResult.data?.members ?? []).map((member) => member.user);

  return (
    <main className="grid gap-4">
      <section className="grid gap-3">
        <PageHeader
          eyebrow="Execution"
          title="All Tasks"
          description="Browse every task and open details for edits."
          actions={<CreateTaskPanel projectId={projectId} assignees={assignees} label="Add Task" variant="primary" />}
        />
        <Link
          href={`/teams/${teamId}/projects/${projectId}`}
          className="inline-flex w-fit items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to project
        </Link>
        <div className="grid gap-3 md:grid-cols-2">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/teams/${teamId}/projects/${projectId}/tasks/${task.id}`}
              className="rounded-md border border-border bg-popover p-3 text-card-foreground transition-colors hover:bg-accent"
            >
              <TaskCardContent task={task} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
