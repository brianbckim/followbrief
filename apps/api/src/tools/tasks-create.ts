import { z } from "zod";
import type { ToolDefinition } from "./tool-definition";
import { getRiskPolicy } from "../workflows/risk-policy";

export const TasksCreateInputSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        dueInDays: z.number().int().min(0).max(60)
      })
    )
    .min(1)
    .max(8)
});

export const TasksCreateOutputSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      dueDate: z.string().nullable()
    })
  )
});

const policy = getRiskPolicy("tasks.create");

export const tasksCreateTool: ToolDefinition<
  z.infer<typeof TasksCreateInputSchema>,
  z.infer<typeof TasksCreateOutputSchema>
> = {
  name: "TASKS_CREATE",
  planName: "tasks.create",
  title: "Create follow-up tasks",
  description: "Creates local next-step tasks for the workspace.",
  riskLevel: policy.riskLevel,
  approvalRequired: policy.approvalRequired,
  inputSchema: TasksCreateInputSchema,
  outputSchema: TasksCreateOutputSchema,
  async run(input, ctx) {
    const existing = await ctx.prisma.task.findMany({
      where: { workflowStepId: ctx.workflowStep.id },
      orderBy: { createdAt: "asc" }
    });

    if (existing.length === 0) {
      await ctx.prisma.task.createMany({
        data: input.tasks.map((task) => ({
          workspaceId: ctx.workflowRun.workspaceId,
          workflowRunId: ctx.workflowRun.id,
          workflowStepId: ctx.workflowStep.id,
          title: task.title,
          description: task.description,
          dueDate: new Date(Date.now() + task.dueInDays * 24 * 60 * 60 * 1000)
        })),
        skipDuplicates: true
      });
    }

    const tasks = await ctx.prisma.task.findMany({
      where: { workflowStepId: ctx.workflowStep.id },
      orderBy: { createdAt: "asc" }
    });

    return {
      provider: "followbrief",
      latencyMs: 0,
      output: {
        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate?.toISOString() ?? null
        }))
      }
    };
  }
};
