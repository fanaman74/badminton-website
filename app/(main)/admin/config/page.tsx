import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ConfigForm } from "./ConfigForm";

export default async function AdminConfigPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/sessions");

  const rows = await sql`
    SELECT *
    FROM team_config
    WHERE id = 1
    LIMIT 1;
  `;

  const config = rows[0] ? (rows[0] as any) : null;

  return <ConfigForm config={config} />;
}
