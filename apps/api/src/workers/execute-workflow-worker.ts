import { Worker } from "bullmq";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { getAIProvider } from "../ai/provider-factory";
import { getTool } from "../tools/tool-registry";
import { workflowQueueName, createRedisConnection } from "./queues";
import {
  friendlyStepCompletedMessage,
  recordWorkflowEvent
} from "../services/workflow-service";
import { logger } from "../logger/logger";
import { terminalRunStatuses } from "../workflows/workflow-state";
import { dbToolToPlanTool } from "../workflows/plan-compiler";
import { getRiskPolicy } from "../workflows/risk-policy";

function errorToJson(error: unknown): Prisma.InputJsonObject {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.slice(0, 1200)
    };
  }
  return { message: String(error) };
}

export async function executeWorkflowRun(runId: string) {
  const existingRun = await prisma.workflowRun.findUnique({
    where: { id: runId },
    include: { steps: { orderBy: { index: "asc" } } }
  });

  if (!existingRun) {
    logger.warn({ runId }, "Skipping stale workflow job with no matching run");
    return null;
  }

  if (terminalRunStatuses.has(existingRun.status)) {
    return existingRun;
  }

  if (
    existingRun.status === "WAITING_FOR_APPROVAL" ||
    existingRun.steps.some((step) => step.status === "WAITING_FOR_APPROVAL")
  ) {
    return existingRun;
  }

  const startedNow = !existingRun.startedAt;
  const run = await prisma.workflowRun.update({
    where: { id: runId },
    data: {
      status: "RUNNING",
      startedAt: existingRun.startedAt ?? new Date(),
      completedAt: null
    },
    include: { steps: { orderBy: { index: "asc" } } }
  });

  if (startedNow) {
    await recordWorkflowEvent({
      workflowRunId: run.id,
      type: "RUN_STARTED",
      message: "Workflow started"
    });
  }

  for (const step of run.steps) {
    if (step.status === "SUCCEEDED" || step.status === "SKIPPED") {
      continue;
    }

    if (step.status === "WAITING_FOR_APPROVAL") {
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: { status: "WAITING_FOR_APPROVAL" }
      });
      return run;
    }

    const tool = getTool(step.toolName);
    const riskPolicy = getRiskPolicy(dbToolToPlanTool(step.toolName));
    const attemptCount = step.attemptCount + 1;
    const claimedStep = await prisma.workflowStep.updateMany({
      where: { id: step.id, status: "PENDING" },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
        attemptCount,
        errorJson: Prisma.DbNull
      }
    });

    if (claimedStep.count === 0) {
      return prisma.workflowRun.findUnique({
        where: { id: run.id },
        include: { steps: { orderBy: { index: "asc" } } }
      });
    }

    const runningStep = await prisma.workflowStep.findUniqueOrThrow({
      where: { id: step.id }
    });

    await recordWorkflowEvent({
      workflowRunId: run.id,
      workflowStepId: step.id,
      type: "STEP_STARTED",
      message: `${tool.title} started`
    });

    const started = Date.now();
    try {
      const input = tool.inputSchema.parse(step.inputJson);
      const result = await tool.run(input, {
        prisma,
        aiProvider: getAIProvider(),
        workflowRun: run,
        workflowStep: runningStep
      });
      const output = tool.outputSchema.parse(result.output);
      const latencyMs = result.latencyMs ?? Date.now() - started;

      await prisma.toolInvocation.create({
        data: {
          workflowRunId: run.id,
          workflowStepId: step.id,
          toolName: step.toolName,
          provider: result.provider,
          model: result.model,
          promptVersion: result.promptVersion,
          inputJson: input as Prisma.InputJsonObject,
          outputJson: output as Prisma.InputJsonObject,
          rawResponsePreview: result.rawResponsePreview,
          latencyMs,
          attemptCount,
          completedAt: new Date()
        }
      });

      await prisma.workflowStep.update({
        where: { id: step.id },
        data: {
          outputJson: output as Prisma.InputJsonObject,
          status: riskPolicy.approvalRequired ? "WAITING_FOR_APPROVAL" : "SUCCEEDED",
          completedAt: riskPolicy.approvalRequired ? null : new Date()
        }
      });

      if (riskPolicy.approvalRequired) {
        const approvalRequestId =
          typeof output === "object" && output !== null && "approvalRequestId" in output
            ? String(output.approvalRequestId)
            : null;
        await prisma.workflowRun.update({
          where: { id: run.id },
          data: { status: "WAITING_FOR_APPROVAL" }
        });
        await recordWorkflowEvent({
          workflowRunId: run.id,
          workflowStepId: step.id,
          approvalRequestId,
          type: "APPROVAL_REQUESTED",
          message: "Waiting for your review",
          payloadJson: output as Prisma.InputJsonObject
        });
        return run;
      }

      await recordWorkflowEvent({
        workflowRunId: run.id,
        workflowStepId: step.id,
        type: "STEP_COMPLETED",
        message: friendlyStepCompletedMessage(step),
        payloadJson: output as Prisma.InputJsonObject
      });
    } catch (error) {
      const errorJson = errorToJson(error);
      await prisma.toolInvocation.create({
        data: {
          workflowRunId: run.id,
          workflowStepId: step.id,
          toolName: step.toolName,
          provider: "followbrief",
          inputJson: (step.inputJson ?? {}) as Prisma.InputJsonObject,
          errorJson,
          latencyMs: Date.now() - started,
          attemptCount,
          completedAt: new Date()
        }
      });
      await prisma.workflowStep.update({
        where: { id: step.id },
        data: {
          status: "FAILED",
          errorJson,
          completedAt: new Date()
        }
      });
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          completedAt: new Date()
        }
      });
      await recordWorkflowEvent({
        workflowRunId: run.id,
        workflowStepId: step.id,
        type: "STEP_FAILED",
        message: "A workflow step failed",
        payloadJson: errorJson
      });
      await recordWorkflowEvent({
        workflowRunId: run.id,
        workflowStepId: step.id,
        type: "RUN_FAILED",
        message: "Workflow failed",
        payloadJson: errorJson
      });
      throw error;
    }
  }

  const completedRun = await prisma.workflowRun.update({
    where: { id: run.id },
    data: {
      status: "SUCCEEDED",
      completedAt: new Date()
    },
    include: { steps: { orderBy: { index: "asc" } } }
  });

  await recordWorkflowEvent({
    workflowRunId: run.id,
    type: "RUN_SUCCEEDED",
    message: "Workflow completed"
  });

  return completedRun;
}

export function startWorkflowWorker() {
  const worker = new Worker(
    workflowQueueName,
    async (job) => {
      await executeWorkflowRun(job.data.runId as string);
    },
    {
      connection: createRedisConnection() as any,
      concurrency: 4
    }
  );

  worker.on("failed", (job, error) => {
    logger.error({ jobId: job?.id, error }, "Workflow job failed");
  });

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Workflow job completed");
  });

  return worker;
}
