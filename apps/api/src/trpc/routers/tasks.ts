import {
	createTaskSchema,
	deleteTaskSchema,
	getTasksSchema,
	updateTaskSchema,
} from "@api/schemas/tasks";
import { protectedProcedure, router } from "@api/trpc/init";
import {
	createTask,
	deleteTask,
	getTaskById,
	getTasks,
	updateTask,
} from "@mimir/db/queries/tasks";

export const tasksRouter = router({
	get: protectedProcedure
		.input(getTasksSchema.optional())
		.query(({ ctx, input }) => {
			return getTasks({
				pageSize: 100,
				...input,
				teamId: ctx.user.teamId!,
			});
		}),
	create: protectedProcedure
		.input(createTaskSchema)
		.mutation(async ({ ctx, input }) => {
			return createTask({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),
	update: protectedProcedure
		.input(updateTaskSchema.omit({ teamId: true }))
		.mutation(async ({ ctx, input }) => {
			return updateTask({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),
	delete: protectedProcedure
		.input(deleteTaskSchema.omit({ teamId: true }))
		.mutation(async ({ ctx, input }) => {
			return deleteTask({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),
	getById: protectedProcedure
		.input(updateTaskSchema.pick({ id: true }))
		.query(async ({ ctx, input }) => {
			return getTaskById(input.id, ctx.user.teamId!);
		}),
});
