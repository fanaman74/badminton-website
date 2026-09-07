"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getCurrentUserId, getCurrentUser } from "@/lib/auth";
import { sendRsvpConfirmationEmail } from "@/lib/email";
import type { RsvpStatus } from "@/types/database";

export async function updateRsvp(
  sessionId: string,
  newStatus: "IN" | "OUT" | "MAYBE"
): Promise<{ error?: string; status?: RsvpStatus }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  // Fetch session details (needed for capacity check + email)
  const sessionRows = await sql`
    SELECT max_capacity, date, location_name, location_maps_url, courts_booked
    FROM sessions
    WHERE id = ${sessionId}
    LIMIT 1;
  `;

  if (!sessionRows || sessionRows.length === 0) {
    return { error: "Session not found" };
  }

  const session = sessionRows[0] as {
    max_capacity: number;
    date: string;
    location_name: string;
    location_maps_url: string | null;
    courts_booked: number;
  };

  const { max_capacity, date, location_name, location_maps_url, courts_booked } = session;

  // Count current IN players (excluding this user)
  const countRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM rsvps
    WHERE session_id = ${sessionId}
      AND status = 'IN'
      AND user_id != ${userId};
  `;

  const inCount = countRows[0]?.count ?? 0;

  let finalStatus: RsvpStatus = newStatus;
  if (newStatus === "IN" && inCount >= max_capacity) {
    finalStatus = "WAITLIST";
  }

  // Upsert RSVP
  await sql`
    INSERT INTO rsvps (user_id, session_id, status)
    VALUES (${userId}, ${sessionId}, ${finalStatus})
    ON CONFLICT (user_id, session_id)
    DO UPDATE SET status = EXCLUDED.status;
  `;

  // If user left IN, try to promote first WAITLIST person
  if (newStatus !== "IN") {
    if (inCount < max_capacity) {
      const waitlistRows = await sql`
        SELECT id, user_id
        FROM rsvps
        WHERE session_id = ${sessionId}
          AND status = 'WAITLIST'
        ORDER BY created_at ASC
        LIMIT 1;
      `;

      if (waitlistRows && waitlistRows.length > 0) {
        const fw = waitlistRows[0] as { id: string; user_id: string };
        await sql`
          UPDATE rsvps
          SET status = 'IN'
          WHERE id = ${fw.id};
        `;

        // Email the promoted player
        const promotedRows = await sql`
          SELECT name, email
          FROM profiles
          WHERE id = ${fw.user_id}
          LIMIT 1;
        `;

        const promotedProfile = promotedRows[0] as { name: string; email: string | null } | undefined;

        if (promotedProfile?.email) {
          await sendRsvpConfirmationEmail({
            toEmail: promotedProfile.email,
            toName: promotedProfile.name,
            status: "IN",
            session: {
              date: new Date(date).toISOString(),
              locationName: location_name,
              locationMapsUrl: location_maps_url,
              courtsBooked: courts_booked,
              maxCapacity: max_capacity,
            },
            sessionId,
          });
        }
      }
    }
  }

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/sessions");

  // Send confirmation email to the user for any RSVP change
  const profileRows = await sql`
    SELECT name, email
    FROM profiles
    WHERE id = ${userId}
    LIMIT 1;
  `;

  const profile = profileRows[0] as { name: string; email: string | null } | undefined;

  if (profile?.email) {
    await sendRsvpConfirmationEmail({
      toEmail: profile.email,
      toName: profile.name,
      status: finalStatus as "IN" | "OUT" | "MAYBE" | "WAITLIST",
      session: {
        date: new Date(date).toISOString(),
        locationName: location_name,
        locationMapsUrl: location_maps_url,
        courtsBooked: courts_booked,
        maxCapacity: max_capacity,
      },
      sessionId,
    });
  }

  return { status: finalStatus };
}

export async function adminRemoveRsvpAction(
  sessionId: string,
  targetUserId: string
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const rsvpRows = await sql`
    SELECT status FROM rsvps
    WHERE session_id = ${sessionId} AND user_id = ${targetUserId}
    LIMIT 1;
  `;

  const prevStatus = rsvpRows[0]?.status;

  await sql`
    DELETE FROM rsvps
    WHERE session_id = ${sessionId} AND user_id = ${targetUserId};
  `;

  if (prevStatus === "IN") {
    const waitlistRows = await sql`
      SELECT user_id
      FROM rsvps
      WHERE session_id = ${sessionId} AND status = 'WAITLIST'
      ORDER BY created_at ASC
      LIMIT 1;
    `;

    if (waitlistRows.length > 0) {
      await sql`
        UPDATE rsvps
        SET status = 'IN'
        WHERE session_id = ${sessionId} AND user_id = ${waitlistRows[0].user_id};
      `;
    }
  }

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/history");
  return { success: true };
}
