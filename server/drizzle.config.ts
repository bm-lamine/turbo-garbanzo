import type * as drizzle_kit from "drizzle-kit";
import config from "#/config";

export default {
  out: "./src/infrastructure/database/migrations",
  schema: "./src/infrastructure/database/schema.ts",
  breakpoints: false,
  strict: true,
  dialect: "postgresql",
  dbCredentials: {
    url: config.env.DATABASE_URL,
  },
  migrations: {
    table: "migrations",
    schema: "public",
  },
  verbose: true,
} satisfies drizzle_kit.Config;
