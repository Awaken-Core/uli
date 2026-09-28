import { z } from "zod";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  runtimeEnv: process.env,
  server: {
    SERVER_URL: z.string().min(1),
    TAVILY_API_KEY: z.string().min(1),
    OPENROUTER_API: z.string().min(1),
    OPENROUTER_MODELID: z.string().min(1),
  }
});