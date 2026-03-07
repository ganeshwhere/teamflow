import { AppThrottlerGuard } from "./app-throttler.guard";

function createGuard(): AppThrottlerGuard {
  return new AppThrottlerGuard([] as never, {} as never, {} as never);
}

describe("AppThrottlerGuard", () => {
  it("prefers authenticated user id as tracker", async () => {
    const guard = createGuard();

    const tracker = await (guard as any).getTracker({
      user: { sub: "user_123" },
    });

    expect(tracker).toBe("user:user_123");
  });

  it("falls back to first trusted proxy IP", async () => {
    const guard = createGuard();

    const tracker = await (guard as any).getTracker({
      ips: ["203.0.113.9", "198.51.100.42"],
    });

    expect(tracker).toBe("ip:203.0.113.9");
  });

  it("uses req.ip when user and forwarded headers are missing", async () => {
    const guard = createGuard();

    const tracker = await (guard as any).getTracker({
      ip: "127.0.0.1",
    });

    expect(tracker).toBe("ip:127.0.0.1");
  });

  it("falls back to unknown tracker when no user or IP is available", async () => {
    const guard = createGuard();

    const tracker = await (guard as any).getTracker({});

    expect(tracker).toBe("ip:unknown");
  });
});
