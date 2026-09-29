import { ChatOpenRouter } from "@langchain/openrouter";
import { env } from "./env";

export const LLM = (modelId: string) => {
    return new ChatOpenRouter({
        model: modelId,
		temperature: 0,
        apiKey: env.OPENROUTER_API,
    })
}