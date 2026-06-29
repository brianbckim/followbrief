import type { WorkflowRunStatus, WorkflowStepStatus } from "@prisma/client";

export const terminalRunStatuses = new Set<WorkflowRunStatus>([
  "SUCCEEDED",
  "FAILED",
  "CANCELLED"
]);

export const terminalStepStatuses = new Set<WorkflowStepStatus>([
  "SUCCEEDED",
  "FAILED",
  "SKIPPED"
]);

export function canCancelRun(status: WorkflowRunStatus) {
  return status === "QUEUED" || status === "RUNNING" || status === "WAITING_FOR_APPROVAL";
}
