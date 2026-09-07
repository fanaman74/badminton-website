import { redirect, notFound } from "next/navigation";
import { sql, type Session } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { EditSessionForm } from "./EditSessionForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSessionPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/sessions");

  const rows = await sql`
    SELECT *
    FROM sessions
    WHERE id = ${id}
    LIMIT 1;
  `;

  if (!rows || rows.length === 0) notFound();

  const session = rows[0] as Session;

  return <EditSessionForm session={session} />;
}
