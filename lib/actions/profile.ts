"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";

export async function updateProfileAction(
  _prevState: { error?: string; success?: boolean } | void | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const supabase = await createClient();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();

  if (!name) {
    return { error: "Name is required" };
  }

  if (!email) {
    return { error: "Email is required" };
  }

  // Check if email is already taken by another user
  const { data: existingEmail } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .neq("id", userId)
    .single();

  if (existingEmail) {
    return { error: "This email is already in use" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name, email })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/you");
  return { success: true };
}
