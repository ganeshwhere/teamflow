import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { AuthUser } from "../interfaces/auth-user.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.NEXTAUTH_SECRET ?? ""
    });
  }

  validate(payload: AuthUser): AuthUser {
    if (!payload?.sub || !payload?.email) {
      throw new UnauthorizedException("Invalid token payload");
    }

    return payload;
  }
}
