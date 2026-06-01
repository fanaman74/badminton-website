import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "badminton_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth") || pathname.startsWith("/setup");

  // Check for session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // If no session and not on auth page, redirect to auth
  if (!sessionToken && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // If has session and on auth page, redirect to sessions
  if (sessionToken && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/sessions";
    return NextResponse.redirect(url);
  }

  // If trying to access root, redirect to sessions
  if (sessionToken && pathname === "/") {
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
