import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { User } from "@prisma/client";
import type { ApiJwtPayload } from "@repo/types";

import { PrismaService } from "../prisma/prisma.service";

import type { VerifyTokenDto } from "./dto/verify-token.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateOrCreateUser(oauthProfile: VerifyTokenDto): Promise<User> {
    const normalizedEmail = oauthProfile.email.toLowerCase();

    return this.prisma.user.upsert({
      where: {
        provider_providerId: {
          provider: oauthProfile.provider,
          providerId: oauthProfile.providerId,
        },
      },
      update: {
        email: normalizedEmail,
        name: oauthProfile.name,
        avatarUrl: oauthProfile.avatarUrl,
      },
      create: {
        email: normalizedEmail,
        name: oauthProfile.name,
        avatarUrl: oauthProfile.avatarUrl,
        provider: oauthProfile.provider,
        providerId: oauthProfile.providerId,
      },
    });
  }

  async issueApiToken(payload: ApiJwtPayload): Promise<string> {
    return this.jwtService.signAsync({
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      provider: payload.provider,
    });
  }
}
