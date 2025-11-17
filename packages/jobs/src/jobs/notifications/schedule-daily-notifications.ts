import { getDb } from "@jobs/init";
import { teams, users, usersOnTeams } from "@mimir/db/schema";
import { schedules } from "@trigger.dev/sdk";
import { set } from "date-fns";
import { eq } from "drizzle-orm";
import { createDigestActivityJob } from "./create-digest-activity";

export const scheduleDailyNotificationsJob = schedules.task({
	id: "schedule-daily-notifications",
	cron: "0 5 * * *", // Every day at 5am
	run: async (payload, ctx) => {
		const db = getDb();
		const usersOnTeamsList = await db
			.select()
			.from(usersOnTeams)
			.innerJoin(users, eq(users.id, usersOnTeams.userId));

		const date = new Date();

		for (const userOnTeam of usersOnTeamsList) {
			await createDigestActivityJob.trigger(
				{
					userId: userOnTeam.user.id,
					teamId: userOnTeam.users_on_teams.teamId,
					userName: userOnTeam.user.name,
				},
				{
					delay: set(date, { hours: 9, minutes: 0, seconds: 0 }),
					tags: [
						`userName:${userOnTeam.user.name}`,
						`teamId:${userOnTeam.users_on_teams.teamId}`,
						`userId:${userOnTeam.user.id}`,
					],
				},
			);
		}
	},
});
