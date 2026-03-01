"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createTask } from "@/actions/task.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { UserSummary } from "@repo/types";

export function CreateTaskForm({
  projectId,
  assignees = [],
  onSuccess
}: {
  projectId: string;
  assignees?: UserSummary[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
          const result = await createTask(projectId, {
            title,
            description: description || undefined,
            priority,
            dueDate: dueDate || undefined,
            assigneeId: assigneeId || undefined
          });

          if (result.error) {
            setError(result.error);
            return;
          }

          setTitle("");
          setDescription("");
          setDueDate("");
          setAssigneeId("");
          setPriority("MEDIUM");
          onSuccess?.();
          router.refresh();
        });
      }}
    >
      <Input placeholder="Task title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <Select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)}>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
        <option value="URGENT">URGENT</option>
      </Select>
      <Select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
        <option value="">Unassigned</option>
        {assignees.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name ?? member.email}
          </option>
        ))}
      </Select>
      <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add Task"}
      </Button>
    </form>
  );
}
