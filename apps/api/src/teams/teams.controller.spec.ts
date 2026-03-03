import { TeamRole } from "@prisma/client";
import { GUARDS_METADATA } from "@nestjs/common/constants";

import { RolesGuard } from "../auth/guards/roles.guard";
import { ROLES_KEY } from "../auth/decorators/roles.decorator";

import { TeamGuard } from "./guards/team.guard";
import { TeamsController } from "./teams.controller";

describe("TeamsController metadata", () => {
  it("protects inviteMember with TeamGuard then RolesGuard", () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      TeamsController.prototype.inviteMember,
    ) as Array<unknown>;

    expect(guards).toEqual([TeamGuard, RolesGuard]);
  });

  it("requires OWNER or ADMIN role for inviteMember", () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TeamsController.prototype.inviteMember,
    ) as Array<string>;

    expect(roles).toEqual([TeamRole.OWNER, TeamRole.ADMIN]);
  });
});
