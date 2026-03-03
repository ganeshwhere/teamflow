import { describe, expect, it, vi } from "vitest";

import { upsertOAuthUser } from "./auth-callback";

const bridgeSecret = "b".repeat(32);

const payload = {
  email: "demo@teamflow.dev",
  name: "Demo",
  avatarUrl: "https://example.com/avatar.png",
  provider: "google",
  providerId: "google-123",
} as const;

describe("upsertOAuthUser", () => {
  it("returns verified payload when API responds with success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        userId: "user_1",
        apiToken: "signed-api-token",
        user: {
          id: "user_1",
          email: payload.email,
          name: payload.name,
          avatarUrl: payload.avatarUrl,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    const result = await upsertOAuthUser({
      apiBaseUrl: "http://localhost:4000",
      payload,
      bridgeSecret,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result?.userId).toBe("user_1");
    expect(result?.apiToken).toBe("signed-api-token");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:4000/auth/verify-token",
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-auth-bridge-secret": bridgeSecret,
        }),
      }),
    );
  });

  it("returns null when API responds with failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
    });

    const result = await upsertOAuthUser({
      apiBaseUrl: "http://localhost:4000",
      payload,
      bridgeSecret,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result).toBeNull();
  });

  it("returns null when API request throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await upsertOAuthUser({
      apiBaseUrl: "http://localhost:4000",
      payload,
      bridgeSecret,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result).toBeNull();
  });

  it("returns null when bridge secret is missing", async () => {
    const result = await upsertOAuthUser({
      apiBaseUrl: "http://localhost:4000",
      payload,
      bridgeSecret: "",
      fetchImpl: vi.fn() as unknown as typeof fetch,
    });

    expect(result).toBeNull();
  });

  it("returns null when bridge secret is too short", async () => {
    const result = await upsertOAuthUser({
      apiBaseUrl: "http://localhost:4000",
      payload,
      bridgeSecret: "short-secret",
      fetchImpl: vi.fn() as unknown as typeof fetch,
    });

    expect(result).toBeNull();
  });
});
