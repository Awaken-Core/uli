import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { drizzle as nodeDrizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";

const isProd = env.NODE_ENV === "production";
const client = isProd
  ? neonDrizzle({ connection: env.DATABASE_URL })
  : nodeDrizzle({ connection: env.DATABASE_URL });

export { client };
