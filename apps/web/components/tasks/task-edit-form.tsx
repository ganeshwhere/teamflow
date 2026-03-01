"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateTask } from "@/actions/task.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type EditableTask = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
};

export function TaskEditForm({ projectId, task }: { projectId: string; task: EditableTask }) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<EditableTask["status"]>(task.status);
  const [priority, setPriority] = useState<EditableTask["priority"]>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
          const result = await updateTask(projectId, task.id, {
            title,
            description: description || undefined,
            status,
            priority,
            dueDate: dueDate || undefined
          });

          if (result.error) {
            setError(result.error);
            return;
          }

          router.refresh();
        });
      }}
    >
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
        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
