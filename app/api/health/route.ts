import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";
import { getEmailConfig } from "@/lib/email";
import { getAuthLimitsDetail } from "@/lib/authLimits";

export async function GET() {
  const email = getEmailConfig();
  const configured = isDatabaseConfigured();
  if (!configured) {
    return NextResponse.json(
      {
        status: "error",
        databaseConfigured: false,
        message: "DATABASE_URL is not set in environment variables",
        email,
      },
      { status: 500 }
    );
  }

  try {
    const result = await sql`SELECT 1 as connected;`;
    return NextResponse.json({
      status: "ok",
      databaseConfigured: true,
      databaseConnected: Boolean(result?.[0]?.connected === 1),
      email,
      rateLimits: await getAuthLimitsDetail(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: "error",
        databaseConfigured: true,
        databaseConnected: false,
        error: error instanceof Error ? error.message : "Unknown database error",
        email,
      },
      { status: 500 }
    );
  }
}
