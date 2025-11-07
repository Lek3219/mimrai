import { getWidgetSchema } from "@api/schemas/widgets";
import { protectedProcedure, router } from "@api/trpc/init";
import {
	getTasksCompletedByDay,
	getTasksSummaryByMember,
	getTasksTodo,
} from "@mimir/db/queries/tasks-analytics";

export const widgetsRouter = router({
	tasksCompletedByDay: protectedProcedure
		.input(getWidgetSchema)
		.query(async ({ ctx, input }) => {
			return getTasksCompletedByDay({
				teamId: ctx.user.teamId!,
				startDate: input.startDate,
				endDate: input.endDate,
			});
		}),

	tasksSummaryByMember: protectedProcedure
		.input(getWidgetSchema)
		.query(async ({ ctx, input }) => {
			return getTasksSummaryByMember({
				teamId: ctx.user.teamId!,
				startDate: input.startDate,
				endDate: input.endDate,
			});
		}),

	tasksTodo: protectedProcedure.query(async ({ ctx, input }) => {
		return getTasksTodo({
			teamId: ctx.user.teamId!,
		});
	}),
});
