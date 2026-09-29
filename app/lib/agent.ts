import { env } from "./env";
import { decisionMaker, type AgentAction } from "./decision-model";
import { LLM } from "./openrouter";
import { availableAgentActions, executeAgentTool } from "./tools";

export interface AgentHistoryMessage {
  role: "user" | "agent" | "system";
  message: string;
}

export interface AgentResult {
  message: string;
  token?: number;
  decision: { action: AgentAction; reasoning: string; confidence: number };
  tool?: { name: AgentAction; result: unknown };
  links?: { taskId?: string; nutritionId?: string; foodId?: string };
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) return String(part.text);
      return "";
    }).join("\n");
  }
  return String(content ?? "");
}

function linkedIds(action: AgentAction, result: unknown): AgentResult["links"] {
  if (!result || typeof result !== "object" || !("id" in result) || typeof result.id !== "string") return undefined;
  if (action === "create_task") return { taskId: result.id };
  if (action === "log_meal") return { nutritionId: result.id };
  if (action === "add_food") return { foodId: result.id };
  return undefined;
}

export async function runAgent(input: {
  message: string;
  history: AgentHistoryMessage[];
  requestHeaders: Headers;
}): Promise<AgentResult> {
  const context = input.history.slice(-12).map(({ role, message }) => `${role}: ${message}`).join("\n");
  const decision = await decisionMaker({
    goal: input.message,
    context,
    availableActions: availableAgentActions,
  });
  let toolResult: unknown;

  if (decision.action !== "respond") {
    try {
      toolResult = await executeAgentTool(
        decision.action,
        decision.parameters,
        input.requestHeaders,
      );
    } catch (cause) {
      toolResult = { error: cause instanceof Error ? cause.message : "Tool execution failed" };
    }
  }

  const response = await LLM(env.OPENROUTER_TEXT_MODELID).invoke([
    {
      role: "system",
      content: "You are Uli, a concise health, nutrition, habit, and task assistant. Be honest about uncertainty. Do not claim a record was created unless the tool result confirms it. Never expose internal routing reasoning.",
    },
    ...input.history.slice(-12).map((item) => ({
      role: item.role === "agent" ? ("assistant" as const) : item.role,
      content: item.message,
    })),
    { role: "user", content: input.message },
    ...(toolResult === undefined ? [] : [{ role: "system" as const, content: `Tool ${decision.action} returned: ${JSON.stringify(toolResult)}` }]),
  ]);

  return {
    message: contentToText(response.content),
    token: response.usage_metadata?.total_tokens,
    decision: { action: decision.action, reasoning: decision.reasoning, confidence: decision.confidence },
    ...(toolResult === undefined ? {} : { tool: { name: decision.action, result: toolResult } }),
    links: linkedIds(decision.action, toolResult),
  };
}
