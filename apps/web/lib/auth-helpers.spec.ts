import { describe, expect, it } from "vitest";

import { buildVerifyTokenPayload } from "./auth-helpers";

describe("buildVerifyTokenPayload", () => {
  it("returns provider payload for api upsert", () => {
    const payload = buildVerifyTokenPayload({
      account: {
        provider: "google",
        providerAccountId: "abc123"
      } as never,
      user: {
        email: "demo@teamflow.dev",
        name: "Demo",
        image: "https://example.com/avatar.png"
      } as never
    });

    expect(payload).toEqual({
      email: "demo@teamflow.dev",
      name: "Demo",
      avatarUrl: "https://example.com/avatar.png",
      provider: "google",
      providerId: "abc123"
    });
  });
});
