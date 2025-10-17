import { Client4 } from "@mattermost/client";
import {
	getIntegrationByType,
	getLinkedUserByUserId,
} from "@mimir/db/queries/integrations";

export const sendMattermostNotification = async ({
	teamId,
	userId,
	message,
}: {
	teamId: string;
	userId: string;
	message: string;
}) => {
	const [integration] = await getIntegrationByType({
		type: "mattermost",
		teamId: teamId,
	});
	if (!integration) {
		throw new Error("No Mattermost integration found for team");
	}
	const token = integration.config.token;
	const url = integration.config.url;
	if (!token || !url) {
		throw new Error("Invalid Mattermost integration configuration");
	}

	const linkedUser = await getLinkedUserByUserId({
		integrationId: integration.id,
		userId: userId,
		teamId: teamId,
	});

	if (!linkedUser) {
		throw new Error("No linked Mattermost user found");
	}

	const externalId = linkedUser.externalUserId;

	const client = new Client4();
	client.setUrl(url);
	client.setToken(token);

	const me = await client.getMe();
	const channel = await client.createDirectChannel([externalId, me.id]);
	await client.createPost({
		channel_id: channel.id,
		message: message,
	});

	return true;
};
