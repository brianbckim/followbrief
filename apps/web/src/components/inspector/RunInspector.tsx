"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { WorkflowRunInspectDocument } from "@/graphql/generated/graphql";
import { StatusPill } from "@/components/layout/StatusPill";
import { JsonBlock } from "./JsonBlock";
import { formatDateTime } from "@/lib/format";

export function RunInspector() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useQuery(WorkflowRunInspectDocument, {
    variables: { runId: params.id },
    pollInterval: 2500
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
        Could not load the inspector.
      </div>
    );
  }

  const run = data.workflowRun;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/runs/${run.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to run
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-ink">Workflow inspector</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">{run.goal}</p>
        </div>
        <StatusPill status={run.status} />
      </div>

      <section className="rounded-md border border-line bg-white p-4 shadow-panel">
        <h2 className="text-base font-semibold text-ink">Tool invocations</h2>
        <div className="mt-4 space-y-4">
          {run.toolInvocations.length ? (
            run.toolInvocations.map((invocation) => (
              <article key={invocation.id} className="rounded-md border border-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      {invocation.step.index + 1}. {invocation.step.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {invocation.toolName} by {invocation.provider}
                      {invocation.model ? ` / ${invocation.model}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{invocation.latencyMs ?? 0} ms</span>
                    <span>Attempt {invocation.attemptCount}</span>
                    <StatusPill status={invocation.step.status} />
                  </div>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Input
                    </p>
                    <JsonBlock value={invocation.input} />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Output
                    </p>
                    <JsonBlock value={invocation.output ?? invocation.error} />
                  </div>
                </div>
                <dl className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                  <div>
                    <dt className="font-medium text-slate-700">Prompt</dt>
                    <dd>{invocation.promptVersion ?? "n/a"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">Created</dt>
                    <dd>{formatDateTime(invocation.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">Completed</dt>
                    <dd>{formatDateTime(invocation.completedAt)}</dd>
                  </div>
                </dl>
                {invocation.rawResponsePreview ? (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Raw response preview
                    </p>
                    <pre className="max-h-48 overflow-auto rounded-md border border-line bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                      {invocation.rawResponsePreview}
                    </pre>
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-line p-4 text-sm text-slate-500">
              No tool invocation logs have been recorded yet.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-4">
        <h2 className="text-base font-semibold text-ink">Persisted events</h2>
        <div className="mt-4 overflow-hidden rounded-md border border-line">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Message</th>
                <th className="px-3 py-2">Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {run.events.map((event) => (
                <tr key={event.id}>
                  <td className="px-3 py-2 text-slate-500">{formatDateTime(event.createdAt)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">{event.type}</td>
                  <td className="px-3 py-2 text-ink">{event.message}</td>
                  <td className="px-3 py-2 text-slate-500">{event.step?.title ?? "Run"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
