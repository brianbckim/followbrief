# Tradeoffs

## Mock Provider By Default

The mock provider makes the demo deterministic and easy to run without API keys, billing setup, or local model downloads. This is better for the default demo path than requiring a hosted model or local weights.

Mock mode is deliberately Acme-demo optimized. If a user enters an unrelated prompt, the assistant returns guidance that points back to the deterministic Acme prompt instead of pretending to support arbitrary customer workflows.

## No Real Gmail Or Calendar

Real integrations would require OAuth, scopes, deliverability decisions, and a much larger risk surface. FollowBrief creates local drafts and approval requests instead. Rejecting a draft is therefore a controlled user outcome, not a delivery failure.

## No Drag-And-Drop Builder

The product is a focused assistant workflow, not a generic automation platform. A builder would distract from the customer follow-up experience.

## No Vector DB

The seeded corpus is small, so Prisma text matching is enough. A vector store would be useful once source volume and semantic recall become real constraints.

## GraphQL Subscriptions

Subscriptions fit the timeline experience: the worker produces events, the UI reacts live, and the run detail remains queryable as a nested graph. Redis pub/sub is transport only; PostgreSQL events remain the durable record.

## Queue Deduplication

BullMQ is used as a pragmatic local async boundary, not a distributed workflow engine. Stable run-scoped job ids and conditional database step claiming protect the demo from duplicate side effects without adding a larger orchestration system.

## One Polished Use Case

The MVP favors a complete Acme follow-up loop over many shallow integrations. That makes quality, approval, and observability easier to understand and inspect.
