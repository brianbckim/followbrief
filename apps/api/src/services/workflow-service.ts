import { Prisma } from "@prisma/client";
import type { PrismaClient, WorkflowRunEventType, WorkflowStep } from "@prisma/client";
import { prisma } from "../db/prisma";
import { publishWorkflowEvent } from "../graphql/pubsub";

export async function recordWorkflowEvent(input: {
  prismaClient?: PrismaClient;
  workflowRunId: string;
  workflowStepId?: string | null;
  approvalRequestId?: string | null;
  type: WorkflowRunEventType;
  message: string;
  payloadJson?: Prisma.InputJsonValue;
}) {
  const client = input.prismaClient ?? prisma;
  const event = await client.workflowRunEvent.create({
    data: {
      workflowRunId: input.workflowRunId,
      workflowStepId: input.workflowStepId ?? undefined,
      approvalRequestId: input.approvalRequestId ?? undefined,
      type: input.type,
      message: input.message,
      payloadJson: input.payloadJson ?? {}
    }
  });

  await publishWorkflowEvent(event);
  return event;
}

export function friendlyStepCompletedMessage(step: WorkflowStep) {
  switch (step.toolName) {
    case "DOCUMENTS_SEARCH":
      return "Found relevant notes";
    case "DOCUMENTS_SUMMARIZE":
      return "Summarized customer context";
    case "TASKS_CREATE":
      return "Created follow-up tasks";
    case "EMAIL_DRAFT":
      return "Draft is ready for review";
    default:
      return "Step completed";
  }
}

export async function retryWorkflowStep(stepId: string) {
  const step = await prisma.workflowStep.findUniqueOrThrow({
    where: { id: stepId },
    include: { workflowRun: true }
  });

  if (step.status !== "FAILED") {
    return step;
  }

  const updated = await prisma.workflowStep.update({
    where: { id: stepId },
    data: {
      status: "PENDING",
      errorJson: Prisma.DbNull,
      completedAt: null
    }
  });

  await prisma.workflowRun.update({
    where: { id: step.workflowRunId },
    data: {
      status: "QUEUED",
      completedAt: null
    }
  });

  await recordWorkflowEvent({
    workflowRunId: step.workflowRunId,
    workflowStepId: step.id,
    type: "RUN_QUEUED",
    message: "Retry queued",
    payloadJson: { retriedStepId: step.id }
  });

  const { enqueueWorkflowRun } = await import("../workers/queues");
  await enqueueWorkflowRun(step.workflowRunId);
  return updated;
}

export async function cancelWorkflowRun(runId: string) {
  const run = await prisma.workflowRun.findUniqueOrThrow({ where: { id: runId } });
  if (!["QUEUED", "RUNNING", "WAITING_FOR_APPROVAL"].includes(run.status)) {
    return run;
  }

  const updated = await prisma.workflowRun.update({
    where: { id: runId },
    data: {
      status: "CANCELLED",
      completedAt: new Date()
    }
  });

  await recordWorkflowEvent({
    workflowRunId: runId,
    type: "RUN_FAILED",
    message: "Workflow cancelled by user"
  });

  return updated;
}
