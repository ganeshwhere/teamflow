import type { User } from "./user";

export interface VerifyTokenPayload {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  provider: string;
  providerId: string;
}

export interface VerifyTokenResponse {
  userId: string;
  user: User;
}

export interface ApiJwtPayload {
  sub: string;
  email: string;
  name: string;
  provider: string;
}
