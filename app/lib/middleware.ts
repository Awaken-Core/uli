import { auth } from "@/lib/auth";
import { createMcpProtectedRequestHandler } from "@better-auth/mcp";
import { env } from "@/lib/env";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const authBaseUrl = `${env.NEXT_PUBLIC_APP_BASE_URL.replace(/\/$/, "")}/api/auth`;
const verifyMcpRequest = createMcpProtectedRequestHandler(
  {
    issuer: authBaseUrl,
    audience: env.MCP_SERVER_URL,
    jwksUrl: `${authBaseUrl}/jwks`,
  },
  async (_request, claims) => NextResponse.json({ subject: claims.sub }),
);

export async function getSession() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (session) return session;

  if (!requestHeaders.get("authorization")?.startsWith("Bearer ")) return null;

  const verification = await verifyMcpRequest(
    new Request(`${env.NEXT_PUBLIC_APP_BASE_URL}/api/auth/mcp-verification`, {
      headers: requestHeaders,
    }),
  );
  if (!verification.ok) return null;

  const result = (await verification.json()) as { subject?: string };
  if (!result.subject) return null;

  return { user: { id: result.subject }, session: null };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}
