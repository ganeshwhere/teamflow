import { describe, expect, it } from "vitest";

import { decodeTeamIdFromToken } from "./invite-token";

describe("decodeTeamIdFromToken", () => {
  it("extracts team id from jwt payload", () => {
    const payload = Buffer.from(JSON.stringify({ teamId: "team_123" }), "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const token = `header.${payload}.signature`;

    expect(decodeTeamIdFromToken(token)).toBe("team_123");
  });
});
