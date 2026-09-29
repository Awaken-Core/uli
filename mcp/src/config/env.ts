import { z } from "zod";
import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  runtimeEnv: process.env,
  server: {
    SERVER_URL: z.string().min(1),
    TAVILY_API_KEY: z.string().min(1),
    MCP_SERVER_URL: z.string().url().default("http://localhost:9000/mcp"),
  }
});
