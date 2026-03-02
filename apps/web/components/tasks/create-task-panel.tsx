"use client";

import { useState } from "react";
import type { UserSummary } from "@repo/types";

import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function CreateTaskPanel({
  projectId,
  assignees,
  label = "Add Task",
  variant = "secondary"
}: {
  projectId: string;
  assignees: UserSummary[];
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} type="button" variant={variant}>
        {label}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Task"
        description="Create and assign a task without leaving the board."
        variant="sheet"
      >
        <CreateTaskForm projectId={projectId} assignees={assignees} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
