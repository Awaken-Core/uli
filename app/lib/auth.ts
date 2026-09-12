import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { client } from "./db";
import * as schema from "@/schema";

export const auth = betterAuth({
    database: drizzleAdapter(client, {
        provider: "pg", // or "pg" or "mysql"
        schema: schema,
    }),

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }
    },

      trustedOrigins: [env.NEXT_PUBLIC_APP_BASE_URL!],
});