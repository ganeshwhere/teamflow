import type { ApiJwtPayload } from "@repo/types";

export type AuthUser = ApiJwtPayload & {
  providerId?: string;
  picture?: string;
};
