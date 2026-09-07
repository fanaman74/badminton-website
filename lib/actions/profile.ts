"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function updateProfileAction(
  _prevState: { error?: string; success?: boolean } | void | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!name) {
    return { error: "Name is required" };
  }

  if (!email) {
    return { error: "Email is required" };
  }

  // Check if email is already taken by another user
  const existingRows = await sql`
    SELECT id
    FROM profiles
    WHERE LOWER(email) = ${email}
      AND id != ${userId}
    LIMIT 1;
  `;

  if (existingRows && existingRows.length > 0) {
    return { error: "This email is already in use" };
  }

  await sql`
    UPDATE profiles
    SET name = ${name}, email = ${email}
    WHERE id = ${userId};
  `;

  revalidatePath("/you");
  return { success: true };
}

export async function updateUserRoleAction(
  targetUserId: string,
  newRole: "ADMIN" | "PLAYER"
): Promise<{ error?: string; success?: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  // Check if current user is admin
  const currentUsers = await sql`
    SELECT role
    FROM profiles
    WHERE id = ${userId}
    LIMIT 1;
  `;

  if (!currentUsers || currentUsers[0]?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  // Prevent user from changing their own role to PLAYER
  if (userId === targetUserId && newRole === "PLAYER") {
    return { error: "You cannot remove your own admin status" };
  }

  await sql`
    UPDATE profiles
    SET role = ${newRole}
    WHERE id = ${targetUserId};
  `;

  revalidatePath("/team");
  return { success: true };
}

export async function deleteMemberAction(
  targetUserId: string
): Promise<{ error?: string; success?: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Not authenticated" };

  // Check if current user is admin
  const currentUsers = await sql`
    SELECT role
    FROM profiles
    WHERE id = ${userId}
    LIMIT 1;
  `;

  if (!currentUsers || currentUsers[0]?.role !== "ADMIN") {
    return { error: "Not authorized. Only administrators can delete members." };
  }

  // Prevent admin from deleting their own account
  if (userId === targetUserId) {
    return { error: "You cannot delete your own account." };
  }

  // Check target member
  const targetUsers = await sql`
    SELECT id, email, name
    FROM profiles
    WHERE id = ${targetUserId}
    LIMIT 1;
  `;

  if (!targetUsers || targetUsers.length === 0) {
    return { error: "Member not found." };
  }

  const target = targetUsers[0];
  const targetEmail = target.email ? target.email.toLowerCase() : "";
  if (
    targetEmail === "fredanaman@gmail.com" ||
    targetEmail === "marika.vernon@yahoo.co.uk"
  ) {
    return { error: "Primary administrator accounts cannot be deleted." };
  }

  // Clean up related records in database before deleting profile
  await sql`DELETE FROM user_sessions WHERE user_id = ${targetUserId};`;
  await sql`DELETE FROM rsvps WHERE user_id = ${targetUserId};`;
  await sql`DELETE FROM session_comments WHERE author_id = ${targetUserId};`;
  await sql`DELETE FROM expenses WHERE payer_id = ${targetUserId};`;
  await sql`
    DELETE FROM matches 
    WHERE team1_p1_id = ${targetUserId} 
       OR team1_p2_id = ${targetUserId} 
       OR team2_p1_id = ${targetUserId} 
       OR team2_p2_id = ${targetUserId};
  `;
  await sql`UPDATE sessions SET created_by = NULL WHERE created_by = ${targetUserId};`;

  // Delete the profile
  await sql`DELETE FROM profiles WHERE id = ${targetUserId};`;

  revalidatePath("/team");
  revalidatePath("/sessions");
  revalidatePath("/history");
  revalidatePath("/leaderboard");
  return { success: true };
}
