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
