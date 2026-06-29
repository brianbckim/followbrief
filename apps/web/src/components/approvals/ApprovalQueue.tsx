"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Check, Loader2, Save, X } from "lucide-react";
import {
  ApprovalQueueDocument,
  ApproveActionDocument,
  EditEmailDraftDocument,
  RejectActionDocument
} from "@/graphql/generated/graphql";
import { DEMO_WORKSPACE_ID } from "@/lib/demo";
import { formatDateTime } from "@/lib/format";
import { StatusPill } from "@/components/layout/StatusPill";

function previewValue(preview: unknown, key: string) {
  if (!preview || typeof preview !== "object" || !(key in preview)) {
    return "";
  }
  const value = (preview as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export function ApprovalQueue() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(ApprovalQueueDocument, {
    variables: { workspaceId: DEMO_WORKSPACE_ID }
  });

  const [approve, approveState] = useMutation(ApproveActionDocument, {
    onCompleted: () => {
      setNotice("Draft approved. The workflow will resume.");
      void refetch();
    }
  });
  const [reject, rejectState] = useMutation(RejectActionDocument, {
    onCompleted: () => {
      setNotice("Email draft rejected. Follow-up tasks were still created.");
      setReason("");
      void refetch();
    }
  });
  const [editDraft, editState] = useMutation(EditEmailDraftDocument, {
    onCompleted: () => {
      setNotice("Draft saved.");
      setEditingId(null);
      void refetch();
    }
  });

  function startEditing(draft: { id: string; subject: string; body: string }) {
    setEditingId(draft.id);
    setSubject(draft.subject);
    setBody(draft.body);
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>, draftId: string) {
    event.preventDefault();
    await editDraft({
      variables: {
        input: {
          emailDraftId: draftId,
          subject,
          body
        }
      }
    });
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-5 text-rose-900">
        Could not load approvals. Check that the GraphQL API is running.
      </div>
    );
  }

  const approvals = data?.pendingApprovals ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Approval queue</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review customer-facing drafts before FollowBrief completes the workflow.
          </p>
        </div>
        <StatusPill status={approvals.length ? "PENDING" : "DONE"} />
      </div>

      {notice ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {notice}
        </div>
      ) : null}

      {approvals.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-white p-8 text-center">
          <h2 className="text-base font-semibold text-ink">No drafts waiting right now</h2>
          <p className="mt-2 text-sm text-slate-500">
            Run the Acme assistant flow and the email review will appear here.
          </p>
        </div>
      ) : (
        approvals.map((approval) => {
          const draft = approval.emailDraft;
          const why =
            previewValue(approval.preview, "whyReviewIsRequired") ||
            "Customer-facing email drafts require your review.";

          return (
            <article key={approval.id} className="rounded-md border border-line bg-white p-5 shadow-panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{approval.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Created {formatDateTime(approval.createdAt)}
                  </p>
                </div>
                <StatusPill status={approval.status} />
              </div>

              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                {why}
              </div>

              {draft ? (
                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div>
                    {editingId === draft.id ? (
                      <form onSubmit={(event) => submitEdit(event, draft.id)} className="space-y-3">
                        <label className="block text-sm font-medium text-ink">
                          Subject
                          <input
                            value={subject}
                            onChange={(event) => setSubject(event.target.value)}
                            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                          />
                        </label>
                        <label className="block text-sm font-medium text-ink">
                          Body
                          <textarea
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            className="mt-1 min-h-80 w-full rounded-md border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                          />
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={editState.loading}
                            className="inline-flex items-center gap-2 rounded bg-ink px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                          >
                            {editState.loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            ) : (
                              <Save className="h-4 w-4" aria-hidden />
                            )}
                            Save draft
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded border border-line px-3 py-2 text-sm font-medium text-ink"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="rounded-md border border-line">
                        <div className="border-b border-line px-4 py-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            To {draft.recipientName} &lt;{draft.recipientEmail}&gt;
                          </p>
                          <h3 className="mt-2 text-base font-semibold text-ink">{draft.subject}</h3>
                        </div>
                        <pre className="whitespace-pre-wrap px-4 py-4 font-sans text-sm leading-6 text-slate-700">
                          {draft.body}
                        </pre>
                      </div>
                    )}
                  </div>

                  <aside className="space-y-4">
                    <section className="rounded-md border border-line p-4">
                      <h3 className="text-sm font-semibold text-ink">Source context</h3>
                      <div className="mt-3 space-y-3">
                        {draft.sourceRun.sourceItems.map((source) => (
                          <div key={source.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                            <p className="text-sm font-medium text-ink">{source.title}</p>
                            <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">
                              {source.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-md border border-line p-4">
                      <h3 className="text-sm font-semibold text-ink">Decision</h3>
                      <div className="mt-3 space-y-2">
                        <button
                          type="button"
                          onClick={() => startEditing(draft)}
                          className="w-full rounded border border-line px-3 py-2 text-sm font-medium text-ink hover:border-slate-400"
                        >
                          Edit draft
                        </button>
                        <button
                          type="button"
                          disabled={approveState.loading}
                          onClick={() =>
                            approve({
                              variables: { approvalId: approval.id, note: "Looks good." }
                            })
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded bg-forest px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                          <Check className="h-4 w-4" aria-hidden />
                          Approve
                        </button>
                        <textarea
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          placeholder="Reason for rejecting"
                          className="min-h-20 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
                        />
                        <button
                          type="button"
                          disabled={rejectState.loading || !reason.trim()}
                          onClick={() =>
                            reject({
                              variables: {
                                approvalId: approval.id,
                                reason: reason.trim()
                              }
                            })
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded bg-coral px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                          <X className="h-4 w-4" aria-hidden />
                          Reject
                        </button>
                      </div>
                    </section>
                  </aside>
                </div>
              ) : null}
            </article>
          );
        })
      )}
    </div>
  );
}
