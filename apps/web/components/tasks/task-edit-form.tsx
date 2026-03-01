"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import type { PriorityValue, TaskStatusValue, UserSummary } from "@repo/types";

import { updateTask } from "@/actions/task.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type EditableTask = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatusValue;
  priority: PriorityValue;
  dueDate?: string | Date | null;
  assigneeId?: string | null;
};

export function TaskEditForm({
  projectId,
  task,
  assignees
}: {
  projectId: string;
  task: EditableTask;
  assignees: UserSummary[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatusValue>(task.status);
  const [priority, setPriority] = useState<PriorityValue>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticTask, setOptimisticTask] = useOptimistic(task, (state, patch: Partial<EditableTask>) => ({
    ...state,
    ...patch
  }));

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setNotice(null);
        const previousSnapshot = optimisticTask;
        const optimisticPatch: Partial<EditableTask> = {
          title,
          description,
          status,
          priority,
          dueDate: dueDate || null,
          assigneeId: assigneeId || null
        };
        setOptimisticTask(optimisticPatch);

        startTransition(async () => {
          const result = await updateTask(projectId, task.id, {
            title,
            description: description || undefined,
            status,
            priority,
            dueDate: dueDate || undefined,
            assigneeId: assigneeId || ""
          });

          if (result.error) {
            setError(result.error);
            setOptimisticTask(previousSnapshot);
            return;
          }

          setNotice("Saved");
          router.refresh();
        });
      }}
    >
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <p className="font-medium text-slate-900">{optimisticTask.title}</p>
        <p className="mt-1 text-xs text-slate-600">
          {optimisticTask.status} • {optimisticTask.priority} •{" "}
          {optimisticTask.assigneeId ? "Assigned" : "Unassigned"}
        </p>
      </div>
      <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
      <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      <div className="grid gap-3 md:grid-cols-3">
        <Select value={status} onChange={(event) => setStatus(event.target.value as EditableTask["status"])}>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="IN_REVIEW">IN_REVIEW</option>
          <option value="DONE">DONE</option>
        </Select>
        <Select value={priority} onChange={(event) => setPriority(event.target.value as EditableTask["priority"])}>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </Select>
        <Select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
          <option value="">Unassigned</option>
          {assignees.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.name ?? assignee.email}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
