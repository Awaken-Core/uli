import { tool } from "@langchain/core/tools";
import { z } from "zod";
import tavilyClient from "../config/tavily";

export function nutritionSearchTool() {
	const client = tavilyClient();

	return tool(
		async ({ food }) => {
			const result = await client.search(
				`${food} calories nutrition typical serving`,
				{ includeAnswer: true, maxResults: 3, searchDepth: "basic" },
			);

			return JSON.stringify({
				answer: result.answer ?? "",
				sources: result.results.map(({ title, url, content }) => ({ title, url, content })),
			});
		},
		{
			name: "search_food_calories",
			description: "Search the internet for calories only when the user named food but did not provide calories.",
			schema: z.object({
				food: z.string().min(1).describe("Food and serving size mentioned by the user"),
			}),
		},
	);
}
