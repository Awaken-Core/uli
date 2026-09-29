import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    OPENROUTER_API: z.string().min(1),
    OPENROUTER_TEXT_MODELID: z.string().min(1),
    OPENROUTER_DECISION_MODELID: z.string().min(1),
    TAVILY_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_BASE_URL: z.string().min(1)
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000"
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
