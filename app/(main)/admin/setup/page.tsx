import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function promoteToAdminAction() {
  "use server";
  const userId = await getCurrentUserId();
  if (!userId) redirect("/auth");

  const supabase = await createClient();

  // Only works if no admins exist yet
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "ADMIN");

  if ((count ?? 0) > 0) redirect("/sessions");

  await supabase.from("profiles").update({ role: "ADMIN" as const }).eq("id", userId);
  redirect("/sessions");
}

export default async function AdminSetupPage() {
  const supabase = await createClient();

  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "ADMIN");

  if ((count ?? 0) > 0) redirect("/sessions");

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>One-time Admin Setup</CardTitle>
          <p className="text-slate-500 text-sm">
            No admin exists yet. Claim admin role for your account.
          </p>
        </CardHeader>
        <CardContent>
          <form action={promoteToAdminAction}>
            <Button
              type="submit"
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
            >
              Make me admin
            </Button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-3">
            This page disables itself once an admin exists.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
