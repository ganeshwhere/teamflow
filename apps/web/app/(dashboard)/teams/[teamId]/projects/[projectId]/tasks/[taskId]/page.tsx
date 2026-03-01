import Link from "next/link";
import type { TaskDetail, UserSummary } from "@repo/types";

import { getTask } from "@/actions/task.actions";
import { getTeam } from "@/actions/team.actions";
import { TaskEditForm } from "@/components/tasks/task-edit-form";
import { Card } from "@/components/ui/card";

export default async function TaskDetailPage({
  params
}: {
  params: Promise<{ teamId: string; projectId: string; taskId: string }>;
}) {
  const { teamId, projectId, taskId } = await params;
  const result = await getTask(projectId, taskId);
  const teamResult = await getTeam(teamId);
  const task: TaskDetail | null = result.data;
  const assignees: UserSummary[] = (teamResult.data?.members ?? []).map((member) => member.user);

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
        <TaskEditForm projectId={projectId} task={task} assignees={assignees} />
      </Card>
    </main>
  );
}
