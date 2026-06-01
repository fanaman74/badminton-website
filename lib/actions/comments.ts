"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase.from("session_comments").insert({
    session_id: sessionId,
    author_id: user.id,
    body,
  });

  if (error) return { error: error.message };

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

  const supabase = await createClient();
  const { error } = await supabase
    .from("session_comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/sessions/${sessionId}`);
  return { success: true };
}
