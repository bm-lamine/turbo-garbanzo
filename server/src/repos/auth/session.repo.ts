import * as orm from "drizzle-orm";

import { db } from "#/infrastructure/database";
import { schema } from "#/infrastructure/database/schema";
import { takeFirst } from "#/infrastructure/database/utils";
import authUtils from "#/utils/auth/auth.utils";
import type { User } from "./user.repo";

export type Session = orm.InferSelectModel<typeof schema.sessions>;

export default class {
  static async create(userId: string): Promise<Session | null> {
    try {
      const now = new Date();
      return await db
        .insert(schema.sessions)
        .values({
          userId,
          expiresAt: new Date(
            now.getTime() + authUtils.defaults.session.lifespan * 1000,
          ),
        })
        .returning()
        .then(takeFirst);
    } catch (error) {
      console.error(`Failed to create session for user ${userId}:`, error);
      return null;
    }
  }

  static async validate(id: string): Promise<{
    session: Session;
    user: User;
  } | null> {
    try {
      const now = new Date();
      const res = await db
        .select({ session: schema.sessions, user: schema.users })
        .from(schema.sessions)
        .innerJoin(
          schema.users,
          orm.eq(schema.sessions.userId, schema.users.id),
        )
        .where(
          orm.and(
            orm.eq(schema.sessions.id, id),
            orm.gt(schema.sessions.expiresAt, new Date(now)),
          ),
        )
        .limit(1)
        .then(takeFirst);

      if (!res) {
        console.warn(`Session ${id} not found or expired.`);
        return null;
      }

      if (
        res.session.expiresAt <
        new Date(
          now.getTime() + (authUtils.defaults.session.lifespan / 2) * 1000,
        )
      ) {
        console.debug(`Extending session ${id} due to approaching expiry.`);

        const ext = await this.extend(
          res.session.id,
          authUtils.defaults.session.lifespan,
        );

        return ext
          ? {
              session: ext,
              user: res.user,
            }
          : null;
      }

      return {
        session: res.session,
        user: res.user,
      };
    } catch (error) {
      console.error(`Failed to validate session ${id}:`, error);
      return null;
    }
  }

  static async extend(id: string, lifespan: number): Promise<Session | null> {
    try {
      const now = new Date();

      return await db
        .update(schema.sessions)
        .set({
          expiresAt: new Date(now.getTime() + lifespan * 1000),
        })
        .where(
          orm.and(
            orm.eq(schema.sessions.id, id),
            orm.gt(schema.sessions.expiresAt, now),
          ),
        )
        .returning()
        .then(takeFirst);
    } catch (error) {
      console.error(`Failed to extend session ${id}:`, error);
      return null;
    }
  }

  static async invalidate(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(schema.sessions)
        .where(orm.eq(schema.sessions.id, id))
        .returning({ id: schema.sessions.id });

      return result.length > 0;
    } catch (error) {
      console.error(`Failed to invalidate session ${id}:`, error);
      return false;
    }
  }

  static async invalidateAll(userId: string): Promise<number> {
    try {
      const result = await db
        .delete(schema.sessions)
        .where(orm.eq(schema.sessions.userId, userId))
        .returning({ id: schema.sessions.id });

      const deletedCount = result.length;
      if (deletedCount > 0) {
        console.info(`Invalidated ${deletedCount} sessions for user ${userId}`);
      }

      return deletedCount;
    } catch (error) {
      console.error(`Failed to invalidate sessions for user ${userId}:`, error);
      return 0;
    }
  }

  static async clean(): Promise<number> {
    try {
      const now = new Date();

      const result = await db
        .delete(schema.sessions)
        .where(orm.lte(schema.sessions.expiresAt, now)) // Fixed: was orm.gt
        .returning({ id: schema.sessions.id });

      const deletedCount = result.length;
      if (deletedCount > 0) {
        console.info(`Cleaned up ${deletedCount} expired sessions`);
      }

      return deletedCount;
    } catch (error) {
      console.error(`Failed to clean expired sessions:`, error);
      return 0;
    }
  }

  static async getActive(userId: string) {
    try {
      return await db
        .select()
        .from(schema.sessions)
        .where(
          orm.and(
            orm.eq(schema.sessions.userId, userId),
            orm.gt(schema.sessions.expiresAt, new Date()),
          ),
        )
        .orderBy(orm.desc(schema.sessions.expiresAt));
    } catch (error) {
      console.error(`Failed to get active sessions for user ${userId}:`, error);
      return [];
    }
  }
}
