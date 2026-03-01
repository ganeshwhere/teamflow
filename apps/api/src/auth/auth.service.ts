import { Injectable } from "@nestjs/common";
import type { User } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import type { VerifyTokenDto } from "./dto/verify-token.dto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateOrCreateUser(oauthProfile: VerifyTokenDto): Promise<User> {
    return this.prisma.user.upsert({
      where: {
        provider_providerId: {
          provider: oauthProfile.provider,
          providerId: oauthProfile.providerId
        }
      },
      update: {
        email: oauthProfile.email,
        name: oauthProfile.name,
        avatarUrl: oauthProfile.avatarUrl
      },
      create: {
        email: oauthProfile.email,
        name: oauthProfile.name,
        avatarUrl: oauthProfile.avatarUrl,
        provider: oauthProfile.provider,
        providerId: oauthProfile.providerId
      }
    });
  }
}
