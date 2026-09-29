import { z } from "zod";
import { env } from "./env";
import { LLM } from "./openrouter";

const DecisionSchema = z.object({
  action: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  parameters: z.record(z.string(), z.any()),
});

export type Decision = z.infer<typeof DecisionSchema>;

const model = LLM(env.OPENROUTER_DECISION_MODELID);
const decisionModel = model.withStructuredOutput(DecisionSchema);

export async function decisionMaker(input: {
  goal: string;
  context?: string;
  availableActions: {
    name: string;
    description: string;
    parameters?: unknown;
  }[];
}): Promise<Decision> {
  const response = await decisionModel.invoke([
    {
      role: "system",
      content: `
You are a generic decision-making engine.

Your job is to determine the single best action
from the available actions based on the user's goal
and the provided context.

Rules:
- Only select an action from availableActions.
- Never invent an action.
- Return parameters required by the selected action.
- If there is insufficient information, choose the
  most appropriate action and explain what is missing.
- Keep reasoning concise.
      `,
    },
    {
      role: "user",
      content: JSON.stringify(input),
    },
  ]);

  return response;
}