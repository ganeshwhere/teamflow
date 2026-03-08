import type { Request } from "express";

import type { AuthUser } from "../../auth/interfaces/auth-user.interface";

export type RequestWithId = Request & {
  requestId?: string;
  user?: AuthUser;
};
