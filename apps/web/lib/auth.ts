import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { AuthProvider } from "@repo/types";

import { buildVerifyTokenPayload } from "./auth-helpers";
import { upsertOAuthUser } from "./auth-callback";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const OAUTH_PROVIDERS: readonly AuthProvider[] = ["google", "github"];

function isOAuthProvider(value: string): value is AuthProvider {
  return OAUTH_PROVIDERS.includes(value as AuthProvider);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && isOAuthProvider(account.provider)) {
        token.provider = account.provider;
      }

      const verifyPayload = buildVerifyTokenPayload({
        account,
        profile,
        user,
        existingProvider:
          typeof token.provider === "string" && isOAuthProvider(token.provider)
            ? token.provider
            : undefined,
      });
      if (verifyPayload) {
        const payload = await upsertOAuthUser({
          apiBaseUrl,
          payload: verifyPayload,
        });

        if (payload) {
          token.userId = payload.userId;
          token.sub = payload.userId;
          token.provider = verifyPayload.provider;
          token.apiToken = payload.apiToken;
        } else {
          delete token.apiToken;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string | undefined) ?? token.sub ?? "";
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
        session.user.image = (token.picture as string | undefined) ?? session.user.image;
      }

      session.apiToken = typeof token.apiToken === "string" ? token.apiToken : undefined;
      return session;
    },
  },
  trustHost: true,
});
