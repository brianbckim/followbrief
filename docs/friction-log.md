# Friction Log

This document summarizes product friction found during implementation review and the changes made to address it.

## Approval CTA Was Too Easy To Miss

Before: the review state could be inferred from the timeline, but there was no obvious call to action.

After: `/assistant` renders a dedicated approval callout when a run has a pending approval.

Key files:

- `apps/web/src/components/assistant/ApprovalCallout.tsx`
- `apps/web/src/components/assistant/AssistantConsole.tsx`

## Timeline Used Internal Names

Before: raw event names such as `STEP_COMPLETED` made the main UI feel like an admin log.

After: timeline events are mapped to user-facing copy. Raw enums remain visible in the inspector.

Key files:

- `apps/web/src/lib/format.ts`
- `apps/web/src/components/timeline/Timeline.tsx`
- `apps/web/src/components/inspector/RunInspector.tsx`

## Empty State Was Ambiguous

Before: a new user landing on the assistant page needed to infer the intended demo path.

After: the Acme prompt is prefilled, the sidebar explains seeded context, and the timeline has a clear empty state before the first run.

Key files:

- `apps/web/src/lib/demo.ts`
- `apps/web/src/components/assistant/AssistantConsole.tsx`
- `apps/web/src/components/timeline/Timeline.tsx`

## Run Failure Message Was Too Technical

Before: failed steps exposed internal detail too early.

After: the run detail page shows a concise user-facing warning, while the inspector keeps raw inputs, outputs, errors, provider, latency, and attempt count.

Key files:

- `apps/web/src/components/assistant/RunDetail.tsx`
- `apps/web/src/components/inspector/RunInspector.tsx`

## Draft Editing Needed Save Feedback

Before: draft edits could feel silent.

After: the approval queue shows a saved notice and refreshes after edit, approve, or reject mutations.

Key files:

- `apps/web/src/components/approvals/ApprovalQueue.tsx`

## Draft Rejection Looked Like A System Failure

Before: rejecting an email marked the workflow run `FAILED`.

After: rejection marks the approval and draft rejected, skips the email step, keeps created tasks, and completes the run when no non-skipped work remains.

Key files:

- `apps/api/src/services/approval-service.ts`
- `apps/api/src/tests/workflow-integration.test.ts`
- `docs/workflow-engine.md`
