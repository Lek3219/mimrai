import z from "zod";

export const createResumeSettingsSchema = z.object({
  enabled: z.boolean(),
  cronExpression: z.string().min(5).max(100),
  instructions: z.string().max(500),
});

export const updateResumeSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  cronPrompt: z.string().max(500).optional(),
  instructions: z.string().max(500).optional(),
});
