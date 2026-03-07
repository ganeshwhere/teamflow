import type { ThrottlerOptions } from "@nestjs/throttler";

type ThrottleWindow = {
  readonly limit: number;
  readonly ttl: number;
};

export type ThrottleDecoratorOptions = Record<"default", ThrottleWindow>;

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsedValue;
}

function createThrottleWindow(
  limitEnvName: string,
  ttlEnvName: string,
  fallbackLimit: number,
  fallbackTtl: number,
): ThrottleDecoratorOptions {
  const limit = readPositiveIntegerEnv(limitEnvName, fallbackLimit);
  const ttl = readPositiveIntegerEnv(ttlEnvName, fallbackTtl);

  return Object.freeze({
    default: Object.freeze({
      limit,
      ttl,
    }),
  });
}

export const THROTTLE_PRESETS = Object.freeze({
  DEFAULT: createThrottleWindow(
    "RATE_LIMIT_DEFAULT_LIMIT",
    "RATE_LIMIT_DEFAULT_TTL_MS",
    120,
    60_000,
  ),
  AUTH_VERIFY: createThrottleWindow(
    "RATE_LIMIT_AUTH_VERIFY_LIMIT",
    "RATE_LIMIT_AUTH_VERIFY_TTL_MS",
    20,
    60_000,
  ),
  TEAM_INVITE: createThrottleWindow(
    "RATE_LIMIT_TEAM_INVITE_LIMIT",
    "RATE_LIMIT_TEAM_INVITE_TTL_MS",
    6,
    600_000,
  ),
  TEAM_JOIN: createThrottleWindow(
    "RATE_LIMIT_TEAM_JOIN_LIMIT",
    "RATE_LIMIT_TEAM_JOIN_TTL_MS",
    20,
    600_000,
  ),
  TASK_WRITE: createThrottleWindow(
    "RATE_LIMIT_TASK_WRITE_LIMIT",
    "RATE_LIMIT_TASK_WRITE_TTL_MS",
    90,
    60_000,
  ),
  CHAT_WRITE: createThrottleWindow(
    "RATE_LIMIT_CHAT_WRITE_LIMIT",
    "RATE_LIMIT_CHAT_WRITE_TTL_MS",
    120,
    60_000,
  ),
});

export function getGlobalThrottlerOptions(): ThrottlerOptions[] {
  const globalWindow = THROTTLE_PRESETS.DEFAULT.default;

  return [
    {
      name: "default",
      limit: globalWindow.limit,
      ttl: globalWindow.ttl,
    },
  ];
}
