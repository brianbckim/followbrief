import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { ToolDefinition } from "./tool-definition";
import { getRiskPolicy } from "../workflows/risk-policy";

export const DocumentsSearchInputSchema = z.object({
  query: z.string().min(1),
  companyName: z.string().optional(),
  limit: z.number().int().min(1).max(10).default(5)
});

export const DocumentsSearchOutputSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      snippet: z.string(),
      companyName: z.string().nullable()
    })
  )
});

const policy = getRiskPolicy("documents.search");

export const documentsSearchTool: ToolDefinition<
  z.infer<typeof DocumentsSearchInputSchema>,
  z.infer<typeof DocumentsSearchOutputSchema>
> = {
  name: "DOCUMENTS_SEARCH",
  planName: "documents.search",
  title: "Find customer context",
  description: "Searches seeded workspace source items for relevant meeting notes and CRM context.",
  riskLevel: policy.riskLevel,
  approvalRequired: policy.approvalRequired,
  inputSchema: DocumentsSearchInputSchema,
  outputSchema: DocumentsSearchOutputSchema,
  async run(input, ctx) {
    const tokens = input.query
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .slice(0, 8);

    const where: Prisma.SourceItemWhereInput = {
      workspaceId: ctx.workflowRun.workspaceId,
      ...(input.companyName
        ? {
            companyName: {
              contains: input.companyName,
              mode: "insensitive"
            }
          }
        : {}),
      OR: tokens.flatMap((token) => [
        { title: { contains: token, mode: "insensitive" as const } },
        { body: { contains: token, mode: "insensitive" as const } },
        { companyName: { contains: token, mode: "insensitive" as const } },
        { contactName: { contains: token, mode: "insensitive" as const } }
      ])
    };

    const items = await ctx.prisma.sourceItem.findMany({
      where,
      take: input.limit,
      orderBy: [{ companyName: "asc" }, { createdAt: "desc" }]
    });

    if (items.length > 0) {
      await ctx.prisma.workflowRunSourceItem.createMany({
        data: items.map((item) => ({
          workflowRunId: ctx.workflowRun.id,
          sourceItemId: item.id
        })),
        skipDuplicates: true
      });
    }

    return {
      provider: "postgres",
      latencyMs: 0,
      output: {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          snippet: item.body.length > 220 ? `${item.body.slice(0, 220)}...` : item.body,
          companyName: item.companyName
        }))
      }
    };
  }
};
