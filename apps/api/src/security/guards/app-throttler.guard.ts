import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

import type { AuthUser } from "../../auth/interfaces/auth-user.interface";

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const user = req.user as AuthUser | undefined;
    if (user?.sub) {
      return `user:${user.sub}`;
    }

    const requestIps = req.ips;
    if (Array.isArray(requestIps) && requestIps.length > 0 && typeof requestIps[0] === "string") {
      const firstIp = requestIps[0].trim();
      if (firstIp.length > 0) {
        return `ip:${firstIp}`;
      }
    }

    const requestIp = req.ip;
    if (typeof requestIp === "string" && requestIp.trim().length > 0) {
      return `ip:${requestIp.trim()}`;
    }

    return "ip:unknown";
  }
}
