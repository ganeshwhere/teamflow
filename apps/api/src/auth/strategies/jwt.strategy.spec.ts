import { UnauthorizedException } from "@nestjs/common";
import type { AuthUser } from "../interfaces/auth-user.interface";

import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  beforeEach(() => {
    process.env.API_JWT_SECRET = "a".repeat(32);
  });

  it("returns payload for valid token payload", () => {
    const strategy = new JwtStrategy();

    const payload = strategy.validate({
      sub: "user_1",
      email: "demo@teamflow.dev",
      provider: "github",
    });

    expect(payload.sub).toBe("user_1");
  });

  it("throws for invalid payload", () => {
    const strategy = new JwtStrategy();

    expect(() =>
      strategy.validate({
        sub: "",
        email: "",
        provider: "github",
      }),
    ).toThrow(UnauthorizedException);
  });

  it("throws when provider is unsupported", () => {
    const strategy = new JwtStrategy();

    expect(() =>
      strategy.validate({
        sub: "user_1",
        email: "demo@teamflow.dev",
        provider: "credentials",
      } as unknown as AuthUser),
    ).toThrow(UnauthorizedException);
  });
});
