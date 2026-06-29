"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { ArrowRight, Loader2, RotateCcw, StopCircle } from "lucide-react";
import {
  CancelWorkflowRunDocument,
  RetryWorkflowStepDocument,
  WorkflowRunDetailDocument
} from "@/graphql/generated/graphql";
import { Timeline } from "@/components/timeline/Timeline";
import { StatusPill } from "@/components/layout/StatusPill";
import { formatDateTime } from "@/lib/format";

export function RunDetail() {
  const params = useParams<{ id: string }>();
  const runId = params.id;

  const { data, loading, error, refetch } = useQuery(WorkflowRunDetailDocument, {
    variables: { runId },
    pollInterval: 2500
  });
  const [retryStep, retryState] = useMutation(RetryWorkflowStepDocument, {
    onCompleted: () => void refetch()
  });
  const [cancelRun, cancelState] = useMutation(CancelWorkflowRunDocument, {
    onCompleted: () => void refetch()
  });

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" aria-hidden />
      </div>
    );
  }

  if (error || !data?.workflowRun) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-5 text-rose-900">
        Could not load this workflow run.
      </div>
    );
  }

  const run = data.workflowRun;
  const failedStep = run.steps.find((step) => step.status === "FAILED");
  const rejectedDraft = run.emailDrafts.find((draft) => draft.status === "REJECTED");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Workflow run</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">{run.goal}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={run.status} />
          <Link
            href={`/runs/${run.id}/inspect`}
            className="inline-flex items-center gap-2 rounded border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:border-slate-400"
          >
            Inspect
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-md border border-line bg-white p-4 shadow-panel">
          {run.status === "FAILED" ? (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
              This workflow hit a system issue. Open the inspector to review the failed step,
              inputs, outputs, and error details.
            </div>
          ) : null}
          {rejectedDraft ? (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              Email draft rejected. Follow-up tasks were still created.
            </div>
          ) : null}
          <Timeline run={run} />
        </section>

        <aside className="space-y-4">
          <section className="rounded-md border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-ink">Controls</h2>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                disabled={!failedStep || retryState.loading}
                onClick={() =>
                  failedStep
                    ? retryStep({ variables: { stepId: failedStep.id } })
                    : undefined
                }
                className="inline-flex items-center justify-center gap-2 rounded border border-line px-3 py-2 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Retry failed step
              </button>
              <button
                type="button"
                disabled={
                  cancelState.loading ||
                  ["SUCCEEDED", "FAILED", "CANCELLED"].includes(run.status)
                }
                onClick={() => cancelRun({ variables: { runId: run.id } })}
                className="inline-flex items-center justify-center gap-2 rounded border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <StopCircle className="h-4 w-4" aria-hidden />
                Cancel run
              </button>
            </div>
          </section>

          <section className="rounded-md border border-line bg-white p-4">
            <h2 className="text-sm font-semibold text-ink">Timing</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Created</dt>
                <dd className="text-right text-ink">{formatDateTime(run.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Started</dt>
                <dd className="text-right text-ink">{formatDateTime(run.startedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Completed</dt>
                <dd className="text-right text-ink">{formatDateTime(run.completedAt)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-md border border-line bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Source items</h2>
          <div className="mt-3 space-y-3">
            {run.sourceItems.length ? (
              run.sourceItems.map((source) => (
                <article key={source.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                  <p className="text-sm font-medium text-ink">{source.title}</p>
                  <p className="mt-1 line-clamp-4 text-xs leading-5 text-slate-500">{source.body}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No source items attached yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-line bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Created tasks</h2>
          <div className="mt-3 space-y-3">
            {run.createdTasks.length ? (
              run.createdTasks.map((task) => (
                <article key={task.id} className="rounded border border-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{task.title}</p>
                    <StatusPill status={task.status} />
                  </div>
                  {task.description ? (
                    <p className="mt-1 text-xs leading-5 text-slate-500">{task.description}</p>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No tasks created yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-line bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Email draft</h2>
          <div className="mt-3 space-y-3">
            {run.emailDrafts.length ? (
              run.emailDrafts.map((draft) => (
                <article key={draft.id} className="rounded border border-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{draft.subject}</p>
                    <StatusPill status={draft.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    To {draft.recipientName} &lt;{draft.recipientEmail}&gt;
                  </p>
                  <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                    {draft.body}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No draft created yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
