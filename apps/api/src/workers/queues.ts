import { Queue } from "bullmq";
import Redis from "ioredis";
import { env } from "../env";
import { prisma } from "../db/prisma";
import { terminalRunStatuses } from "../workflows/workflow-state";

export const workflowQueueName = "workflow-execution";

export function createRedisConnection() {
  return new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
}

export const workflowQueue = new Queue(workflowQueueName, {
  connection: createRedisConnection() as any
});

export async function enqueueWorkflowRun(runId: string) {
  const run = await prisma.workflowRun.findUnique({
    where: { id: runId },
    select: { status: true }
  });

  if (!run || terminalRunStatuses.has(run.status) || run.status === "WAITING_FOR_APPROVAL") {
    return null;
  }

  return workflowQueue.add(
    "execute-workflow",
    { runId },
    {
      jobId: `workflow-run-${runId}`,
      removeOnComplete: true,
      removeOnFail: 100
    }
  );
}
