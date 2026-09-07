"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getCurrentUserId, getCurrentUser } from "@/lib/auth";

export async function createSessionAction(
  _prevState: { error: string } | void | undefined,
  formData: FormData
): Promise<{ error: string } | void> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

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

  const rows = await sql`
    INSERT INTO sessions (date, location_name, location_maps_url, courts_booked, max_capacity, created_by)
    VALUES (${date}, ${locationName}, ${locationMapsUrl}, ${courtsBooked}, ${maxCapacity}, ${userId})
    RETURNING id;
  `;

  const newSessionId = rows[0]?.id;

  revalidatePath("/sessions");
  redirect(`/sessions/${newSessionId}`);
}

export async function updateSessionAction(
  sessionId: string,
  _prevState: { error?: string; success?: boolean } | void | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

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

  const date = new Date(`${dateStr}T${timeStr}Z`).toISOString();
  const maxCapacity = courtsBooked * 4;

  await sql`
    UPDATE sessions
    SET date = ${date},
        location_name = ${locationName},
        location_maps_url = ${locationMapsUrl},
        courts_booked = ${courtsBooked},
        max_capacity = ${maxCapacity}
    WHERE id = ${sessionId};
  `;

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${sessionId}`);
  return { success: true };
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

  await sql`
    UPDATE sessions
    SET status = ${status}
    WHERE id = ${sessionId};
  `;

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

  await sql`
    DELETE FROM sessions
    WHERE id = ${sessionId};
  `;

  revalidatePath("/sessions");
  revalidatePath("/history");
  revalidatePath(`/sessions/${sessionId}`);
  return { success: true };
}

export async function createRecurringSessionsAction(
  _prevState: { error?: string; success?: boolean; message?: string } | void | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean; message?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const startDateStr = formData.get("start_date") as string;
  const endDateStr = formData.get("end_date") as string;
  const timeStr = (formData.get("time") as string)?.trim() || "19:00";
  const locationName = (formData.get("location_name") as string)?.trim();
  const locationMapsUrl = (formData.get("location_maps_url") as string)?.trim() || null;
  const courtsBooked = parseInt(formData.get("courts_booked") as string, 10) || 3;
  const dayOfWeek = parseInt(formData.get("day_of_week") as string, 10); // 0=Mon, 3=Thu, etc.

  if (!startDateStr || !endDateStr || !locationName || isNaN(dayOfWeek)) {
    return { error: "Please fill in all required fields." };
  }

  const [h, m] = timeStr.split(":").map(Number);
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (start > end) {
    return { error: "Start date must be before end date." };
  }

  // dayOfWeek: 0=Mon...3=Thu...6=Sun
  // JS getUTCDay(): 0=Sun, 1=Mon, 4=Thu
  const targetJsDay = (dayOfWeek + 1) % 7;

  let current = new Date(start);
  while (current.getUTCDay() !== targetJsDay) {
    current.setUTCDate(current.getUTCDate() + 1);
  }

  let added = 0;
  let skipped = 0;

  while (current <= end) {
    const sessionDate = new Date(Date.UTC(
      current.getUTCFullYear(),
      current.getUTCMonth(),
      current.getUTCDate(),
      h, m, 0, 0
    ));

    const dayStart = new Date(sessionDate); dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(sessionDate); dayEnd.setUTCHours(23, 59, 59, 999);

    const existing = await sql`
      SELECT id FROM sessions
      WHERE date >= ${dayStart.toISOString()}
        AND date <= ${dayEnd.toISOString()}
      LIMIT 1;
    `;

    if (!existing || existing.length === 0) {
      await sql`
        INSERT INTO sessions (date, location_name, location_maps_url, courts_booked, max_capacity, created_by)
        VALUES (${sessionDate.toISOString()}, ${locationName}, ${locationMapsUrl}, ${courtsBooked}, ${courtsBooked * 4}, ${userId});
      `;
      added++;
    } else {
      skipped++;
    }

    current.setUTCDate(current.getUTCDate() + 7);
  }

  revalidatePath("/sessions");
  revalidatePath("/admin/sessions/new");
  return {
    success: true,
    message: `Successfully scheduled ${added} play dates! (${skipped} dates already existed)`,
  };
}

