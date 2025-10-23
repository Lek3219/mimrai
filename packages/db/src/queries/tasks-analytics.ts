import { add, format } from "date-fns";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../index";
import { activities } from "../schema";

export const getTasksCompletedByDay = async ({
  teamId,
  startDate,
  endDate,
}: {
  teamId: string;
  startDate: Date;
  endDate: Date;
}) => {
  const data = new Map<
    string,
    {
      completedCount: number;
    }
  >();

  // fill in dates with 0 completions
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = format(currentDate, "yyyy-MM-dd 00:00:00+00");
    data.set(dateKey, { completedCount: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const result = await db
    .select({
      date: sql<Date>`date_trunc('day', ${activities.createdAt})`,
      completedCount: sql<number>`COUNT(*)`,
    })
    .from(activities)
    .where(
      and(
        eq(activities.teamId, teamId),
        eq(activities.type, "task_completed"),
        gte(activities.createdAt, startDate.toISOString()),
        lte(activities.createdAt, endDate.toISOString())
      )
    )
    .groupBy(sql`date_trunc('day', ${activities.createdAt})`)
    .orderBy(sql`date_trunc('day', ${activities.createdAt}) ASC`);

  for (const row of result) {
    const dateKey = format(row.date, "yyyy-MM-dd 00:00:00+00");
    data.set(dateKey, { completedCount: Number(row.completedCount) });
  }

  return Array.from(data.entries()).map(([date, value]) => ({
    date,
    ...value,
  }));
};
