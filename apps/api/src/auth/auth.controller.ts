import { Body, Controller, Post } from "@nestjs/common";
import type { User } from "@prisma/client";

import { Public } from "./decorators/public.decorator";
import { VerifyTokenDto } from "./dto/verify-token.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("verify-token")
  async verifyToken(@Body() dto: VerifyTokenDto): Promise<{ userId: string; user: User }> {
    const user = await this.authService.validateOrCreateUser(dto);

    return {
      userId: user.id,
      user
    };
  }
}
