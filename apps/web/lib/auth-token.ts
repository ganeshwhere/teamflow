import type { JWT } from "next-auth/jwt";
import { sign } from "jsonwebtoken";

export function createApiToken(token: JWT): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "";
  const expiresIn = (process.env.JWT_EXPIRY ?? "7d") as import("jsonwebtoken").SignOptions["expiresIn"];

  return sign(
    {
      sub: token.userId,
      email: token.email,
      name: token.name,
      provider: token.provider
    },
    secret,
    {
      expiresIn
    }
  );
}
