import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export default async function middleware(req) {
  // Use getToken to verify your token in Edge-friendly code.
  const token = await getToken({ req });
  console.log("Middleware token:", token);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
