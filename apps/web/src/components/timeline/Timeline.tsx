"use client";

import { CheckCircle2, Circle, Clock3, XCircle } from "lucide-react";
import clsx from "clsx";
import type { WorkflowRunTimelineFragment } from "@/graphql/generated/graphql";
import { eventLabel, formatDateTime, readableStatus } from "@/lib/format";
import { StatusPill } from "@/components/layout/StatusPill";

function iconFor(type: string) {
  if (type.includes("FAILED") || type.includes("REJECTED")) {
    return XCircle;
  }
  if (type.includes("COMPLETED") || type.includes("SUCCEEDED") || type.includes("APPROVED")) {
    return CheckCircle2;
  }
  if (type.includes("APPROVAL")) {
    return Clock3;
  }
  return Circle;
}

export function Timeline({ run }: { run?: WorkflowRunTimelineFragment | null }) {
  if (!run) {
    return (
      <div className="rounded-md border border-dashed border-line bg-white p-5 text-sm text-slate-500">
        No workflow yet. Send the Acme prompt to start the live timeline.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-ink">Current workflow</h2>
          <p className="mt-1 text-sm text-slate-600">{run.goal}</p>
        </div>
        <StatusPill status={run.status} />
      </div>

      <ol className="space-y-3">
        {run.events.length === 0 ? (
          <li className="rounded-md border border-line bg-white p-4 text-sm text-slate-500">
            Waiting for the first worker update.
          </li>
        ) : (
          run.events.map((event) => {
            const Icon = iconFor(event.type);
            return (
              <li key={event.id} className="flex gap-3 rounded-md border border-line bg-white p-3">
                <span
                  className={clsx(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    event.type.includes("FAILED") || event.type.includes("REJECTED")
                      ? "bg-rose-50 text-rose-700"
                      : event.type.includes("APPROVAL")
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">
                      {eventLabel(event.type, event.message)}
                    </p>
                    <time className="text-xs text-slate-500">
                      {formatDateTime(event.createdAt)}
                    </time>
                  </div>
                  {event.step?.title ? (
                    <p className="mt-1 text-xs text-slate-500">{event.step.title}</p>
                  ) : null}
                </div>
              </li>
            );
          })
        )}
      </ol>

      <div className="grid gap-2">
        {run.steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center justify-between gap-3 rounded-md border border-line bg-white px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{step.title}</p>
              <p className="text-xs text-slate-500">Attempt {step.attemptCount}</p>
            </div>
            <span className="text-xs text-slate-500">{readableStatus(step.status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
