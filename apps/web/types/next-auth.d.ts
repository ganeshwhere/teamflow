import type { DefaultSession } from "next-auth";
import type { AuthProvider } from "@repo/types";

declare module "next-auth" {
  interface Session {
    apiToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    provider?: AuthProvider;
    apiToken?: string;
  }
}
