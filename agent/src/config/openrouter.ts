import { ChatOpenRouter } from "@langchain/openrouter";
import { env } from "./env";

export const chatModel = () => {
    return new ChatOpenRouter({
        model: env.OPENROUTER_MODELID,
		temperature: 0,
        apiKey: env.OPENROUTER_API,
    })
}