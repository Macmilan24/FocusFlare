import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;

  const token = await getToken({ req, secret });

  console.log("[MIDDLEWARE] Pathname:", req.nextUrl.pathname);
  console.log("[MIDDLEWARE] Decoded Token:", token);

  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  // --- REDIRECT LOGGED-IN USERS FROM ROOT OR OLD DASHBOARD TO ROLE-SPECIFIC OVERVIEW ---
  if (
    isLoggedIn &&
    (pathname === "/" ||
      pathname === "/parent/home") /* handle old path if it exists briefly */
  ) {
    if (token.role === Role.PARENT) {
      console.log(
        "[MIDDLEWARE] Redirecting PARENT from root/old-home to /parent/overview"
      );
      return NextResponse.redirect(new URL("/parent/overview", req.url));
    } else if (token.role === Role.CHILD) {
      console.log("[MIDDLEWARE] Redirecting CHILD from root to /kid/home");
      return NextResponse.redirect(new URL("/kid/home", req.url));
    } else {
      return NextResponse.next();
    }
  }

  // --- PROTECT PLATFORM-SPECIFIC ROUTES ---

  const isPlatformRoute =
    pathname.startsWith("/parent") || pathname.startsWith("/kid");

  if (isPlatformRoute && !isLoggedIn) {
    console.log(
      "[MIDDLEWARE] User not logged in, redirecting to signin from protected route:",
      pathname
    );
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // --- ROLE-BASED ACCESS CONTROL FOR PLATFORM ROUTES (Optional but good practice) ---
  if (isLoggedIn && isPlatformRoute) {
    if (pathname.startsWith("/parent") && token.role !== Role.PARENT) {
      console.log(
        "[MIDDLEWARE] Non-PARENT trying to access PARENT route. Redirecting."
      );
      return NextResponse.redirect(new URL("/kid/home", req.url));
    }
    if (pathname.startsWith("/kid") && token.role !== Role.CHILD) {
      return NextResponse.redirect(new URL("/parent/overview", req.url));
    }
  }

  // --- REDIRECT LOGGED-IN USERS AWAY FROM AUTH PAGES (SIGNIN/REGISTER) ---
  if (
    isLoggedIn &&
    (pathname.startsWith("/auth/signin") ||
      pathname.startsWith("/auth/register"))
  ) {
    if (token.role === Role.PARENT) {
      return NextResponse.redirect(new URL("/parent/overview", req.url));
    } else if (token.role === Role.CHILD) {
      return NextResponse.redirect(new URL("/kid/home", req.url));
    } else {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/"],
};
