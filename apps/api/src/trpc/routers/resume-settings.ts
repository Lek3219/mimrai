import {
  createResumeSettingsSchema,
  updateResumeSettingsSchema,
} from "@api/schemas/resume-settings";
import { protectedProcedure, router } from "@api/trpc/init";
import {
  createResumeSettings,
  getResumeSettingsByTeamId,
  updateResumeSettings,
} from "@mimir/db/queries/resume-settings";
import { sendResumeJob } from "@mimir/jobs/notifications/send-resume-job";
import { TRPCError } from "@trpc/server";
import { generateObject } from "ai";
import z from "zod";

export const resumeSettingsRouter = router({
  get: protectedProcedure.query(async ({ ctx, input }) => {
    return getResumeSettingsByTeamId(ctx.user.teamId!);
  }),

  create: protectedProcedure
    .input(createResumeSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      return createResumeSettings({
        ...input,
        teamId: ctx.user.teamId!,
      });
    }),

  update: protectedProcedure
    .input(updateResumeSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const generatedCron = await generateObject({
        model: "openai/gpt-4o-mini",
        schema: z.object({
          cronExpression: z.string().min(5).max(100),
          success: z
            .boolean()
            .describe(
              "If the resulting cron expression intervals are too frequent (more than once a day), return success as false"
            ),
        }),
        prompt: `Generate a cron expression for the following schedule: ${input.cronPrompt}.`,
        temperature: 0.2,
      });

      if (!generatedCron.object.success) {
        throw new TRPCError({
          message:
            "The provided schedule is too frequent. Please provide a less frequent schedule.",
          code: "BAD_REQUEST",
        });
      }

      return updateResumeSettings({
        ...input,
        teamId: ctx.user.teamId!,
        cronExpression: generatedCron.object.cronExpression,
      });
    }),

  test: protectedProcedure.mutation(async ({ ctx, input }) => {
    await updateResumeSettings({
      teamId: ctx.user.teamId!,
      lastRunAt: new Date("1970-01-01T00:00:00Z"),
    });
    await sendResumeJob.trigger({
      externalId: ctx.user.teamId!,
      scheduleId: "immediate-test-resume-job",
      timestamp: new Date(),
      timezone: "UTC",
      type: "IMPERATIVE",
      upcoming: [new Date()],
    });
  }),
});
