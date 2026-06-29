"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { ArrowRight, Loader2, Send, Sparkles } from "lucide-react";
import {
  AssistantConsoleDataDocument,
  SendAssistantMessageDocument,
  WorkflowRunUpdatedDocument
} from "@/graphql/generated/graphql";
import { DEMO_PROMPT, DEMO_THREAD_ID, DEMO_WORKSPACE_ID } from "@/lib/demo";
import { formatDateTime, readableStatus } from "@/lib/format";
import { Timeline } from "@/components/timeline/Timeline";
import { ApprovalCallout } from "./ApprovalCallout";
import { StatusPill } from "@/components/layout/StatusPill";

export function AssistantConsole() {
  const [content, setContent] = useState(DEMO_PROMPT);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(AssistantConsoleDataDocument, {
    variables: { workspaceId: DEMO_WORKSPACE_ID, threadId: DEMO_THREAD_ID },
    pollInterval: activeRunId ? 0 : undefined
  });

  const latestRun = data?.assistantThread.latestRun;
  const subscribedRunId = activeRunId ?? latestRun?.id ?? "";

  useSubscription(WorkflowRunUpdatedDocument, {
    variables: { runId: subscribedRunId },
    skip: !subscribedRunId,
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData.data?.workflowRunUpdated) {
        void refetch();
      }
    }
  });

  const [sendMessage, { loading: submitting }] = useMutation(SendAssistantMessageDocument, {
    onCompleted: (result) => {
      setActiveRunId(result.sendAssistantMessage.run.id);
      setNotice("Workflow started. The timeline will update as the worker runs.");
      setContent("");
      void refetch();
    }
  });

  const run = useMemo(() => data?.assistantThread.latestRun ?? null, [data]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }
    setNotice(null);
    await sendMessage({
      variables: {
        input: {
          threadId: DEMO_THREAD_ID,
          content: content.trim()
        }
      }
    });
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-5 text-rose-900">
        Could not load FollowBrief. Start Postgres, Redis, the API, and the worker, then refresh.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_390px]">
      <aside className="space-y-4">
        <section className="rounded-md border border-line bg-white p-4 shadow-panel">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Workspace</p>
          <h1 className="mt-2 text-lg font-semibold text-ink">{data?.workspace.name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Demo mode: deterministic Acme follow-up scenario with seeded customer context.
          </p>
        </section>

        <section className="rounded-md border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">Recent sources</h2>
            <span className="text-xs text-slate-500">{data?.sourceItems.length ?? 0}</span>
          </div>
          <div className="mt-3 space-y-3">
            {data?.sourceItems.slice(0, 5).map((item) => (
              <article key={item.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-line bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Recent runs</h2>
          <div className="mt-3 space-y-2">
            {data?.workspace.recentRuns.length ? (
              data.workspace.recentRuns.map((recentRun) => (
                <Link
                  key={recentRun.id}
                  href={`/runs/${recentRun.id}`}
                  className="block rounded border border-line p-3 hover:border-slate-400"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-ink">{recentRun.goal}</p>
                    <StatusPill status={recentRun.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(recentRun.createdAt)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded border border-dashed border-line p-3 text-sm text-slate-500">
                Your first run will appear here.
              </p>
            )}
          </div>
        </section>
      </aside>

      <section className="flex min-h-[calc(100vh-120px)] flex-col rounded-md border border-line bg-white shadow-panel">
        <div className="border-b border-line p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" aria-hidden />
            <h2 className="text-lg font-semibold text-ink">Assistant console</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Ask FollowBrief to turn customer notes into reviewed follow-up work.
          </p>
        </div>

        <div className="scrollbar-thin flex-1 space-y-4 overflow-auto p-4">
          {data?.assistantThread.messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "USER"
                  ? "ml-auto max-w-[78%] rounded-md bg-ink px-4 py-3 text-white"
                  : "mr-auto max-w-[82%] rounded-md border border-line bg-mist px-4 py-3 text-ink"
              }
            >
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
              <p className="mt-2 text-xs opacity-70">{formatDateTime(message.createdAt)}</p>
            </div>
          ))}
          {notice ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {notice}
            </div>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="border-t border-line p-4">
          <label className="sr-only" htmlFor="assistant-input">
            Assistant request
          </label>
          <textarea
            id="assistant-input"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-24 w-full resize-none rounded-md border border-line px-3 py-3 text-sm leading-6 outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
            placeholder={DEMO_PROMPT}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Demo mode is optimized for the Acme prompt; other prompts return guidance instead of
              silently running the demo flow.
            </p>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              Send
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-4">
        <ApprovalCallout run={run} />
        <section className="rounded-md border border-line bg-white p-4 shadow-panel">
          <Timeline run={run} />
          {run ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/runs/${run.id}`}
                className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm font-medium text-ink hover:border-slate-400"
              >
                View run
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={`/runs/${run.id}/inspect`}
                className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-sm font-medium text-ink hover:border-slate-400"
              >
                Inspect
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : null}
        </section>
        {run ? (
          <section className="rounded-md border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-ink">Run snapshot</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Sources</dt>
                <dd className="font-semibold text-ink">{run.sourceItems.length}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Tasks</dt>
                <dd className="font-semibold text-ink">{run.createdTasks.length}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Drafts</dt>
                <dd className="font-semibold text-ink">{run.emailDrafts.length}</dd>
              </div>
              <div>
                <dt className="text-slate-500">State</dt>
                <dd className="font-semibold text-ink">{readableStatus(run.status)}</dd>
              </div>
            </dl>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
