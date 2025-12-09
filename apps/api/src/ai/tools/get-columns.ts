import { db } from "@db/index";
import { statuses } from "@db/schema";
import { tool } from "ai";
import { eq } from "drizzle-orm";
import z from "zod";
import type { AppContext } from "../agents/config/shared";

export const getColumnsToolSchema = z.object({});

export const getColumnsTool = tool({
	description: "Get columns from your task manager",
	inputSchema: getColumnsToolSchema,
	execute: async function* (input, executionOptions) {
		const { userId, teamId } =
			executionOptions.experimental_context as AppContext;

		yield { text: "Retrieving columns..." };

		const data = await db
			.select({
				id: statuses.id,
				name: statuses.name,
			})
			.from(statuses)
			.where(eq(statuses.teamId, teamId));

		yield {
			text: `Found ${data.length} columns.`,
			data,
		};
	},
});
