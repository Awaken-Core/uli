import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { client } from "@/lib/db";
import { foods } from "@/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { updateFoodSchema, isValidUuid } from "@/lib/validations/nutrition";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    if (!isValidUuid(id)) {
      return NextResponse.json({ error: "Invalid food ID format" }, { status: 400 });
    }

    const [food] = await client
      .select()
      .from(foods)
      .where(
        and(
          eq(foods.id, id),
          or(eq(foods.ownerId, session!.user.id), isNull(foods.ownerId))
        )
      );

    if (!food) return NextResponse.json({ error: "Food not found" }, { status: 404 });
    return NextResponse.json(food);
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
      return NextResponse.json({ error: "Invalid food ID format" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateFoodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [updatedFood] = await client
      .update(foods)
      .set(parsed.data)
      .where(and(eq(foods.id, id), eq(foods.ownerId, session!.user.id)))
      .returning();

    if (!updatedFood) {
      return NextResponse.json(
        { error: "Food not found or you do not have permission to edit it" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFood);
  } catch (err: unknown) {
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

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    if (!isValidUuid(id)) {
      return NextResponse.json({ error: "Invalid food ID format" }, { status: 400 });
    }

    const [deletedFood] = await client
      .delete(foods)
      .where(and(eq(foods.id, id), eq(foods.ownerId, session!.user.id)))
      .returning();

    if (!deletedFood) {
      return NextResponse.json(
        { error: "Food not found or you do not have permission to delete it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
