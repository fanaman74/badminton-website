import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateSessionToken } from "@/lib/auth";


const SESSION_COOKIE_NAME = "badminton_session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const isDemo = searchParams.get("demo") === "true";
  const returnTo = searchParams.get("state") || "/sessions";
  const origin = request.nextUrl.origin;

  let email: string | null = null;
  let name: string | null = null;

  try {
    if (provider === "google") {
      if (code && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        // Exchange code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${origin}/api/auth/callback/google`,
            grant_type: "authorization_code",
          }),
        });
        const tokenData = await tokenRes.json();

        if (tokenData.access_token) {
          const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          const userData = await userRes.json();
          email = userData.email?.toLowerCase();
          name = userData.name;
        }
      } else if (isDemo) {
        // Quick demo login when API credentials are not yet configured in production
        email = "google.user@example.com";
        name = "Google Player";
      }
    } else if (provider === "facebook") {
      if (code && (process.env.FACEBOOK_APP_ID || process.env.FACEBOOK_CLIENT_ID) && process.env.FACEBOOK_CLIENT_SECRET) {
        const appId = process.env.FACEBOOK_APP_ID || process.env.FACEBOOK_CLIENT_ID!;
        const appSecret = process.env.FACEBOOK_CLIENT_SECRET!;
        const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?` + new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: `${origin}/api/auth/callback/facebook`,
          code,
        }));
        const tokenData = await tokenRes.json();

        if (tokenData.access_token) {
          const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`);
          const userData = await userRes.json();
          email = userData.email?.toLowerCase() || `fb_${userData.id}@facebook.com`;
          name = userData.name;
        }
      } else if (isDemo) {
        email = "facebook.user@example.com";
        name = "Facebook Player";
      }
    }

    if (!email) {
      return NextResponse.redirect(new URL("/auth?error=Unable to retrieve user information from provider", origin));
    }

    // Match or create profile
    const existing = await sql`
      SELECT id FROM profiles WHERE LOWER(email) = ${email} LIMIT 1;
    `;

    let userId: string;
    if (existing && existing.length > 0) {
      userId = existing[0].id as string;
    } else {
      const playerName = name || email.split("@")[0];
      const inserted = await sql`
        INSERT INTO profiles (name, email, role)
        VALUES (${playerName}, ${email}, 'PLAYER')
        RETURNING id;
      `;
      userId = inserted[0]?.id as string;
    }

    // Create session token in database
    const sessionToken = generateSessionToken();
    await sql`
      INSERT INTO user_sessions (user_id, token)
      VALUES (${userId}, ${sessionToken});
    `;

    // Set session cookie and redirect
    const response = NextResponse.redirect(new URL(returnTo, origin));
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/auth?error=Authentication failed. Please try again.", origin));
  }
}
