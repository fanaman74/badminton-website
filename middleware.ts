import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "badminton_session";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/you", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = pathname.startsWith("/auth");

  // If user is trying to access a protected route without session, redirect to auth with returnTo
  if (!sessionToken && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  // If user is logged in and visits auth page, redirect to returnTo or /sessions
  if (sessionToken && isAuthRoute) {
    const returnTo = request.nextUrl.searchParams.get("returnTo") || "/sessions";
    const url = request.nextUrl.clone();
    url.pathname = returnTo;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // If accessing root /, rewrite or redirect to /sessions
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/sessions";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
