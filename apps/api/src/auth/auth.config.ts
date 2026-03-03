import { timingSafeEqual } from "node:crypto";

const DEFAULT_API_JWT_EXPIRY = "15m";
const DEFAULT_API_JWT_ISSUER = "teamflow-api";
const DEFAULT_API_JWT_AUDIENCE = "teamflow-clients";
const MIN_SECRET_LENGTH = 32;

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getApiJwtSecret(): string {
  const secret = readEnv("API_JWT_SECRET");

  if (!secret) {
    throw new Error("Missing API JWT secret. Set API_JWT_SECRET.");
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`API_JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`);
  }

  return secret;
}

export function getApiJwtExpiry(): string {
  return readEnv("API_JWT_EXPIRY") ?? DEFAULT_API_JWT_EXPIRY;
}

export function getApiJwtIssuer(): string {
  return readEnv("API_JWT_ISSUER") ?? DEFAULT_API_JWT_ISSUER;
}

export function getApiJwtAudience(): string {
  return readEnv("API_JWT_AUDIENCE") ?? DEFAULT_API_JWT_AUDIENCE;
}

export function getAuthBridgeSecret(): string {
  const secret = readEnv("AUTH_BRIDGE_SECRET");

  if (!secret) {
    throw new Error("Missing auth bridge secret. Set AUTH_BRIDGE_SECRET.");
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`AUTH_BRIDGE_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`);
  }

  return secret;
}

export function isAuthBridgeSecretValid(providedSecret?: string): boolean {
  if (!providedSecret) {
    return false;
  }

  const normalizedProvidedSecret = providedSecret.trim();
  if (!normalizedProvidedSecret) {
    return false;
  }

  const expectedSecret = getAuthBridgeSecret();
  const expectedBuffer = Buffer.from(expectedSecret);
  const providedBuffer = Buffer.from(normalizedProvidedSecret);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function getTeamInviteJwtSecret(): string {
  const configuredSecret = readEnv("TEAM_INVITE_JWT_SECRET");
  if (!configuredSecret) {
    return getApiJwtSecret();
  }

  if (configuredSecret.length < MIN_SECRET_LENGTH) {
    throw new Error(`TEAM_INVITE_JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`);
  }

  return configuredSecret;
}
