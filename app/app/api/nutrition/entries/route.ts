import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { foods, nutritionEntries } from "@/schema";
import { eq, and, gte, lte, desc, or, isNull } from "drizzle-orm";
import {
  createNutritionEntrySchema,
  nutritionEntryQuerySchema,
} from "@/lib/validations/nutrition";
import { getStartAndEndOfDayInTimezone } from "@/lib/timezone";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = req.nextUrl;
    const query = nutritionEntryQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return NextResponse.json({ error: query.error.flatten() }, { status: 400 });
    }

    const { date, startDate, endDate, mealType, timezone } = query.data;

    const conditions = [eq(nutritionEntries.userId, session!.user.id)];

    if (mealType) {
      conditions.push(eq(nutritionEntries.mealType, mealType));
    }

    if (date) {
      const { startOfDay, endOfDay } = getStartAndEndOfDayInTimezone(date, timezone);
      conditions.push(
        gte(nutritionEntries.consumedAt, startOfDay),
        lte(nutritionEntries.consumedAt, endOfDay)
      );
    } else {
      if (startDate) {
        conditions.push(gte(nutritionEntries.consumedAt, new Date(startDate)));
      }
      if (endDate) {
        conditions.push(lte(nutritionEntries.consumedAt, new Date(endDate)));
      }
    }

    const result = await client
      .select()
      .from(nutritionEntries)
      .where(and(...conditions))
      .orderBy(desc(nutritionEntries.consumedAt));

    return NextResponse.json(result);
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
    const parsed = createNutritionEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    let foodTemplate = null;

    // Security fix: Verify foodId exists AND is either owned by current user or is public
    if (data.foodId) {
      const [found] = await client
        .select()
        .from(foods)
        .where(
          and(
            eq(foods.id, data.foodId),
            or(eq(foods.ownerId, session!.user.id), isNull(foods.ownerId))
          )
        );

      if (!found) {
        return NextResponse.json(
          { error: "Referenced food template not found or is private to another user" },
          { status: 404 }
        );
      }
      foodTemplate = found;
    }

    // Calculate ratio if food template exists
    const servingBase = foodTemplate?.servingQuantity ?? 1;
    const scaleRatio = servingBase > 0 ? data.quantity / servingBase : 1;

    const roundTo2 = (num: number) => Math.round(num * 100) / 100;

    // Create immutable snapshot of nutrition facts
    const entryValues = {
      userId: session!.user.id,
      foodId: data.foodId ?? null,
      foodName: data.foodName || foodTemplate?.name || "Custom Item",
      mealType: data.mealType,
      source: data.source,
      quantity: data.quantity,
      quantityUnit: data.quantityUnit || foodTemplate?.servingUnit || "serving",
      calories: data.calories ?? (foodTemplate ? roundTo2(foodTemplate.calories * scaleRatio) : 0),
      proteinGrams:
        data.proteinGrams ?? (foodTemplate ? roundTo2(foodTemplate.proteinGrams * scaleRatio) : 0),
      carbohydrateGrams:
        data.carbohydrateGrams ??
        (foodTemplate ? roundTo2(foodTemplate.carbohydrateGrams * scaleRatio) : 0),
      fatGrams: data.fatGrams ?? (foodTemplate ? roundTo2(foodTemplate.fatGrams * scaleRatio) : 0),
      saturatedFatGrams:
        data.saturatedFatGrams ??
        (foodTemplate ? roundTo2(foodTemplate.saturatedFatGrams * scaleRatio) : 0),
      fiberGrams:
        data.fiberGrams ?? (foodTemplate ? roundTo2(foodTemplate.fiberGrams * scaleRatio) : 0),
      sugarGrams:
        data.sugarGrams ?? (foodTemplate ? roundTo2(foodTemplate.sugarGrams * scaleRatio) : 0),
      sodiumMilligrams:
        data.sodiumMilligrams ??
        (foodTemplate ? roundTo2(foodTemplate.sodiumMilligrams * scaleRatio) : 0),
      notes: data.notes ?? null,
      consumedAt: data.consumedAt ? new Date(data.consumedAt) : new Date(),
    };

    const [newEntry] = await client
      .insert(nutritionEntries)
      .values(entryValues)
      .returning();

    return NextResponse.json(newEntry, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
