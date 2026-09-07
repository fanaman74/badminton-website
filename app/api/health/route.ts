import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";

export async function GET() {
  const configured = isDatabaseConfigured();
  if (!configured) {
    return NextResponse.json(
      {
        status: "error",
        databaseConfigured: false,
        message: "DATABASE_URL is not set in environment variables",
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
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        databaseConfigured: true,
        databaseConnected: false,
        error: error?.message || "Unknown database error",
      },
      { status: 500 }
    );
  }
}
