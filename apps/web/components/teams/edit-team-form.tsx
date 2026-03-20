"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateTeam } from "@/actions/team.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type EditTeamFormProps = {
  teamId: string;
  initialName: string;
  initialDescription?: string | null;
};

export function EditTeamForm({ teamId, initialName, initialDescription }: EditTeamFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
          const result = await updateTeam(teamId, { name, description: description || undefined });
          if (result.error) {
            setError(result.error);
            return;
          }

          router.push(`/teams/${teamId}`);
          router.refresh();
        });
      }}
    >
      <Input
        placeholder="Team name"
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
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() => router.push(`/teams/${teamId}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
