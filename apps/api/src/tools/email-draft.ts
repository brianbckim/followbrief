import { z } from "zod";
import type { ToolDefinition } from "./tool-definition";
import { parseWithSchema } from "../ai/extract-json";
import { EmailDraftOutputSchema } from "../ai/schemas";
import { getRiskPolicy } from "../workflows/risk-policy";

export const EmailDraftInputSchema = z.object({
  recipientName: z.string().min(1),
  recipientEmail: z.string().email(),
  companyName: z.string().min(1),
  purpose: z.string().min(1),
  sourceItemIds: z.array(z.string()).default([]),
  tone: z.string().min(1).default("concise and warm")
});

export const EmailDraftToolOutputSchema = EmailDraftOutputSchema.extend({
  emailDraftId: z.string(),
  approvalRequestId: z.string()
});

const policy = getRiskPolicy("email.draft");

export const emailDraftTool: ToolDefinition<
  z.infer<typeof EmailDraftInputSchema>,
  z.infer<typeof EmailDraftToolOutputSchema>
> = {
  name: "EMAIL_DRAFT",
  planName: "email.draft",
  title: "Draft follow-up email",
  description: "Creates a customer-facing email draft and opens an approval request.",
  riskLevel: policy.riskLevel,
  approvalRequired: policy.approvalRequired,
  inputSchema: EmailDraftInputSchema,
  outputSchema: EmailDraftToolOutputSchema,
  async run(input, ctx) {
    const existing = await ctx.prisma.emailDraft.findUnique({
      where: { workflowStepId: ctx.workflowStep.id },
      include: { approvals: true }
    });

    if (existing) {
      const approval = existing.approvals[0];
      if (!approval) {
        throw new Error("Existing email draft is missing its approval request.");
      }

      return {
        provider: "followbrief",
        latencyMs: 0,
        output: {
          emailDraftId: existing.id,
          approvalRequestId: approval.id,
          subject: existing.subject,
          body: existing.body,
          rationale: "Existing draft reused for this workflow step."
        }
      };
    }

    const summaryStep = await ctx.prisma.workflowStep.findFirst({
      where: {
        workflowRunId: ctx.workflowRun.id,
        toolName: "DOCUMENTS_SUMMARIZE",
        status: "SUCCEEDED"
      },
      orderBy: { index: "desc" }
    });

    const summaryOutput = summaryStep?.outputJson as { summary?: string } | null;
    const result = await ctx.aiProvider.draftEmail({
      recipientName: input.recipientName,
      recipientEmail: input.recipientEmail,
      companyName: input.companyName,
      purpose: input.purpose,
      tone: input.tone,
      contextSummary: summaryOutput?.summary
    });

    const parsed = parseWithSchema(result.text, EmailDraftOutputSchema);
    const draft = await ctx.prisma.emailDraft.create({
      data: {
        workflowRunId: ctx.workflowRun.id,
        workflowStepId: ctx.workflowStep.id,
        recipientName: input.recipientName,
        recipientEmail: input.recipientEmail,
        subject: parsed.subject,
        body: parsed.body
      }
    });

    const approval = await ctx.prisma.approvalRequest.create({
      data: {
        workflowRunId: ctx.workflowRun.id,
        workflowStepId: ctx.workflowStep.id,
        emailDraftId: draft.id,
        riskLevel: policy.riskLevel,
        title: `Review email to ${input.recipientName}`,
        previewJson: {
          recipientName: input.recipientName,
          recipientEmail: input.recipientEmail,
          companyName: input.companyName,
          subject: parsed.subject,
          body: parsed.body,
          rationale: parsed.rationale,
          whyReviewIsRequired:
            "Customer-facing email drafts require approval before FollowBrief finalizes them."
        }
      }
    });

    return {
      provider: result.provider,
      model: result.model,
      promptVersion: result.promptVersion,
      rawResponsePreview: result.text.slice(0, 1000),
      latencyMs: result.latencyMs,
      output: {
        emailDraftId: draft.id,
        approvalRequestId: approval.id,
        ...parsed
      }
    };
  }
};
