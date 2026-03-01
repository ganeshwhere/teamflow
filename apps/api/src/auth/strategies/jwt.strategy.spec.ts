import { UnauthorizedException } from "@nestjs/common";

import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  it("returns payload for valid token payload", () => {
    const strategy = new JwtStrategy();

    const payload = strategy.validate({
      sub: "user_1",
      email: "demo@teamflow.dev",
      provider: "github"
    });

    expect(payload.sub).toBe("user_1");
  });

  it("throws for invalid payload", () => {
    const strategy = new JwtStrategy();

    expect(() =>
      strategy.validate({
        sub: "",
        email: "",
        provider: "github"
      })
    ).toThrow(UnauthorizedException);
  });
});
