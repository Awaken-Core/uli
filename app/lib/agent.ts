import type { MessageContent } from "@langchain/core/messages";
import { env } from "./env";
import { decisionMaker, extractParameters, type AgentAction, type Decision, type PriorToolResult } from "./decision-model";
import { LLM } from "./openrouter";
import { availableAgentActions, executeAgentTool, type ToolOutput } from "./tools";

export interface AgentHistoryMessage {
  role: "user" | "agent" | "system";
  message: string;
}

export interface ToolResult {
  action: AgentAction;
  result: ToolOutput;
}

export interface AgentResult {
  message: string;
  token?: number;
  decisions: Decision[];
  tools: ToolResult[];
  links?: { taskId?: string; nutritionId?: string; foodId?: string };
}

const SYSTEM_PROMPT = `You are Uli, a personal health and productivity assistant.

Personality: concise, honest, supportive but not sycophantic.

You have access to these capabilities (handled automatically — never generate tool calls, XML, or function calls yourself):
- Searching nutrition facts for any food
- Logging meals and food consumption
- Saving custom food items
- Creating tasks, todos, and reminders

Your job is to write a natural language response based on the tool results provided to you.

Rules:
- NEVER output tool calls, XML tags, function calls, or code blocks as your response. You are a conversational assistant, not a tool executor.
- Only confirm a record was created if the tool result contains a success or id.
- If a tool returned an error, explain what went wrong plainly.
- Never reveal internal action routing, confidence scores, or raw tool names to the user.
- When nutritional data comes from a search, cite the source briefly.
- Use metric units by default unless the user specifies otherwise.
- When multiple tools ran, summarize the combined outcome naturally.
- If no tool results are provided, answer conversationally with what you know.`;

const ACTION_TO_LINK_KEY: Partial<Record<AgentAction, keyof NonNullable<AgentResult["links"]>>> = {
  create_task: "taskId",
  log_meal: "nutritionId",
  add_food: "foodId",
};

function extractText(content: MessageContent): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((p) => ("text" in p && typeof p.text === "string" ? p.text : ""))
      .join("\n");
  }
  return String(content ?? "");
}

function extractLinks(toolResults: ToolResult[]): AgentResult["links"] | undefined {
  const links: AgentResult["links"] = {};
  let hasAny = false;
  for (const { action, result } of toolResults) {
    const key = ACTION_TO_LINK_KEY[action];
    if (key && "id" in result && typeof result.id === "string") {
      links[key] = result.id;
      hasAny = true;
    }
  }
  return hasAny ? links : undefined;
}

export async function runAgent(input: {
  message: string;
  history: AgentHistoryMessage[];
  requestHeaders: Headers;
}): Promise<AgentResult> {
  const recentHistory = input.history.slice(-12);
  const context = recentHistory.map((h) => `${h.role}: ${h.message}`).join("\n");

  // 1. Decide which tools to use (may be multiple)
  const decisions = await decisionMaker({
    goal: input.message,
    context,
    availableActions: availableAgentActions,
  });

  // 2. Execute tools sequentially, passing prior results forward
  const toolResults: ToolResult[] = [];

  for (const decision of decisions) {
    if (decision.action === "respond") continue;

    // Extract parameters with awareness of prior tool results
    const actionDef = availableAgentActions.find((a) => a.name === decision.action);
    const priorResults: PriorToolResult[] = toolResults.map((t) => ({
      action: t.action,
      result: t.result,
    }));

    decision.parameters = await extractParameters({
      goal: input.message,
      context,
      action: decision.action,
      parameterSchema: actionDef?.parameters,
      priorResults: priorResults.length > 0 ? priorResults : undefined,
    });

    try {
      const result = await executeAgentTool(
        decision.action,
        decision.parameters,
        input.requestHeaders,
      );
      toolResults.push({ action: decision.action, result });
    } catch (err) {
      toolResults.push({
        action: decision.action,
        result: { error: err instanceof Error ? err.message : "Tool execution failed" },
      });
    }
  }

  // 3. Generate natural language response with all tool results
  const toolSummary = toolResults.length > 0
    ? toolResults
        .map((t) => `Tool ${t.action} returned: ${JSON.stringify(t.result)}`)
        .join("\n\n")
    : undefined;

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...recentHistory.map((h) => ({
      role: h.role === "agent" ? ("assistant" as const) : h.role,
      content: h.message,
    })),
    { role: "user" as const, content: input.message },
    ...(toolSummary
      ? [{ role: "system" as const, content: toolSummary }]
      : []),
  ];

  const response = await LLM(env.OPENROUTER_TEXT_MODELID).invoke(messages);

  return {
    message: extractText(response.content),
    token: response.usage_metadata?.total_tokens,
    decisions,
    tools: toolResults,
    links: extractLinks(toolResults),
  };
}
