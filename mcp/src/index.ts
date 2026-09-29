import { tavily } from "@tavily/core";
import { createMcpHonoApp } from "@modelcontextprotocol/hono";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { createMcpProtectedRequestHandler } from "@better-auth/mcp";
import * as z from "zod/v4";
import { env } from "./config/env";
import { toolError, toolResult } from "./utils";

const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack"]);
const nutritionSourceSchema = z.enum(["manual", "savedFood", "barcode", "ai"]);
const taskStatusSchema = z.enum(["todo", "inProgress", "completed", "cancelled"]);
const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

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

function createServer(request: Request) {
  const server = new McpServer({
    name: "uli-mcp-server",
    version: "1.0.0",
  });
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");

  const postToUli = async (path: string, body: unknown) => {
    if (!authorization && !cookie) {
      throw new Error("Authentication required. Supply a Better Auth session cookie or Bearer session token.");
    }

    const headers = new Headers({ "content-type": "application/json" });
    if (authorization) headers.set("authorization", authorization);
    if (cookie) headers.set("cookie", cookie);

    const response = await fetch(new URL(path, env.SERVER_URL), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const responseBody: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const detail = responseBody ? JSON.stringify(responseBody) : response.statusText;
      throw new Error(`Uli API request failed (${response.status}): ${detail}`);
    }
    return responseBody;
  };

  server.registerTool(
    "search_food_nutrition",
    {
      title: "Search food nutrition",
      description: "Search reliable web sources for nutrition facts normalized to a gram quantity. Returns every nutrition field used by Uli; verify the cited sources before logging.",
      inputSchema: z.object({
        food: z.string().min(1).describe("Specific food, preparation, and brand if known"),
        quantityGrams: z.number().positive().default(100).describe("Edible portion in grams"),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ food, quantityGrams }) => {
      try {
        const client = tavily({ apiKey: env.TAVILY_API_KEY });
        const result = await client.search(
          `${food} nutrition for ${quantityGrams} grams calories protein carbohydrates total fat saturated fat fiber sugar sodium`,
          {
            includeAnswer: "advanced",
            includeDomainsMode: "prefer",
            includeDomains: ["fdc.nal.usda.gov", "usda.gov", "nih.gov"],
            maxResults: 5,
            searchDepth: "advanced",
          },
        );
        return toolResult({
          food,
          quantityGrams,
          requestedFields: ["calories", "proteinGrams", "carbohydrateGrams", "fatGrams", "saturatedFatGrams", "fiberGrams", "sugarGrams", "sodiumMilligrams"],
          answer: result.answer ?? "",
          sources: result.results.map(({ title, url, content }) => ({ title, url, content })),
        });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "log_meal",
    {
      title: "Log meal",
      description: "Create a nutrition entry for the authenticated Better Auth user.",
      inputSchema: z.object({
        foodId: z.string().uuid().optional(),
        foodName: z.string().min(1).optional(),
        mealType: mealTypeSchema.optional(),
        source: nutritionSourceSchema.default("ai"),
        quantity: z.number().positive().default(1),
        quantityUnit: z.string().min(1).default("serving"),
        ...nutritionFields,
        notes: z.string().optional(),
        consumedAt: z.string().datetime().optional(),
      }).refine((data) => Boolean(data.foodId || data.foodName), {
        message: "Either foodId or foodName is required",
        path: ["foodName"],
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      try { return toolResult(await postToUli("/api/nutrition/entries", input)); }
      catch (error) { return toolError(error); }
    },
  );

  server.registerTool(
    "add_food",
    {
      title: "Add reusable food",
      description: "Save a reusable food and its per-serving nutrition for the authenticated user.",
      inputSchema: z.object({
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
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      try { return toolResult(await postToUli("/api/nutrition/foods", input)); }
      catch (error) { return toolError(error); }
    },
  );

  server.registerTool(
    "create_task",
    {
      title: "Create task",
      description: "Create a task for the authenticated Better Auth user.",
      inputSchema: z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        categoryId: z.string().uuid().optional(),
        parentTaskId: z.string().uuid().optional(),
        status: taskStatusSchema.optional(),
        priority: taskPrioritySchema.optional(),
        scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        scheduledStartAt: z.string().datetime().optional(),
        scheduledEndAt: z.string().datetime().optional(),
        dueAt: z.string().datetime().optional(),
        estimatedMinutes: z.number().int().nonnegative().optional(),
        recurrenceRule: z.string().optional(),
        recurrenceTimeZone: z.string().optional(),
        sortOrder: z.number().int().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      try { return toolResult(await postToUli("/api/tasks", input)); }
      catch (error) { return toolError(error); }
    },
  );

  return server;
}

const app = createMcpHonoApp();

const appBaseUrl = env.SERVER_URL;
const authBaseUrl = `${appBaseUrl}/api/auth`;

function handleMcpProtocolRequest(request: Request) {
  const handler = createMcpHandler(
    ({ requestInfo }) => createServer(requestInfo ?? request),
    { legacy: "reject" },
  );
  return handler.fetch(request);
}

const handleAuthenticatedMcpRequest = createMcpProtectedRequestHandler(
  {
    issuer: authBaseUrl,
    audience: env.MCP_SERVER_URL,
    jwksUrl: `${authBaseUrl}/jwks`,
  },
  handleMcpProtocolRequest,
);

async function hasValidBetterAuthSession(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return false;

  try {
    const response = await fetch(new URL("/api/auth/get-session", env.SERVER_URL), {
      headers: { cookie, accept: "application/json" },
    });
    if (!response.ok) return false;

    const result = await response.json() as { session?: unknown; user?: unknown } | null;
    return Boolean(result?.session && result.user);
  } catch {
    return false;
  }
}

app.post("/mcp", async (c) => {
  const request = c.req.raw;
  if (request.headers.get("authorization")?.startsWith("Bearer ")) {
    return handleAuthenticatedMcpRequest(request);
  }
  if (await hasValidBetterAuthSession(request)) {
    return handleMcpProtocolRequest(request);
  }
  return handleAuthenticatedMcpRequest(request);
});

export default app;
