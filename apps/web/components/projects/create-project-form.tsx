"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createProject } from "@/actions/project.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateProjectForm({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
          const result = await createProject(teamId, {
            name,
            description: description || undefined,
          });
          if (result.error) {
            setError(result.error);
            return;
          }

          setName("");
          setDescription("");
          if (result.data) {
            router.push(`/teams/${teamId}/projects/${result.data.id}`);
          }
          router.refresh();
        });
      }}
    >
      <Input
        placeholder="Project name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Project"}
      </Button>
    </form>
  );
}
