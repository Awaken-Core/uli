import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { nutritionGoals } from "@/schema";
import { eq, and, lte, or, gte, isNull, desc } from "drizzle-orm";
import {
  createNutritionGoalSchema,
  nutritionGoalQuerySchema,
} from "@/lib/validations/nutrition";
import { getTodayInTimezone } from "@/lib/timezone";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = req.nextUrl;
    const query = nutritionGoalQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return NextResponse.json({ error: query.error.flatten() }, { status: 400 });
    }

    const { date, timezone } = query.data;

    if (date) {
      // Find the goal active on the requested date
      const [activeGoal] = await client
        .select()
        .from(nutritionGoals)
        .where(
          and(
            eq(nutritionGoals.userId, session!.user.id),
            lte(nutritionGoals.effectiveFrom, date),
            or(isNull(nutritionGoals.effectiveTo), gte(nutritionGoals.effectiveTo, date))
          )
        )
        .orderBy(desc(nutritionGoals.effectiveFrom))
        .limit(1);

      return NextResponse.json(activeGoal ?? null);
    }

    const allGoals = await client
      .select()
      .from(nutritionGoals)
      .where(eq(nutritionGoals.userId, session!.user.id))
      .orderBy(desc(nutritionGoals.effectiveFrom));

    return NextResponse.json(allGoals);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = createNutritionGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Upsert on (userId, effectiveFrom) to seamlessly update if a goal already exists for that date
    const [savedGoal] = await client
      .insert(nutritionGoals)
      .values({
        ...parsed.data,
        userId: session!.user.id,
      })
      .onConflictDoUpdate({
        target: [nutritionGoals.userId, nutritionGoals.effectiveFrom],
        set: parsed.data,
      })
      .returning();

    return NextResponse.json(savedGoal, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
