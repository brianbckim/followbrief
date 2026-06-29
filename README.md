# FollowBrief — AI Follow-up Assistant

FollowBrief is a focused AI follow-up assistant demo. In the default local demo, it uses seeded Acme customer context to create next-step tasks, draft a customer follow-up email, pause for approval, and show an inspectable real-time workflow timeline.

GraphQL is the main product API: queries, mutations, and subscriptions keep workflow progress, approval state, tool invocations, and product health visible in the React/TypeScript UI.

It runs with a deterministic mock AI provider, so the Acme scenario works without API keys or model downloads. Unrelated prompts return demo guidance instead of pretending to support arbitrary customer workflows.

**Demo mode:** deterministic local Acme follow-up scenario, designed to run without external API keys, email delivery, or third-party accounts.

## After Setup: Try It In 60 Seconds

1. Open `/assistant`.
2. Submit the Acme prompt:

```text
Find last week's Acme meeting notes, draft a follow-up email to Sarah, and create next-step tasks for our team.
```

Expected result:

- Finds Acme source items.
- Creates a workflow run.
- Creates next-step tasks.
- Drafts an email to Sarah.
- Pauses for approval.
- Allows edit, approve, or reject.
- Completes the run after approval or controlled rejection.
- Inspector shows tool invocations.
- Health page shows metrics.

The approval queue also supports editing or rejecting the draft. Rejection is treated as a controlled user decision: tasks remain created and the run completes without finalizing the email.

## Local Quickstart

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm codegen
pnpm dev
```

Open [http://localhost:3000/assistant](http://localhost:3000/assistant).

`pnpm dev` starts all three local processes: the GraphQL API, the BullMQ worker, and the Next.js web app. You can also run them separately:

```bash
pnpm dev:api
pnpm dev:worker
pnpm dev:web
```

## Port Conflicts

If the default local ports are unavailable, run the stack on alternate ports:

```bash
POSTGRES_PORT=5433 REDIS_PORT=6380 docker compose up -d
DATABASE_URL=postgresql://followbrief:followbrief@127.0.0.1:5433/followbrief REDIS_URL=redis://127.0.0.1:6380 pnpm db:migrate
DATABASE_URL=postgresql://followbrief:followbrief@127.0.0.1:5433/followbrief REDIS_URL=redis://127.0.0.1:6380 pnpm db:seed
DATABASE_URL=postgresql://followbrief:followbrief@127.0.0.1:5433/followbrief REDIS_URL=redis://127.0.0.1:6380 GRAPHQL_PORT=4200 pnpm dev:api
DATABASE_URL=postgresql://followbrief:followbrief@127.0.0.1:5433/followbrief REDIS_URL=redis://127.0.0.1:6380 pnpm dev:worker
NEXT_PUBLIC_GRAPHQL_HTTP_URL=http://127.0.0.1:4200/graphql NEXT_PUBLIC_GRAPHQL_WS_URL=ws://127.0.0.1:4200/graphql pnpm --filter @followbrief/web exec next dev -p 3100
```

These examples use `127.0.0.1` consistently so Postgres, Redis, API, and browser URLs all resolve to the same local loopback interface.

## Verified Commands

These commands were run successfully against the current implementation:

- `pnpm codegen`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:seed`
- `RUN_DB_TESTS=1 pnpm --filter @followbrief/api test`
- `pnpm test:e2e`
- `pnpm capture:demo:fresh`

The service-backed checks require local Postgres, Redis, API, worker, and web processes. The alternate-port setup above is the recommended path when the default local ports are not available.

## Screenshots / Demo Assets

![Assistant console waiting for review](docs/assets/assistant-waiting-for-review.png)

![Approval queue with Sarah email draft](docs/assets/approval-email-draft.png)

![Run inspector with tool invocations](docs/assets/run-inspector.png)

![Product health metrics](docs/assets/product-health.png)

Screenshots are checked in. GIF capture is optional; the screenshot capture helper expects the local stack to be running:

```bash
CAPTURE_BASE_URL=http://127.0.0.1:3000 pnpm capture:demo
```

For a clean public-demo refresh, use the explicit fresh capture command after the local stack is running:

```bash
CAPTURE_BASE_URL=http://127.0.0.1:3000 pnpm capture:demo:fresh
```

`capture:demo:fresh` resets the local demo database before capturing screenshots. It refuses to run unless `DATABASE_URL` points to `localhost`, `127.0.0.1`, or `::1`; do not run destructive reset scripts against shared or production databases.

## Core Flow

```mermaid
sequenceDiagram
  participant User
  participant Web as Next.js UI
  participant API as GraphQL API
  participant Worker
  participant DB as PostgreSQL
  participant Redis

  User->>Web: Submit Acme follow-up prompt
  Web->>API: sendAssistantMessage
  API->>DB: Persist messages, run, steps, RUN_QUEUED event
  API->>Worker: Enqueue workflow job
  Worker->>DB: Run search, summarize, tasks, email draft
  Worker->>Redis: Publish workflowRunUpdated events
  Redis->>API: Subscription fan-out
  API->>Web: Timeline updates
  Worker->>DB: Create approval request
  User->>Web: Edit, approve, or reject draft
  Web->>API: approveAction / rejectAction
  API->>DB: Complete run or skip rejected email step
```

## Architecture

```mermaid
flowchart LR
  UI["Next.js React UI"] -->|Queries and mutations| API["GraphQL Yoga API"]
  UI -->|GraphQL WS subscription| API
  API --> DB[(PostgreSQL via Prisma)]
  API --> Queue["BullMQ queue"]
  Queue --> Worker["Node worker"]
  Worker --> DB
  Worker --> AI["AI provider (mock default)"]
  Worker --> Redis[(Redis pub/sub)]
  Redis --> API
```

## Tech Stack

TypeScript, Next.js, React, Apollo Client, GraphQL Code Generator, Tailwind CSS, Node.js, GraphQL Yoga, graphql-ws, Prisma, PostgreSQL, Redis, BullMQ, Zod, Vitest, and Playwright.

## GraphQL Highlights

- Queries return nested product data such as workflow runs, source items, approvals, tasks, events, and tool invocations.
- Mutations are domain-specific: `sendAssistantMessage`, `approveAction`, `rejectAction`, `editEmailDraft`, `retryWorkflowStep`, and `cancelWorkflowRun`.
- Subscriptions stream `workflowRunUpdated` events from Redis pub/sub to the UI.
- PostgreSQL `WorkflowRunEvent` records are the source of truth; Redis only transports live updates.
- The frontend imports generated typed documents from GraphQL Code Generator.

## Testing

- Vitest covers plan validation, unknown-tool rejection, risk policy, JSON extraction, and the DB-backed Acme approval/rejection workflow.
- Playwright covers the Acme follow-up flow from `/assistant` through approval and the run inspector.
- `pnpm capture:demo` reuses Playwright to refresh the checked-in demo screenshots under `docs/assets/`.

## Workflow Engine

Runs move `DRAFT -> QUEUED -> RUNNING -> WAITING_FOR_APPROVAL -> RUNNING -> SUCCEEDED`. Tool or schema failures move a run to `FAILED`. User rejection of a draft marks that email step `SKIPPED` and completes the run when the remaining work is already done.

The mock AI provider only proposes a plan and content. The server owns approval policy through `risk-policy.ts`, so `email.draft` always pauses for review. Approval decisions are terminal: approving an approved draft and rejecting a rejected draft are idempotent, while trying to flip an approved/rejected decision returns a conflict error.

## AI Providers

`AI_PROVIDER=mock` is the intended demo path and requires no keys. `AI_PROVIDER=replay` uses fixture-backed outputs. `AI_PROVIDER=openai-compatible` is available for manual experiments against a local or hosted `/v1/chat/completions` server.

## Deployment Notes

Run the web app and API as separate processes, run the worker as a long-lived background process, and provide managed PostgreSQL and Redis. Keep `AI_PROVIDER=mock` for deployed demos when deterministic behavior matters. See `docs/deployment.md` for the recommended Vercel plus Render/Fly/Railway style deployment posture.

## Tradeoffs

The MVP intentionally avoids OAuth, real Gmail/Slack/Calendar integrations, vector search, and a drag-and-drop workflow builder. It focuses on one polished customer follow-up loop with inspectable execution.

## Documentation

- [Implementation summary](docs/implementation-summary.md)
- [Architecture](docs/architecture.md)
- [Workflow engine](docs/workflow-engine.md)
- [GraphQL](docs/graphql.md)
- [Friction log](docs/friction-log.md)
- [Tradeoffs](docs/tradeoffs.md)
- [Deployment](docs/deployment.md)
- [Optional OpenAI-compatible provider](docs/optional-openai-compatible-provider.md)
