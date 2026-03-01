"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createTeam } from "@/actions/team.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateTeamForm() {
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
          const result = await createTeam({ name, description: description || undefined });
          if (result.error) {
            setError(result.error);
            return;
          }

          setName("");
          setDescription("");
          router.refresh();
        });
      }}
    >
      <Input placeholder="Team name" value={name} onChange={(event) => setName(event.target.value)} required />
      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Team"}
      </Button>
    </form>
  );
}
