import { z } from "zod";
import { MEAL_TYPE, NUTRITION_SOURCE } from "@/lib/constants";

export const isValidUuid = (id: string): boolean => z.string().uuid().safeParse(id).success;

/**
 * Validates that a string is a real calendar date in YYYY-MM-DD format
 * (e.g. rejects 2026-99-99, 2026-02-31, 2025-02-29).
 */
export const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
  .refine(
    (val) => {
      const [year, month, day] = val.split("-").map(Number);
      const d = new Date(Date.UTC(year, month - 1, day));
      return (
        d.getUTCFullYear() === year &&
        d.getUTCMonth() === month - 1 &&
        d.getUTCDate() === day
      );
    },
    { message: "Invalid calendar date (check month, day, and leap year)" }
  );

// --- FOOD TEMPLATES VALIDATION ---
export const createFoodSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  brand: z.string().optional(),
  barcode: z
    .string()
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  servingQuantity: z.number().positive("Serving quantity must be greater than 0").default(1),
  servingUnit: z.string().min(1).default("serving"),
  calories: z.number().nonnegative().default(0),
  proteinGrams: z.number().nonnegative().default(0),
  carbohydrateGrams: z.number().nonnegative().default(0),
  fatGrams: z.number().nonnegative().default(0),
  saturatedFatGrams: z.number().nonnegative().default(0),
  fiberGrams: z.number().nonnegative().default(0),
  sugarGrams: z.number().nonnegative().default(0),
  sodiumMilligrams: z.number().nonnegative().default(0),
});

export const updateFoodSchema = createFoodSchema.partial();

export const foodQuerySchema = z.object({
  search: z.string().optional(),
  barcode: z.string().optional(),
  onlyUser: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// --- NUTRITION ENTRIES VALIDATION ---
export const createNutritionEntrySchema = z
  .object({
    foodId: z.string().uuid("Invalid foodId UUID format").optional(),
    foodName: z.string().min(1).optional(),
    mealType: z.nativeEnum(MEAL_TYPE).optional(),
    source: z.nativeEnum(NUTRITION_SOURCE).default(NUTRITION_SOURCE.MANUAL),
    quantity: z.number().positive("Quantity must be greater than 0").default(1),
    quantityUnit: z.string().min(1).default("serving"),
    calories: z.number().nonnegative().optional(),
    proteinGrams: z.number().nonnegative().optional(),
    carbohydrateGrams: z.number().nonnegative().optional(),
    fatGrams: z.number().nonnegative().optional(),
    saturatedFatGrams: z.number().nonnegative().optional(),
    fiberGrams: z.number().nonnegative().optional(),
    sugarGrams: z.number().nonnegative().optional(),
    sodiumMilligrams: z.number().nonnegative().optional(),
    notes: z.string().optional(),
    consumedAt: z.string().datetime().optional(),
  })
  .refine((data) => Boolean(data.foodName || data.foodId), {
    message: "Either foodName or a valid foodId must be provided",
    path: ["foodName"],
  });

export const updateNutritionEntrySchema = z.object({
  foodId: z.string().uuid("Invalid foodId UUID format").optional(),
  foodName: z.string().min(1).optional(),
  mealType: z.nativeEnum(MEAL_TYPE).optional(),
  source: z.nativeEnum(NUTRITION_SOURCE).optional(),
  quantity: z.number().positive("Quantity must be greater than 0").optional(),
  quantityUnit: z.string().min(1).optional(),
  calories: z.number().nonnegative().optional(),
  proteinGrams: z.number().nonnegative().optional(),
  carbohydrateGrams: z.number().nonnegative().optional(),
  fatGrams: z.number().nonnegative().optional(),
  saturatedFatGrams: z.number().nonnegative().optional(),
  fiberGrams: z.number().nonnegative().optional(),
  sugarGrams: z.number().nonnegative().optional(),
  sodiumMilligrams: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  consumedAt: z.string().datetime().optional(),
});

export const nutritionEntryQuerySchema = z.object({
  date: calendarDateSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  mealType: z.nativeEnum(MEAL_TYPE).optional(),
  timezone: z.string().optional(),
});

// --- NUTRITION GOALS VALIDATION ---
export const createNutritionGoalSchema = z
  .object({
    effectiveFrom: calendarDateSchema,
    effectiveTo: calendarDateSchema.optional(),
    calorieTarget: z.number().nonnegative().optional(),
    proteinGramsTarget: z.number().nonnegative().optional(),
    carbohydrateGramsTarget: z.number().nonnegative().optional(),
    fatGramsTarget: z.number().nonnegative().optional(),
    fiberGramsTarget: z.number().nonnegative().optional(),
    sodiumMilligramsLimit: z.number().nonnegative().optional(),
    waterMillilitersTarget: z.number().nonnegative().optional(),
  })
  .refine((data) => !data.effectiveTo || data.effectiveTo >= data.effectiveFrom, {
    message: "effectiveTo must be on or after effectiveFrom",
    path: ["effectiveTo"],
  });

export const updateNutritionGoalSchema = z
  .object({
    effectiveFrom: calendarDateSchema.optional(),
    effectiveTo: calendarDateSchema.optional(),
    calorieTarget: z.number().nonnegative().optional(),
    proteinGramsTarget: z.number().nonnegative().optional(),
    carbohydrateGramsTarget: z.number().nonnegative().optional(),
    fatGramsTarget: z.number().nonnegative().optional(),
    fiberGramsTarget: z.number().nonnegative().optional(),
    sodiumMilligramsLimit: z.number().nonnegative().optional(),
    waterMillilitersTarget: z.number().nonnegative().optional(),
  })
  .refine(
    (data) => !data.effectiveFrom || !data.effectiveTo || data.effectiveTo >= data.effectiveFrom,
    {
      message: "effectiveTo must be on or after effectiveFrom",
      path: ["effectiveTo"],
    }
  );

export const nutritionGoalQuerySchema = z.object({
  date: calendarDateSchema.optional(),
  timezone: z.string().optional(),
});
