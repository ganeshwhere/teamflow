"use client";

import { useState, useTransition } from "react";

import { inviteMember } from "@/actions/team.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteMemberForm({ teamId }: { teamId: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
          const result = await inviteMember(teamId, email);
          if (result.error) {
            setError(result.error);
            return;
          }

          setSuccess("Invite sent.");
          setEmail("");
        });
      }}
    >
      <Input type="email" placeholder="member@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Inviting..." : "Invite Member"}
      </Button>
    </form>
  );
}
