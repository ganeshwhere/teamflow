import type { JWT } from "next-auth/jwt";
import type { ApiJwtPayload } from "@repo/types";
import { SignJWT } from "jose";

const DEFAULT_JWT_EXPIRY = "7d";
const encoder = new TextEncoder();

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required to sign API tokens.`);
  }

  return value;
}

function readJwtExpiry(): string {
  return process.env.JWT_EXPIRY?.trim() || DEFAULT_JWT_EXPIRY;
}

function pickString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function buildPayload(token: JWT): ApiJwtPayload & Record<string, unknown> {
  const sub = pickString(token.userId) ?? pickString(token.sub);
  const email = pickString(token.email);
  const provider = pickString(token.provider) ?? "oauth";
  const name = pickString(token.name);

  if (!sub) {
    throw new Error("Cannot sign API token: missing user id.");
  }

  if (!email) {
    throw new Error("Cannot sign API token: missing user email.");
  }

  return {
    sub,
    email,
    name,
    provider,
  };
}

export async function createApiToken(token: JWT): Promise<string> {
  const secret = readRequiredEnv("NEXTAUTH_SECRET");
  const expiresIn = readJwtExpiry();
  const payload = buildPayload(token);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encoder.encode(secret));
}
