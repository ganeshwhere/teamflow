import { describe, expect, it } from "vitest";

import { createApiToken } from "./auth-token";

describe("createApiToken", () => {
  it("creates a signed token from callback payload", async () => {
    process.env.NEXTAUTH_SECRET = "super-secret-for-tests";

    const token = await createApiToken({
      userId: "user_1",
      email: "demo@teamflow.dev",
      name: "Demo",
      provider: "github"
    });

    expect(token.split(".")).toHaveLength(3);
  });
});
