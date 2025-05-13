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
    async jwt({ token, user, trigger, session: sessionFromUpdate }) {
      // Renamed 'session' param to 'sessionFromUpdate' for clarity
      console.log("[JWT Callback] Fired. Trigger:", trigger);
      console.log("[JWT Callback] Initial Token:", JSON.stringify(token));
      console.log(
        "[JWT Callback] User object (on signin):",
        JSON.stringify(user)
      );
      console.log(
        "[JWT Callback] Session from update trigger:",
        JSON.stringify(sessionFromUpdate)
      );

      if (user) {
        // @ts-expect-error 'id' might not be on NextAuth 'User' type initially
        token.id = user.id;
        token.role = user.role as Role;
        token.username = user.username;
        token.name = user.name;
        token.image = user.image;
        token.email = user.email;

        if (user.points !== undefined) {
          token.points = user.points;
        } else {
          // Fetch points if not on initial user obj, e.g. from DB if user.id exists
          // This part is optional if session update mechanism is robust
        }
      }

      // IMPORTANT: Handle session updates triggered by unstable_update
      if (trigger === "update" && sessionFromUpdate?.user) {
        console.log(
          "[JWT Callback] Trigger is 'update'. Merging data from sessionFromUpdate.user"
        );
        if (sessionFromUpdate.user.name !== undefined)
          token.name = sessionFromUpdate.user.name;
        if (sessionFromUpdate.user.email !== undefined)
          token.email = sessionFromUpdate.user.email;
        if (sessionFromUpdate.user.image !== undefined)
          token.image = sessionFromUpdate.user.image;
        if (sessionFromUpdate.user.points !== undefined) {
          token.points = sessionFromUpdate.user.points;
          console.log(
            "[JWT Callback] Updated token.points from sessionFromUpdate:",
            token.points
          );
        }
        // Add any other fields from session.user you want to be updatable
      }
      console.log("[JWT Callback] Final Token:", JSON.stringify(token));
      return token;
    },

    async session({ session, token }) {
      console.log("[Session Callback] Fired.");
      console.log("[Session Callback] Token received:", JSON.stringify(token));
      console.log(
        "[Session Callback] Original session.user:",
        JSON.stringify(session.user)
      );
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string | null | undefined;
        session.user.name = token.name as string | null | undefined;
        session.user.image = token.image as string | null | undefined;
        // @ts-expect-error Defaulting points if not on token
        session.user.email = token.email as string | null | undefined;

        if (token.points !== undefined) {
          session.user.points = token.points as number;
        } else {
          session.user.points = 0; // Or keep as undefined if your type allows
        }
      }
      console.log(
        "[Session Callback] Modified session.user:",
        JSON.stringify(session.user)
      );
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
