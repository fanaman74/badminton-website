"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, getCurrentUser } from "@/lib/auth";

export async function createSessionAction(
  _prevState: { error: string } | void | undefined,
  formData: FormData
): Promise<{ error: string } | void> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  const locationName = formData.get("location_name") as string;
  const locationMapsUrl = (formData.get("location_maps_url") as string) || null;
  const courtsBooked = parseInt(formData.get("courts_booked") as string, 10);

  if (!dateStr || !timeStr || !locationName || isNaN(courtsBooked) || courtsBooked < 1) {
    return { error: "Please fill in all required fields." };
  }

  // Store exactly what the admin typed — server runs UTC so no conversion needed
  const date = new Date(`${dateStr}T${timeStr}Z`).toISOString();
  const maxCapacity = courtsBooked * 4;

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      date,
      location_name: locationName,
      location_maps_url: locationMapsUrl,
      courts_booked: courtsBooked,
      max_capacity: maxCapacity,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/sessions");
  redirect(`/sessions/${(data as { id: string }).id}`);
}

export async function updateSessionStatusAction(
  sessionId: string,
  status: "COMPLETED" | "CANCELLED"
): Promise<{ error?: string; success?: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("sessions")
    .update({ status })
    .eq("id", sessionId);

  if (error) return { error: error.message };

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${sessionId}`);

  return { success: true };
}

export async function deleteSessionAction(
  sessionId: string
): Promise<{ error?: string; success?: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  if (error) return { error: error.message };

  revalidatePath("/sessions");
  return { success: true };
}
