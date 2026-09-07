"use server";

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type TeamMember = {
  name: string;
  email: string;
  role: "ADMIN" | "PLAYER";
};

export async function setupTeamAction(
  members: TeamMember[]
): Promise<{ error?: string; created?: string[]; skipped?: string[] }> {
  // Allow setup only if no profiles exist yet, OR if an authenticated admin is running it
  const user = await getCurrentUser();
  const profileCountRows = await sql`SELECT COUNT(*)::int AS count FROM profiles;`;
  const count = profileCountRows[0]?.count ?? 0;

  if (count > 0 && (!user || user.role !== "ADMIN")) {
    return { error: "Setup can only be run by an administrator once profiles exist." };
  }

  const created: string[] = [];
  const skipped: string[] = [];

  for (const member of members) {
    const email = member.email.trim().toLowerCase();
    const name = member.name.trim();

    if (!name || !email) continue;

    // Check if profile with this email already exists
    const existing = await sql`
      SELECT id 
      FROM profiles 
      WHERE LOWER(email) = ${email} 
      LIMIT 1;
    `;

    if (existing && existing.length > 0) {
      skipped.push(name);
      continue;
    }

    // Create new profile
    await sql`
      INSERT INTO profiles (name, email, role)
      VALUES (${name}, ${email}, ${member.role});
    `;

    created.push(name);
  }

  return { created, skipped };
}
