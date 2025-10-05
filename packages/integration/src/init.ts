import type { integrations } from "@mimir/db/schema";
import { initMattermost, initMattermostSingle } from "./mattermost/init";

export const initIntegrations = async () => {
	await Promise.all([initMattermost()]);
};

export const initIntegrationSingle = async (
	integration: typeof integrations.$inferSelect,
) => {
	switch (integration.type) {
		case "mattermost":
			await initMattermostSingle(integration);
	}
};
