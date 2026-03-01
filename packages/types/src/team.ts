import type { User } from "./user";

export enum TeamRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER"
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
  ownerId: string;
}

export interface TeamMember {
  id: string;
  role: TeamRole;
  user: User;
  joinedAt: Date;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}
