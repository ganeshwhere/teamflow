import { AuthService } from "./auth.service";

describe("AuthService", () => {
  it("upserts users by provider and providerId", async () => {
    const upsert = jest.fn().mockResolvedValue({ id: "user_1" });
    const service = new AuthService(
      { user: { upsert } } as never,
      { signAsync: jest.fn() } as never,
    );

    await service.validateOrCreateUser({
      email: "Demo@TeamFlow.Dev",
      name: "Demo",
      provider: "google",
      providerId: "google_123",
      avatarUrl: "https://example.com/avatar.png",
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          provider_providerId: {
            provider: "google",
            providerId: "google_123",
          },
        },
      }),
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          email: "demo@teamflow.dev",
        }),
        create: expect.objectContaining({
          email: "demo@teamflow.dev",
        }),
      }),
    );
  });

  it("issues API token with normalized payload", async () => {
    const signAsync = jest.fn().mockResolvedValue("signed-token");
    const service = new AuthService(
      { user: { upsert: jest.fn() } } as never,
      { signAsync } as never,
    );

    const token = await service.issueApiToken({
      sub: "user_1",
      email: "demo@teamflow.dev",
      name: "Demo User",
      provider: "google",
    });

    expect(token).toBe("signed-token");
    expect(signAsync).toHaveBeenCalledWith({
      sub: "user_1",
      email: "demo@teamflow.dev",
      name: "Demo User",
      provider: "google",
    });
  });
});
