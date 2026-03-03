"use client";

import type { TeamMemberItem } from "@repo/types";

import { Badge } from "@/components/ui/badge";

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

export function TeamMemberRow({ member }: { member: TeamMemberItem }) {
  const displayName = member.user.name ?? member.user.email;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-popover p-3">
      {member.user.avatarUrl ? (
        <img
          src={member.user.avatarUrl}
          alt={displayName}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
          {memberInitials(displayName)}
        </span>
      )}

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
