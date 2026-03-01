import { describe, expect, it, vi } from "vitest";

import { upsertOAuthUser } from "./auth-callback";

const payload = {
  email: "demo@teamflow.dev",
  name: "Demo",
  avatarUrl: "https://example.com/avatar.png",
  provider: "google",
  providerId: "google-123"
} as const;

describe("upsertOAuthUser", () => {
  it("returns verified payload when API responds with success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        userId: "user_1",
        user: {
          id: "user_1",
          email: payload.email,
          name: payload.name,
          avatarUrl: payload.avatarUrl,
          createdAt: new Date().toISOString()
        }
      })
    });

    const result = await upsertOAuthUser({
      apiBaseUrl: "http://localhost:4000",
      payload,
      fetchImpl: fetchImpl as unknown as typeof fetch
    });

    expect(result?.userId).toBe("user_1");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("returns null when API responds with failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false
    });

    const result = await upsertOAuthUser({
      apiBaseUrl: "http://localhost:4000",
      payload,
      fetchImpl: fetchImpl as unknown as typeof fetch
    });

    expect(result).toBeNull();
  });

  it("returns null when API request throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await upsertOAuthUser({
      apiBaseUrl: "http://localhost:4000",
      payload,
      fetchImpl: fetchImpl as unknown as typeof fetch
    });

    expect(result).toBeNull();
  });
});
