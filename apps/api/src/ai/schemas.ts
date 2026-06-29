import { z } from "zod";

export const SupportedPlanToolSchema = z.enum([
  "documents.search",
  "documents.summarize",
  "email.draft",
  "tasks.create"
]);

export const WorkflowPlanStepSchema = z.object({
  clientStepId: z.string().min(1),
  title: z.string().min(1),
  toolName: SupportedPlanToolSchema,
  input: z.record(z.unknown()).default({}),
  dependsOn: z.array(z.string()).default([]),
  userVisibleReason: z.string().min(1)
});

export const WorkflowPlanSchema = z.object({
  goal: z.string().min(1),
  userVisibleSummary: z.string().min(1),
  steps: z.array(WorkflowPlanStepSchema).min(1).max(6)
});

export type WorkflowPlan = z.infer<typeof WorkflowPlanSchema>;
export type WorkflowPlanStep = z.infer<typeof WorkflowPlanStepSchema>;

export const SummaryOutputSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  actionItems: z.array(z.string())
});

export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;

export const EmailDraftOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
  rationale: z.string()
});

export type EmailDraftOutput = z.infer<typeof EmailDraftOutputSchema>;
