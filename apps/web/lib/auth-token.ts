import type { JWT } from "next-auth/jwt";
import { sign } from "jsonwebtoken";

export function createApiToken(token: JWT): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "";

  return sign(
    {
      sub: token.userId,
      email: token.email,
      name: token.name,
      provider: token.provider
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRY ?? "7d"
    }
  );
}
