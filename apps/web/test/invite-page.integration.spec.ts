import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/actions/team.actions", () => ({
  joinTeam: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));

function createInviteToken(teamId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ teamId })).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("invite page integration", () => {
  it("renders invalid invite content when token is missing", async () => {
    const { default: InvitePage } = await import("@/app/invite/page");
    const markup = renderToStaticMarkup(await InvitePage({ searchParams: Promise.resolve({}) }));

    expect(markup).toContain("Invalid Invite");
    expect(markup).toContain("invalid or expired");
  });

  it("renders join action when token contains a team id", async () => {
    const { default: InvitePage } = await import("@/app/invite/page");
    const token = createInviteToken("team_1");
    const markup = renderToStaticMarkup(await InvitePage({ searchParams: Promise.resolve({ token }) }));

    expect(markup).toContain("Team Invitation");
    expect(markup).toContain("Join Team");
  });
});
