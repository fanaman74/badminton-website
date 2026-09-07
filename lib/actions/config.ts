"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
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

  await sql`
    INSERT INTO team_config (id, day_of_week, courts, start_time, location_name, location_maps_url, updated_at)
    VALUES (1, ${day_of_week}, ${courts}, ${start_time}, ${location_name}, ${location_maps_url}, NOW())
    ON CONFLICT (id)
    DO UPDATE SET
      day_of_week = EXCLUDED.day_of_week,
      courts = EXCLUDED.courts,
      start_time = EXCLUDED.start_time,
      location_name = EXCLUDED.location_name,
      location_maps_url = EXCLUDED.location_maps_url,
      updated_at = NOW();
  `;

  revalidatePath("/admin/config");
  revalidatePath("/admin/sessions/new");
  return { success: true };
}

export async function createNextSessionAction(dateStr?: string): Promise<{ error?: string; id?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Not authorized." };

  const configs = await sql`
    SELECT *
    FROM team_config
    WHERE id = 1
    LIMIT 1;
  `;

  if (!configs || configs.length === 0) return { error: "No config found. Save your court configuration first." };
  const config = configs[0] as {
    day_of_week: number;
    courts: number;
    start_time: string;
    location_name: string;
    location_maps_url: string | null;
  };

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

  const existingRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM sessions
    WHERE date >= ${dayStart.toISOString()}
      AND date <= ${dayEnd.toISOString()};
  `;

  if (existingRows && existingRows[0]?.count > 0) {
    return { error: "A session already exists on that date." };
  }

  const rows = await sql`
    INSERT INTO sessions (date, location_name, location_maps_url, courts_booked, max_capacity, created_by)
    VALUES (${sessionDate.toISOString()}, ${config.location_name}, ${config.location_maps_url}, ${config.courts}, ${config.courts * 4}, ${user.id})
    RETURNING id;
  `;

  revalidatePath("/sessions");
  return { id: rows[0]?.id as string };
}
