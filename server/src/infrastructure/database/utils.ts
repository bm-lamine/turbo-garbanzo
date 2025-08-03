import * as pgCore from "drizzle-orm/pg-core";
import { HTTPException } from "hono/http-exception";

export const createTable = pgCore.pgTableCreator((name) => name);

export const bytea = pgCore.customType<{
  data: Uint8Array;
  driverData: Buffer;
}>({
  dataType() {
    return "bytea";
  },
  fromDriver(value: Buffer) {
    return new Uint8Array(value);
  },
  toDriver(value: Uint8Array): Buffer {
    return Buffer.from(value);
  },
});

export const takeFirst = <T>(values: T[]): T | null => {
  if (values.length === 0) return null;
  return values[0]!;
};

export const takeFirstOrThrow = <T>(values: T[]): T => {
  if (values.length === 0)
    throw new HTTPException(404, {
      message: "Resource not found",
    });
  return values[0]!;
};

export const timestamps = {
  createdAt: pgCore
    .timestamp({ mode: "date", withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: pgCore
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => new Date()),
};
