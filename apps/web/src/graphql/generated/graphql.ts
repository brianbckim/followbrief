import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  JSON: { input: unknown; output: unknown; }
};

export type ApprovalRequest = {
  __typename?: 'ApprovalRequest';
  createdAt: Scalars['DateTime']['output'];
  decidedAt?: Maybe<Scalars['DateTime']['output']>;
  decisionNote?: Maybe<Scalars['String']['output']>;
  emailDraft?: Maybe<EmailDraft>;
  id: Scalars['ID']['output'];
  preview: Scalars['JSON']['output'];
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  step: WorkflowStep;
  title: Scalars['String']['output'];
};

export enum ApprovalStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type AssistantMessage = {
  __typename?: 'AssistantMessage';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  role: MessageRole;
};

export type AssistantThread = {
  __typename?: 'AssistantThread';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  latestRun?: Maybe<WorkflowRun>;
  messages: Array<AssistantMessage>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AssistantTurnPayload = {
  __typename?: 'AssistantTurnPayload';
  assistantMessage: AssistantMessage;
  message: AssistantMessage;
  run: WorkflowRun;
};

export type EditEmailDraftInput = {
  body: Scalars['String']['input'];
  emailDraftId: Scalars['ID']['input'];
  subject: Scalars['String']['input'];
};

export type EmailDraft = {
  __typename?: 'EmailDraft';
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  recipientEmail: Scalars['String']['output'];
  recipientName: Scalars['String']['output'];
  sourceRun: WorkflowRun;
  status: EmailDraftStatus;
  subject: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum EmailDraftStatus {
  Approved = 'APPROVED',
  Draft = 'DRAFT',
  Rejected = 'REJECTED'
}

export enum MessageRole {
  Assistant = 'ASSISTANT',
  System = 'SYSTEM',
  User = 'USER'
}

export type Mutation = {
  __typename?: 'Mutation';
  approveAction: ApprovalRequest;
  cancelWorkflowRun: WorkflowRun;
  editEmailDraft: EmailDraft;
  rejectAction: ApprovalRequest;
  retryWorkflowStep: WorkflowStep;
  sendAssistantMessage: AssistantTurnPayload;
  startWorkflowRun: WorkflowRun;
};


export type MutationApproveActionArgs = {
  approvalId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelWorkflowRunArgs = {
  runId: Scalars['ID']['input'];
};


export type MutationEditEmailDraftArgs = {
  input: EditEmailDraftInput;
};


export type MutationRejectActionArgs = {
  approvalId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRetryWorkflowStepArgs = {
  stepId: Scalars['ID']['input'];
};


export type MutationSendAssistantMessageArgs = {
  input: SendAssistantMessageInput;
};


export type MutationStartWorkflowRunArgs = {
  runId: Scalars['ID']['input'];
};

export type ProductHealth = {
  __typename?: 'ProductHealth';
  failedStepsLast24h: Scalars['Int']['output'];
  mostCommonFailure?: Maybe<Scalars['String']['output']>;
  p95StepLatencyMs?: Maybe<Scalars['Int']['output']>;
  runsLast24h: Scalars['Int']['output'];
  successRateLast24h: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  assistantThread: AssistantThread;
  pendingApprovals: Array<ApprovalRequest>;
  productHealth: ProductHealth;
  sourceItems: Array<SourceItem>;
  viewer: User;
  workflowRun: WorkflowRun;
  workspace: Workspace;
};


export type QueryAssistantThreadArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPendingApprovalsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryProductHealthArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QuerySourceItemsArgs = {
  query?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['ID']['input'];
};


export type QueryWorkflowRunArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkspaceArgs = {
  id: Scalars['ID']['input'];
};

export enum RiskLevel {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export type SendAssistantMessageInput = {
  content: Scalars['String']['input'];
  threadId: Scalars['ID']['input'];
};

export type SourceItem = {
  __typename?: 'SourceItem';
  body: Scalars['String']['output'];
  companyName?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  kind: SourceItemKind;
  title: Scalars['String']['output'];
};

export enum SourceItemKind {
  CrmNote = 'CRM_NOTE',
  EmailSnippet = 'EMAIL_SNIPPET',
  MeetingNote = 'MEETING_NOTE'
}

export type Subscription = {
  __typename?: 'Subscription';
  workflowRunUpdated: WorkflowRunEvent;
};


export type SubscriptionWorkflowRunUpdatedArgs = {
  runId: Scalars['ID']['input'];
};

export type Task = {
  __typename?: 'Task';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  sourceRun: WorkflowRun;
  status: TaskStatus;
  title: Scalars['String']['output'];
};

export enum TaskStatus {
  Done = 'DONE',
  Todo = 'TODO'
}

export type ToolInvocation = {
  __typename?: 'ToolInvocation';
  attemptCount: Scalars['Int']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  error?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  input: Scalars['JSON']['output'];
  latencyMs?: Maybe<Scalars['Int']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  output?: Maybe<Scalars['JSON']['output']>;
  promptVersion?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  rawResponsePreview?: Maybe<Scalars['String']['output']>;
  step: WorkflowStep;
  toolName: ToolName;
};

export enum ToolName {
  DocumentsSearch = 'DOCUMENTS_SEARCH',
  DocumentsSummarize = 'DOCUMENTS_SUMMARIZE',
  EmailDraft = 'EMAIL_DRAFT',
  TasksCreate = 'TASKS_CREATE'
}

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type WorkflowRun = {
  __typename?: 'WorkflowRun';
  approvals: Array<ApprovalRequest>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdTasks: Array<Task>;
  emailDrafts: Array<EmailDraft>;
  events: Array<WorkflowRunEvent>;
  goal: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  sourceItems: Array<SourceItem>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: WorkflowRunStatus;
  steps: Array<WorkflowStep>;
  thread: AssistantThread;
  toolInvocations: Array<ToolInvocation>;
};

export type WorkflowRunEvent = {
  __typename?: 'WorkflowRunEvent';
  approval?: Maybe<ApprovalRequest>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  payload?: Maybe<Scalars['JSON']['output']>;
  run: WorkflowRun;
  step?: Maybe<WorkflowStep>;
  type: WorkflowRunEventType;
};

export enum WorkflowRunEventType {
  ApprovalApproved = 'APPROVAL_APPROVED',
  ApprovalRejected = 'APPROVAL_REJECTED',
  ApprovalRequested = 'APPROVAL_REQUESTED',
  RunFailed = 'RUN_FAILED',
  RunQueued = 'RUN_QUEUED',
  RunStarted = 'RUN_STARTED',
  RunSucceeded = 'RUN_SUCCEEDED',
  StepCompleted = 'STEP_COMPLETED',
  StepFailed = 'STEP_FAILED',
  StepStarted = 'STEP_STARTED'
}

export enum WorkflowRunStatus {
  Cancelled = 'CANCELLED',
  Draft = 'DRAFT',
  Failed = 'FAILED',
  Queued = 'QUEUED',
  Running = 'RUNNING',
  Succeeded = 'SUCCEEDED',
  WaitingForApproval = 'WAITING_FOR_APPROVAL'
}

export type WorkflowStep = {
  __typename?: 'WorkflowStep';
  attemptCount: Scalars['Int']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  error?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  index: Scalars['Int']['output'];
  input?: Maybe<Scalars['JSON']['output']>;
  output?: Maybe<Scalars['JSON']['output']>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: WorkflowStepStatus;
  title: Scalars['String']['output'];
  toolName: ToolName;
};

export enum WorkflowStepStatus {
  Failed = 'FAILED',
  Pending = 'PENDING',
  Running = 'RUNNING',
  Skipped = 'SKIPPED',
  Succeeded = 'SUCCEEDED',
  WaitingForApproval = 'WAITING_FOR_APPROVAL'
}

export type Workspace = {
  __typename?: 'Workspace';
  assistantThreads: Array<AssistantThread>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  recentRuns: Array<WorkflowRun>;
};

export type WorkflowRunTimelineFragment = { __typename?: 'WorkflowRun', id: string, goal: string, status: WorkflowRunStatus, createdAt: string, startedAt?: string | null, completedAt?: string | null, steps: Array<{ __typename?: 'WorkflowStep', id: string, index: number, title: string, toolName: ToolName, status: WorkflowStepStatus, input?: unknown | null, output?: unknown | null, error?: unknown | null, attemptCount: number, startedAt?: string | null, completedAt?: string | null }>, events: Array<{ __typename?: 'WorkflowRunEvent', id: string, type: WorkflowRunEventType, message: string, payload?: unknown | null, createdAt: string, step?: { __typename?: 'WorkflowStep', id: string, title: string } | null }>, sourceItems: Array<{ __typename?: 'SourceItem', id: string, kind: SourceItemKind, title: string, body: string, contactName?: string | null, contactEmail?: string | null, companyName?: string | null, createdAt: string }>, createdTasks: Array<{ __typename?: 'Task', id: string, title: string, description?: string | null, status: TaskStatus, dueDate?: string | null, createdAt: string }>, emailDrafts: Array<{ __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus, createdAt: string, updatedAt: string }>, approvals: Array<{ __typename?: 'ApprovalRequest', id: string, status: ApprovalStatus, riskLevel: RiskLevel, title: string, preview: unknown, decisionNote?: string | null, createdAt: string, decidedAt?: string | null, emailDraft?: { __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus } | null }> };

export type ApprovalQueueQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type ApprovalQueueQuery = { __typename?: 'Query', pendingApprovals: Array<{ __typename?: 'ApprovalRequest', id: string, title: string, status: ApprovalStatus, riskLevel: RiskLevel, preview: unknown, decisionNote?: string | null, createdAt: string, decidedAt?: string | null, step: { __typename?: 'WorkflowStep', id: string, title: string, status: WorkflowStepStatus }, emailDraft?: { __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus, sourceRun: { __typename?: 'WorkflowRun', id: string, goal: string, sourceItems: Array<{ __typename?: 'SourceItem', id: string, title: string, body: string, companyName?: string | null }> } } | null }> };

export type ApproveActionMutationVariables = Exact<{
  approvalId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type ApproveActionMutation = { __typename?: 'Mutation', approveAction: { __typename?: 'ApprovalRequest', id: string, status: ApprovalStatus, decisionNote?: string | null, decidedAt?: string | null } };

export type RejectActionMutationVariables = Exact<{
  approvalId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type RejectActionMutation = { __typename?: 'Mutation', rejectAction: { __typename?: 'ApprovalRequest', id: string, status: ApprovalStatus, decisionNote?: string | null, decidedAt?: string | null } };

export type EditEmailDraftMutationVariables = Exact<{
  input: EditEmailDraftInput;
}>;


export type EditEmailDraftMutation = { __typename?: 'Mutation', editEmailDraft: { __typename?: 'EmailDraft', id: string, subject: string, body: string, status: EmailDraftStatus, updatedAt: string } };

export type AssistantConsoleDataQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  threadId: Scalars['ID']['input'];
}>;


export type AssistantConsoleDataQuery = { __typename?: 'Query', viewer: { __typename?: 'User', id: string, name: string, email: string }, workspace: { __typename?: 'Workspace', id: string, name: string, recentRuns: Array<{ __typename?: 'WorkflowRun', id: string, goal: string, status: WorkflowRunStatus, createdAt: string }> }, assistantThread: { __typename?: 'AssistantThread', id: string, title: string, messages: Array<{ __typename?: 'AssistantMessage', id: string, role: MessageRole, content: string, createdAt: string }>, latestRun?: { __typename?: 'WorkflowRun', id: string, goal: string, status: WorkflowRunStatus, createdAt: string, startedAt?: string | null, completedAt?: string | null, steps: Array<{ __typename?: 'WorkflowStep', id: string, index: number, title: string, toolName: ToolName, status: WorkflowStepStatus, input?: unknown | null, output?: unknown | null, error?: unknown | null, attemptCount: number, startedAt?: string | null, completedAt?: string | null }>, events: Array<{ __typename?: 'WorkflowRunEvent', id: string, type: WorkflowRunEventType, message: string, payload?: unknown | null, createdAt: string, step?: { __typename?: 'WorkflowStep', id: string, title: string } | null }>, sourceItems: Array<{ __typename?: 'SourceItem', id: string, kind: SourceItemKind, title: string, body: string, contactName?: string | null, contactEmail?: string | null, companyName?: string | null, createdAt: string }>, createdTasks: Array<{ __typename?: 'Task', id: string, title: string, description?: string | null, status: TaskStatus, dueDate?: string | null, createdAt: string }>, emailDrafts: Array<{ __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus, createdAt: string, updatedAt: string }>, approvals: Array<{ __typename?: 'ApprovalRequest', id: string, status: ApprovalStatus, riskLevel: RiskLevel, title: string, preview: unknown, decisionNote?: string | null, createdAt: string, decidedAt?: string | null, emailDraft?: { __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus } | null }> } | null }, sourceItems: Array<{ __typename?: 'SourceItem', id: string, kind: SourceItemKind, title: string, body: string, contactName?: string | null, contactEmail?: string | null, companyName?: string | null, createdAt: string }>, pendingApprovals: Array<{ __typename?: 'ApprovalRequest', id: string, title: string, status: ApprovalStatus, riskLevel: RiskLevel, emailDraft?: { __typename?: 'EmailDraft', id: string, recipientName: string, subject: string } | null }> };

export type SendAssistantMessageMutationVariables = Exact<{
  input: SendAssistantMessageInput;
}>;


export type SendAssistantMessageMutation = { __typename?: 'Mutation', sendAssistantMessage: { __typename?: 'AssistantTurnPayload', message: { __typename?: 'AssistantMessage', id: string, role: MessageRole, content: string, createdAt: string }, assistantMessage: { __typename?: 'AssistantMessage', id: string, role: MessageRole, content: string, createdAt: string }, run: { __typename?: 'WorkflowRun', id: string, goal: string, status: WorkflowRunStatus, createdAt: string, startedAt?: string | null, completedAt?: string | null, steps: Array<{ __typename?: 'WorkflowStep', id: string, index: number, title: string, toolName: ToolName, status: WorkflowStepStatus, input?: unknown | null, output?: unknown | null, error?: unknown | null, attemptCount: number, startedAt?: string | null, completedAt?: string | null }>, events: Array<{ __typename?: 'WorkflowRunEvent', id: string, type: WorkflowRunEventType, message: string, payload?: unknown | null, createdAt: string, step?: { __typename?: 'WorkflowStep', id: string, title: string } | null }>, sourceItems: Array<{ __typename?: 'SourceItem', id: string, kind: SourceItemKind, title: string, body: string, contactName?: string | null, contactEmail?: string | null, companyName?: string | null, createdAt: string }>, createdTasks: Array<{ __typename?: 'Task', id: string, title: string, description?: string | null, status: TaskStatus, dueDate?: string | null, createdAt: string }>, emailDrafts: Array<{ __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus, createdAt: string, updatedAt: string }>, approvals: Array<{ __typename?: 'ApprovalRequest', id: string, status: ApprovalStatus, riskLevel: RiskLevel, title: string, preview: unknown, decisionNote?: string | null, createdAt: string, decidedAt?: string | null, emailDraft?: { __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus } | null }> } } };

export type WorkflowRunUpdatedSubscriptionVariables = Exact<{
  runId: Scalars['ID']['input'];
}>;


export type WorkflowRunUpdatedSubscription = { __typename?: 'Subscription', workflowRunUpdated: { __typename?: 'WorkflowRunEvent', id: string, type: WorkflowRunEventType, message: string, payload?: unknown | null, createdAt: string, step?: { __typename?: 'WorkflowStep', id: string, title: string } | null } };

export type ProductHealthQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type ProductHealthQuery = { __typename?: 'Query', productHealth: { __typename?: 'ProductHealth', runsLast24h: number, successRateLast24h: number, failedStepsLast24h: number, p95StepLatencyMs?: number | null, mostCommonFailure?: string | null } };

export type WorkflowRunDetailQueryVariables = Exact<{
  runId: Scalars['ID']['input'];
}>;


export type WorkflowRunDetailQuery = { __typename?: 'Query', workflowRun: { __typename?: 'WorkflowRun', id: string, goal: string, status: WorkflowRunStatus, createdAt: string, startedAt?: string | null, completedAt?: string | null, steps: Array<{ __typename?: 'WorkflowStep', id: string, index: number, title: string, toolName: ToolName, status: WorkflowStepStatus, input?: unknown | null, output?: unknown | null, error?: unknown | null, attemptCount: number, startedAt?: string | null, completedAt?: string | null }>, events: Array<{ __typename?: 'WorkflowRunEvent', id: string, type: WorkflowRunEventType, message: string, payload?: unknown | null, createdAt: string, step?: { __typename?: 'WorkflowStep', id: string, title: string } | null }>, sourceItems: Array<{ __typename?: 'SourceItem', id: string, kind: SourceItemKind, title: string, body: string, contactName?: string | null, contactEmail?: string | null, companyName?: string | null, createdAt: string }>, createdTasks: Array<{ __typename?: 'Task', id: string, title: string, description?: string | null, status: TaskStatus, dueDate?: string | null, createdAt: string }>, emailDrafts: Array<{ __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus, createdAt: string, updatedAt: string }>, approvals: Array<{ __typename?: 'ApprovalRequest', id: string, status: ApprovalStatus, riskLevel: RiskLevel, title: string, preview: unknown, decisionNote?: string | null, createdAt: string, decidedAt?: string | null, emailDraft?: { __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus } | null }> } };

export type WorkflowRunInspectQueryVariables = Exact<{
  runId: Scalars['ID']['input'];
}>;


export type WorkflowRunInspectQuery = { __typename?: 'Query', workflowRun: { __typename?: 'WorkflowRun', id: string, goal: string, status: WorkflowRunStatus, createdAt: string, startedAt?: string | null, completedAt?: string | null, toolInvocations: Array<{ __typename?: 'ToolInvocation', id: string, toolName: ToolName, provider: string, model?: string | null, promptVersion?: string | null, input: unknown, output?: unknown | null, rawResponsePreview?: string | null, error?: unknown | null, latencyMs?: number | null, attemptCount: number, createdAt: string, completedAt?: string | null, step: { __typename?: 'WorkflowStep', id: string, index: number, title: string, status: WorkflowStepStatus } }>, steps: Array<{ __typename?: 'WorkflowStep', id: string, index: number, title: string, toolName: ToolName, status: WorkflowStepStatus, input?: unknown | null, output?: unknown | null, error?: unknown | null, attemptCount: number, startedAt?: string | null, completedAt?: string | null }>, events: Array<{ __typename?: 'WorkflowRunEvent', id: string, type: WorkflowRunEventType, message: string, payload?: unknown | null, createdAt: string, step?: { __typename?: 'WorkflowStep', id: string, title: string } | null }>, sourceItems: Array<{ __typename?: 'SourceItem', id: string, kind: SourceItemKind, title: string, body: string, contactName?: string | null, contactEmail?: string | null, companyName?: string | null, createdAt: string }>, createdTasks: Array<{ __typename?: 'Task', id: string, title: string, description?: string | null, status: TaskStatus, dueDate?: string | null, createdAt: string }>, emailDrafts: Array<{ __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus, createdAt: string, updatedAt: string }>, approvals: Array<{ __typename?: 'ApprovalRequest', id: string, status: ApprovalStatus, riskLevel: RiskLevel, title: string, preview: unknown, decisionNote?: string | null, createdAt: string, decidedAt?: string | null, emailDraft?: { __typename?: 'EmailDraft', id: string, recipientName: string, recipientEmail: string, subject: string, body: string, status: EmailDraftStatus } | null }> } };

export type RetryWorkflowStepMutationVariables = Exact<{
  stepId: Scalars['ID']['input'];
}>;


export type RetryWorkflowStepMutation = { __typename?: 'Mutation', retryWorkflowStep: { __typename?: 'WorkflowStep', id: string, status: WorkflowStepStatus, attemptCount: number } };

export type CancelWorkflowRunMutationVariables = Exact<{
  runId: Scalars['ID']['input'];
}>;


export type CancelWorkflowRunMutation = { __typename?: 'Mutation', cancelWorkflowRun: { __typename?: 'WorkflowRun', id: string, status: WorkflowRunStatus, completedAt?: string | null } };

export const WorkflowRunTimelineFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowRunTimeline"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowRun"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"goal"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"toolName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"output"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"step"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"emailDrafts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approvals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"riskLevel"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"preview"}},{"kind":"Field","name":{"kind":"Name","value":"decisionNote"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"emailDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<WorkflowRunTimelineFragment, unknown>;
export const ApprovalQueueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ApprovalQueue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pendingApprovals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"riskLevel"}},{"kind":"Field","name":{"kind":"Name","value":"preview"}},{"kind":"Field","name":{"kind":"Name","value":"decisionNote"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"step"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"emailDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"sourceRun"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"goal"}},{"kind":"Field","name":{"kind":"Name","value":"sourceItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ApprovalQueueQuery, ApprovalQueueQueryVariables>;
export const ApproveActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"approvalId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveAction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"approvalId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"approvalId"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"decisionNote"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}}]}}]}}]} as unknown as DocumentNode<ApproveActionMutation, ApproveActionMutationVariables>;
export const RejectActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"approvalId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectAction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"approvalId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"approvalId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"decisionNote"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}}]}}]}}]} as unknown as DocumentNode<RejectActionMutation, RejectActionMutationVariables>;
export const EditEmailDraftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditEmailDraft"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EditEmailDraftInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"editEmailDraft"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<EditEmailDraftMutation, EditEmailDraftMutationVariables>;
export const AssistantConsoleDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AssistantConsoleData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"recentRuns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"goal"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"assistantThread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"latestRun"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowRunTimeline"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pendingApprovals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"riskLevel"}},{"kind":"Field","name":{"kind":"Name","value":"emailDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowRunTimeline"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowRun"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"goal"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"toolName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"output"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"step"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"emailDrafts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approvals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"riskLevel"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"preview"}},{"kind":"Field","name":{"kind":"Name","value":"decisionNote"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"emailDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<AssistantConsoleDataQuery, AssistantConsoleDataQueryVariables>;
export const SendAssistantMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendAssistantMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SendAssistantMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendAssistantMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assistantMessage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"run"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowRunTimeline"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowRunTimeline"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowRun"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"goal"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"toolName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"output"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"step"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"emailDrafts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approvals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"riskLevel"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"preview"}},{"kind":"Field","name":{"kind":"Name","value":"decisionNote"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"emailDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<SendAssistantMessageMutation, SendAssistantMessageMutationVariables>;
export const WorkflowRunUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"WorkflowRunUpdated"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"runId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflowRunUpdated"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"runId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"runId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"step"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]}}]} as unknown as DocumentNode<WorkflowRunUpdatedSubscription, WorkflowRunUpdatedSubscriptionVariables>;
export const ProductHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductHealth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productHealth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"runsLast24h"}},{"kind":"Field","name":{"kind":"Name","value":"successRateLast24h"}},{"kind":"Field","name":{"kind":"Name","value":"failedStepsLast24h"}},{"kind":"Field","name":{"kind":"Name","value":"p95StepLatencyMs"}},{"kind":"Field","name":{"kind":"Name","value":"mostCommonFailure"}}]}}]}}]} as unknown as DocumentNode<ProductHealthQuery, ProductHealthQueryVariables>;
export const WorkflowRunDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkflowRunDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"runId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflowRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"runId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowRunTimeline"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowRunTimeline"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowRun"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"goal"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"toolName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"output"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"step"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"emailDrafts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approvals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"riskLevel"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"preview"}},{"kind":"Field","name":{"kind":"Name","value":"decisionNote"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"emailDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<WorkflowRunDetailQuery, WorkflowRunDetailQueryVariables>;
export const WorkflowRunInspectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkflowRunInspect"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"runId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workflowRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"runId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkflowRunTimeline"}},{"kind":"Field","name":{"kind":"Name","value":"toolInvocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"toolName"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"promptVersion"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"output"}},{"kind":"Field","name":{"kind":"Name","value":"rawResponsePreview"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"latencyMs"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"step"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkflowRunTimeline"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkflowRun"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"goal"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"toolName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"input"}},{"kind":"Field","name":{"kind":"Name","value":"output"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"step"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"emailDrafts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"approvals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"riskLevel"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"preview"}},{"kind":"Field","name":{"kind":"Name","value":"decisionNote"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"emailDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"recipientEmail"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<WorkflowRunInspectQuery, WorkflowRunInspectQueryVariables>;
export const RetryWorkflowStepDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RetryWorkflowStep"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stepId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"retryWorkflowStep"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"stepId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stepId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"attemptCount"}}]}}]}}]} as unknown as DocumentNode<RetryWorkflowStepMutation, RetryWorkflowStepMutationVariables>;
export const CancelWorkflowRunDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelWorkflowRun"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"runId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelWorkflowRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"runId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"runId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<CancelWorkflowRunMutation, CancelWorkflowRunMutationVariables>;