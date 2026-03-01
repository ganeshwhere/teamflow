import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import type { VerifyTokenResponse } from "@repo/types";

import { createApiToken } from "./auth-token";
import { buildVerifyTokenPayload } from "./auth-helpers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt"
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.provider = account.provider;
      }

      const verifyPayload = buildVerifyTokenPayload({
        account,
        profile,
        user,
        existingProvider: token.provider as string | undefined
      });
      if (verifyPayload) {
        const response = await fetch(`${apiBaseUrl}/auth/verify-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(verifyPayload)
        });

        if (response.ok) {
          const payload = (await response.json()) as VerifyTokenResponse;
          token.userId = payload.userId;
          token.sub = payload.userId;
          token.provider = verifyPayload.provider;
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

      session.apiToken = await createApiToken(token);
      return session;
    }
  },
  trustHost: true
});
