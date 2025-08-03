import z from "zod";

export default class {
  static register = z.object({
    name: z.string({ error: "name-required" }),
    email: z.email({ error: "email-required" }),
    password: z
      .string({ error: "password-required" })
      .min(8, "password-too-short")
      .max(32, "password-too-long"),
  });

  static login = z.object({
    email: z.email({ error: "email-required" }),
    password: z.string(),
  });
}
