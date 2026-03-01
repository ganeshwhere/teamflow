import { describe, expect, it } from "vitest";

import { config } from "./middleware";

describe("middleware config", () => {
  it("protects dashboard and teams routes", () => {
    expect(config.matcher).toContain("/dashboard/:path*");
    expect(config.matcher).toContain("/teams/:path*");
  });
});
