import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { TaskDetail, UserSummary } from "@repo/types";

import { getTask } from "@/actions/task.actions";
import { getTeam } from "@/actions/team.actions";
import { PageHeader } from "@/components/layout/page-header";
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
      <PageHeader
        eyebrow="Task"
        title="Task Details"
        description="Update status, priority, assignee, and due date."
        actions={
          <Link href={`/teams/${teamId}/projects/${projectId}/tasks`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to tasks
          </Link>
        }
      />
      <Card>
        <TaskEditForm projectId={projectId} task={task} assignees={assignees} />
      </Card>
    </main>
  );
}
