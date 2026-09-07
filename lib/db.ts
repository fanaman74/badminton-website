import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type NeonClient = NeonQueryFunction<false, false>;

let _sqlInstance: NeonClient | null = null;

function getSql(): NeonClient {
  if (!_sqlInstance) {
    const url = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
    if (!url) {
      throw new Error("DATABASE_URL is not set in environment variables");
    }
    _sqlInstance = neon(url);
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
