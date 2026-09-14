import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { nutritionEntries, foods } from "@/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { updateNutritionEntrySchema, isValidUuid } from "@/lib/validations/nutrition";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    if (!isValidUuid(id)) {
      return NextResponse.json({ error: "Invalid entry ID format" }, { status: 400 });
    }

    const [entry] = await client
      .select()
      .from(nutritionEntries)
      .where(
        and(
          eq(nutritionEntries.id, id),
          eq(nutritionEntries.userId, session!.user.id)
        )
      );

    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json(entry);
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
      return NextResponse.json({ error: "Invalid entry ID format" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateNutritionEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Security fix: If updating foodId, ensure it exists and is either owned by current user or is public
    if (parsed.data.foodId) {
      const [food] = await client
        .select()
        .from(foods)
        .where(
          and(
            eq(foods.id, parsed.data.foodId),
            or(eq(foods.ownerId, session!.user.id), isNull(foods.ownerId))
          )
        );
      if (!food) {
        return NextResponse.json(
          { error: "Referenced food template not found or is private to another user" },
          { status: 404 }
        );
      }
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.consumedAt) {
      updateData.consumedAt = new Date(parsed.data.consumedAt);
    }

    const [updatedEntry] = await client
      .update(nutritionEntries)
      .set(updateData)
      .where(
        and(
          eq(nutritionEntries.id, id),
          eq(nutritionEntries.userId, session!.user.id)
        )
      )
      .returning();

    if (!updatedEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEntry);
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
      return NextResponse.json({ error: "Invalid entry ID format" }, { status: 400 });
    }

    const [deletedEntry] = await client
      .delete(nutritionEntries)
      .where(
        and(
          eq(nutritionEntries.id, id),
          eq(nutritionEntries.userId, session!.user.id)
        )
      )
      .returning();

    if (!deletedEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
