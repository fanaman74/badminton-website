import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type NeonClient = NeonQueryFunction<false, false>;

let _sqlInstance: NeonClient | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED);
}

function getSql(): NeonClient {
  if (!_sqlInstance) {
    const rawUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
    if (!rawUrl) {
      const msg = "[DB] DATABASE_URL is not set in environment variables! Please configure DATABASE_URL in your deployment platform (e.g. Railway -> Service -> Variables).";
      console.error(msg);
      throw new Error(msg);
    }
    const cleanUrl = rawUrl.trim().replace(/^["']|["']$/g, "");
    _sqlInstance = neon(cleanUrl);
  }
  return _sqlInstance;
}

export const sql: NeonClient = new Proxy(
  (() => {}) as unknown as NeonClient,
  {
    apply(_target, thisArg, argArray) {
      const fn = getSql();
      return Reflect.apply(fn as any, thisArg, argArray);
    },
    get(_target, prop, receiver) {
      const fn = getSql();
      return Reflect.get(fn as any, prop, receiver);
    },
  }
);

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
