import z from "zod";

export default class {
  static schema = z.object({
    DATABASE_URL: z.url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  });

  static runtimeEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  static env = this.schema.parse(this.runtimeEnv);
}
