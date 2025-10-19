import NotificationEmail from "@mimir/email/emails/notification";
import { getAppUrl } from "@mimir/utils/envs";
import type { NotificationHandler } from "@notifications/base";

export const taskAssigned: NotificationHandler = {
  createNotification: (data, user) => {
    return {
      title: "Task Assigned",
      message: `You have been assigned a new task **${data.metadata?.title}**.`,
      type: "customer",
    };
  },
  createEmail: (data, user, team) => {
    return {
      subject: `New Task Assigned: ${data.metadata?.title}`,
      react: NotificationEmail({
        message: `You have been assigned a new task ${data.metadata?.title}.`,
        teamName: team.name,
        title: "Task Assigned",
        ctaLink: `${getAppUrl()}`,
      }),
      emailType: "customer",
      data,
    };
  },
};
