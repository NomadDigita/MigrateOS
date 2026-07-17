import { z } from "zod";

const publicConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
});

export const publicConfig = publicConfigSchema.parse({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
});
