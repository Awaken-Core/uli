import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { tasks } from "@/schema";
import { eq, and } from "drizzle-orm";
import { updateTaskSchema } from "@/lib/validations/task";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const [task] = await client
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, session!.user.id)));

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [task] = await client
    .update(tasks)
    .set(parsed.data)
    .where(and(eq(tasks.id, id), eq(tasks.userId, session!.user.id)))
    .returning();

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const [task] = await client
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, session!.user.id)))
    .returning();

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
