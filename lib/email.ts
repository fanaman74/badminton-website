import { Resend } from "resend";

// Lazily initialised so a missing key doesn't crash the module at import time
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

interface SessionEmailData {
  toEmail: string;
  toName: string;
  status: "IN" | "MAYBE" | "OUT" | "WAITLIST";
  session: {
    date: string; // ISO string
    locationName: string;
    locationMapsUrl: string | null;
    courtsBooked: number;
    maxCapacity: number;
  };
  sessionId: string;
}

const STATUS_COPY = {
  IN: {
    subject: "You're in! 🏸",
    headline: "You're confirmed!",
    badge: "#1FA463",
    badgeText: "Going",
    intro: "Great news — your spot is secured. See you on the court!",
  },
  WAITLIST: {
    subject: "You're on the waitlist 🏸",
    headline: "You're on the waitlist",
    badge: "#E08A1E",
    badgeText: "Waitlisted",
    intro: "The session is full right now, but you're on the waitlist. We'll email you if a spot opens up.",
  },
  MAYBE: {
    subject: "RSVP saved: Maybe 🏸",
    headline: "Marked as maybe",
    badge: "#E08A1E",
    badgeText: "Maybe",
    intro: "No worries — we've noted you as a maybe. Update your RSVP any time before the session.",
  },
  OUT: {
    subject: "RSVP saved: Not going 🏸",
    headline: "You're not going",
    badge: "#D8463B",
    badgeText: "Not going",
    intro: "No problem — we've noted you as not attending. Hope to see you next time!",
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC",
  });
}

function buildHtml(data: SessionEmailData): string {
  const copy = STATUS_COPY[data.status];
  const date = formatDate(data.session.date);
  const time = formatTime(data.session.date);
  const mapLink = data.session.locationMapsUrl
    ? `<a href="${data.session.locationMapsUrl}" style="color:#FF5A1F;text-decoration:none;font-weight:600;">View on Google Maps →</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1EFE6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1EFE6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E9E5D8;">

        <!-- Header bar -->
        <tr>
          <td style="background:#17150F;padding:24px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#C6F03C;">
                    🏸 VUB Smashers
                  </span><br>
                  <span style="font-size:22px;font-weight:800;color:#F1EFE6;letter-spacing:-0.02em;line-height:1.2;">
                    ${copy.headline}
                  </span>
                </td>
                <td align="right" style="vertical-align:top;">
                  <span style="display:inline-block;background:${copy.badge};color:#fff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:999px;">
                    ${copy.badgeText}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px 28px;">
            <p style="margin:0 0 20px;font-size:15px;color:#4A4535;line-height:1.6;">
              Hey ${data.toName.split(" ")[0]},<br><br>
              ${copy.intro}
            </p>

            <!-- Session details card -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#F8F6EF;border-radius:14px;border:1px solid #E9E5D8;overflow:hidden;margin-bottom:20px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#A8A18C;">
                    Session details
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                    <!-- Date -->
                    <tr>
                      <td style="padding:5px 0;width:20px;vertical-align:top;">
                        <span style="font-size:16px;">📅</span>
                      </td>
                      <td style="padding:5px 0 5px 10px;">
                        <span style="font-size:14px;font-weight:600;color:#17150F;">${date}</span>
                      </td>
                    </tr>
                    <!-- Time -->
                    <tr>
                      <td style="padding:5px 0;vertical-align:top;">
                        <span style="font-size:16px;">⏰</span>
                      </td>
                      <td style="padding:5px 0 5px 10px;">
                        <span style="font-size:14px;font-weight:600;color:#17150F;">${time}</span>
                      </td>
                    </tr>
                    <!-- Location -->
                    <tr>
                      <td style="padding:5px 0;vertical-align:top;">
                        <span style="font-size:16px;">📍</span>
                      </td>
                      <td style="padding:5px 0 5px 10px;">
                        <span style="font-size:14px;font-weight:600;color:#17150F;">${data.session.locationName}</span>
                        ${mapLink ? `<br><span style="font-size:13px;">${mapLink}</span>` : ""}
                      </td>
                    </tr>
                    <!-- Courts -->
                    <tr>
                      <td style="padding:5px 0;vertical-align:top;">
                        <span style="font-size:16px;">🏸</span>
                      </td>
                      <td style="padding:5px 0 5px 10px;">
                        <span style="font-size:14px;font-weight:600;color:#17150F;">
                          ${data.session.courtsBooked} court${data.session.courtsBooked > 1 ? "s" : ""} booked · max ${data.session.maxCapacity} players
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#7C7560;line-height:1.6;">
              You can update your availability any time in the app.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8F6EF;border-top:1px solid #E9E5D8;padding:16px 28px;text-align:center;">
            <span style="font-size:11px;color:#A8A18C;">VUB Smashers · Brussels Badminton</span>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendRsvpConfirmationEmail(data: SessionEmailData): Promise<void> {
  const client = getResend();
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return;
  }

  const copy = STATUS_COPY[data.status];

  try {
    const result = await client.emails.send({
      from: "VUB Smashers <notifications@cordis-explorer.eu>",
      to: data.toEmail,
      subject: `${copy.subject} — ${formatDate(data.session.date)}`,
      html: buildHtml(data),
    });

    if (result.error) {
      console.error("[email] Resend API error:", result.error);
    } else {
      console.log("[email] Sent RSVP confirmation to", data.toEmail, "id:", result.data?.id);
    }
  } catch (err) {
    // Never throw — email is non-critical
    console.error("[email] Failed to send RSVP confirmation:", err);
  }
}

export async function sendOtpEmail(
  toEmail: string,
  code: string,
  toName?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getResend();
  const displayName = toName || toEmail.split("@")[0];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; background:#060C1C; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#FFFFFF; }
    .container { max-width:480px; margin:0 auto; padding:32px 20px; }
    .card { background:#0F1A30; border-radius:16px; border:1px solid rgba(198,240,60,0.22); padding:32px 24px; text-align:center; }
    .logo { font-size:38px; margin-bottom:12px; }
    .title { font-size:22px; font-weight:800; margin:0 0 8px; color:#FFFFFF; }
    .sub { font-size:14px; color:#94A3B8; margin:0 0 24px; line-height:1.5; }
    .code-box { background:#060C1C; border:2px dashed #C6F03C; border-radius:12px; padding:16px 24px; font-size:34px; font-weight:900; letter-spacing:8px; color:#C6F03C; display:inline-block; margin-bottom:24px; font-family:monospace; }
    .footer { font-size:12px; color:#64748B; margin-top:24px; line-height:1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">🏸</div>
      <h1 class="title">VUB Smashers</h1>
      <p class="sub">Hello <strong>${displayName}</strong>,<br>Here is your verification code to sign in:</p>
      <div class="code-box">${code}</div>
      <p class="sub" style="font-size:13px; margin:0;">This code will expire in <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
      <div class="footer">
        🏸 VUB Smashers Badminton Club · Brussels, Belgium
      </div>
    </div>
  </div>
</body>
</html>`;

  if (!client) {
    console.warn(`[email] RESEND_API_KEY not set — OTP for ${toEmail}: ${code}`);
    return { success: true };
  }

  try {
    const result = await client.emails.send({
      from: "VUB Smashers <notifications@cordis-explorer.eu>",
      to: toEmail,
      subject: `🏸 Your verification code: ${code}`,
      html,
    });

    if (result.error) {
      console.error("[email] Resend error:", result.error);
      return { success: false, error: result.error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("[email] Failed to send OTP email:", err);
    return { success: false, error: err?.message || "Failed to send email" };
  }
}

export interface BatchSessionItem {
  date: string;
  locationName: string;
  locationMapsUrl?: string | null;
  status: "IN" | "WAITLIST";
}

export async function sendBatchRsvpConfirmationEmail({
  toEmail,
  toName,
  sessions,
}: {
  toEmail: string;
  toName: string;
  sessions: BatchSessionItem[];
}): Promise<{ success: boolean; error?: string }> {
  const client = getResend();
  const firstName = toName.split(" ")[0] || "Player";
  const count = sessions.length;

  const rowsHtml = sessions
    .map((s) => {
      const d = formatDate(s.date);
      const t = formatTime(s.date);
      const isWait = s.status === "WAITLIST";
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #E9E5D8;font-size:13.5px;color:#17150F;">
            <strong>${d}</strong><br>
            <span style="color:#78715E;font-size:12.5px;">⏰ ${t} · 📍 ${s.locationName}</span>
          </td>
          <td align="right" style="padding:10px 12px;border-bottom:1px solid #E9E5D8;vertical-align:middle;">
            <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;background:${
              isWait ? "#E08A1E" : "#1FA463"
            };color:#fff;">
              ${isWait ? "Waitlist" : "Accepted"}
            </span>
          </td>
        </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1EFE6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1EFE6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E9E5D8;">
        <tr>
          <td style="background:#17150F;padding:24px 28px;">
            <span style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#C6F03C;">
              🏸 VUB Smashers
            </span><br>
            <span style="font-size:22px;font-weight:800;color:#F1EFE6;letter-spacing:-0.02em;line-height:1.2;">
              You're added to ${count} session${count > 1 ? "s" : ""}!
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px;">
            <p style="margin:0 0 20px;font-size:15px;color:#4A4535;line-height:1.6;">
              Hey ${firstName},<br><br>
              You have successfully accepted and joined the following badminton sessions:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F6EF;border-radius:14px;border:1px solid #E9E5D8;overflow:hidden;margin-bottom:20px;">
              ${rowsHtml}
            </table>
            <p style="margin:0;font-size:13.5px;color:#78715E;line-height:1.5;">
              You can review or change your responses at any time in the <strong>You</strong> section of the website.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#F8F6EF;padding:16px 28px;border-top:1px solid #E9E5D8;text-align:center;">
            <p style="margin:0;font-size:12px;color:#A8A18C;">
              🏸 VUB Smashers Badminton Club · Brussels, Belgium
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  if (!client) {
    console.warn(`[email] RESEND_API_KEY not set — batch RSVP email for ${toEmail}: ${count} sessions`);
    return { success: true };
  }

  try {
    const result = await client.emails.send({
      from: "VUB Smashers <notifications@cordis-explorer.eu>",
      to: toEmail,
      subject: `🏸 You're confirmed for ${count} playing session${count > 1 ? "s" : ""}!`,
      html,
    });
    if (result.error) {
      console.error("[email] Batch RSVP Resend error:", result.error);
      return { success: false, error: result.error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("[email] Failed to send batch RSVP email:", err);
    return { success: false, error: err?.message || "Failed to send email" };
  }
}


