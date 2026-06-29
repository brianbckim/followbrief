import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { PrismaClient } from "@prisma/client";

const runDbTests = process.env.RUN_DB_TESTS === "1";

describe.skipIf(!runDbTests)("workflow integration", () => {
  let prisma: PrismaClient;
  let modules: {
    seedDemoData: () => Promise<void>;
    DEMO_THREAD_ID: string;
    createAssistantTurn: typeof import("../services/assistant-service").createAssistantTurn;
    executeWorkflowRun: typeof import("../workers/execute-workflow-worker").executeWorkflowRun;
    approveAction: typeof import("../services/approval-service").approveAction;
    rejectAction: typeof import("../services/approval-service").rejectAction;
    workflowQueue: typeof import("../workers/queues").workflowQueue;
    closePubSub: typeof import("../graphql/pubsub").closePubSub;
  };

  beforeAll(async () => {
    const prismaModule = await import("../db/prisma");
    const seedModule = await import("../../prisma/seed");
    const assistantModule = await import("../services/assistant-service");
    const workerModule = await import("../workers/execute-workflow-worker");
    const approvalModule = await import("../services/approval-service");
    const queueModule = await import("../workers/queues");
    const pubsubModule = await import("../graphql/pubsub");

    prisma = prismaModule.prisma;
    modules = {
      seedDemoData: seedModule.seedDemoData,
      DEMO_THREAD_ID: seedModule.DEMO_THREAD_ID,
      createAssistantTurn: assistantModule.createAssistantTurn,
      executeWorkflowRun: workerModule.executeWorkflowRun,
      approveAction: approvalModule.approveAction,
      rejectAction: approvalModule.rejectAction,
      workflowQueue: queueModule.workflowQueue,
      closePubSub: pubsubModule.closePubSub
    };
  });

  beforeEach(async () => {
    await prisma.toolInvocation.deleteMany();
    await prisma.workflowRunEvent.deleteMany();
    await prisma.approvalRequest.deleteMany();
    await prisma.emailDraft.deleteMany();
    await prisma.task.deleteMany();
    await prisma.workflowRunSourceItem.deleteMany();
    await prisma.workflowStep.deleteMany();
    await prisma.assistantMessage.deleteMany();
    await prisma.workflowRun.deleteMany();
    await prisma.sourceItem.deleteMany();
    await prisma.assistantThread.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
    await modules.seedDemoData();
  });

  afterAll(async () => {
    await modules.workflowQueue.close();
    modules.closePubSub();
    await prisma.$disconnect();
  });

  async function createRunWaitingForApproval() {
    const turn = await modules.createAssistantTurn({
      threadId: modules.DEMO_THREAD_ID,
      content:
        "Find last week's Acme meeting notes, draft a follow-up email to Sarah, and create next-step tasks for our team."
    });

    expect(turn.message.role).toBe("USER");
    expect(turn.assistantMessage.role).toBe("ASSISTANT");
    expect(turn.run.steps).toHaveLength(4);

    await modules.executeWorkflowRun(turn.run.id);

    const waitingRun = await prisma.workflowRun.findUniqueOrThrow({
      where: { id: turn.run.id },
      include: {
        steps: true,
        tasks: true,
        emailDrafts: true,
        approvals: true,
        events: true,
        toolInvocations: true
      }
    });

    expect(waitingRun.status).toBe("WAITING_FOR_APPROVAL");
    expect(waitingRun.tasks).toHaveLength(3);
    expect(waitingRun.emailDrafts).toHaveLength(1);
    expect(waitingRun.approvals).toHaveLength(1);
    expect(waitingRun.toolInvocations.length).toBeGreaterThanOrEqual(4);
    expect(
      waitingRun.steps.find((step) => step.toolName === "EMAIL_DRAFT")?.status
    ).toBe("WAITING_FOR_APPROVAL");
    expect(waitingRun.events.some((event) => event.type === "APPROVAL_REQUESTED")).toBe(true);

    return waitingRun;
  }

  it("creates and completes the Acme workflow after approval", async () => {
    const waitingRun = await createRunWaitingForApproval();

    const firstApproval = await modules.approveAction(waitingRun.approvals[0]!.id, "Looks good.");
    const secondApproval = await modules.approveAction(
      waitingRun.approvals[0]!.id,
      "Looks good again."
    );
    expect(firstApproval.status).toBe("APPROVED");
    expect(secondApproval.status).toBe("APPROVED");
    await expect(
      modules.rejectAction(waitingRun.approvals[0]!.id, "Trying to flip an approved decision.")
    ).rejects.toThrow(/already approved/);

    await modules.executeWorkflowRun(waitingRun.id);

    const completedRun = await prisma.workflowRun.findUniqueOrThrow({
      where: { id: waitingRun.id },
      include: { events: true, approvals: true, emailDrafts: true }
    });

    expect(completedRun.status).toBe("SUCCEEDED");
    expect(completedRun.approvals[0]?.status).toBe("APPROVED");
    expect(completedRun.emailDrafts[0]?.status).toBe("APPROVED");
    expect(completedRun.events.some((event) => event.type === "RUN_SUCCEEDED")).toBe(true);
  });

  it("treats draft rejection as a controlled user outcome, not a system failure", async () => {
    const waitingRun = await createRunWaitingForApproval();

    const firstRejection = await modules.rejectAction(
      waitingRun.approvals[0]!.id,
      "Sarah asked us not to send this version."
    );
    const secondRejection = await modules.rejectAction(
      waitingRun.approvals[0]!.id,
      "Sarah asked us not to send this version twice."
    );
    expect(firstRejection.status).toBe("REJECTED");
    expect(secondRejection.status).toBe("REJECTED");
    await expect(
      modules.approveAction(waitingRun.approvals[0]!.id, "Trying to flip a rejected decision.")
    ).rejects.toThrow(/already rejected/);

    const completedRun = await prisma.workflowRun.findUniqueOrThrow({
      where: { id: waitingRun.id },
      include: {
        steps: { orderBy: { index: "asc" } },
        tasks: true,
        approvals: true,
        emailDrafts: true,
        events: true
      }
    });

    expect(completedRun.status).toBe("SUCCEEDED");
    expect(completedRun.tasks).toHaveLength(3);
    expect(completedRun.approvals[0]?.status).toBe("REJECTED");
    expect(completedRun.emailDrafts[0]?.status).toBe("REJECTED");
    expect(completedRun.steps.at(-1)?.status).toBe("SKIPPED");
    expect(completedRun.events.some((event) => event.type === "APPROVAL_REJECTED")).toBe(true);
    expect(completedRun.events.some((event) => event.type === "RUN_FAILED")).toBe(false);
  });

  it("does not duplicate side effects when the same run is executed more than once", async () => {
    const turn = await modules.createAssistantTurn({
      threadId: modules.DEMO_THREAD_ID,
      content:
        "Find last week's Acme meeting notes, draft a follow-up email to Sarah, and create next-step tasks for our team."
    });

    await Promise.all([
      modules.executeWorkflowRun(turn.run.id),
      modules.executeWorkflowRun(turn.run.id)
    ]);
    await modules.executeWorkflowRun(turn.run.id);

    const waitingRun = await prisma.workflowRun.findUniqueOrThrow({
      where: { id: turn.run.id },
      include: {
        tasks: true,
        emailDrafts: true,
        approvals: true,
        toolInvocations: true
      }
    });

    expect(waitingRun.status).toBe("WAITING_FOR_APPROVAL");
    expect(waitingRun.tasks).toHaveLength(3);
    expect(waitingRun.emailDrafts).toHaveLength(1);
    expect(waitingRun.approvals).toHaveLength(1);
    expect(
      waitingRun.toolInvocations.filter((tool) => tool.toolName === "EMAIL_DRAFT")
    ).toHaveLength(1);
  });

  it("guides non-Acme mock prompts without creating follow-up side effects", async () => {
    const turn = await modules.createAssistantTurn({
      threadId: modules.DEMO_THREAD_ID,
      content: "Draft a renewal note for a different customer."
    });

    expect(turn.assistantMessage.content).toContain("Demo mode is optimized");
    expect(turn.run.steps).toHaveLength(1);
    expect(turn.run.steps[0]?.toolName).toBe("DOCUMENTS_SEARCH");

    await modules.executeWorkflowRun(turn.run.id);

    const completedRun = await prisma.workflowRun.findUniqueOrThrow({
      where: { id: turn.run.id },
      include: { tasks: true, emailDrafts: true, approvals: true }
    });

    expect(completedRun.status).toBe("SUCCEEDED");
    expect(completedRun.tasks).toHaveLength(0);
    expect(completedRun.emailDrafts).toHaveLength(0);
    expect(completedRun.approvals).toHaveLength(0);
  });
});
