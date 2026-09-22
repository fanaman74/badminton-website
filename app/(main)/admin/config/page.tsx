import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AUTH_LIMIT_FIELDS, getAuthLimitsDetail } from "@/lib/authLimits";
import { ConfigForm } from "./ConfigForm";
import { RateLimitForm } from "./RateLimitForm";

export default async function AdminConfigPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/sessions");

  const rows = await sql`
    SELECT *
    FROM team_config
    WHERE id = 1
    LIMIT 1;
  `;

  const config = (rows[0] ?? null) as {
    day_of_week: number;
    courts: number;
    start_time: string;
    location_name: string;
    location_maps_url: string | null;
  } | null;

  // Effective sign-in limits + which of them an admin has overridden
  const rateLimits = await getAuthLimitsDetail();

  return (
    <>
      <ConfigForm config={config} />
      <RateLimitForm
        fields={AUTH_LIMIT_FIELDS}
        defaults={rateLimits.defaults}
        overrides={rateLimits.overrides}
        effective={rateLimits.effective}
      />
    </>
  );
}
