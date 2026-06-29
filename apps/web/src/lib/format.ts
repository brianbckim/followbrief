export function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not yet";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function readableStatus(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    QUEUED: "Queued",
    RUNNING: "Running",
    WAITING_FOR_APPROVAL: "Waiting for review",
    SUCCEEDED: "Completed",
    FAILED: "Needs attention",
    CANCELLED: "Cancelled",
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    SKIPPED: "Skipped",
    TODO: "To do",
    DONE: "Done"
  };
  return labels[status] ?? status.toLowerCase();
}

export function eventLabel(type: string, fallback: string) {
  const labels: Record<string, string> = {
    RUN_QUEUED: "Queued the workflow",
    RUN_STARTED: "Started the workflow",
    STEP_STARTED: "Started a step",
    STEP_COMPLETED: fallback,
    APPROVAL_REQUESTED: "Waiting for your review",
    APPROVAL_APPROVED: "Draft approved",
    APPROVAL_REJECTED: fallback || "Email draft rejected. Follow-up tasks were still created.",
    STEP_FAILED: "A step needs attention",
    RUN_SUCCEEDED: "Workflow completed",
    RUN_FAILED: fallback || "Workflow stopped"
  };
  return labels[type] ?? fallback;
}
