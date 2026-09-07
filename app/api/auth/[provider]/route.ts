import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("returnTo") || "/sessions";

  const origin = request.nextUrl.origin;
  const callbackUrl = `${origin}/api/auth/callback/${provider}`;

  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId) {
      const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      googleAuthUrl.searchParams.set("client_id", clientId);
      googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
      googleAuthUrl.searchParams.set("response_type", "code");
      googleAuthUrl.searchParams.set("scope", "openid email profile");
      googleAuthUrl.searchParams.set("state", returnTo);
      googleAuthUrl.searchParams.set("prompt", "select_account");
      return NextResponse.redirect(googleAuthUrl.toString());
    }

    // Direct OAuth redirect through callback (demo/preview mode when OAuth keys are pending)
    const previewUrl = new URL(callbackUrl);
    previewUrl.searchParams.set("demo", "true");
    previewUrl.searchParams.set("state", returnTo);
    return NextResponse.redirect(previewUrl.toString());
  }

  if (provider === "facebook") {
    const appId = process.env.FACEBOOK_APP_ID || process.env.FACEBOOK_CLIENT_ID;
    if (appId) {
      const fbAuthUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
      fbAuthUrl.searchParams.set("client_id", appId);
      fbAuthUrl.searchParams.set("redirect_uri", callbackUrl);
      fbAuthUrl.searchParams.set("response_type", "code");
      fbAuthUrl.searchParams.set("scope", "email,public_profile");
      fbAuthUrl.searchParams.set("state", returnTo);
      return NextResponse.redirect(fbAuthUrl.toString());
    }

    // Direct OAuth redirect through callback (demo/preview mode when OAuth keys are pending)
    const previewUrl = new URL(callbackUrl);
    previewUrl.searchParams.set("demo", "true");
    previewUrl.searchParams.set("state", returnTo);
    return NextResponse.redirect(previewUrl.toString());
  }

  return NextResponse.redirect(new URL(`/auth?error=Unsupported provider ${provider}`, origin));
}
