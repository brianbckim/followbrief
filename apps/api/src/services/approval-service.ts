import { prisma } from "../db/prisma";
import { enqueueWorkflowRun } from "../workers/queues";
import { recordWorkflowEvent } from "./workflow-service";

function approvalConflict(message: string) {
  const error = new Error(message);
  error.name = "ApprovalStateConflictError";
  return error;
}

export async function approveAction(approvalId: string, note?: string | null) {
  const approval = await prisma.approvalRequest.findUniqueOrThrow({
    where: { id: approvalId },
    include: { workflowStep: true, emailDraft: true }
  });

  if (approval.status === "APPROVED") {
    return approval;
  }
  if (approval.status === "REJECTED") {
    throw approvalConflict("This approval was already rejected and cannot be approved.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const claimed = await tx.approvalRequest.updateMany({
      where: { id: approvalId, status: "PENDING" },
      data: {
        status: "APPROVED",
        decisionNote: note,
        decidedAt: new Date()
      }
    });

    const nextApproval = await tx.approvalRequest.findUniqueOrThrow({
      where: { id: approvalId }
    });

    if (claimed.count === 0) {
      if (nextApproval.status === "APPROVED") {
        return { nextApproval, changed: false };
      }
      throw approvalConflict("This approval was already rejected and cannot be approved.");
    }

    if (approval.emailDraftId) {
      await tx.emailDraft.update({
        where: { id: approval.emailDraftId },
        data: { status: "APPROVED" }
      });
    }

    await tx.workflowStep.update({
      where: { id: approval.workflowStepId },
      data: {
        status: "SUCCEEDED",
        completedAt: new Date()
      }
    });

    await tx.workflowRun.update({
      where: { id: approval.workflowRunId },
      data: { status: "QUEUED" }
    });

    return { nextApproval, changed: true };
  });

  if (updated.changed) {
    await recordWorkflowEvent({
      workflowRunId: approval.workflowRunId,
      workflowStepId: approval.workflowStepId,
      approvalRequestId: approval.id,
      type: "APPROVAL_APPROVED",
      message: "Draft approved"
    });
    await recordWorkflowEvent({
      workflowRunId: approval.workflowRunId,
      workflowStepId: approval.workflowStepId,
      approvalRequestId: approval.id,
      type: "STEP_COMPLETED",
      message: "Email draft approved"
    });
    await enqueueWorkflowRun(approval.workflowRunId);
  }

  return updated.nextApproval;
}

export async function rejectAction(approvalId: string, reason: string) {
  const approval = await prisma.approvalRequest.findUniqueOrThrow({
    where: { id: approvalId },
    include: { emailDraft: true }
  });

  if (approval.status === "REJECTED") {
    return approval;
  }
  if (approval.status === "APPROVED") {
    throw approvalConflict("This approval was already approved and cannot be rejected.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const claimed = await tx.approvalRequest.updateMany({
      where: { id: approvalId, status: "PENDING" },
      data: {
        status: "REJECTED",
        decisionNote: reason,
        decidedAt: new Date()
      }
    });

    const nextApproval = await tx.approvalRequest.findUniqueOrThrow({
      where: { id: approvalId }
    });

    if (claimed.count === 0) {
      if (nextApproval.status === "REJECTED") {
        return { nextApproval, everyRunnableStepComplete: false, changed: false };
      }
      throw approvalConflict("This approval was already approved and cannot be rejected.");
    }

    if (approval.emailDraftId) {
      await tx.emailDraft.update({
        where: { id: approval.emailDraftId },
        data: { status: "REJECTED" }
      });
    }

    await tx.workflowStep.update({
      where: { id: approval.workflowStepId },
      data: {
        status: "SKIPPED",
        completedAt: new Date()
      }
    });

    const steps = await tx.workflowStep.findMany({
      where: { workflowRunId: approval.workflowRunId }
    });
    const everyRunnableStepComplete = steps.every((step) =>
      step.id === approval.workflowStepId
        ? true
        : step.status === "SUCCEEDED" || step.status === "SKIPPED"
    );

    if (everyRunnableStepComplete) {
      await tx.workflowRun.update({
        where: { id: approval.workflowRunId },
        data: {
          status: "SUCCEEDED",
          completedAt: new Date()
        }
      });
    } else {
      await tx.workflowRun.update({
        where: { id: approval.workflowRunId },
        data: {
          status: "QUEUED",
          completedAt: null
        }
      });
    }

    return { nextApproval, everyRunnableStepComplete, changed: true };
  });

  if (updated.changed) {
    await recordWorkflowEvent({
      workflowRunId: approval.workflowRunId,
      workflowStepId: approval.workflowStepId,
      approvalRequestId: approval.id,
      type: "APPROVAL_REJECTED",
      message: "Email draft rejected. Follow-up tasks were still created.",
      payloadJson: { reason }
    });

    if (updated.everyRunnableStepComplete) {
      await recordWorkflowEvent({
        workflowRunId: approval.workflowRunId,
        workflowStepId: approval.workflowStepId,
        approvalRequestId: approval.id,
        type: "RUN_SUCCEEDED",
        message: "Workflow completed without finalizing the rejected draft.",
        payloadJson: { reason }
      });
    } else {
      await enqueueWorkflowRun(approval.workflowRunId);
    }
  }

  return updated.nextApproval;
}

export async function editEmailDraft(input: {
  emailDraftId: string;
  subject: string;
  body: string;
}) {
  const draft = await prisma.emailDraft.findUniqueOrThrow({
    where: { id: input.emailDraftId }
  });

  if (draft.status !== "DRAFT") {
    throw new Error("Only draft emails can be edited before approval.");
  }

  return prisma.emailDraft.update({
    where: { id: input.emailDraftId },
    data: {
      subject: input.subject,
      body: input.body
    }
  });
}
