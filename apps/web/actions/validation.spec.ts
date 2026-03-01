import { describe, expect, it } from "vitest";

import { createTeamInputSchema } from "./schemas";

describe("action input validation", () => {
  it("rejects invalid team creation payload", () => {
    const result = createTeamInputSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });
});
