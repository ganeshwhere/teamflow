import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { TaskItem } from "@repo/types";

import { getTasks } from "@/actions/task.actions";
import { PageHeader } from "@/components/layout/page-header";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { Card } from "@/components/ui/card";

export default async function ProjectTasksPage({
  params
}: {
  params: Promise<{ teamId: string; projectId: string }>;
}) {
  const { teamId, projectId } = await params;
  const result = await getTasks(projectId);
  const tasks: TaskItem[] = result.data ?? [];

  return (
    <main className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <section className="grid gap-3">
        <PageHeader
          eyebrow="Execution"
          title="All Tasks"
          description="Browse every task and open details for edits."
          actions={
            <Link href={`/teams/${teamId}/projects/${projectId}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to project
            </Link>
          }
        />
        {tasks.map((task) => (
          <Link key={task.id} href={`/teams/${teamId}/projects/${projectId}/tasks/${task.id}`}>
            <Card className="transition hover:border-primary">
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-muted-foreground">
                {task.status} • {task.priority} • {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due"}
              </p>
            </Card>
          </Link>
        ))}
      </section>

      <Card id="new-task">
        <h2 className="mb-1 text-lg font-semibold">Add Task</h2>
        <p className="mb-3 text-sm text-muted-foreground">Create and assign tasks without leaving this view.</p>
        <CreateTaskForm projectId={projectId} />
      </Card>
    </main>
  );
}
