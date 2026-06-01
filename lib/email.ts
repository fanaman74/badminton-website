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
    // On free tier, Resend only allows sending to your account email
    // unless you verify a domain. Use RESEND_TEST_EMAIL to test, or verify
    // a domain at resend.com/domains and update the 'from' address
    const toEmail = process.env.RESEND_TEST_EMAIL || data.toEmail;

    const result = await client.emails.send({
      from: "VUB Smashers <onboarding@resend.dev>",
      to: toEmail,
      subject: `${copy.subject} — ${formatDate(data.session.date)}`,
      html: buildHtml(data),
    });

    if (result.error) {
      console.error("[email] Resend API error:", result.error);
    } else {
      console.log("[email] Sent to", toEmail, "(user:", data.toEmail + ")", "id:", result.data?.id);
    }
  } catch (err) {
    // Never throw — email is non-critical
    console.error("[email] Failed to send RSVP confirmation:", err);
  }
}
