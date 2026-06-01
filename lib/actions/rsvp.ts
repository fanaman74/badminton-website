"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import type { RsvpStatus } from "@/types/database";

export async function updateRsvp(
  sessionId: string,
  newStatus: "IN" | "OUT" | "MAYBE"
): Promise<{ error?: string; status?: RsvpStatus }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("max_capacity")
    .eq("id", sessionId)
    .single();

  if (!session) return { error: "Session not found" };

  const maxCapacity = (session as { max_capacity: number }).max_capacity;

  const { count: currentInCount } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("status", "IN")
    .neq("user_id", userId);

  const inCount = currentInCount ?? 0;

  let finalStatus: RsvpStatus = newStatus;
  if (newStatus === "IN" && inCount >= maxCapacity) {
    finalStatus = "WAITLIST";
  }

  const { error } = await supabase.from("rsvps").upsert(
    { user_id: userId, session_id: sessionId, status: finalStatus },
    { onConflict: "user_id,session_id" }
  );

  if (error) return { error: error.message };

  // If user left IN, try to promote first WAITLIST person
  if (newStatus !== "IN") {
    if (inCount < maxCapacity) {
      const { data: firstWaitlisted } = await supabase
        .from("rsvps")
        .select("id")
        .eq("session_id", sessionId)
        .eq("status", "WAITLIST")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (firstWaitlisted) {
        await supabase
          .from("rsvps")
          .update({ status: "IN" as RsvpStatus })
          .eq("id", (firstWaitlisted as { id: string }).id);
      }
    }
  }

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/sessions");

  return { status: finalStatus };
}
