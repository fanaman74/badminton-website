"use server";

import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

type TeamMember = {
  name: string;
  email: string;
  role: "ADMIN" | "PLAYER";
};

export async function setupTeamAction(
  members: TeamMember[]
): Promise<{ error?: string; created?: string[]; skipped?: string[] }> {
  const supabase = await createClient();

  const created: string[] = [];
  const skipped: string[] = [];

  for (const member of members) {
    const email = member.email.toLowerCase();

    // Check if profile with this email already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      skipped.push(member.name);
      continue;
    }

    // Create new profile
    const { error } = await supabase.from("profiles").insert({
      id: uuidv4(),
      name: member.name,
      email,
      role: member.role,
    });

    if (error) {
      return { error: `Failed to create profile for ${member.name}: ${error.message}` };
    }

    created.push(member.name);
  }

  return { created, skipped };
}
