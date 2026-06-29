import { GraphQLDateTime, GraphQLJSON } from "graphql-scalars";
import { prisma } from "../../db/prisma";
import { createAssistantTurn } from "../../services/assistant-service";
import {
  approveAction,
  editEmailDraft,
  rejectAction
} from "../../services/approval-service";
import { findSourceItems } from "../../services/source-item-service";
import { productHealth } from "../../services/metrics-service";
import {
  cancelWorkflowRun,
  retryWorkflowStep
} from "../../services/workflow-service";
import { enqueueWorkflowRun } from "../../workers/queues";
import { terminalRunStatuses } from "../../workflows/workflow-state";
import { subscribeWorkflowEvents } from "../pubsub";

type FieldResolver = (
  parent: any,
  args: any,
  context: any,
  info: any
) => any;
type SubscriptionResolver = {
  subscribe: FieldResolver;
  resolve: FieldResolver;
};
type ResolverGroup = Record<string, FieldResolver>;
type ResolverMap = {
  DateTime: unknown;
  JSON: unknown;
  Query: ResolverGroup;
  Mutation: ResolverGroup;
  Subscription: Record<string, SubscriptionResolver>;
  Workspace: ResolverGroup;
  AssistantThread: ResolverGroup;
  WorkflowRun: ResolverGroup;
  WorkflowStep: ResolverGroup;
  EmailDraft: ResolverGroup;
  Task: ResolverGroup;
  ApprovalRequest: ResolverGroup;
  WorkflowRunEvent: ResolverGroup;
  ToolInvocation: ResolverGroup;
};

export const resolvers: ResolverMap = {
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
  Query: {
    viewer: () => prisma.user.findUniqueOrThrow({ where: { email: "demo@followbrief.local" } }),
    workspace: (_parent, args) => prisma.workspace.findUniqueOrThrow({ where: { id: args.id } }),
    assistantThread: (_parent, args) =>
      prisma.assistantThread.findUniqueOrThrow({ where: { id: args.id } }),
    workflowRun: (_parent, args) =>
      prisma.workflowRun.findUniqueOrThrow({ where: { id: args.id } }),
    pendingApprovals: (_parent, args) =>
      prisma.approvalRequest.findMany({
        where: { workflowRun: { workspaceId: args.workspaceId }, status: "PENDING" },
        orderBy: { createdAt: "desc" }
      }),
    sourceItems: (_parent, args) => findSourceItems(args),
    productHealth: (_parent, args) => productHealth(args.workspaceId)
  },
  Mutation: {
    sendAssistantMessage: (_parent, args) => createAssistantTurn(args.input),
    startWorkflowRun: async (_parent, args) => {
      const existingRun = await prisma.workflowRun.findUniqueOrThrow({
        where: { id: args.runId }
      });
      if (terminalRunStatuses.has(existingRun.status)) {
        return existingRun;
      }
      const run =
        existingRun.status === "WAITING_FOR_APPROVAL"
          ? existingRun
          : await prisma.workflowRun.update({
              where: { id: args.runId },
              data: { status: "QUEUED" }
            });
      await enqueueWorkflowRun(run.id);
      return run;
    },
    approveAction: (_parent, args) => approveAction(args.approvalId, args.note),
    rejectAction: (_parent, args) => rejectAction(args.approvalId, args.reason),
    editEmailDraft: (_parent, args) => editEmailDraft(args.input),
    retryWorkflowStep: (_parent, args) => retryWorkflowStep(args.stepId),
    cancelWorkflowRun: (_parent, args) => cancelWorkflowRun(args.runId)
  },
  Subscription: {
    workflowRunUpdated: {
      subscribe: (_parent, args) => subscribeWorkflowEvents(args.runId),
      resolve: (event) => event
    }
  },
  Workspace: {
    assistantThreads: (workspace) =>
      prisma.assistantThread.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { updatedAt: "desc" }
      }),
    recentRuns: (workspace) =>
      prisma.workflowRun.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 10
      })
  },
  AssistantThread: {
    messages: (thread) =>
      prisma.assistantMessage.findMany({
        where: { threadId: thread.id },
        orderBy: { createdAt: "asc" }
      }),
    latestRun: (thread) =>
      prisma.workflowRun.findFirst({
        where: { threadId: thread.id },
        orderBy: { createdAt: "desc" }
      })
  },
  WorkflowRun: {
    thread: (run) => prisma.assistantThread.findUniqueOrThrow({ where: { id: run.threadId } }),
    steps: (run) =>
      prisma.workflowStep.findMany({
        where: { workflowRunId: run.id },
        orderBy: { index: "asc" }
      }),
    sourceItems: async (run) => {
      const links = await prisma.workflowRunSourceItem.findMany({
        where: { workflowRunId: run.id },
        include: { sourceItem: true }
      });
      return links.map((link) => link.sourceItem);
    },
    emailDrafts: (run) =>
      prisma.emailDraft.findMany({
        where: { workflowRunId: run.id },
        orderBy: { createdAt: "asc" }
      }),
    createdTasks: (run) =>
      prisma.task.findMany({
        where: { workflowRunId: run.id },
        orderBy: { createdAt: "asc" }
      }),
    approvals: (run) =>
      prisma.approvalRequest.findMany({
        where: { workflowRunId: run.id },
        orderBy: { createdAt: "asc" }
      }),
    events: (run) =>
      prisma.workflowRunEvent.findMany({
        where: { workflowRunId: run.id },
        orderBy: { createdAt: "asc" }
      }),
    toolInvocations: (run) =>
      prisma.toolInvocation.findMany({
        where: { workflowRunId: run.id },
        orderBy: { createdAt: "asc" }
      })
  },
  WorkflowStep: {
    input: (step) => step.inputJson,
    output: (step) => step.outputJson,
    error: (step) => step.errorJson
  },
  EmailDraft: {
    sourceRun: (draft) =>
      prisma.workflowRun.findUniqueOrThrow({ where: { id: draft.workflowRunId } })
  },
  Task: {
    sourceRun: (task) =>
      prisma.workflowRun.findUniqueOrThrow({ where: { id: task.workflowRunId } })
  },
  ApprovalRequest: {
    preview: (approval) => approval.previewJson,
    step: (approval) =>
      prisma.workflowStep.findUniqueOrThrow({ where: { id: approval.workflowStepId } }),
    emailDraft: (approval) =>
      approval.emailDraftId
        ? prisma.emailDraft.findUnique({ where: { id: approval.emailDraftId } })
        : null
  },
  WorkflowRunEvent: {
    run: (event) =>
      prisma.workflowRun.findUniqueOrThrow({ where: { id: event.workflowRunId } }),
    step: (event) =>
      event.workflowStepId
        ? prisma.workflowStep.findUnique({ where: { id: event.workflowStepId } })
        : null,
    approval: (event) =>
      event.approvalRequestId
        ? prisma.approvalRequest.findUnique({ where: { id: event.approvalRequestId } })
        : null,
    payload: (event) => event.payloadJson
  },
  ToolInvocation: {
    input: (invocation) => invocation.inputJson,
    output: (invocation) => invocation.outputJson,
    error: (invocation) => invocation.errorJson,
    step: (invocation) =>
      prisma.workflowStep.findUniqueOrThrow({ where: { id: invocation.workflowStepId } })
  }
};
