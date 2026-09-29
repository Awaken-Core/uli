import z from "zod";
import { env } from "./env";
import { LLM } from "./openrouter";

const ChatSchema = z.object({

});

const model = LLM(env.OPENROUTER_DECISION_MODELID);
const chatModel = model.withStructuredOutput(ChatSchema);