import * as orm from "drizzle-orm";

import { db } from "#/infrastructure/database";
import { schema } from "#/infrastructure/database/schema";
import { takeFirst } from "#/infrastructure/database/utils";
import authUtils from "#/utils/auth/auth.utils";
import type { User } from "./user.repo";

export type Session = orm.InferSelectModel<typeof schema.sessions>;

export default class {
  static async create(userId: string): Promise<Session | null> {
    return await db
      .insert(schema.sessions)
      .values({
        userId,
        expiresAt: new Date(
          Date.now() + authUtils.defaults.session.livespan * 1000,
        ),
      })
      .returning()
      .then(takeFirst);
  }

  static async validate(id: string): Promise<{
    session: Session;
    user: User;
  } | null> {
    const now = Date.now();
    const res = await db
      .select({ session: schema.sessions, user: schema.users })
      .from(schema.sessions)
      .innerJoin(schema.users, orm.eq(schema.sessions.userId, schema.users.id))
      .where(
        orm.and(
          orm.eq(schema.sessions.id, id),
          orm.gt(schema.sessions.expiresAt, new Date()),
        ),
      )
      .then(takeFirst);

    if (!res) {
      console.warn(`Session ${id} not found.`);
      return null;
    }

    if (
      new Date(res.session.expiresAt) <
      new Date(now + (authUtils.defaults.session.livespan / 2) * 1000)
    ) {
      console.warn(`Session ${id} nearing expiry, invalidated.`);
      await this.invalidate(id);
      return null;
    }

    await this.extend(res.session.id, authUtils.defaults.session.livespan);

    return {
      session: res.session,
      user: res.user,
    };
  }

  static async extend(id: string, livespan: number): Promise<void> {
    const now = Date.now();
    await db
      .update(schema.sessions)
      .set({
        expiresAt: new Date(now + livespan * 1000),
      })
      .where(
        orm.and(
          orm.eq(schema.sessions.id, id),
          orm.gt(schema.sessions.expiresAt, new Date(now)),
        ),
      );
  }

  static async invalidate(id: string): Promise<void> {
    await db.delete(schema.sessions).where(orm.eq(schema.sessions.id, id));
  }

  static async invalidateAll(userId: string): Promise<void> {
    await db
      .delete(schema.sessions)
      .where(orm.eq(schema.sessions.userId, userId));
  }
}
