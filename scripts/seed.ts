/**
 * Seed script — dev-only. Creates 5 players, 2 sessions, and sample RSVPs.
 * Run: npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const players = [
  { name: "Admin Alex", role: "ADMIN" },
  { name: "Ben Tan", role: "PLAYER" },
  { name: "Clara Lim", role: "PLAYER" },
  { name: "David Koh", role: "PLAYER" },
  { name: "Emma Wong", role: "PLAYER" },
];

function nextWeekend(offset = 0): Date {
  const d = new Date();
  const day = d.getDay();
  const daysUntilSat = (6 - day + 7 * offset) % 7 || 7 + 7 * offset;
  d.setDate(d.getDate() + daysUntilSat);
  d.setHours(19, 0, 0, 0);
  return d;
}

async function seed() {
  console.log("🌱 Seeding database...\n");

  const userIds: string[] = [];

  // Create profiles
  for (const player of players) {
    const userId = randomUUID();
    const { error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        name: player.name,
        role: player.role,
      });

    if (error) {
      console.error(`  ✗ Failed to create ${player.name}:`, error.message);
      continue;
    }

    userIds.push(userId);
    console.log(`  ✓ Created player: ${player.name} (${player.role})`);
  }

  // Create 2 sessions
  const session1Date = nextWeekend(0);
  const session2Date = nextWeekend(1);

  const adminId = userIds[0];

  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .insert([
      {
        date: session1Date.toISOString(),
        location_name: "Kallang Squash & Tennis Centre",
        location_maps_url: null,
        courts_booked: 2,
        max_capacity: 8,
        created_by: adminId,
      },
      {
        date: session2Date.toISOString(),
        location_name: "Clementi Sports Hall",
        location_maps_url: null,
        courts_booked: 1,
        max_capacity: 4,
        created_by: adminId,
      },
    ])
    .select("id");

  if (sessionsError) {
    console.error("  ✗ Failed to create sessions:", sessionsError.message);
    return;
  }

  console.log(`\n  ✓ Created ${sessions!.length} sessions`);

  const [s1, s2] = sessions!;

  // RSVPs for session 1 (2 courts, max 8): 5 IN, 1 MAYBE
  const s1Rsvps = [
    { user_id: userIds[0], status: "IN" },
    { user_id: userIds[1], status: "IN" },
    { user_id: userIds[2], status: "IN" },
    { user_id: userIds[3], status: "IN" },
    { user_id: userIds[4], status: "MAYBE" },
  ];

  // RSVPs for session 2 (1 court, max 4): 4 IN (full), 1 WAITLIST
  const s2Rsvps = [
    { user_id: userIds[0], status: "IN" },
    { user_id: userIds[1], status: "IN" },
    { user_id: userIds[2], status: "IN" },
    { user_id: userIds[3], status: "IN" },
    { user_id: userIds[4], status: "WAITLIST" },
  ];

  await supabase.from("rsvps").insert(
    s1Rsvps.map((r) => ({ ...r, session_id: s1.id }))
  );
  await supabase.from("rsvps").insert(
    s2Rsvps.map((r) => ({ ...r, session_id: s2.id }))
  );

  console.log("  ✓ Created RSVPs\n");
  console.log("✅ Seed complete!\n");
  console.log("To log in:");
  console.log("  1. Visit http://localhost:3000/auth");
  console.log("  2. Enter invite code: smash2024");
  console.log("  3. You'll be assigned a random player (or create a new one)");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
