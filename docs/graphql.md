# GraphQL

FollowBrief is schema-first. The SDL lives in `apps/api/src/graphql/schema.graphql`, and the frontend documents live in `apps/web/src/graphql`.

## Why GraphQL Fits

The product graph is nested: a workflow run includes source items, steps, tasks, drafts, approvals, events, and tool invocations. The assistant console needs a compact nested run view, the approval queue needs draft plus source context, and the inspector needs raw invocation detail. GraphQL lets each screen request the shape it needs without REST endpoint sprawl.

## Core Query Example

```graphql
query WorkflowRunDetail($runId: ID!) {
  workflowRun(id: $runId) {
    ...WorkflowRunTimeline
  }
}
```

## Workflow Timeline Fragment

This fragment powers the assistant console and run detail page.

```graphql
fragment WorkflowRunTimeline on WorkflowRun {
  id
  goal
  status
  steps {
    id
    index
    title
    toolName
    status
    attemptCount
  }
  events {
    id
    type
    message
    payload
    createdAt
    step {
      id
      title
    }
  }
  sourceItems {
    id
    title
    body
    companyName
  }
  createdTasks {
    id
    title
    status
  }
  emailDrafts {
    id
    recipientName
    subject
    status
  }
  approvals {
    id
    status
    riskLevel
    title
  }
}
```

The checked-in fragment is in `apps/web/src/graphql/fragments/WorkflowRunTimeline.graphql`.

## Subscription Example

```graphql
subscription WorkflowRunUpdated($runId: ID!) {
  workflowRunUpdated(runId: $runId) {
    id
    type
    message
    payload
    createdAt
    step {
      id
      title
    }
  }
}
```

The worker writes a `WorkflowRunEvent` row first, then publishes the event over Redis. The browser uses the subscription as a live signal and refetches the run so missed WebSocket messages can be recovered from PostgreSQL.

## Approval Mutations

```graphql
mutation ApproveAction($approvalId: ID!, $note: String) {
  approveAction(approvalId: $approvalId, note: $note) {
    id
    status
    decisionNote
    decidedAt
  }
}
```

```graphql
mutation EditEmailDraft($input: EditEmailDraftInput!) {
  editEmailDraft(input: $input) {
    id
    subject
    body
    status
    updatedAt
  }
}
```

`rejectAction` follows the same domain-specific mutation style. It rejects the approval and draft, skips the email step, and completes the run when the remaining work is done.

## Code Generator

Run `pnpm codegen` to generate typed frontend documents in `apps/web/src/graphql/generated/graphql.ts`. React components import generated documents such as `AssistantConsoleDataDocument`, `WorkflowRunUpdatedDocument`, and `ApprovalQueueDocument` for Apollo hooks.

## Apollo Updates

Apollo uses a split link: HTTP for queries/mutations and WebSocket for subscriptions. The assistant console subscribes to `workflowRunUpdated` for the active run and calls `refetch()` when events arrive. This keeps the UI simple and ensures the rendered timeline matches persisted data.

The approval queue refetches after approve, reject, or edit mutations so pending approvals and draft state stay current.

## N+1 Status

The current demo corpus is small, so resolvers use straightforward Prisma queries. The `loaders.ts` file is present as the intended extension point for DataLoader batching if the dataset grows. For the current Acme flow, the query volume is acceptable and easier to inspect.
