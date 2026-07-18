import { z } from "zod";

const publicConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
});

const defaultApiBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://migrateos.onrender.com/api/v1"
    : "http://localhost:8000/api/v1";

export const publicConfig = publicConfigSchema.parse({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl,
});
