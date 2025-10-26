import { stripeClient } from "@api/lib/payments";
import { getMembers, getTeamById } from "@db/queries/teams";

export const updateSubscriptionUsersUsage = async ({
  teamId,
}: {
  teamId: string;
}) => {
  const team = await getTeamById(teamId);
  if (team.subscriptionId) {
    const members = await getMembers({ teamId: team.id });
    const subscription = await stripeClient.subscriptions.retrieve(
      team.subscriptionId
    );
    const userSubscriptionItem = subscription.items.data.find((item) =>
      item.price.lookup_key.includes("users")
    );

    if (userSubscriptionItem) {
      await stripeClient.subscriptionItems.update(userSubscriptionItem.id, {
        quantity: members.length,
      });
    }
  }
};
