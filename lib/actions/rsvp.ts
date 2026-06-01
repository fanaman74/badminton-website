"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { sendRsvpConfirmationEmail } from "@/lib/email";
import type { RsvpStatus } from "@/types/database";

export async function updateRsvp(
  sessionId: string,
  newStatus: "IN" | "OUT" | "MAYBE"
): Promise<{ error?: string; status?: RsvpStatus }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();

  // Fetch session details (needed for capacity check + email)
  const { data: session } = await supabase
    .from("sessions")
    .select("max_capacity, date, location_name, location_maps_url, courts_booked")
    .eq("id", sessionId)
    .single();

  if (!session) return { error: "Session not found" };

  const { max_capacity, date, location_name, location_maps_url, courts_booked } =
    session as {
      max_capacity: number;
      date: string;
      location_name: string;
      location_maps_url: string | null;
      courts_booked: number;
    };

  // Count current IN players (excluding this user)
  const { count: currentInCount } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("status", "IN")
    .neq("user_id", userId);

  const inCount = currentInCount ?? 0;

  let finalStatus: RsvpStatus = newStatus;
  if (newStatus === "IN" && inCount >= max_capacity) {
    finalStatus = "WAITLIST";
  }

  const { error } = await supabase.from("rsvps").upsert(
    { user_id: userId, session_id: sessionId, status: finalStatus },
    { onConflict: "user_id,session_id" }
  );

  if (error) return { error: error.message };

  // If user left IN, try to promote first WAITLIST person
  if (newStatus !== "IN") {
    if (inCount < max_capacity) {
      const { data: firstWaitlisted } = await supabase
        .from("rsvps")
        .select("id, user_id")
        .eq("session_id", sessionId)
        .eq("status", "WAITLIST")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (firstWaitlisted) {
        const fw = firstWaitlisted as { id: string; user_id: string };
        await supabase
          .from("rsvps")
          .update({ status: "IN" as RsvpStatus })
          .eq("id", fw.id);

        // Email the promoted player
        const { data: promotedProfile } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("id", fw.user_id)
          .single();

        if (promotedProfile?.email) {
          sendRsvpConfirmationEmail({
            toEmail: promotedProfile.email,
            toName: promotedProfile.name,
            status: "IN",
            session: {
              date,
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

  // Send confirmation email to the user who just RSVPed
  // Only email for IN, WAITLIST, MAYBE — not for OUT (cancellation)
  if (finalStatus !== "OUT") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", userId)
      .single();

    if (profile?.email) {
      sendRsvpConfirmationEmail({
        toEmail: profile.email,
        toName: profile.name,
        status: finalStatus as "IN" | "MAYBE" | "WAITLIST",
        session: {
          date,
          locationName: location_name,
          locationMapsUrl: location_maps_url,
          courtsBooked: courts_booked,
          maxCapacity: max_capacity,
        },
        sessionId,
      });
    }
  }

  return { status: finalStatus };
}
