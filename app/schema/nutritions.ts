import { relations } from "drizzle-orm/_relations";
import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./user";
import type { MealType, NutritionSource } from "@/lib/constants";

export const foods = pgTable(
  "food",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("ownerId").references(() => user.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    brand: text("brand"),
    barcode: text("barcode").unique(),
    servingQuantity: numeric("servingQuantity", {
      precision: 10,
      scale: 2,
      mode: "number",
    })
      .default(1)
      .notNull(),
    servingUnit: text("servingUnit").default("serving").notNull(),
    calories: numeric("calories", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    proteinGrams: numeric("proteinGrams", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    carbohydrateGrams: numeric("carbohydrateGrams", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    fatGrams: numeric("fatGrams", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    saturatedFatGrams: numeric("saturatedFatGrams", {
      precision: 10,
      scale: 2,
      mode: "number",
    }).default(0).notNull(),
    fiberGrams: numeric("fiberGrams", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    sugarGrams: numeric("sugarGrams", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    sodiumMilligrams: numeric("sodiumMilligrams", {
      precision: 10,
      scale: 2,
      mode: "number",
    }).default(0).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("food_owner_id_idx").on(table.ownerId),
    index("food_name_idx").on(table.name),
    check(
      "food_nutrition_nonnegative_check",
      sql`${table.servingQuantity} > 0 and ${table.calories} >= 0 and ${table.proteinGrams} >= 0 and ${table.carbohydrateGrams} >= 0 and ${table.fatGrams} >= 0 and ${table.saturatedFatGrams} >= 0 and ${table.fiberGrams} >= 0 and ${table.sugarGrams} >= 0 and ${table.sodiumMilligrams} >= 0`,
    ),
  ],
);

export const nutritionEntries = pgTable(
  "nutritionEntry",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    foodId: uuid("foodId").references(() => foods.id, { onDelete: "set null" }),
    foodName: text("foodName").notNull(),
    mealType: text("mealType").$type<MealType>(),
    source: text("source")
      .$type<NutritionSource>()
      .default("manual")
      .notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2, mode: "number" })
      .default(1)
      .notNull(),
    quantityUnit: text("quantityUnit").default("serving").notNull(),
    calories: numeric("calories", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    proteinGrams: numeric("proteinGrams", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    carbohydrateGrams: numeric("carbohydrateGrams", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    fatGrams: numeric("fatGrams", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    saturatedFatGrams: numeric("saturatedFatGrams", {
      precision: 10,
      scale: 2,
      mode: "number",
    }).default(0).notNull(),
    fiberGrams: numeric("fiberGrams", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    sugarGrams: numeric("sugarGrams", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    sodiumMilligrams: numeric("sodiumMilligrams", {
      precision: 10,
      scale: 2,
      mode: "number",
    }).default(0).notNull(),
    notes: text("notes"),
    consumedAt: timestamp("consumedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("nutrition_entry_user_consumed_at_idx").on(table.userId, table.consumedAt),
    index("nutrition_entry_food_id_idx").on(table.foodId),
    check(
      "nutrition_entry_values_check",
      sql`${table.quantity} > 0 and ${table.calories} >= 0 and ${table.proteinGrams} >= 0 and ${table.carbohydrateGrams} >= 0 and ${table.fatGrams} >= 0 and ${table.saturatedFatGrams} >= 0 and ${table.fiberGrams} >= 0 and ${table.sugarGrams} >= 0 and ${table.sodiumMilligrams} >= 0`,
    ),
  ],
);

export const nutritionGoals = pgTable(
  "nutritionGoal",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    effectiveFrom: date("effectiveFrom", { mode: "string" }).notNull(),
    effectiveTo: date("effectiveTo", { mode: "string" }),
    calorieTarget: numeric("calorieTarget", { precision: 10, scale: 2, mode: "number" }),
    proteinGramsTarget: numeric("proteinGramsTarget", { precision: 10, scale: 2, mode: "number" }),
    carbohydrateGramsTarget: numeric("carbohydrateGramsTarget", {
      precision: 10,
      scale: 2,
      mode: "number",
    }),
    fatGramsTarget: numeric("fatGramsTarget", { precision: 10, scale: 2, mode: "number" }),
    fiberGramsTarget: numeric("fiberGramsTarget", { precision: 10, scale: 2, mode: "number" }),
    sodiumMilligramsLimit: numeric("sodiumMilligramsLimit", {
      precision: 10,
      scale: 2,
      mode: "number",
    }),
    waterMillilitersTarget: numeric("waterMillilitersTarget", {
      precision: 10,
      scale: 2,
      mode: "number",
    }),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("nutrition_goal_user_effective_from_uidx").on(
      table.userId,
      table.effectiveFrom,
    ),
    check(
      "nutrition_goal_date_range_check",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`,
    ),
    check(
      "nutrition_goal_values_nonnegative_check",
      sql`(${table.calorieTarget} is null or ${table.calorieTarget} >= 0) and (${table.proteinGramsTarget} is null or ${table.proteinGramsTarget} >= 0) and (${table.carbohydrateGramsTarget} is null or ${table.carbohydrateGramsTarget} >= 0) and (${table.fatGramsTarget} is null or ${table.fatGramsTarget} >= 0) and (${table.fiberGramsTarget} is null or ${table.fiberGramsTarget} >= 0) and (${table.sodiumMilligramsLimit} is null or ${table.sodiumMilligramsLimit} >= 0) and (${table.waterMillilitersTarget} is null or ${table.waterMillilitersTarget} >= 0)`,
    ),
  ],
);

export const foodRelations = relations(foods, ({ one, many }) => ({
  owner: one(user, {
    fields: [foods.ownerId],
    references: [user.id],
  }),
  entries: many(nutritionEntries),
}));

export const nutritionEntryRelations = relations(nutritionEntries, ({ one }) => ({
  user: one(user, {
    fields: [nutritionEntries.userId],
    references: [user.id],
  }),
  food: one(foods, {
    fields: [nutritionEntries.foodId],
    references: [foods.id],
  }),
}));

export const nutritionGoalRelations = relations(nutritionGoals, ({ one }) => ({
  user: one(user, {
    fields: [nutritionGoals.userId],
    references: [user.id],
  }),
}));
