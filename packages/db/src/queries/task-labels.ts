import { and, eq, type SQL } from "drizzle-orm";
import { db } from "..";
import { taskLabels } from "../schema";

export const createTaskLabel = async (input: {
	name: string;
	color: string;
	description?: string;
	teamId: string;
}) => {
	const [taskLabel] = await db
		.insert(taskLabels)
		.values({
			...input,
		})
		.returning();

	if (!taskLabel) {
		throw new Error("Failed to create task label");
	}

	return taskLabel;
};

export const updateTaskLabel = async ({
	id,
	teamId,
	...input
}: {
	id: string;
	name?: string;
	color?: string;
	description?: string;
	teamId?: string;
}) => {
	const whereClause: SQL[] = [eq(taskLabels.id, id)];
	teamId && whereClause.push(eq(taskLabels.teamId, teamId));

	const [taskLabel] = await db
		.update(taskLabels)
		.set({
			...input,
		})
		.where(and(...whereClause))
		.returning();

	if (!taskLabel) {
		throw new Error("Failed to update task label");
	}

	return taskLabel;
};

export const getTaskLabelById = async ({
	id,
	teamId,
}: {
	id: string;
	teamId?: string;
}) => {
	const whereClause: SQL[] = [eq(taskLabels.id, id)];
	teamId && whereClause.push(eq(taskLabels.teamId, teamId));

	const [taskLabel] = await db
		.select()
		.from(taskLabels)
		.where(and(...whereClause))
		.limit(1);

	return taskLabel;
};

export const getTaskLabels = async ({ teamId }: { teamId?: string }) => {
	const whereClause: SQL[] = [];
	teamId && whereClause.push(eq(taskLabels.teamId, teamId));

	const taskLabelsList = await db
		.select()
		.from(taskLabels)
		.where(and(...whereClause))
		.orderBy(taskLabels.name);

	return taskLabelsList;
};

export const deleteTaskLabel = async ({
	id,
	teamId,
}: {
	id: string;
	teamId?: string;
}) => {
	const whereClause: SQL[] = [eq(taskLabels.id, id)];
	teamId && whereClause.push(eq(taskLabels.teamId, teamId));

	const [taskLabel] = await db
		.delete(taskLabels)
		.where(and(...whereClause))
		.returning();

	if (!taskLabel) {
		throw new Error("Failed to delete task label");
	}

	return taskLabel;
};
