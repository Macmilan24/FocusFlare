// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const token = await getToken({ req, secret });

  console.log("[MIDDLEWARE] Pathname:", req.nextUrl.pathname);
  console.log("[MIDDLEWARE] Token:", token);

  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  if (isLoggedIn && pathname === "/") {
    if (token.role === Role.PARENT) {
      console.log("[MIDDLEWARE] Redirecting PARENT to /parent/home");
      return NextResponse.redirect(new URL("/parent/home", req.url));
    } else if (token.role === Role.CHILD) {
      console.log("[MIDDLEWARE] Redirecting CHILD to /kid/home");
      return NextResponse.redirect(new URL("/kid/home", req.url));
    }
  }

  // Protect dashboard/platform routes
  if (
    (pathname.startsWith("/parent") ||
      pathname.startsWith("/kid") ||
      pathname.startsWith("/dashboard")) &&
    !isLoggedIn
  ) {
    console.log(
      "[MIDDLEWARE] User not logged in, redirecting to signin from protected route."
    );
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  if (
    isLoggedIn &&
    (pathname.startsWith("/auth/signin") ||
      pathname.startsWith("/auth/register"))
  ) {
    if (token.role === Role.PARENT) {
      console.log(
        "[MIDDLEWARE] Logged-in PARENT on auth page, redirecting to /parent/home"
      );
      return NextResponse.redirect(new URL("/parent/home", req.url));
    } else if (token.role === Role.CHILD) {
      console.log(
        "[MIDDLEWARE] Logged-in CHILD on auth page, redirecting to /kid/home"
      );
      return NextResponse.redirect(new URL("/kid/home", req.url));
    }
    console.log(
      "[MIDDLEWARE] Logged-in user (unknown role) on auth page, redirecting to /"
    );
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
