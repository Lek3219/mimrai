import type { NotificationHandler } from "@notifications/base";

export const resumeGenerated: NotificationHandler = {
  createNotification: (data, user) => {
    return {
      title: "Resume Generated",
      message: `${data.metadata?.summary}`,
      type: "team",
    };
  },
};
