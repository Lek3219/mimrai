import {
	createTaskLabelSchema,
	deleteTaskLabelSchema,
	getTaskLabelByIdSchema,
	getTaskLabelsSchema,
	updateTaskLabelSchema,
} from "@api/schemas/task-label";
import { protectedProcedure, router } from "@api/trpc/init";
import {
	createTaskLabel,
	deleteTaskLabel,
	getTaskLabelById,
	getTaskLabels,
	updateTaskLabel,
} from "@mimir/db/queries/task-labels";

export const taskLabelsRouter = router({
	get: protectedProcedure
		.input(getTaskLabelsSchema)
		.query(async ({ ctx, input }) => {
			return getTaskLabels({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),

	create: protectedProcedure
		.input(createTaskLabelSchema)
		.mutation(async ({ ctx, input }) => {
			return await createTaskLabel({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),

	update: protectedProcedure
		.input(updateTaskLabelSchema)
		.mutation(async ({ ctx, input }) => {
			return updateTaskLabel({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),

	getById: protectedProcedure
		.input(getTaskLabelByIdSchema)
		.query(async ({ ctx, input }) => {
			return getTaskLabelById({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),

	delete: protectedProcedure
		.input(deleteTaskLabelSchema)
		.mutation(async ({ ctx, input }) => {
			return deleteTaskLabel({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),
});
