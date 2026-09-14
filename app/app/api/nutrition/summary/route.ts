import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { nutritionEntries, nutritionGoals } from "@/schema";
import { eq, and, gte, lte, isNull, or, desc } from "drizzle-orm";
import { z } from "zod";
import { calendarDateSchema } from "@/lib/validations/nutrition";
import { getStartAndEndOfDayInTimezone, getTodayInTimezone } from "@/lib/timezone";

const summaryQuerySchema = z.object({
  date: calendarDateSchema.optional(),
  timezone: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = req.nextUrl;
    const query = summaryQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return NextResponse.json({ error: query.error.flatten() }, { status: 400 });
    }

    const { date, timezone } = query.data;

    // Resolve target date in the user's timezone if not explicitly provided
    const targetDate = date || getTodayInTimezone(timezone);

    // Compute exact start and end of day in the user's timezone
    const { startOfDay, endOfDay } = getStartAndEndOfDayInTimezone(targetDate, timezone);

    // 1. Fetch all logged entries for the localized day range
    const entries = await client
      .select()
      .from(nutritionEntries)
      .where(
        and(
          eq(nutritionEntries.userId, session!.user.id),
          gte(nutritionEntries.consumedAt, startOfDay),
          lte(nutritionEntries.consumedAt, endOfDay)
        )
      );

    // 2. Fetch active nutrition goal for target date
    const [activeGoal] = await client
      .select()
      .from(nutritionGoals)
      .where(
        and(
          eq(nutritionGoals.userId, session!.user.id),
          lte(nutritionGoals.effectiveFrom, targetDate),
          or(isNull(nutritionGoals.effectiveTo), gte(nutritionGoals.effectiveTo, targetDate))
        )
      )
      .orderBy(desc(nutritionGoals.effectiveFrom))
      .limit(1);

    // 3. Compute totals
    const round2 = (num: number) => Math.round(num * 100) / 100;

    const totals = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    const byMeal: Record<
      string,
      { calories: number; itemsCount: number; entries: typeof entries }
    > = {
      breakfast: { calories: 0, itemsCount: 0, entries: [] },
      lunch: { calories: 0, itemsCount: 0, entries: [] },
      dinner: { calories: 0, itemsCount: 0, entries: [] },
      snack: { calories: 0, itemsCount: 0, entries: [] },
      other: { calories: 0, itemsCount: 0, entries: [] },
    };

    for (const entry of entries) {
      totals.calories += Number(entry.calories || 0);
      totals.protein += Number(entry.proteinGrams || 0);
      totals.carbohydrates += Number(entry.carbohydrateGrams || 0);
      totals.fats += Number(entry.fatGrams || 0);
      totals.fiber += Number(entry.fiberGrams || 0);
      totals.sugar += Number(entry.sugarGrams || 0);
      totals.sodium += Number(entry.sodiumMilligrams || 0);

      const mealKey = entry.mealType && byMeal[entry.mealType] ? entry.mealType : "other";
      byMeal[mealKey].calories += Number(entry.calories || 0);
      byMeal[mealKey].itemsCount += 1;
      byMeal[mealKey].entries.push(entry);
    }

    // Round summary totals
    totals.calories = round2(totals.calories);
    totals.protein = round2(totals.protein);
    totals.carbohydrates = round2(totals.carbohydrates);
    totals.fats = round2(totals.fats);
    totals.fiber = round2(totals.fiber);
    totals.sugar = round2(totals.sugar);
    totals.sodium = round2(totals.sodium);

    for (const key of Object.keys(byMeal)) {
      byMeal[key].calories = round2(byMeal[key].calories);
    }

    // Default targets if no custom goal was configured
    const calorieTarget = Number(activeGoal?.calorieTarget ?? 2000);
    const proteinTarget = Number(activeGoal?.proteinGramsTarget ?? 120);
    const carbsTarget = Number(activeGoal?.carbohydrateGramsTarget ?? 220);
    const fatsTarget = Number(activeGoal?.fatGramsTarget ?? 65);
    const fiberTarget = Number(activeGoal?.fiberGramsTarget ?? 30);
    const sodiumLimit = Number(activeGoal?.sodiumMilligramsLimit ?? 2300);
    const waterTarget = Number(activeGoal?.waterMillilitersTarget ?? 2000);

    return NextResponse.json({
      date: targetDate,
      timezone: timezone ?? "UTC",
      goal: activeGoal ?? null,
      summary: {
        consumed: totals,
        target: {
          calories: calorieTarget,
          protein: proteinTarget,
          carbohydrates: carbsTarget,
          fats: fatsTarget,
          fiber: fiberTarget,
          sodium: sodiumLimit,
          water: waterTarget,
        },
        remaining: {
          calories: Math.max(0, round2(calorieTarget - totals.calories)),
        },
        progress: {
          calories: calorieTarget > 0 ? round2(totals.calories / calorieTarget) : 0,
          protein: proteinTarget > 0 ? round2(totals.protein / proteinTarget) : 0,
          carbohydrates: carbsTarget > 0 ? round2(totals.carbohydrates / carbsTarget) : 0,
          fats: fatsTarget > 0 ? round2(totals.fats / fatsTarget) : 0,
        },
      },
      byMeal,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
