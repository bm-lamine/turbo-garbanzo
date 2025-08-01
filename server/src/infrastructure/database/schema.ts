import { createId } from "@paralleldrive/cuid2";
import { createTable, timestamps } from "./utils";

export const userTable = createTable("users", (db) => ({
  id: db.varchar().$defaultFn(createId).primaryKey(),
  email: db.varchar().notNull().unique(),
  password: db.varchar().notNull(),
  ...timestamps,
}));

export const schema = {
  users: userTable,
} as const;
