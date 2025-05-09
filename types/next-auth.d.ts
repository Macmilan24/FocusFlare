// types/next-auth.d.ts
import type { Role } from "@prisma/client";
import type {
  Session as NextAuthSession,
  User as NextAuthUser,
} from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends NextAuthSession {
    user: {
      id: string;
      role?: Role | null;
      username?: string | null;
    } & Omit<NextAuthUser, "id">;
  }

  interface User extends NextAuthUser {
    role?: Role | null;
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    id: string;
    role?: Role | null;
    username?: string | null;
  }
}
