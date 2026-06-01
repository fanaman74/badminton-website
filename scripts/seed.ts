/**
 * Seed script — dev-only. Creates 5 users, 2 sessions, and sample RSVPs.
 * Run: npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";
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
  { name: "Admin Alex", email: "admin@team.com", password: "Admin1234!", role: "ADMIN" },
  { name: "Ben Tan", email: "ben@team.com", password: "Player1234!", role: "PLAYER" },
  { name: "Clara Lim", email: "clara@team.com", password: "Player1234!", role: "PLAYER" },
  { name: "David Koh", email: "david@team.com", password: "Player1234!", role: "PLAYER" },
  { name: "Emma Wong", email: "emma@team.com", password: "Player1234!", role: "PLAYER" },
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

  const userIds: Record<string, string> = {};

  // Create auth users
  for (const player of players) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: player.email,
      password: player.password,
      email_confirm: true,
      user_metadata: { name: player.name },
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        // Find existing user
        const { data: existing } = await supabase.auth.admin.listUsers();
        const found = existing?.users.find((u) => u.email === player.email);
        if (found) userIds[player.email] = found.id;
        console.log(`  ↩ ${player.name} already exists, skipping`);
      } else {
        console.error(`  ✗ Failed to create ${player.name}:`, error.message);
      }
      continue;
    }

    userIds[player.email] = data.user.id;
    console.log(`  ✓ Created user: ${player.name}`);

    // Set role for admin
    if (player.role === "ADMIN") {
      await supabase.from("profiles").update({ role: "ADMIN" }).eq("id", data.user.id);
    }
  }

  // Create 2 sessions
  const session1Date = nextWeekend(0);
  const session2Date = nextWeekend(1);

  const adminId = userIds["admin@team.com"];

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
    { user_id: adminId, status: "IN" },
    { user_id: userIds["ben@team.com"], status: "IN" },
    { user_id: userIds["clara@team.com"], status: "IN" },
    { user_id: userIds["david@team.com"], status: "IN" },
    { user_id: userIds["emma@team.com"], status: "MAYBE" },
  ];

  // RSVPs for session 2 (1 court, max 4): 4 IN (full), 1 WAITLIST
  const s2Rsvps = [
    { user_id: adminId, status: "IN" },
    { user_id: userIds["ben@team.com"], status: "IN" },
    { user_id: userIds["clara@team.com"], status: "IN" },
    { user_id: userIds["david@team.com"], status: "IN" },
    { user_id: userIds["emma@team.com"], status: "WAITLIST" },
  ];

  await supabase.from("rsvps").insert(
    s1Rsvps.map((r) => ({ ...r, session_id: s1.id }))
  );
  await supabase.from("rsvps").insert(
    s2Rsvps.map((r) => ({ ...r, session_id: s2.id }))
  );

  console.log("  ✓ Created RSVPs\n");
  console.log("✅ Seed complete!\n");
  console.log("Test accounts:");
  console.log("  Admin:  admin@team.com / Admin1234!");
  console.log("  Player: ben@team.com   / Player1234!");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
