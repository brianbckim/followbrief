import type { PrismaClient, RiskLevel, ToolName, WorkflowRun, WorkflowStep } from "@prisma/client";
import type { z } from "zod";
import type { AIProvider } from "../ai/ai-provider";
import type { PlanToolName } from "../workflows/risk-policy";

export interface ToolContext {
  prisma: PrismaClient;
  aiProvider: AIProvider;
  workflowRun: WorkflowRun;
  workflowStep: WorkflowStep;
}

export interface ToolRunResult<TOutput = unknown> {
  output: TOutput;
  provider: string;
  model?: string;
  promptVersion?: string;
  rawResponsePreview?: string;
  latencyMs?: number;
}

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: ToolName;
  planName: PlanToolName;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  inputSchema: z.ZodType<TInput, z.ZodTypeDef, unknown>;
  outputSchema: z.ZodType<TOutput, z.ZodTypeDef, unknown>;
  run(input: TInput, ctx: ToolContext): Promise<ToolRunResult<TOutput>>;
}
