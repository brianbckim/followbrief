import { z } from "zod";
import type { ToolDefinition } from "./tool-definition";
import { parseWithSchema } from "../ai/extract-json";
import { SummaryOutputSchema } from "../ai/schemas";
import { getRiskPolicy } from "../workflows/risk-policy";

export const DocumentsSummarizeInputSchema = z.object({
  sourceItemIds: z.array(z.string()).default([]),
  focus: z.string().min(1)
});

export const DocumentsSummarizeOutputSchema = SummaryOutputSchema;

const policy = getRiskPolicy("documents.summarize");

export const documentsSummarizeTool: ToolDefinition<
  z.infer<typeof DocumentsSummarizeInputSchema>,
  z.infer<typeof DocumentsSummarizeOutputSchema>
> = {
  name: "DOCUMENTS_SUMMARIZE",
  planName: "documents.summarize",
  title: "Summarize context",
  description: "Summarizes selected source items for the follow-up.",
  riskLevel: policy.riskLevel,
  approvalRequired: policy.approvalRequired,
  inputSchema: DocumentsSummarizeInputSchema,
  outputSchema: DocumentsSummarizeOutputSchema,
  async run(input, ctx) {
    const linkedSources = await ctx.prisma.workflowRunSourceItem.findMany({
      where: { workflowRunId: ctx.workflowRun.id },
      select: { sourceItemId: true }
    });
    const sourceItemIds = input.sourceItemIds.length
      ? input.sourceItemIds
      : linkedSources.map((source) => source.sourceItemId);

    const documents = await ctx.prisma.sourceItem.findMany({
      where: {
        workspaceId: ctx.workflowRun.workspaceId,
        id: { in: sourceItemIds }
      }
    });

    const result = await ctx.aiProvider.summarizeDocuments({
      focus: input.focus,
      documents: documents.map((document) => ({
        id: document.id,
        title: document.title,
        body: document.body,
        companyName: document.companyName
      }))
    });

    return {
      provider: result.provider,
      model: result.model,
      promptVersion: result.promptVersion,
      rawResponsePreview: result.text.slice(0, 1000),
      latencyMs: result.latencyMs,
      output: parseWithSchema(result.text, DocumentsSummarizeOutputSchema)
    };
  }
};
