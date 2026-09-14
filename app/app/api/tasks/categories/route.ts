import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { taskCategories } from "@/schema";
import { eq } from "drizzle-orm";
import { createCategorySchema } from "@/lib/validations/task";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const result = await client
    .select()
    .from(taskCategories)
    .where(eq(taskCategories.userId, session!.user.id));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [category] = await client
    .insert(taskCategories)
    .values({ ...parsed.data, userId: session!.user.id })
    .returning();

  return NextResponse.json(category, { status: 201 });
}
