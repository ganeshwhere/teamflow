"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createTask } from "@/actions/task.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CreateTaskForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
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
            dueDate: dueDate || undefined
          });

          if (result.error) {
            setError(result.error);
            return;
          }

          setTitle("");
          setDescription("");
          setDueDate("");
          setPriority("MEDIUM");
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
      <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add Task"}
      </Button>
    </form>
  );
}
