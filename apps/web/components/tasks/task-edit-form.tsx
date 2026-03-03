"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import type { PriorityValue, TaskStatusValue, UserSummary } from "@repo/types";

import { updateTask } from "@/actions/task.actions";
import { Badge } from "@/components/ui/badge";
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

const statusOptions: TaskStatusValue[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
const priorityOptions: PriorityValue[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function formatStatusLabel(status: TaskStatusValue): string {
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "IN_REVIEW") return "In Review";
  if (status === "TODO") return "Todo";
  return "Done";
}

function formatPriorityLabel(priority: PriorityValue): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

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
      className="grid gap-5"
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
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-sm font-semibold text-foreground">{optimisticTask.title}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge className="bg-muted text-muted-foreground">{formatStatusLabel(optimisticTask.status)}</Badge>
          <Badge className="bg-muted text-muted-foreground">{formatPriorityLabel(optimisticTask.priority)}</Badge>
          <Badge className="bg-muted text-muted-foreground">
            {optimisticTask.assigneeId ? "Assigned" : "Unassigned"}
          </Badge>
        </div>
      </div>

      <section className="grid gap-2">
        <label htmlFor="task-title" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Title
        </label>
        <Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      </section>

      <section className="grid gap-2">
        <label
          htmlFor="task-description"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
        >
          Description
        </label>
        <Textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add context, acceptance criteria, or notes."
          className="min-h-[120px]"
        />
      </section>

      <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 md:grid-cols-2">
        <section className="grid gap-2">
          <label htmlFor="task-status" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Status
          </label>
          <Select id="task-status" value={status} onChange={(event) => setStatus(event.target.value as EditableTask["status"])}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {formatStatusLabel(option)}
              </option>
            ))}
          </Select>
        </section>

        <section className="grid gap-2">
          <label
            htmlFor="task-priority"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
          >
            Priority
          </label>
          <Select id="task-priority" value={priority} onChange={(event) => setPriority(event.target.value as EditableTask["priority"])}>
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {formatPriorityLabel(option)}
              </option>
            ))}
          </Select>
        </section>

        <section className="grid gap-2">
          <label
            htmlFor="task-assignee"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
          >
            Assignee
          </label>
          <Select id="task-assignee" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
            <option value="">Unassigned</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name ?? assignee.email}
              </option>
            ))}
          </Select>
        </section>

        <section className="grid gap-2">
          <label
            htmlFor="task-due-date"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
          >
            Due date
          </label>
          <Input id="task-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 p-3">
        <div className="grid gap-1">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
          {!error && !notice ? <p className="text-xs text-muted-foreground">Changes are saved to the project immediately.</p> : null}
        </div>
        <Button type="submit" disabled={isPending} className="min-w-[130px]">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
