import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { foods } from "@/schema";
import { eq, or, and, ilike, isNull } from "drizzle-orm";
import { createFoodSchema, foodQuerySchema } from "@/lib/validations/nutrition";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = req.nextUrl;
    const query = foodQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) {
      return NextResponse.json({ error: query.error.flatten() }, { status: 400 });
    }

    const { search, barcode, onlyUser } = query.data;

    const conditions = [];

    // Visibility: User's foods or global/public foods
    if (onlyUser) {
      conditions.push(eq(foods.ownerId, session!.user.id));
    } else {
      conditions.push(or(eq(foods.ownerId, session!.user.id), isNull(foods.ownerId)));
    }

    // Filter by barcode if provided
    if (barcode) {
      conditions.push(eq(foods.barcode, barcode.trim()));
    }

    // Search by food name or brand
    if (search && search.trim().length > 0) {
      const cleanSearch = search.trim();
      conditions.push(
        or(
          ilike(foods.name, `%${cleanSearch}%`),
          ilike(foods.brand, `%${cleanSearch}%`)
        )
      );
    }

    const result = await client
      .select()
      .from(foods)
      .where(and(...conditions))
      .limit(50);

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
    const parsed = createFoodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [newFood] = await client
      .insert(foods)
      .values({
        ...parsed.data,
        ownerId: session!.user.id,
      })
      .returning();

    return NextResponse.json(newFood, { status: 201 });
  } catch (err: unknown) {
    // Check for PostgreSQL unique constraint violation on barcode
    const errObj = err as { code?: string; message?: string };
    if (errObj.code === "23505" || errObj.message?.includes("barcode")) {
      return NextResponse.json(
        { error: "A food with this barcode already exists" },
        { status: 409 }
      );
    }
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
