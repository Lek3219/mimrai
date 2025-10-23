import { getTasksCompletedByDaySchema } from "@api/schemas/widgets";
import { protectedProcedure, router } from "@api/trpc/init";
import { getTasksCompletedByDay } from "@mimir/db/queries/tasks-analytics";

export const widgetsRouter = router({
  tasksCompletedByDay: protectedProcedure
    .input(getTasksCompletedByDaySchema)
    .query(async ({ ctx, input }) => {
      return getTasksCompletedByDay({
        teamId: ctx.user.teamId!,
        startDate: input.startDate,
        endDate: input.endDate,
      });
    }),
});
