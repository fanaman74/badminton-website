"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function saveTeamConfigAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Not authorized." };

  const day_of_week = parseInt(formData.get("day_of_week") as string, 10);
  const courts = parseInt(formData.get("courts") as string, 10);
  const start_time = formData.get("start_time") as string;
  const location_name = (formData.get("location_name") as string).trim();
  const location_maps_url = (formData.get("location_maps_url") as string).trim() || null;

  if (isNaN(day_of_week) || isNaN(courts) || !start_time) {
    return { error: "Please fill in all required fields." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("team_config").upsert({
    id: 1,
    day_of_week,
    courts,
    start_time,
    location_name,
    location_maps_url,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/config");
  revalidatePath("/admin/sessions/new");
  return { success: true };
}

export async function createNextSessionAction(dateStr?: string): Promise<{ error?: string; id?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Not authorized." };

  const supabase = await createClient();

  const { data: config } = await supabase
    .from("team_config")
    .select("*")
    .eq("id", 1)
    .single();

  if (!config) return { error: "No config found. Save your court configuration first." };
  if (!config.location_name) return { error: "Set a default location before creating sessions." };

  const [h, m] = config.start_time.split(":").map(Number);
  let sessionDate: Date;

  if (dateStr) {
    // Admin picked a specific date (YYYY-MM-DD)
    const [year, month, day] = dateStr.split("-").map(Number);
    sessionDate = new Date(Date.UTC(year, month - 1, day, h, m, 0, 0));
  } else {
    // Find next occurrence of the configured weekday
    // day_of_week: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    // JS getDay():  0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const jsDay = (config.day_of_week + 1) % 7;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayJs = today.getDay();
    let daysAhead = (jsDay - todayJs + 7) % 7;
    if (daysAhead === 0) daysAhead = 7;
    sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() + daysAhead);
    sessionDate.setUTCHours(h, m, 0, 0);
  }

  // Check for existing session on the same calendar day
  const dayStart = new Date(sessionDate); dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd   = new Date(sessionDate); dayEnd.setUTCHours(23, 59, 59, 999);
  const { count: existing } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .gte("date", dayStart.toISOString())
    .lte("date", dayEnd.toISOString());
  if (existing && existing > 0) {
    return { error: "A session already exists on that date." };
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      date: sessionDate.toISOString(),
      location_name: config.location_name,
      location_maps_url: config.location_maps_url,
      courts_booked: config.courts,
      max_capacity: config.courts * 4,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/sessions");
  return { id: (data as { id: string }).id };
}
