"use client";

import { useState } from "react";

import { InviteMemberForm } from "@/components/teams/invite-member-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function InviteMemberDialog({ teamId }: { teamId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} type="button" variant="secondary">
        Invite Member
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite Team Member"
        description="Send a secure invite link that expires in 48 hours."
      >
        <InviteMemberForm teamId={teamId} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
