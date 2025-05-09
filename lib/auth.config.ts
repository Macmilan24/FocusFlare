import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const { loginId, password } = credentials as {
          loginId?: string;
          password?: string;
        };
        if (!loginId || !password) {
          console.log("Authorization failed: Missing loginId or password");
          return null;
        }

        let user = await prisma.user.findUnique({
          where: { username: loginId },
        });

        if (!user) {
          user = await prisma.user.findUnique({
            where: { username: loginId },
          });
        }

        if (!user || !user.password) {
          console.log(
            "Authorize: User not found or no password set for:",
            loginId
          );
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          console.log(
            "Authorize: Invalid password for user:",
            user.email || user.username
          );
          return null;
        }

        console.log(
          "Authorize: User authenticated successfully:",
          user.email || user.username
        );

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error user is not defined in the type of token
        token.id = user.id;
        if (user.role) token.role = user.role as Role;
        if (user.username) token.username = user.username;
        token.name = user.name ?? null;
        token.image = user.image ?? null;
        token.email = user.email ?? null;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role | null | undefined;
        session.user.username = token.username as string | null | undefined;
        if (token.name !== undefined)
          session.user.name = token.name as string | null | undefined;

        if (token.email !== undefined) {
          // @ts-expect-error email is not defined in the type of session.user
          session.user.email = token.email as string | null | undefined;
        }
        if (token.image !== undefined)
          session.user.image = token.image as string | null | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
