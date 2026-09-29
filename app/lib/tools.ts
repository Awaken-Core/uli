import "server-only";

import { tavily } from "@tavily/core";
import { z } from "zod";
import { env } from "./env";
import type { AgentAction } from "./decision-model";

export type ToolAction = Exclude<AgentAction, "respond">;

interface ToolContext {
  requestHeaders: Headers;
}

interface ToolDefinition {
  description: string;
  inputSchema: z.ZodType;
  execute: (input: unknown, context: ToolContext) => Promise<unknown>;
}

const nutritionFields = {
  calories: z.number().nonnegative().optional(),
  proteinGrams: z.number().nonnegative().optional(),
  carbohydrateGrams: z.number().nonnegative().optional(),
  fatGrams: z.number().nonnegative().optional(),
  saturatedFatGrams: z.number().nonnegative().optional(),
  fiberGrams: z.number().nonnegative().optional(),
  sugarGrams: z.number().nonnegative().optional(),
  sodiumMilligrams: z.number().nonnegative().optional(),
};

const searchFoodNutritionSchema = z.object({
  food: z.string().min(1).describe("Specific food, preparation, and brand if known"),
  quantityGrams: z.number().positive().default(100).describe("Edible portion in grams"),
});

const logMealSchema = z
  .object({
    foodId: z.string().uuid().optional(),
    foodName: z.string().min(1).optional(),
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
    source: z.enum(["manual", "savedFood", "barcode", "ai"]).default("ai"),
    quantity: z.number().positive().default(1),
    quantityUnit: z.string().min(1).default("serving"),
    ...nutritionFields,
    notes: z.string().optional(),
    consumedAt: z.string().datetime().optional(),
  })
  .refine((data) => Boolean(data.foodId || data.foodName), {
    message: "Either foodId or foodName is required",
    path: ["foodName"],
  });

const addFoodSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  servingQuantity: z.number().positive().default(1),
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

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  status: z.enum(["todo", "inProgress", "completed", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  dueAt: z.string().datetime().optional(),
  estimatedMinutes: z.number().int().nonnegative().optional(),
  recurrenceRule: z.string().optional(),
  recurrenceTimeZone: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

async function postToApp(path: string, body: unknown, requestHeaders: Headers) {
  const headers = new Headers({ "content-type": "application/json" });
  const cookie = requestHeaders.get("cookie");
  const authorization = requestHeaders.get("authorization");
  if (cookie) headers.set("cookie", cookie);
  if (authorization) headers.set("authorization", authorization);

  const response = await fetch(new URL(path, env.NEXT_PUBLIC_APP_BASE_URL), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Tool request failed (${response.status}): ${JSON.stringify(result)}`);
  }
  return result;
}

function apiTool(
  description: string,
  path: string,
  inputSchema: z.ZodType,
): ToolDefinition {
  return {
    description,
    inputSchema,
    execute: async (input, { requestHeaders }) =>
      postToApp(path, inputSchema.parse(input), requestHeaders),
  };
}

const toolDefinitions: Record<ToolAction, ToolDefinition> = {
  search_food_nutrition: {
    description: "Search reliable web sources for nutrition facts normalized to a gram quantity.",
    inputSchema: searchFoodNutritionSchema,
    execute: async (input) => {
      const { food, quantityGrams } = searchFoodNutritionSchema.parse(input);
      const result = await tavily({ apiKey: env.TAVILY_API_KEY }).search(
        `${food} nutrition for ${quantityGrams} grams calories protein carbohydrates total fat saturated fat fiber sugar sodium`,
        {
          includeAnswer: "advanced",
          includeDomainsMode: "prefer",
          includeDomains: ["fdc.nal.usda.gov", "usda.gov", "nih.gov"],
          maxResults: 5,
          searchDepth: "advanced",
        },
      );
      return {
        food,
        quantityGrams,
        requestedFields: Object.keys(nutritionFields),
        answer: result.answer ?? "",
        sources: result.results.map(({ title, url, content }) => ({ title, url, content })),
      };
    },
  },
  log_meal: apiTool(
    "Create a consumed nutrition entry for the authenticated user.",
    "/api/nutrition/entries",
    logMealSchema,
  ),
  add_food: apiTool(
    "Save a reusable food and its per-serving nutrition for the authenticated user.",
    "/api/nutrition/foods",
    addFoodSchema,
  ),
  create_task: apiTool(
    "Create a task or reminder for the authenticated user.",
    "/api/tasks",
    createTaskSchema,
  ),
};

const toolNames = Object.keys(toolDefinitions) as ToolAction[];

export const availableAgentActions: {
  name: AgentAction;
  description: string;
  parameters?: unknown;
}[] = [
  { name: "respond", description: "Answer without changing data." },
  ...toolNames.map((name) => ({
    name,
    description: toolDefinitions[name].description,
    parameters: z.toJSONSchema(toolDefinitions[name].inputSchema),
  })),
];

export async function executeAgentTool(
  name: ToolAction,
  input: Record<string, unknown>,
  requestHeaders: Headers,
) {
  return toolDefinitions[name].execute(input, { requestHeaders });
}
