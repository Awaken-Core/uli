import "server-only";

import { tavily } from "@tavily/core";
import { z } from "zod";
import { env } from "./env";
import type { AgentAction } from "./decision-model";

// --- Shared types ---

export type ToolAction = Exclude<AgentAction, "respond">;

/** JSON Schema object as returned by z.toJSONSchema(). Passed through to the LLM for parameter extraction. */
export type JsonSchema = Record<string, unknown>;

export interface NutritionSearchResult {
  food: string;
  quantityGrams: number;
  requestedFields: string[];
  answer: string;
  sources: { title: string; url: string; content: string }[];
}

export interface ApiResponse {
  id: string;
  [key: string]: string | number | boolean | null | Date | undefined;
}

export interface ToolError {
  error: string;
}

export type ToolOutput = NutritionSearchResult | ApiResponse | ToolError;

// --- Internal types ---

interface ToolContext {
  requestHeaders: Headers;
}

interface ToolDefinition {
  description: string;
  inputSchema: z.ZodType;
  execute: (input: Record<string, unknown>, context: ToolContext) => Promise<ToolOutput>;
}

// --- Nutrition fields ---

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

// --- Schemas ---

const searchFoodNutritionSchema = z.object({
  food: z.string().optional().describe("Food name, preparation, and brand if known"),
  query: z.string().optional().describe("Alternative field name for food"),
  quantityGrams: z.coerce.number().positive().optional().describe("Edible portion in grams, defaults to 100"),
  quantity: z.coerce.number().positive().optional().describe("Alternative field name for quantityGrams"),
}).passthrough();

const logMealSchema = z
  .object({
    foodId: z.string().uuid().optional(),
    foodName: z.string().min(1).optional(),
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).default("breakfast").optional(),
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
  scheduledDate: z.string().date().optional(),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  dueAt: z.string().datetime().optional(),
  estimatedMinutes: z.number().int().nonnegative().optional(),
  recurrenceRule: z.string().optional(),
  recurrenceTimeZone: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// --- Helpers ---

function parseSearchInput(input: Record<string, unknown>): { food: string; quantityGrams: number } {
  const parsed = searchFoodNutritionSchema.safeParse(input);
  if (!parsed.success) return { food: String(input), quantityGrams: 100 };
  return {
    food: parsed.data.food || parsed.data.query || "",
    quantityGrams: parsed.data.quantityGrams || parsed.data.quantity || 100,
  };
}

async function postToApp(path: string, body: Record<string, unknown>, requestHeaders: Headers): Promise<ApiResponse> {
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
  const result = (await response.json().catch(() => null)) as ApiResponse | null;
  if (!response.ok || !result) {
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
      postToApp(path, inputSchema.parse(input) as Record<string, unknown>, requestHeaders),
  };
}

// --- Tool definitions ---

const toolDefinitions: Record<ToolAction, ToolDefinition> = {
  search_food_nutrition: {
    description: "Search reliable web sources for nutrition facts about a food.",
    inputSchema: searchFoodNutritionSchema,
    execute: async (input): Promise<NutritionSearchResult | ToolError> => {
      const { food, quantityGrams } = parseSearchInput(input);
      if (!food) return { error: "No food specified to search for." };

      const result = await tavily({ apiKey: env.TAVILY_API_KEY }).search(
        `${food} nutrition for ${quantityGrams} grams calories protein carbohydrates total fat saturated fat fiber sugar sodium`,
        {
          includeAnswer: "advanced",
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
    "Log a meal or food the user consumed.",
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

// --- Exports ---

export interface AvailableAction {
  name: AgentAction;
  description: string;
  parameters?: JsonSchema;
}

const toolNames = Object.keys(toolDefinitions) as ToolAction[];

export const availableAgentActions: AvailableAction[] = [
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
): Promise<ToolOutput> {
  return toolDefinitions[name].execute(input, { requestHeaders });
}
