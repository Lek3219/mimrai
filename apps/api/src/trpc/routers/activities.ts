import {
	deleteActivitySchema,
	getActivitiesSchema,
} from "@api/schemas/activities";
import { protectedProcedure, router } from "@api/trpc/init";
import { deleteActivity, getActivities } from "@mimir/db/queries/activities";

export const activitiesRouter = router({
	get: protectedProcedure
		.input(getActivitiesSchema)
		.query(async ({ ctx, input }) => {
			return getActivities({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),

	delete: protectedProcedure
		.input(deleteActivitySchema)
		.mutation(async ({ ctx, input }) => {
			return deleteActivity({
				...input,
				teamId: ctx.user.teamId!,
			});
		}),
});
