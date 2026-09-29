import { z } from "zod";
import { env } from "./env";
import { LLM } from "./openrouter";
import type { AvailableAction, JsonSchema, ToolOutput } from "./tools";

export const agentActionSchema = z.enum([
  "respond",
  "search_food_nutrition",
  "log_meal",
  "add_food",
  "create_task",
]);

export type AgentAction = z.infer<typeof agentActionSchema>;

export interface Decision {
  action: AgentAction;
  confidence: number;
  parameters: Record<string, unknown>;
}

export interface PriorToolResult {
  action: AgentAction;
  result: ToolOutput;
}

const CONFIDENCE_THRESHOLD = 0.4;

const DecisionResponseSchema = z.object({
  answers: z.record(
    z.string(),
    z.object({
      type: z.literal("noul").optional(),
      noul: z.number().min(0).max(1),
    }),
  ),
});

const ParameterResponseSchema = z.object({
  parameters: z.record(z.string(), z.unknown()).default({}),
});

const PARAMETER_PROMPT = `You extract structured parameters for Uli tool calls.

Rules:
- Use the exact API field names from the provided schema.
- Only include values the user explicitly stated or that are clear from conversation context.
- Never fabricate IDs, dates, or nutritional values the user did not mention.
- When prior tool results are provided, use relevant values from them (e.g. nutrition data from a search).
- Return { "parameters": {} } when nothing can be safely extracted.`;

const parameterModel = LLM(env.OPENROUTER_TEXT_MODELID).withStructuredOutput(ParameterResponseSchema);

/**
 * Extract parameters for a tool action.
 * `priorResults` carries output from earlier tools in the chain so
 * later tools can incorporate values (e.g. nutrition from a search).
 */
export async function extractParameters(input: {
  goal: string;
  context?: string;
  action: AgentAction;
  parameterSchema?: JsonSchema;
  priorResults?: PriorToolResult[];
}): Promise<Record<string, unknown>> {
  if (input.action === "respond") return {};

  const result = await parameterModel.invoke([
    { role: "system", content: PARAMETER_PROMPT },
    { role: "user", content: JSON.stringify(input) },
  ]);

  return result.parameters ?? {};
}

// --- Decision criteria per action ---

const ACTION_CRITERIA: Record<AgentAction, { true: string; false: string }> = {
  respond: {
    true: "The message is purely conversational, asks for advice, opinions, explanations, or a summary. No data-changing action is implied.",
    false: "The message implies eating, consuming, or tracking food (use log_meal), looking up nutrition info (use search_food_nutrition), saving a new food item (use add_food), or creating a task/reminder/todo (use create_task).",
  },
  log_meal: {
    true: "The user says they ate, drank, consumed, or had something. Statements like 'i ate X', 'just had X', 'had X for lunch', or 'X more' in the context of food all imply logging a meal.",
    false: "The message is not about something the user consumed. Asking about nutrition facts without eating is not a meal log. Creating a reminder to eat is not a meal log.",
  },
  search_food_nutrition: {
    true: "The user mentions a food, whether they ate it or are asking about it. Any mention of food that could benefit from nutrition lookup qualifies. 'I ate 2 bananas' needs a nutrition search before logging.",
    false: "The message does not mention any specific food or is completely unrelated to nutrition.",
  },
  add_food: {
    true: "The user wants to save a new custom food item with its nutritional info for future use.",
    false: "The user is logging something they ate (use log_meal) or just asking about nutrition (use search_food_nutrition).",
  },
  create_task: {
    true: "The user wants to create a task, todo, reminder, or plan something to do in the future. Statements like 'remind me to X', 'I need to X', 'add a task for X', 'add that in task', 'make a task', 'create task'. Also applies when the user refers to something from conversation context and asks to add/save/track it as a task.",
    false: "The message is about food consumption or nutrition logging. 'I ate X' is never a task. Asking about calories is not a task.",
  },
};

/** Execution order: tools earlier in this list run first. */
const EXECUTION_ORDER: AgentAction[] = [
  "search_food_nutrition",
  "add_food",
  "log_meal",
  "create_task",
  "respond",
];

function buildCriteria(action: AvailableAction) {
  return {
    true: `${action.description} ${ACTION_CRITERIA[action.name].true}`,
    false: ACTION_CRITERIA[action.name].false,
  };
}

/**
 * Returns an ordered list of actions the agent should execute.
 * All tool actions scoring above `CONFIDENCE_THRESHOLD` are included.
 * If no tool passes the threshold, falls back to `respond`.
 * Parameter extraction happens later in the agent loop.
 */
export async function decisionMaker(input: {
  goal: string;
  context?: string;
  availableActions: AvailableAction[];
}): Promise<Decision[]> {
  const questions = Object.fromEntries(
    input.availableActions.map((action) => [
      action.name,
      {
        type: "noul",
        instructions: `Should Uli use "${action.name}" to handle this request? Multiple tools can be selected.`,
        criteria: buildCriteria(action),
      },
    ]),
  );

  const response = await fetch("https://openrouter.ai/api/alpha/decisions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENROUTER_API}`,
      "content-type": "application/json",
      "HTTP-Referer": env.NEXT_PUBLIC_APP_BASE_URL,
      "X-Title": "Uli",
    },
    body: JSON.stringify({
      model: env.OPENROUTER_DECISION_MODELID,
      state: JSON.stringify({
        goal: input.goal,
        context: input.context ?? "",
        availableActions: input.availableActions,
      }),
      questions,
    }),
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`OpenRouter Decisions API failed (${response.status}): ${JSON.stringify(body)}`);
  }

  const { answers } = DecisionResponseSchema.parse(body);

  // Collect all tool actions above the threshold
  const selected = input.availableActions
    .filter((a) => a.name !== "respond" && (answers[a.name]?.noul ?? 0) >= CONFIDENCE_THRESHOLD)
    .sort((a, b) => EXECUTION_ORDER.indexOf(a.name) - EXECUTION_ORDER.indexOf(b.name))
    .map((a): Decision => ({
      action: a.name,
      confidence: answers[a.name]?.noul ?? 0,
      parameters: {}, // filled by agent loop
    }));

  // Fallback to respond if nothing passed the threshold
  if (selected.length === 0) {
    return [{
      action: "respond",
      confidence: answers["respond"]?.noul ?? 1,
      parameters: {},
    }];
  }

  return selected;
}
