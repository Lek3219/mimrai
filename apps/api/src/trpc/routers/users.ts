import { roleScopes } from "@api/lib/scopes";
import { switchTeamSchema } from "@api/schemas/users";
import { protectedProcedure, router } from "@api/trpc/init";
import { getCurrentUser, switchTeam } from "@mimir/db/queries/users";

export const usersRouter = router({
	getCurrent: protectedProcedure
		.meta({ team: false })
		.query(async ({ ctx }) => {
			const user = await getCurrentUser(ctx.user.id, ctx.user.teamId!);
			return {
				...user,
				team: {
					...user.team,
					scopes: roleScopes[user.team.role],
				},
			};
		}),
	switchTeam: protectedProcedure
		.input(switchTeamSchema)
		.mutation(async ({ ctx, input }) => {
			const user = await switchTeam(ctx.user.id, input.teamId);
			return user;
		}),
});
