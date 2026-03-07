import { Body, Controller, Headers, Post, UnauthorizedException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { User, VerifyTokenResponse } from "@repo/types";

import { Public } from "./decorators/public.decorator";
import { isAuthBridgeSecretValid } from "./auth.config";
import { VerifyTokenDto } from "./dto/verify-token.dto";
import { AuthService } from "./auth.service";
import { THROTTLE_PRESETS } from "../security/throttling.config";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle(THROTTLE_PRESETS.AUTH_VERIFY)
  @Post("verify-token")
  async verifyToken(
    @Body() dto: VerifyTokenDto,
    @Headers("x-auth-bridge-secret") bridgeSecret?: string,
  ): Promise<VerifyTokenResponse> {
    if (!isAuthBridgeSecretValid(bridgeSecret)) {
      throw new UnauthorizedException("Invalid auth bridge secret");
    }

    const user = await this.authService.validateOrCreateUser(dto);
    const safeUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    const apiToken = await this.authService.issueApiToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      provider: dto.provider,
    });

    return {
      userId: user.id,
      user: safeUser,
      apiToken,
    };
  }
}
