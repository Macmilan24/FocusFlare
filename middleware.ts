// FILE: middleware.ts

import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";
import { Role } from "@prisma/client";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isParentRoute = nextUrl.pathname.startsWith("/parent");
  const isKidRoute = nextUrl.pathname.startsWith("/kid");

  console.log(
    "[MIDDLEWARE] Path:",
    nextUrl.pathname,
    "isLoggedIn:",
    isLoggedIn,
    "Role:",
    userRole
  );

  // If trying to access auth pages (signin/register) while logged in, redirect to the correct dashboard.
  if (isAuthRoute && isLoggedIn) {
    if (userRole === Role.PARENT) {
      return Response.redirect(new URL("/parent/overview", nextUrl));
    }
    if (userRole === Role.CHILD) {
      return Response.redirect(new URL("/kid/home", nextUrl));
    }
    // Fallback for any other role, though unlikely
    return Response.redirect(new URL("/", nextUrl));
  }

  // If trying to access a protected parent route
  if (isParentRoute) {
    if (!isLoggedIn) return Response.redirect(new URL("/auth/signin", nextUrl));
    if (userRole !== Role.PARENT)
      return Response.redirect(new URL("/unauthorized", nextUrl)); // Or redirect to their own dashboard
  }

  // If trying to access a protected kid route
  if (isKidRoute) {
    if (!isLoggedIn) return Response.redirect(new URL("/auth/signin", nextUrl));
    if (userRole !== Role.CHILD)
      return Response.redirect(new URL("/unauthorized", nextUrl)); // Or redirect to their own dashboard
  }

  // If a logged-in user lands on the root, redirect them
  if (nextUrl.pathname === "/" && isLoggedIn) {
    if (userRole === Role.PARENT)
      return Response.redirect(new URL("/parent/overview", nextUrl));
    if (userRole === Role.CHILD)
      return Response.redirect(new URL("/kid/home", nextUrl));
  }

  // Allow the request to proceed if no rules matched
  return;
});

// This config prevents the middleware from running on static files and API routes.
// It's crucial for performance and correctness.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
