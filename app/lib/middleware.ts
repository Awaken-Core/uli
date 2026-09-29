import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function getSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({ headers: requestHeaders });
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}
