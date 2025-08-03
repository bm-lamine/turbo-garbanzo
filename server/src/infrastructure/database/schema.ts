import { createId } from "@paralleldrive/cuid2";
import { createTable, timestamps } from "./utils";

export const userTable = createTable("users", (db) => ({
  id: db.varchar().$defaultFn(createId).primaryKey(),
  email: db.varchar().notNull().unique(),
  password: db.varchar().notNull(),
  ...timestamps,
}));

export const sessionTable = createTable("sessions", (db) => ({
  id: db.varchar().$defaultFn(createId).primaryKey(),
  userId: db
    .varchar()
    .references(() => userTable.id)
    .notNull(),
  expiresAt: db.timestamp({ mode: "date", withTimezone: true }).notNull(),
  createdA: timestamps.createdAt,
}));

export const schema = {
  users: userTable,
  sessions: sessionTable,
} as const;
