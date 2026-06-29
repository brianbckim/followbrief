# Implementation Summary

This summary describes feature areas present in the current codebase.

## GraphQL Foundation And Seeded Context

Key files:

- `apps/api/src/graphql/schema.graphql`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/seed.ts`
- `fixtures/ai/acme-followup-plan.json`

## Assistant Message And Mock Plan Flow

Key files:

- `apps/api/src/services/assistant-service.ts`
- `apps/api/src/ai/mock-provider.ts`
- `apps/api/src/ai/schemas.ts`
- `apps/api/src/workflows/plan-compiler.ts`

## Worker And Tool Execution

Key files:

- `apps/api/src/workers/execute-workflow-worker.ts`
- `apps/api/src/tools/documents-search.ts`
- `apps/api/src/tools/documents-summarize.ts`
- `apps/api/src/tools/tasks-create.ts`
- `apps/api/src/tools/email-draft.ts`

## Subscriptions And Timeline

Key files:

- `apps/api/src/graphql/pubsub.ts`
- `apps/web/src/graphql/operations/assistant.graphql`
- `apps/web/src/components/timeline/Timeline.tsx`

## Approval Queue And Full Acme Demo

Key files:

- `apps/web/src/components/approvals/ApprovalQueue.tsx`
- `apps/api/src/services/approval-service.ts`
- `apps/web/tests/e2e/acme-followup.spec.ts`

## Inspector, Health, Tests, Docs

Key files:

- `apps/web/src/components/inspector/RunInspector.tsx`
- `apps/web/src/components/health/HealthPanel.tsx`
- `apps/api/src/tests`
- `README.md`
- `docs/`

## Checks

The main non-service checks are:

- `pnpm codegen`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Database integration and E2E checks require Postgres, Redis, API, worker, and web processes as described in `README.md`.
