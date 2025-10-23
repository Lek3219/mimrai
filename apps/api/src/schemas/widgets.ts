import z from "zod";

export const getTasksCompletedByDaySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
