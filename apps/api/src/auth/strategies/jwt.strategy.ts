import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AUTH_PROVIDERS, type AuthProvider } from "@repo/types";

import { getApiJwtAudience, getApiJwtIssuer, getApiJwtSecret } from "../auth.config";
import type { AuthUser } from "../interfaces/auth-user.interface";

const OAUTH_PROVIDER_SET = new Set<AuthProvider>(AUTH_PROVIDERS);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getApiJwtSecret(),
      issuer: getApiJwtIssuer(),
      audience: getApiJwtAudience(),
      algorithms: ["HS256"],
    });
  }

  validate(payload: AuthUser): AuthUser {
    if (
      !payload?.sub ||
      !payload?.email ||
      !payload.provider ||
      !OAUTH_PROVIDER_SET.has(payload.provider)
    ) {
      throw new UnauthorizedException("Invalid token payload");
    }

    return payload;
  }
}
