import { AuthController } from "../auth/auth.controller";
import { ProjectChatController } from "../project-chat/project-chat.controller";
import { TasksController } from "../tasks/tasks.controller";
import { TeamsController } from "../teams/teams.controller";

import { THROTTLE_PRESETS } from "./throttling.config";

const LIMIT_METADATA_KEY = "THROTTLER:LIMITdefault";
const TTL_METADATA_KEY = "THROTTLER:TTLdefault";

function expectThrottleMetadata(handler: unknown, limit: number, ttl: number): void {
  const actualLimit = Reflect.getMetadata(LIMIT_METADATA_KEY, handler as object) as
    | number
    | undefined;
  const actualTtl = Reflect.getMetadata(TTL_METADATA_KEY, handler as object) as number | undefined;

  expect(actualLimit).toBe(limit);
  expect(actualTtl).toBe(ttl);
}

describe("throttling metadata", () => {
  it("applies auth verify-token throttle override", () => {
    expectThrottleMetadata(
      AuthController.prototype.verifyToken,
      THROTTLE_PRESETS.AUTH_VERIFY.default.limit,
      THROTTLE_PRESETS.AUTH_VERIFY.default.ttl,
    );
  });

  it("applies team invite and join throttle overrides", () => {
    expectThrottleMetadata(
      TeamsController.prototype.inviteMember,
      THROTTLE_PRESETS.TEAM_INVITE.default.limit,
      THROTTLE_PRESETS.TEAM_INVITE.default.ttl,
    );

    expectThrottleMetadata(
      TeamsController.prototype.joinTeam,
      THROTTLE_PRESETS.TEAM_JOIN.default.limit,
      THROTTLE_PRESETS.TEAM_JOIN.default.ttl,
    );
  });

  it("applies task write throttle override to create, update, and delete", () => {
    expectThrottleMetadata(
      TasksController.prototype.createTask,
      THROTTLE_PRESETS.TASK_WRITE.default.limit,
      THROTTLE_PRESETS.TASK_WRITE.default.ttl,
    );

    expectThrottleMetadata(
      TasksController.prototype.updateTask,
      THROTTLE_PRESETS.TASK_WRITE.default.limit,
      THROTTLE_PRESETS.TASK_WRITE.default.ttl,
    );

    expectThrottleMetadata(
      TasksController.prototype.deleteTask,
      THROTTLE_PRESETS.TASK_WRITE.default.limit,
      THROTTLE_PRESETS.TASK_WRITE.default.ttl,
    );
  });

  it("applies project chat write throttle override", () => {
    expectThrottleMetadata(
      ProjectChatController.prototype.createMessage,
      THROTTLE_PRESETS.CHAT_WRITE.default.limit,
      THROTTLE_PRESETS.CHAT_WRITE.default.ttl,
    );
  });
});
