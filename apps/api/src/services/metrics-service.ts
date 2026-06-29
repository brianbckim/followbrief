import { WorkflowRunStatus } from "@prisma/client";
import { prisma } from "../db/prisma";

export async function productHealth(workspaceId: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const runs = await prisma.workflowRun.findMany({
    where: { workspaceId, createdAt: { gte: since } },
    include: { steps: true }
  });

  const runsLast24h = runs.length;
  const succeeded = runs.filter((run) => run.status === WorkflowRunStatus.SUCCEEDED).length;
  const terminal = runs.filter((run) =>
    ["SUCCEEDED", "FAILED", "CANCELLED"].includes(run.status)
  ).length;
  const failedSteps = runs.flatMap((run) =>
    run.steps.filter((step) => step.status === "FAILED")
  );

  const invocations = await prisma.toolInvocation.findMany({
    where: {
      workflowRun: { workspaceId },
      createdAt: { gte: since },
      latencyMs: { not: null }
    },
    select: { latencyMs: true, errorJson: true }
  });

  const latencies = invocations
    .map((invocation) => invocation.latencyMs)
    .filter((latency): latency is number => typeof latency === "number")
    .sort((a, b) => a - b);
  const p95Index = latencies.length ? Math.ceil(latencies.length * 0.95) - 1 : -1;

  const failures = invocations
    .map((invocation) => invocation.errorJson)
    .filter(Boolean)
    .map((error) => JSON.stringify(error));
  const failureCounts = new Map<string, number>();
  failures.forEach((failure) => failureCounts.set(failure, (failureCounts.get(failure) ?? 0) + 1));
  const mostCommonFailure =
    [...failureCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    runsLast24h,
    successRateLast24h: terminal ? succeeded / terminal : 1,
    failedStepsLast24h: failedSteps.length,
    p95StepLatencyMs: p95Index >= 0 ? latencies[p95Index] : null,
    mostCommonFailure
  };
}
