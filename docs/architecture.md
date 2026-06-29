# Architecture

FollowBrief is a pragmatic modular monorepo. The frontend, API, worker, Prisma schema, fixtures, and docs live together so the whole system is easy to inspect without chasing separate services.

## Boundaries

- `apps/web` owns the Next.js UI, Apollo Client setup, GraphQL documents, and generated frontend operation types.
- `apps/api` owns the GraphQL schema, resolvers, workflow services, worker, tools, AI providers, and Prisma client.
- PostgreSQL stores product state: source items, assistant messages, workflow runs, steps, approvals, events, and tool invocations.
- Redis backs BullMQ jobs and workflow event pub/sub.

## Why GraphQL Is Central

The product is naturally graph-shaped. A workflow run needs steps, events, source items, drafts, tasks, approvals, and invocation logs. GraphQL lets the UI ask for exactly those nested views without REST endpoint sprawl.

The main UI uses nested run data, the approval queue reaches through an approval to the draft and source run, and the inspector asks for tool invocation detail. Those are product-shaped reads that fit GraphQL well.

## Request Lifecycle

1. The user submits the Acme prompt in `/assistant`.
2. The UI calls `sendAssistantMessage`.
3. The API saves the user message, asks the configured AI provider for a plan, validates the plan with Zod, repairs once if needed, compiles the plan into `WorkflowRun` and `WorkflowStep` rows, saves the assistant response, persists `RUN_QUEUED`, and enqueues a BullMQ job.
4. The worker loads the run, skips terminal runs and completed steps, claims each pending step with a conditional database update, validates step input, runs the registered tool, validates output, records a `ToolInvocation`, updates step state, persists a `WorkflowRunEvent`, and publishes that event through Redis.
5. The API subscription process receives the Redis message and streams `workflowRunUpdated` to the browser.
6. The UI refetches the workflow run after subscription events so it can render the durable source of truth, not only the transient event payload.

## Event Persistence Model

PostgreSQL `WorkflowRunEvent` is the source of truth. Redis pub/sub is only a live transport between the worker and API process.

If a browser disconnects or misses a WebSocket message, it can recover by re-querying `workflowRun(id:)`, which returns the persisted event list, steps, tasks, drafts, approvals, and invocation logs.

## API And Worker Process Boundary

The API and worker are separate processes because request/response GraphQL work and long-running workflow execution have different lifecycles. They are not separate services: they share the same repository, Prisma schema, tool registry, AI provider interface, and domain services.

That boundary keeps local development simple while still demonstrating queue-backed async execution.

## Transaction And Idempotency Boundaries

- `sendAssistantMessage` persists the user message, assistant message, run, and steps in one transaction before enqueueing work.
- Workflow enqueueing uses a stable run-scoped BullMQ job id and skips terminal or approval-waiting runs.
- Worker execution claims a step with a conditional `PENDING -> RUNNING` update before side effects occur; duplicate workers exit if another worker already claimed the step.
- `tasks.create` is idempotent per workflow step; reruns return existing tasks.
- `email.draft` is idempotent per workflow step; reruns return the existing draft and approval request.
- `approveAction` is idempotent for already-approved approvals and rejects attempts to approve an already-rejected request.
- `rejectAction` is idempotent for already-rejected approvals, rejects attempts to reject an already-approved request, records rejection as a user decision, skips the email step, and completes the run when remaining work is done.
- Worker retries and manual `retryWorkflowStep` reset failed system/tool steps without recreating completed side effects.

## Approval Policy

`risk-policy.ts` is the runtime source of truth for approval requirements. The worker checks that policy before deciding whether a step can complete or must pause for approval. Tool definitions expose the same policy as metadata for UI and inspector consistency, but they do not silently override the runtime policy.

## Product Health

`productHealth(workspaceId:)` reads persisted runs, failed steps, and tool invocations to calculate runs in the last 24 hours, success rate, failed steps, p95 step latency, and the most common failure. The UI presents natural metric labels in `/health`.
