import { createTaskPullRequest } from "@api/lib/copilot";
import { tool } from "ai";
import z from "zod";
import { getContext } from "../context";

export const createTaskPullRequestToolSchema = z.object({
	taskId: z
		.string()
		.describe(
			"The ID of the parent task to which the subtask belongs. Must be a valid task ID, if not provided try to get it from getTasks tool.",
		),
});

export const createTaskPullRequestTool = tool({
	description: "Create a new github pull request for a task.",
	inputSchema: createTaskPullRequestToolSchema,
	execute: async function* (input) {
		const { db, user } = getContext();

		try {
			const response = await createTaskPullRequest({
				taskId: input.taskId,
				teamId: user.teamId,
			});
			yield {
				text: response,
			};
		} catch (error) {
			yield {
				text: `Error creating pull request: ${(error as Error).message}`,
			};
			return;
		}
	},
});
