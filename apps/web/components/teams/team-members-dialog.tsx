"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import type { TeamMemberItem } from "@repo/types";

import { TeamMemberRow } from "@/components/teams/team-member-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function TeamMembersDialog({ members }: { members: TeamMemberItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const searchValue = query.trim().toLowerCase();
    if (!searchValue) {
      return members;
    }

    return members.filter((member) => {
      const displayName = member.user.name ?? member.user.email;
      return `${displayName} ${member.user.email} ${member.role}`
        .toLowerCase()
        .includes(searchValue);
    });
  }, [members, query]);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
        className="h-9 rounded-lg px-3"
      >
        <Users className="mr-1.5 h-4 w-4" />
        Members
      </Button>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setQuery("");
        }}
        title="Current Members"
        description="View everyone in this team and their roles."
      >
        <div className="grid max-h-[70vh] min-h-0 gap-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-popover px-3 py-2">
            <p className="text-sm font-medium text-foreground">Team members</p>
            <Badge className="bg-muted text-muted-foreground">{members.length}</Badge>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search members..."
              className="pl-9"
            />
          </div>

          <div className="grid min-h-0 gap-2 overflow-y-auto pr-1">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => <TeamMemberRow key={member.id} member={member} />)
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-popover p-4 text-sm text-muted-foreground">
                No members match your search.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
