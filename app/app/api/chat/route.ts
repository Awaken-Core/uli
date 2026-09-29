import { and, asc, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/agent";
import { client } from "@/lib/db";
import { env } from "@/lib/env";
import { requireAuth } from "@/lib/middleware";
import { chats, conversation } from "@/schema";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(8_000),
  conversationId: z.string().uuid().optional(),
});

async function ownedConversation(id: string, userId: string) {
  const [record] = await client
    .select()
    .from(conversation)
    .where(and(eq(conversation.id, id), eq(conversation.userId, userId)))
    .limit(1);
  return record;
}

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const userId = session!.user.id;
  const requestedId = req.nextUrl.searchParams.get("conversationId");

  const conversations = await client
    .select({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    })
    .from(conversation)
    .where(eq(conversation.userId, userId))
    .orderBy(desc(conversation.updatedAt));

  const active = requestedId
    ? await ownedConversation(requestedId, userId)
    : conversations[0];

  if (requestedId && !active) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  if (!active) {
    return NextResponse.json({ conversations, conversation: null, messages: [] });
  }

  const messages = await client
    .select()
    .from(chats)
    .where(and(eq(chats.conversationId, active.id), eq(chats.userId, userId)))
    .orderBy(asc(chats.createdAt));

  return NextResponse.json({ conversations, conversation: active, messages });
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    const userId = session!.user.id;
    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    let active = parsed.data.conversationId
      ? await ownedConversation(parsed.data.conversationId, userId)
      : undefined;
    if (parsed.data.conversationId && !active) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (!active) {
      [active] = await client
        .insert(conversation)
        .values({ userId, title: parsed.data.message.slice(0, 80) })
        .returning();
    }

    const history = await client
      .select({ role: chats.role, message: chats.message })
      .from(chats)
      .where(and(eq(chats.conversationId, active.id), eq(chats.userId, userId)))
      .orderBy(desc(chats.createdAt))
      .limit(12);

    const [userMessage] = await client
      .insert(chats)
      .values({
        userId,
        conversationId: active.id,
        message: parsed.data.message,
        role: "user",
      })
      .returning();

    const result = await runAgent({
      message: parsed.data.message,
      history: history.reverse(),
      requestHeaders: req.headers,
    });

    const [agentMessage] = await client
      .insert(chats)
      .values({
        userId,
        conversationId: active.id,
        message: result.message,
        role: "agent",
        token: result.token,
        taskId: result.links?.taskId,
        nutritionId: result.links?.nutritionId,
        foodId: result.links?.foodId,
        metaData: {
          decision: result.decision,
          ...(result.tool ? { tool: result.tool } : {}),
          model: env.OPENROUTER_TEXT_MODELID,
        },
      })
      .returning();

    const updatedAt = new Date();
    await client
      .update(conversation)
      .set({ updatedAt })
      .where(eq(conversation.id, active.id));

    return NextResponse.json(
      {
        conversation: { ...active, updatedAt },
        messages: [userMessage, agentMessage],
      },
      { status: 201 },
    );
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unable to process chat message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
