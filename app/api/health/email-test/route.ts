import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkSenderDomain, getEmailConfig, sendTestEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Admin-only email diagnostic. Open it in the browser while signed in as an admin:
 * it reports the email configuration, whether the sender domain is verified in
 * Resend, and the exact reply from a real test send to the admin's own address.
 * It only ever emails the signed-in admin, so it cannot be used as an open relay.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "Your profile has no email address" }, { status: 400 });
  }

  const config = getEmailConfig();
  const senderDomain = await checkSenderDomain();
  const send = await sendTestEmail(user.email);

  return NextResponse.json(
    { sentTo: user.email, config, senderDomain, send },
    { status: send.success ? 200 : 500 }
  );
}