import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { nutritionGoals } from "@/schema";
import { eq, and } from "drizzle-orm";
import { updateNutritionGoalSchema, isValidUuid } from "@/lib/validations/nutrition";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    if (!isValidUuid(id)) {
      return NextResponse.json({ error: "Invalid goal ID format" }, { status: 400 });
    }

    const [goal] = await client
      .select()
      .from(nutritionGoals)
      .where(
        and(
          eq(nutritionGoals.id, id),
          eq(nutritionGoals.userId, session!.user.id)
        )
      );

    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    return NextResponse.json(goal);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    if (!isValidUuid(id)) {
      return NextResponse.json({ error: "Invalid goal ID format" }, { status: 400 });
    }

    // 1. Fetch existing goal to validate partial updates
    const [existingGoal] = await client
      .select()
      .from(nutritionGoals)
      .where(
        and(
          eq(nutritionGoals.id, id),
          eq(nutritionGoals.userId, session!.user.id)
        )
      );

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateNutritionGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // 2. Cross-validate effectiveFrom vs effectiveTo with existing record
    const finalEffectiveFrom = parsed.data.effectiveFrom ?? existingGoal.effectiveFrom;
    const finalEffectiveTo =
      parsed.data.effectiveTo !== undefined
        ? parsed.data.effectiveTo
        : existingGoal.effectiveTo;

    if (finalEffectiveTo && finalEffectiveTo < finalEffectiveFrom) {
      return NextResponse.json(
        { error: "effectiveTo must be on or after effectiveFrom" },
        { status: 400 }
      );
    }

    const [updatedGoal] = await client
      .update(nutritionGoals)
      .set(parsed.data)
      .where(
        and(
          eq(nutritionGoals.id, id),
          eq(nutritionGoals.userId, session!.user.id)
        )
      )
      .returning();

    return NextResponse.json(updatedGoal);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    if (!isValidUuid(id)) {
      return NextResponse.json({ error: "Invalid goal ID format" }, { status: 400 });
    }

    const [deletedGoal] = await client
      .delete(nutritionGoals)
      .where(
        and(
          eq(nutritionGoals.id, id),
          eq(nutritionGoals.userId, session!.user.id)
        )
      )
      .returning();

    if (!deletedGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
