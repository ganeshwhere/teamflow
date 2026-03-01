import type { Account, Profile, User } from "next-auth";

export type VerifyTokenPayload = {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  provider: string;
  providerId: string;
};

export function buildVerifyTokenPayload(args: {
  account?: Account | null;
  profile?: Profile;
  user?: User;
  existingProvider?: string;
}): VerifyTokenPayload | null {
  const { account, profile, user, existingProvider } = args;

  if (!user?.email) {
    return null;
  }

  const provider = account?.provider ?? existingProvider ?? "github";
  const providerId =
    account?.providerAccountId ??
    (typeof profile?.sub === "string" ? profile.sub : undefined) ??
    user.email;

  return {
    email: user.email,
    name: user.name,
    avatarUrl: user.image,
    provider,
    providerId
  };
}
