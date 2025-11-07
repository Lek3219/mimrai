import { add, format } from "date-fns";
import { and, asc, desc, eq, gte, inArray, lte, not, sql } from "drizzle-orm";
import { db } from "../index";
import { activities, columns, tasks, users, usersOnTeams } from "../schema";

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
			taskCompletedCount: number;
			checklistItemsCompletedCount: number;
		}
	>();

	// fill in dates with 0 completions
	const currentDate = new Date(startDate);
	while (currentDate <= endDate) {
		const dateKey = format(currentDate, "yyyy-MM-dd 00:00:00+00");
		data.set(dateKey, {
			taskCompletedCount: 0,
			checklistItemsCompletedCount: 0,
		});
		currentDate.setDate(currentDate.getDate() + 1);
	}

	const tasksCompleted = await db
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
				lte(activities.createdAt, endDate.toISOString()),
			),
		)
		.groupBy(sql`date_trunc('day', ${activities.createdAt})`)
		.orderBy(sql`date_trunc('day', ${activities.createdAt}) ASC`);

	for (const row of tasksCompleted) {
		const dateKey = format(row.date, "yyyy-MM-dd 00:00:00+00");
		const current = data.get(dateKey);
		data.set(dateKey, {
			...current!,
			taskCompletedCount: Number(row.completedCount),
		});
	}

	const checklistItemsCompleted = await db
		.select({
			date: sql<Date>`date_trunc('day', ${activities.createdAt})`,
			completedCount: sql<number>`COUNT(*)`,
		})
		.from(activities)
		.where(
			and(
				eq(activities.teamId, teamId),
				eq(activities.type, "checklist_item_completed"),
				gte(activities.createdAt, startDate.toISOString()),
				lte(activities.createdAt, endDate.toISOString()),
			),
		)
		.groupBy(sql`date_trunc('day', ${activities.createdAt})`)
		.orderBy(sql`date_trunc('day', ${activities.createdAt}) ASC`);

	for (const row of checklistItemsCompleted) {
		const dateKey = format(row.date, "yyyy-MM-dd 00:00:00+00");
		const current = data.get(dateKey);
		data.set(dateKey, {
			...current!,
			checklistItemsCompletedCount: Number(row.completedCount),
		});
	}

	return Array.from(data.entries()).map(([date, value]) => ({
		date,
		...value,
	}));
};

export const getTasksSummaryByMember = async ({
	teamId,
	startDate,
	endDate,
}: {
	teamId: string;
	startDate: Date;
	endDate: Date;
}) => {
	const completedSubquery = db
		.select({
			memberId: sql<string>`activities.user_id`.as("member_id"),
			completedCount: sql<number>`COUNT(*)`.as("completed_count"),
		})
		.from(activities)
		.where(
			and(
				eq(activities.teamId, teamId),
				inArray(activities.type, [
					"task_completed",
					"checklist_item_completed",
				]),
				gte(activities.createdAt, startDate.toISOString()),
				lte(activities.createdAt, endDate.toISOString()),
			),
		)
		.groupBy(activities.userId);

	const assignedSubquery = db
		.select({
			memberId: sql<string>`tasks.assignee_id`.as("member_id"),
			assignedCount: sql<number>`COUNT(*)`.as("assigned_count"),
		})
		.from(tasks)
		.where(
			and(
				eq(tasks.teamId, teamId),
				not(inArray(columns.type, ["done", "backlog"])),
			),
		)
		.innerJoin(columns, eq(tasks.columnId, columns.id))
		.groupBy(tasks.assigneeId);

	const data = await db
		.select({
			member: {
				id: users.id,
				name: users.name,
				color: users.color,
			},
			completedCount: sql<number>`COALESCE(completed.completed_count, 0)`,
			assignedCount: sql<number>`COALESCE(assigned.assigned_count, 0)`,
		})
		.from(usersOnTeams)
		.where(and(eq(usersOnTeams.teamId, teamId)))
		.leftJoin(
			completedSubquery.as("completed"),
			eq(usersOnTeams.userId, sql`completed.member_id`),
		)
		.leftJoin(
			assignedSubquery.as("assigned"),
			eq(usersOnTeams.userId, sql`assigned.member_id`),
		)
		.innerJoin(users, eq(usersOnTeams.userId, users.id))
		.orderBy(desc(sql`COALESCE(assigned.assigned_count, 0)`));

	return data;
};

export const getTasksTodo = async ({ teamId }: { teamId: string }) => {
	const data = await db
		.select({
			id: tasks.id,
			title: tasks.title,
			dueDate: tasks.dueDate,
			assigneeId: tasks.assigneeId,
			columnId: tasks.columnId,
			priority: tasks.priority,
			column: {
				id: columns.id,
				name: columns.name,
				type: columns.type,
			},
			assignee: {
				id: users.id,
				name: users.name,
				color: users.color,
			},
		})
		.from(tasks)
		.innerJoin(columns, eq(tasks.columnId, columns.id))
		.leftJoin(users, eq(tasks.assigneeId, users.id))
		.where(
			and(
				eq(tasks.teamId, teamId),
				not(inArray(columns.type, ["done", "backlog"])),
			),
		)
		.limit(10)
		.orderBy(
			asc(
				sql`CASE ${tasks.priority} WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END`,
			),
			desc(tasks.dueDate),
		);

	return data;
};
