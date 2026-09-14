import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { tasks } from "@/schema";
import { eq, and } from "drizzle-orm";
import { createTaskSchema, taskQuerySchema } from "@/lib/validations/task";

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const query = taskQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!query.success) return NextResponse.json({ error: query.error.flatten() }, { status: 400 });

  const { status, priority, categoryId, scheduledDate, parentTaskId } = query.data;

  const conditions = [eq(tasks.userId, session!.user.id)];
  if (status) conditions.push(eq(tasks.status, status));
  if (priority) conditions.push(eq(tasks.priority, priority));
  if (categoryId) conditions.push(eq(tasks.categoryId, categoryId));
  if (scheduledDate) conditions.push(eq(tasks.scheduledDate, scheduledDate));
  if (parentTaskId) conditions.push(eq(tasks.parentTaskId, parentTaskId));

  const result = await client.select().from(tasks).where(and(...conditions));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [task] = await client
    .insert(tasks)
    .values({ ...parsed.data, userId: session!.user.id })
    .returning();

  return NextResponse.json(task, { status: 201 });
}
