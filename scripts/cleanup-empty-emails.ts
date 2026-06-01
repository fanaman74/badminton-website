import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  if (line && !line.startsWith("#")) {
    const [key, value] = line.split("=");
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  try {
    // Find all profiles without email
    const { data: profilesWithoutEmail, error: selectError } = await supabase
      .from("profiles")
      .select("id, name, email")
      .or("email.is.null,email.eq.");

    if (selectError) {
      console.error("Error fetching profiles:", selectError);
      return;
    }

    console.log(`Found ${profilesWithoutEmail?.length || 0} profiles without email:`);
    profilesWithoutEmail?.forEach((p) => {
      console.log(`  - ID: ${p.id}, Name: ${p.name}, Email: ${p.email}`);
    });

    if (!profilesWithoutEmail || profilesWithoutEmail.length === 0) {
      console.log("No profiles without email found. Nothing to delete.");
      return;
    }

    // Delete profiles without email
    const idsToDelete = profilesWithoutEmail.map((p) => p.id);
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      console.error("Error deleting profiles:", deleteError);
      return;
    }

    console.log(`✓ Successfully deleted ${idsToDelete.length} profiles without email`);
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}

cleanup();
