import type { Account, Profile, User } from "next-auth";
import { AUTH_PROVIDERS, type AuthProvider, type VerifyTokenPayload } from "@repo/types";

const AUTH_PROVIDER_SET = new Set<AuthProvider>(AUTH_PROVIDERS);

function resolveAuthProvider(value?: string): AuthProvider | null {
  if (!value || !AUTH_PROVIDER_SET.has(value as AuthProvider)) {
    return null;
  }

  return value as AuthProvider;
}

export function buildVerifyTokenPayload(args: {
  account?: Account | null;
  profile?: Profile;
  user?: User;
  existingProvider?: AuthProvider;
}): VerifyTokenPayload | null {
  const { account, profile, user, existingProvider } = args;

  if (!user?.email) {
    return null;
  }

  const provider = resolveAuthProvider(account?.provider ?? existingProvider);
  if (!provider) {
    return null;
  }

  const providerId =
    account?.providerAccountId ??
    (typeof profile?.sub === "string" ? profile.sub : undefined) ??
    user.email;

  return {
    email: user.email,
    name: user.name,
    avatarUrl: user.image,
    provider,
    providerId,
  };
}
