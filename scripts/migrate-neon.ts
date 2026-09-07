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

async function migrate() {
  console.log("🚀 Running Neon Postgres schema migration...");

  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'PLAYER' CHECK (role IN ('ADMIN', 'PLAYER')),
      balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("  ✓ Created profiles table");

  await sql`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
    );
  `;
  console.log("  ✓ Created user_sessions table");

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date TIMESTAMPTZ NOT NULL,
      location_name TEXT NOT NULL,
      location_maps_url TEXT,
      courts_booked INTEGER NOT NULL DEFAULT 1 CHECK (courts_booked > 0),
      max_capacity INTEGER NOT NULL DEFAULT 4 CHECK (max_capacity > 0),
      status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'COMPLETED', 'CANCELLED')),
      created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("  ✓ Created sessions table");

  await sql`
    CREATE TABLE IF NOT EXISTS rsvps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('IN', 'OUT', 'MAYBE', 'WAITLIST')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, session_id)
    );
  `;
  console.log("  ✓ Created rsvps table");

  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      payer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
      description TEXT NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("  ✓ Created expenses table");

  await sql`
    CREATE TABLE IF NOT EXISTS matches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
      team1_p1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      team1_p2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      team2_p1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      team2_p2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      team1_score INTEGER NOT NULL CHECK (team1_score >= 0),
      team2_score INTEGER NOT NULL CHECK (team2_score >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("  ✓ Created matches table");

  await sql`
    CREATE TABLE IF NOT EXISTS team_config (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      day_of_week INTEGER NOT NULL DEFAULT 3,
      courts INTEGER NOT NULL DEFAULT 3,
      start_time TEXT NOT NULL DEFAULT '20:00',
      location_name TEXT NOT NULL DEFAULT '',
      location_maps_url TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("  ✓ Created team_config table");

  await sql`
    CREATE TABLE IF NOT EXISTS session_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("  ✓ Created session_comments table");

  await sql`
    CREATE TABLE IF NOT EXISTS email_otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  console.log("  ✓ Created email_otps table");

  // Create indexes for fast lookups
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rsvps_session ON rsvps(session_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rsvps_user ON rsvps(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_session_comments_session ON session_comments(session_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);`;
  console.log("  ✓ Created indexes");

  console.log("\n✅ Migration completed successfully!");
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
