import { schema } from "#/infrastructure/database/schema";
import * as drizzle_zod from "drizzle-zod";
import z from "zod";

export default class {
  static create = drizzle_zod.createInsertSchema(schema.users, {
    email: z.email(),
  });

  static update = drizzle_zod.createUpdateSchema(schema.users).omit({
    id: true,
    created_at: true,
    updated_at: true,
  });
}
