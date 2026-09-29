import { tavily } from "@tavily/core";
import { env } from "./env";

const tavilyClient = () => {
	return tavily({ apiKey: env.TAVILY_API_KEY });
}

export default tavilyClient;
