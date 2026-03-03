import type { User } from "./user.js";

export const AUTH_PROVIDERS = ["google", "github"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export interface VerifyTokenPayload {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  provider: AuthProvider;
  providerId: string;
}

export interface VerifyTokenResponse {
  userId: string;
  user: User;
  apiToken: string;
}

export interface ApiJwtPayload {
  sub: string;
  email: string;
  name?: string | null;
  provider: AuthProvider;
}
