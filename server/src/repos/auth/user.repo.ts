import * as orm from "drizzle-orm";

import type { schema } from "#/infrastructure/database/schema";

export type User = orm.InferSelectModel<typeof schema.users>;
