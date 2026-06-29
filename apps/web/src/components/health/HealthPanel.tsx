"use client";

import { useQuery } from "@apollo/client";
import { Activity, Loader2, Timer, XCircle } from "lucide-react";
import { ProductHealthDocument } from "@/graphql/generated/graphql";
import { DEMO_WORKSPACE_ID } from "@/lib/demo";
import { percent } from "@/lib/format";

export function HealthPanel() {
  const { data, loading, error } = useQuery(ProductHealthDocument, {
    variables: { workspaceId: DEMO_WORKSPACE_ID },
    pollInterval: 5000
  });

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" aria-hidden />
      </div>
    );
  }

  if (error || !data?.productHealth) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-5 text-rose-900">
        Could not load product health.
      </div>
    );
  }

  const health = data.productHealth;
  const cards = [
    {
      label: "Runs in last 24 hours",
      value: String(health.runsLast24h),
      icon: Activity
    },
    {
      label: "Success rate",
      value: percent(health.successRateLast24h),
      icon: Activity
    },
    {
      label: "Steps needing attention",
      value: String(health.failedStepsLast24h),
      icon: XCircle
    },
    {
      label: "95th percentile step latency",
      value: health.p95StepLatencyMs == null ? "n/a" : `${health.p95StepLatencyMs} ms`,
      icon: Timer
    }
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Product health</h1>
        <p className="mt-1 text-sm text-slate-600">
          Simple workflow metrics calculated from persisted runs, steps, and tool invocations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.label} className="rounded-md border border-line bg-white p-5 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-slate-500">{card.label}</h2>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-ink">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-ink">{card.value}</p>
            </section>
          );
        })}
      </div>

      <section className="rounded-md border border-line bg-white p-5">
        <h2 className="text-base font-semibold text-ink">Most common issue</h2>
        <p className="mt-3 rounded-md border border-line bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700">
          {health.mostCommonFailure ?? "No failures in the last 24 hours."}
        </p>
      </section>
    </div>
  );
}
