import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ConfigForm } from "./ConfigForm";

export default async function AdminConfigPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/sessions");

  const supabase = await createClient();
  const { data: config } = await supabase
    .from("team_config")
    .select("*")
    .eq("id", 1)
    .single();

  return <ConfigForm config={config} />;
}
