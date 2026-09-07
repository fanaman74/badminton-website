/**
 * Seed script — dev-only. Creates sample players, config, sessions, and sample RSVPs in Neon.
 * Run: npm run seed
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

const players = [
  { name: "Admin Alex", email: "alex@example.com", role: "ADMIN" },
  { name: "Ben Tan", email: "ben@example.com", role: "PLAYER" },
  { name: "Clara Lim", email: "clara@example.com", role: "PLAYER" },
  { name: "David Koh", email: "david@example.com", role: "PLAYER" },
  { name: "Emma Wong", email: "emma@example.com", role: "PLAYER" },
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
  console.log("🌱 Seeding Neon Postgres database...\n");

  const userIds: string[] = [];

  // Create profiles
  for (const player of players) {
    const rows = await sql`
      INSERT INTO profiles (name, email, role)
      VALUES (${player.name}, ${player.email}, ${player.role})
      ON CONFLICT (email)
      DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
      RETURNING id;
    `;

    const userId = rows[0]?.id;
    userIds.push(userId);
    console.log(`  ✓ Created/updated player: ${player.name} (${player.role}, ${player.email})`);
  }

  // Create default team config
  await sql`
    INSERT INTO team_config (id, day_of_week, courts, start_time, location_name, location_maps_url, updated_at)
    VALUES (1, 3, 3, '20:00', 'VUB Sports Hall', 'https://maps.google.com', NOW())
    ON CONFLICT (id)
    DO UPDATE SET location_name = EXCLUDED.location_name;
  `;
  console.log("  ✓ Created default team config");

  // Create 2 sessions
  const session1Date = nextWeekend(0);
  const session2Date = nextWeekend(1);
  const adminId = userIds[0];

  const s1Rows = await sql`
    INSERT INTO sessions (date, location_name, location_maps_url, courts_booked, max_capacity, created_by)
    VALUES (${session1Date.toISOString()}, 'VUB Sports Hall', 'https://maps.google.com', 2, 8, ${adminId})
    RETURNING id;
  `;
  const s1Id = s1Rows[0]?.id;

  const s2Rows = await sql`
    INSERT INTO sessions (date, location_name, location_maps_url, courts_booked, max_capacity, created_by)
    VALUES (${session2Date.toISOString()}, 'VUB Sports Hall - Court 3', 'https://maps.google.com', 1, 4, ${adminId})
    RETURNING id;
  `;
  const s2Id = s2Rows[0]?.id;

  console.log(`\n  ✓ Created 2 sessions`);

  // RSVPs for session 1: 4 IN, 1 MAYBE
  const s1Rsvps = [
    { user_id: userIds[0], status: "IN" },
    { user_id: userIds[1], status: "IN" },
    { user_id: userIds[2], status: "IN" },
    { user_id: userIds[3], status: "IN" },
    { user_id: userIds[4], status: "MAYBE" },
  ];

  // RSVPs for session 2: 4 IN (full), 1 WAITLIST
  const s2Rsvps = [
    { user_id: userIds[0], status: "IN" },
    { user_id: userIds[1], status: "IN" },
    { user_id: userIds[2], status: "IN" },
    { user_id: userIds[3], status: "IN" },
    { user_id: userIds[4], status: "WAITLIST" },
  ];

  for (const r of s1Rsvps) {
    await sql`
      INSERT INTO rsvps (user_id, session_id, status)
      VALUES (${r.user_id}, ${s1Id}, ${r.status})
      ON CONFLICT (user_id, session_id) DO UPDATE SET status = EXCLUDED.status;
    `;
  }

  for (const r of s2Rsvps) {
    await sql`
      INSERT INTO rsvps (user_id, session_id, status)
      VALUES (${r.user_id}, ${s2Id}, ${r.status})
      ON CONFLICT (user_id, session_id) DO UPDATE SET status = EXCLUDED.status;
    `;
  }

  console.log("  ✓ Created sample RSVPs\n");
  console.log("✅ Seed complete!\n");
  console.log("To log in:");
  console.log("  1. Visit http://localhost:3000/auth");
  console.log("  2. Enter email: alex@example.com");
  console.log("  3. Enter team password (INVITE_CODE)");
}

seed().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
