import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { NewSessionForm } from "./NewSessionForm";

export default async function NewSessionPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/sessions");
  }

  return <NewSessionForm />;
}
