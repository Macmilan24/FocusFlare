// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    console.error(
      "AUTH_SECRET is not set in the environment. Middleware cannot verify token."
    );
  }

  const token = await getToken({
    req,
    secret,
  });

  console.log("Middleware token:", token);

  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    return Response.redirect(url);
  }

  if (
    isLoggedIn &&
    (pathname.startsWith("/auth/signin") ||
      pathname.startsWith("/auth/register"))
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard"; // Assuming /dashboard is your main authenticated route
    return Response.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
