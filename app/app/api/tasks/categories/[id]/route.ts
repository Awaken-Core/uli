import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { taskCategories } from "@/schema";
import { eq, and } from "drizzle-orm";
import { updateCategorySchema } from "@/lib/validations/task";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [category] = await client
    .update(taskCategories)
    .set(parsed.data)
    .where(and(eq(taskCategories.id, id), eq(taskCategories.userId, session!.user.id)))
    .returning();

  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const [category] = await client
    .delete(taskCategories)
    .where(and(eq(taskCategories.id, id), eq(taskCategories.userId, session!.user.id)))
    .returning();

  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
