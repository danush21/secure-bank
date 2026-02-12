import { db } from "./db";
import { sessions, users } from "./db/schema";
import { eq, lt, gt, lte, and } from "drizzle-orm";

export const SESSION_CONFIG = {
  MAX_SESSIONS_PER_USER: 1,
  SESSION_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,
  CLEANUP_INTERVAL_MS: 60 * 60 * 1000,
};

export async function invalidateAllUserSessions(userId: number, exceptToken?: string): Promise<number> {
  const query = db.delete(sessions).where(eq(sessions.userId, userId));

  if (exceptToken) {
    const existingSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .all();

    for (const session of existingSessions) {
      if (session.token !== exceptToken) {
        await db.delete(sessions).where(eq(sessions.token, session.token));
      }
    }

    return existingSessions.filter((s) => s.token !== exceptToken).length;
  } else {
    const result = await db.delete(sessions).where(eq(sessions.userId, userId));
    return 0;
  }
}

export async function enforceSessionLimit(userId: number, keepToken: string): Promise<number> {
  const userSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .all();

  if (userSessions.length <= SESSION_CONFIG.MAX_SESSIONS_PER_USER) {
    return 0;
  }

  const sessionsToDelete = userSessions
    .filter((s) => s.token !== keepToken)
    .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
    .slice(0, userSessions.length - SESSION_CONFIG.MAX_SESSIONS_PER_USER);

  let deletedCount = 0;
  for (const session of sessionsToDelete) {
    await db.delete(sessions).where(eq(sessions.token, session.token));
    deletedCount++;
  }

  return deletedCount;
}

export async function cleanupExpiredSessions(): Promise<number> {
  const now = new Date().toISOString();
  await db.delete(sessions).where(lte(sessions.expiresAt, now));
  return 0;
}

export async function validateSessionToken(token: string) {
  const session = await db.select().from(sessions).where(eq(sessions.token, token)).get();

  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt) <= new Date()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }

  return session;
}

export async function invalidateSession(token: string): Promise<boolean> {
  const session = await db.select().from(sessions).where(eq(sessions.token, token)).get();

  if (!session) {
    return false;
  }

  await db.delete(sessions).where(eq(sessions.token, token));
  return true;
}

export async function getUserActiveSessions(userId: number) {
  const now = new Date().toISOString();
  const userSessions = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expiresAt, now)))
    .all();

  return userSessions;
}

export async function getSessionInfo(token: string) {
  const session = await db.select().from(sessions).where(eq(sessions.token, token)).get();

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    isExpired: new Date(session.expiresAt) < new Date(),
  };
}
