import { OpenPanel } from "@openpanel/sdk";

export const op = new OpenPanel({
  clientId: process.env.OPENPANEL_CLIENT_ID!,
  clientSecret: process.env.OPENPANEL_CLIENT_SECRET!,
});

export const trackTaskCompleted = async ({
  taskId,
  userId,
  teamId,
  userName,
  score = 1,
}: {
  taskId: string;
  userId: string;
  teamId: string;
  userName: string;
  score?: number;
}) => {
  await op.identify({
    profileId: `${teamId}-${userId}`,
    firstName: userName.split(" ")[0],
  });
  await op.track("task_completed", {
    taskId,
    score,
  });
};
