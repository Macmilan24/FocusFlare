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
        if (!loginId) {
          console.log("Authorization failed: Missing loginId");
          return null;
        }

        if (!password) {
          console.log("Authorization failed: Missing password");
          return null;
        }

        let user;

        if (loginId.includes("@")) {
          user = await prisma.user.findUnique({
            where: { email: loginId },
          });
        }

        if (!user) {
          user = await prisma.user.findFirst({
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
        token.role = user.role as Role;
        token.username = user.username;
        token.name = user.name;
        token.image = user.image;
        token.email = user.email;
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

    async redirect({ url, baseUrl }) {
      console.log("[REDIRECT CALLBACK] Fired. URL:", url, "BaseURL:", baseUrl);
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl; // Default for most cases
    },
  },
} satisfies NextAuthConfig;
