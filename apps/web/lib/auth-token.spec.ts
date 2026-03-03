import { jwtVerify } from "jose";
import { afterEach, describe, expect, it } from "vitest";

import { createApiToken } from "./auth-token";

describe("createApiToken", () => {
  const originalSecret = process.env.NEXTAUTH_SECRET;
  const originalExpiry = process.env.JWT_EXPIRY;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.NEXTAUTH_SECRET;
    } else {
      process.env.NEXTAUTH_SECRET = originalSecret;
    }

    if (originalExpiry === undefined) {
      delete process.env.JWT_EXPIRY;
    } else {
      process.env.JWT_EXPIRY = originalExpiry;
    }
  });

  it("creates a signed token with required claims", async () => {
    process.env.NEXTAUTH_SECRET = "super-secret-for-tests";
    delete process.env.JWT_EXPIRY;

    const signedToken = await createApiToken({
      userId: "user_1",
      email: "demo@teamflow.dev",
      name: "Demo",
      provider: "github",
    });

    expect(signedToken.split(".")).toHaveLength(3);

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(signedToken, secret);

    expect(payload.sub).toBe("user_1");
    expect(payload.email).toBe("demo@teamflow.dev");
    expect(payload.name).toBe("Demo");
    expect(payload.provider).toBe("github");
  });

  it("falls back to token.sub when userId is missing", async () => {
    process.env.NEXTAUTH_SECRET = "super-secret-for-tests";

    const signedToken = await createApiToken({
      sub: "user_sub",
      email: "demo@teamflow.dev",
      provider: "github",
    });

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(signedToken, secret);

    expect(payload.sub).toBe("user_sub");
  });

  it("throws when NEXTAUTH_SECRET is missing", async () => {
    delete process.env.NEXTAUTH_SECRET;

    await expect(
      createApiToken({
        userId: "user_1",
        email: "demo@teamflow.dev",
        provider: "github",
      }),
    ).rejects.toThrow("NEXTAUTH_SECRET is required");
  });

  it("throws when required claims are missing", async () => {
    process.env.NEXTAUTH_SECRET = "super-secret-for-tests";

    await expect(
      createApiToken({
        userId: "user_1",
        provider: "github",
      }),
    ).rejects.toThrow("missing user email");
  });
});
