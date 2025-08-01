import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import config from "#/config";
import { schema } from "./schema";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(config.env.DATABASE_URL);
if (config.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, {
  schema,
  logger: config.env.NODE_ENV === "development",
});
