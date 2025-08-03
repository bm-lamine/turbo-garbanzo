import type { z, ZodObject } from "zod";

export default function <T extends ZodObject<any>>(
  path: Array<keyof z.infer<T>> | undefined,
  message: string,
) {
  return { path, message };
}
