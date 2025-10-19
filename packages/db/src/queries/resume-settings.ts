import { eq } from "drizzle-orm";
import { db } from "..";
import { resumeSettings } from "../schema";

export const updateResumeSettings = async ({
  teamId,
  enabled,
  cronExpression,
  cronPrompt,
  instructions,
  lastRunAt,
}: {
  teamId: string;
  enabled?: boolean;
  cronExpression?: string;
  cronPrompt?: string;
  instructions?: string;
  lastRunAt?: Date;
}) => {
  const [settings] = await db
    .update(resumeSettings)
    .set({
      enabled,
      cronExpression,
      cronPrompt,
      instructions,
      lastRunAt: lastRunAt ? lastRunAt.toISOString() : undefined,
      shouldUpdateJob: true,
    })
    .where(eq(resumeSettings.teamId, teamId))
    .returning();

  return settings;
};

export const createResumeSettings = async ({
  teamId,
  enabled,
  cronExpression,
  instructions,
}: {
  teamId: string;
  enabled: boolean;
  cronExpression: string;
  instructions: string;
}) => {
  const [settings] = await db
    .insert(resumeSettings)
    .values({
      teamId,
      enabled,
      cronExpression,
      instructions,
      shouldUpdateJob: true,
    })
    .returning();

  return settings;
};

export const getResumeSettingsByTeamId = async (teamId: string) => {
  const [settings] = await db
    .select()
    .from(resumeSettings)
    .where(eq(resumeSettings.teamId, teamId))
    .limit(1);

  if (!settings) {
    const [created] = await db
      .insert(resumeSettings)
      .values({
        teamId,
        enabled: false,
        cronExpression: "0 16 * * 1-5", // Default: At 16:00 on every day-of-week from Monday through Friday
        instructions: "",
        shouldUpdateJob: true,
      })
      .returning();
    return created;
  }

  return settings;
};
