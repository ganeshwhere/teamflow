import { AuthService } from "./auth.service";

describe("AuthService", () => {
  it("upserts users by provider and providerId", async () => {
    const upsert = jest.fn().mockResolvedValue({ id: "user_1" });
    const service = new AuthService({ user: { upsert } } as never);

    await service.validateOrCreateUser({
      email: "demo@teamflow.dev",
      name: "Demo",
      provider: "google",
      providerId: "google_123",
      avatarUrl: "https://example.com/avatar.png"
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          provider_providerId: {
            provider: "google",
            providerId: "google_123"
          }
        }
      })
    );
  });
});
