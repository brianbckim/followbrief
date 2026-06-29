"use client";

import Link from "next/link";
import { ArrowRight, MailCheck } from "lucide-react";
import type { WorkflowRunTimelineFragment } from "@/graphql/generated/graphql";

export function ApprovalCallout({ run }: { run?: WorkflowRunTimelineFragment | null }) {
  const pending = run?.approvals.find((approval) => approval.status === "PENDING");

  if (!pending) {
    return null;
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-800">
          <MailCheck className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-amber-950">Waiting for your review</h3>
          <p className="mt-1 text-sm text-amber-900">
            {pending.emailDraft
              ? `Review the email to ${pending.emailDraft.recipientName} before finalizing it.`
              : pending.title}
          </p>
          <Link
            href="/approvals"
            className="mt-3 inline-flex items-center gap-2 rounded bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Open approval
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
