import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    apiToken: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    provider?: string;
  }
}
