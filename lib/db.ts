import { neon } from "@neondatabase/serverless";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!url) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }
  return url;
}

export const sql = neon(getDatabaseUrl());

export type {
  Profile,
  Session,
  Rsvp,
  Expense,
  Match,
  UserSession,
  SessionComment,
  RsvpStatus,
  SessionStatus,
  UserRole,
} from "@/types/database";
