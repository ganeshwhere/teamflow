import { ExecutionContext, ForbiddenException } from "@nestjs/common";

import { TeamMemberGuard } from "./team-member.guard";

describe("TeamMemberGuard", () => {
  it("throws when user is not team member", async () => {
    const guard = new TeamMemberGuard({
      teamMember: {
        findUnique: jest.fn().mockResolvedValue(null)
      }
    } as never);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          params: { teamId: "team_1" },
          user: { sub: "user_1" }
        })
      })
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
