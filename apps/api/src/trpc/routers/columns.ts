import {
	createColumnSchema,
	deleteColumnSchema,
	getColumnByIdSchema,
	getColumnsSchema,
	updateColumnSchema,
} from "@api/schemas/columns";
import { protectedProcedure, router } from "@api/trpc/init";
import {
	createColumn,
	deleteColumn,
	getBacklogColumn,
	getColumnById,
	getColumns,
	updateColumn,
} from "@mimir/db/queries/columns";

export const columnsRouter = router({
	get: protectedProcedure
		.input(getColumnsSchema.optional())
		.query(({ ctx, input }) => {
			return getColumns({
				pageSize: 100,
				...input,
				teamId: ctx.user.teamId!,
			});
		}),
	getBacklogColumn: protectedProcedure.query(({ ctx }) => {
		return getBacklogColumn({
			teamId: ctx.user.teamId!,
		});
	}),
	getById: protectedProcedure
		.input(getColumnByIdSchema)
		.query(({ ctx, input }) => {
			return getColumnById({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),

	create: protectedProcedure
		.input(createColumnSchema)
		.mutation(async ({ ctx, input }) => {
			return createColumn({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),
	update: protectedProcedure
		.input(updateColumnSchema)
		.mutation(async ({ ctx, input }) => {
			return updateColumn({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),
	delete: protectedProcedure
		.input(deleteColumnSchema)
		.mutation(async ({ ctx, input }) => {
			return deleteColumn({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),
});
