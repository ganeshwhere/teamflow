import Link from "next/link";

import { getTask } from "@/actions/task.actions";
import { TaskEditForm } from "@/components/tasks/task-edit-form";
import { Card } from "@/components/ui/card";

export default async function TaskDetailPage({
  params
}: {
  params: Promise<{ teamId: string; projectId: string; taskId: string }>;
}) {
  const { teamId, projectId, taskId } = await params;
  const result = await getTask(projectId, taskId);
  const task =
    (result.data as {
      id: string;
      title: string;
      description?: string | null;
      status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
      priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      dueDate?: string | null;
    } | null) ?? null;

  if (!task) {
    return (
      <Card>
        <p className="text-sm text-red-600">Unable to load task.</p>
      </Card>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-4">
      <Link href={`/teams/${teamId}/projects/${projectId}/tasks`} className="text-sm text-blue-700 hover:underline">
        Back to tasks
      </Link>
      <Card>
        <h1 className="mb-3 text-xl font-semibold">Task Details</h1>
        <TaskEditForm projectId={projectId} task={task} />
      </Card>
    </main>
  );
}
