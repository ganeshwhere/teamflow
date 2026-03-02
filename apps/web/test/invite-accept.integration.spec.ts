import { beforeEach, describe, expect, it, vi } from "vitest";

import { decodeTeamIdFromToken } from "@/lib/invite-token";

const revalidatePath = vi.fn();
const post = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath
}));

vi.mock("@/lib/api-client", () => ({
  post
}));

function createInviteToken(teamId: string, email = "member@example.com"): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ teamId, email })).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("invite accept integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("decodes invite token and joins the matching team", async () => {
    post.mockResolvedValueOnce({ joined: true });
    const token = createInviteToken("team_1");
    const decodedTeamId = decodeTeamIdFromToken(token);
    const { joinTeam } = await import("@/actions/team.actions");

    expect(decodedTeamId).toBe("team_1");
    const result = await joinTeam(decodedTeamId ?? "", token);

    expect(result).toEqual({ data: { joined: true }, error: null });
    expect(post).toHaveBeenCalledWith("/teams/team_1/join", { token });
    expect(revalidatePath).toHaveBeenCalledWith("/teams/team_1");
    expect(revalidatePath).toHaveBeenCalledWith("/teams");
  });
});
