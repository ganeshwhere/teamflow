"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import type { TeamMemberItem } from "@repo/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

function memberInitials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "U";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function formatJoinedAt(value: TeamMemberItem["joinedAt"]): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

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
      return `${displayName} ${member.user.email} ${member.role}`.toLowerCase().includes(searchValue);
    });
  }, [members, query]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="h-9 rounded-lg border border-border bg-popover px-3 text-sm font-medium text-foreground hover:bg-accent"
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
              filteredMembers.map((member) => {
                const displayName = member.user.name ?? member.user.email;

                return (
                  <div key={member.id} className="flex items-center gap-2 rounded-lg border border-border bg-popover p-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      {memberInitials(displayName)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                      <p className="truncate text-[11px] text-muted-foreground">Joined {formatJoinedAt(member.joinedAt)}</p>
                    </div>

                    <Badge>{member.role}</Badge>
                  </div>
                );
              })
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
