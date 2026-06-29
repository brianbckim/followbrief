# Workflow Engine

The engine is intentionally small and explicit. It keeps asynchronous execution, approval gates, persisted events, and tool-level observability visible without turning FollowBrief into a generic workflow builder.

## Run States

Primary path:

```text
DRAFT -> QUEUED -> RUNNING -> WAITING_FOR_APPROVAL -> RUNNING -> SUCCEEDED
```

System failure path:

```text
RUNNING -> FAILED
```

Cancellation path:

```text
QUEUED/RUNNING/WAITING_FOR_APPROVAL -> CANCELLED
```

User rejection is not a system failure. `rejectAction` marks the approval rejected, marks the email draft rejected, skips the email step, persists an `APPROVAL_REJECTED` event, and completes the run if the remaining non-skipped steps are already complete.

Approval decisions are terminal at the service layer. Repeating the same decision is idempotent, but trying to approve a rejected request or reject an approved request returns a clear conflict error.

## Step States

Steps move through one of these paths:

- `PENDING -> RUNNING -> SUCCEEDED`
- `PENDING -> RUNNING -> WAITING_FOR_APPROVAL -> SUCCEEDED`
- `PENDING -> RUNNING -> FAILED`
- `PENDING -> RUNNING -> WAITING_FOR_APPROVAL -> SKIPPED`

The current Acme plan puts `email.draft` last, so rejecting the draft leaves the already-created follow-up tasks in place and marks the run `SUCCEEDED`.

## Approval Gates

The AI provider cannot decide approval requirements. `risk-policy.ts` is the runtime source of truth: it marks `email.draft` as medium risk and approval-required. Tool metadata mirrors that policy for display and inspection, but the worker checks the policy before deciding whether a step can complete or must pause.

## Retry and Idempotency

Workflow jobs use a stable run-scoped BullMQ job id. The enqueue path skips terminal runs and runs waiting for approval. The worker also skips terminal runs, skips succeeded/skipped steps, and claims each pending step with a conditional `PENDING -> RUNNING` database update before executing a tool. If another worker already claimed the step, the duplicate worker exits without creating side effects.

`tasks.create` reuses tasks for the same workflow step. `email.draft` reuses the draft and approval request for the same step. Approval is idempotent for repeated same-state decisions, so repeated approve/reject calls do not create duplicate tasks, drafts, or state-changing events.

## Events and Subscriptions

Every meaningful transition is persisted as `WorkflowRunEvent`. Events are then published through Redis pub/sub so GraphQL subscriptions can update the UI without refresh. PostgreSQL is the source of truth; a reconnecting UI can re-query `workflowRun(id:)` and recover missed events.
