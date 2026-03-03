"use client";

import type { TeamMemberItem } from "@repo/types";

import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";

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

export function TeamMemberRow({ member }: { member: TeamMemberItem }) {
  const displayName = member.user.name ?? member.user.email;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-popover p-3">
      <UserAvatar
        name={member.user.name}
        email={member.user.email}
        avatarUrl={member.user.avatarUrl}
        className="h-10 w-10 text-sm"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
      </div>

      <div className="grid justify-items-end gap-1">
        <Badge>{member.role}</Badge>
        <p className="text-[11px] text-muted-foreground">Joined {formatJoinedAt(member.joinedAt)}</p>
      </div>
    </div>
  );
}
