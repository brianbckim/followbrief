# Deployment

This repository does not include a live deployment URL. The recommended demo deployment posture is deterministic and focused on the Acme follow-up flow, not production email automation.

## Recommended Services

- Web: Vercel
- API: Render, Fly.io, or Railway
- Worker: Render, Fly.io, or Railway background worker
- PostgreSQL: Neon, Supabase, or Railway
- Redis: Upstash or Railway

The API and worker are separate processes from the same codebase. They should share the same `DATABASE_URL`, `REDIS_URL`, and AI provider environment.

## Required Environment

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
AI_PROVIDER=mock
NEXT_PUBLIC_GRAPHQL_HTTP_URL=https://your-api.example.com/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://your-api.example.com/graphql
```

Use `AI_PROVIDER=mock` for a public demo unless the goal is to evaluate model behavior. The mock provider keeps the Acme flow deterministic and does not require API keys.

## Release Steps

1. Provision PostgreSQL and Redis.
2. Deploy the API process.
3. Deploy the worker process with the same database and Redis environment.
4. Run `pnpm db:migrate`.
5. Run `pnpm db:seed` so the Acme demo context exists.
6. Deploy the web app with the public GraphQL HTTP and WebSocket URLs.
7. Open `/assistant` and submit the Acme prompt:

```text
Find last week's Acme meeting notes, draft a follow-up email to Sarah, and create next-step tasks for our team.
```

Expected result: the run finds Acme context, creates tasks, drafts an email, waits for approval, completes after approval or controlled rejection, and exposes tool invocations in the inspector.

## Notes

- Redis pub/sub is a live transport only; PostgreSQL `WorkflowRunEvent` rows are the recovery source after reconnects.
- No real Gmail, Slack, Calendar, OAuth, or email sending is included.
- For deterministic demos, seed data should be reset or reseeded between demo sessions if a clean first-run state matters.
