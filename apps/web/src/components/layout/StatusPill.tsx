import clsx from "clsx";
import { readableStatus } from "@/lib/format";

const colors: Record<string, string> = {
  SUCCEEDED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  RUNNING: "border-sky-200 bg-sky-50 text-sky-800",
  QUEUED: "border-blue-200 bg-blue-50 text-blue-800",
  WAITING_FOR_APPROVAL: "border-amber-200 bg-amber-50 text-amber-800",
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  FAILED: "border-rose-200 bg-rose-50 text-rose-800",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-800",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-700",
  SKIPPED: "border-slate-200 bg-slate-100 text-slate-700",
  DRAFT: "border-violet-200 bg-violet-50 text-violet-800",
  TODO: "border-slate-200 bg-white text-slate-700",
  DONE: "border-emerald-200 bg-emerald-50 text-emerald-800"
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded border px-2 py-1 text-xs font-medium",
        colors[status] ?? "border-slate-200 bg-white text-slate-700"
      )}
    >
      {readableStatus(status)}
    </span>
  );
}
