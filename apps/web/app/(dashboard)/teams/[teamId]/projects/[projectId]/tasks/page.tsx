import Link from "next/link";

import { getTasks } from "@/actions/task.actions";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { Card } from "@/components/ui/card";

export default async function ProjectTasksPage({
  params
}: {
  params: { teamId: string; projectId: string };
}): Promise<JSX.Element> {
  const result = await getTasks(params.projectId);
  const tasks =
    (result.data as Array<{ id: string; title: string; status: string; priority: string; dueDate?: string | null }> | null) ?? [];

  return (
    <main className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">All Tasks</h1>
          <Link href={`/teams/${params.teamId}/projects/${params.projectId}`} className="text-sm text-blue-700 hover:underline">
            Back to project
          </Link>
        </div>
        {tasks.map((task) => (
          <Link key={task.id} href={`/teams/${params.teamId}/projects/${params.projectId}/tasks/${task.id}`}>
            <Card className="transition hover:border-blue-300">
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-slate-600">
                {task.status} • {task.priority} • {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due"}
              </p>
            </Card>
          </Link>
        ))}
      </section>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Add Task</h2>
        <CreateTaskForm projectId={params.projectId} />
      </Card>
    </main>
  );
}
