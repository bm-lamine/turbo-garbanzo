import * as orm from "drizzle-orm";
import type z from "zod";

import type userDto from "#/dtos/auth/user.dto";
import { db } from "#/infrastructure/database";
import { schema } from "#/infrastructure/database/schema";
import { takeFirst } from "#/infrastructure/database/utils";

export type User = orm.InferSelectModel<typeof schema.users>;
export type UserCreate = z.infer<typeof userDto.create>;
export type UserUpdate = z.infer<typeof userDto.update>;

export default class {
  static async get() {
    return await db.select().from(schema.users);
  }

  static async create(data: UserCreate) {
    return await db
      .insert(schema.users)
      .values(data)
      .returning()
      .then(takeFirst);
  }

  static async update(id: string, data: UserUpdate) {
    return await db
      .update(schema.users)
      .set(data)
      .where(orm.eq(schema.users.id, id))
      .returning()
      .then(takeFirst);
  }

  static async delete(id: string) {
    return await db
      .delete(schema.users)
      .where(orm.eq(schema.users.id, id))
      .returning()
      .then(takeFirst);
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await db
      .select()
      .from(schema.users)
      .where(orm.eq(schema.users.email, email))
      .then(takeFirst);
  }
}
