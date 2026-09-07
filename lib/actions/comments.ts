"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function addCommentAction(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  if (user.role !== "ADMIN") return { error: "Only admins can post comments" };

  const sessionId = formData.get("session_id") as string;
  const body = (formData.get("body") as string)?.trim();

  if (!body) return { error: "Comment cannot be empty" };
  if (body.length > 1000) return { error: "Comment is too long (max 1000 characters)" };

  await sql`
    INSERT INTO session_comments (session_id, author_id, body)
    VALUES (${sessionId}, ${user.id}, ${body});
  `;

  revalidatePath(`/sessions/${sessionId}`);
  return { success: true };
}

export async function deleteCommentAction(
  commentId: string,
  sessionId: string
): Promise<{ error?: string; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };
  if (user.role !== "ADMIN") return { error: "Not authorized" };

  await sql`
    DELETE FROM session_comments
    WHERE id = ${commentId} AND author_id = ${user.id};
  `;

  revalidatePath(`/sessions/${sessionId}`);
  return { success: true };
}
