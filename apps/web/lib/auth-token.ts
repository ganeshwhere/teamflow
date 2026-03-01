import type { JWT } from "next-auth/jwt";
import { SignJWT } from "jose";

export async function createApiToken(token: JWT): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET ?? "";
  const secretBytes = new TextEncoder().encode(secret);
  const expiresIn = process.env.JWT_EXPIRY ?? "7d";

  return new SignJWT(
    {
      sub: token.userId,
      email: token.email,
      name: token.name,
      provider: token.provider
    }
  )
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretBytes);
}
