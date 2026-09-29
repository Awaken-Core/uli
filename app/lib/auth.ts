import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { cimd } from "@better-auth/cimd";
import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { mcp } from "@better-auth/mcp";
import { jwt } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { client } from "./db";
import * as schema from "../schema";
import { env } from "./env";

export const auth = betterAuth({
    baseURL: env.NEXT_PUBLIC_APP_BASE_URL,
    database: drizzleAdapter(client, {
        provider: "pg", // or "pg" or "mysql"
        schema: schema,
    }),

    plugins: [
        expo(),
        jwt(),
        mcp({
            loginPage: "/sign-in",
            consentPage: "/consent",
            resource: env.MCP_SERVER_URL,
        }),
        cimd({
            fetchClientMetadataResource,
            metadataProfile: "mcp-2026-07-28",
        }),
    ],
    emailAndPassword: {
        enabled: true, // Enable authentication using email and password.
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
        }
    },

    trustedOrigins: [
        env.NEXT_PUBLIC_APP_BASE_URL!,
        "mobile://",
        "mobile://*",
        ...(env.NODE_ENV === "development" ? ["exp://", "exp://**"] : []),
    ],
});
