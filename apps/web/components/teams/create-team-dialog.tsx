"use client";

import { useState } from "react";

import { CreateTeamForm } from "@/components/teams/create-team-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        type="button"
        variant="primary"
        className="font-semibold"
      >
        Create Team
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Team"
        description="Set up a team workspace for projects and tasks."
      >
        <CreateTeamForm onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
