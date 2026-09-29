import { z } from "zod";
import { env } from "./env";
import { LLM } from "./openrouter";

export const agentActionSchema = z.enum([
  "respond",
  "search_food_nutrition",
  "log_meal",
  "add_food",
  "create_task",
]);

const DecisionSchema = z.object({
  action: agentActionSchema,
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  parameters: z.record(z.string(), z.unknown()).default({}),
});

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

export type AgentAction = z.infer<typeof agentActionSchema>;
export type Decision = z.infer<typeof DecisionSchema>;

const parameterModel = LLM(env.OPENROUTER_TEXT_MODELID).withStructuredOutput(ParameterResponseSchema);

async function extractParameters(input: {
  goal: string;
  context?: string;
  action: AgentAction;
  parameterSchema?: unknown;
}) {
  if (input.action === "respond") return {};

  const result = await parameterModel.invoke([
    {
      role: "system",
      content: "Extract parameters for the selected Uli tool. Use its API field names, include only values supported by the user's request or conversation context, and never invent IDs or missing facts. Return an empty parameters object when nothing can be safely extracted.",
    },
    { role: "user", content: JSON.stringify(input) },
  ]);

  return result.parameters;
}

export async function decisionMaker(input: {
  goal: string;
  context?: string;
  availableActions: { name: AgentAction; description: string; parameters?: unknown }[];
}): Promise<Decision> {
  const questions = Object.fromEntries(
    input.availableActions.map((action) => [
      action.name,
      {
        type: "noul",
        instructions: `Should Uli select the "${action.name}" action as the single next step?`,
        criteria: action.name === "respond"
          ? {
              true: `${action.description} The request is conversational, asks for advice or a summary, is unsupported, or lacks details required for a mutation.`,
              false: "The user explicitly requests a supported tool action and supplies enough information to perform it.",
            }
          : {
              true: `${action.description} The user explicitly requests this action and supplies enough information to perform it safely.`,
              false: "This action was not explicitly requested, required details are missing, or another available action is a better fit.",
            },
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

  const answers = DecisionResponseSchema.parse(body).answers;
  const selectedAction = input.availableActions.reduce((best, action) => {
    const score = answers[action.name]?.noul ?? -1;
    const bestScore = answers[best.name]?.noul ?? -1;
    return score > bestScore ? action : best;
  });
  const confidence = answers[selectedAction.name]?.noul;
  if (confidence === undefined) {
    throw new Error("OpenRouter Decisions API did not return an answer for an available action.");
  }
  const parameters = await extractParameters({
    goal: input.goal,
    context: input.context,
    action: selectedAction.name,
    parameterSchema: selectedAction.parameters,
  });

  return DecisionSchema.parse({
    action: selectedAction.name,
    reasoning: "Selected by the configured OpenRouter decision model.",
    confidence,
    parameters,
  });
}
