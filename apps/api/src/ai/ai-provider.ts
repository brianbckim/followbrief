export interface AIResult {
  text: string;
  provider: string;
  model?: string;
  promptVersion?: string;
  latencyMs?: number;
}

export interface GenerateWorkflowPlanInput {
  userMessage: string;
  workspaceName: string;
}

export interface RepairWorkflowPlanInput {
  originalText: string;
  validationError: string;
}

export interface SummarizeDocumentsInput {
  documents: Array<{
    id: string;
    title: string;
    body: string;
    companyName?: string | null;
  }>;
  focus: string;
}

export interface DraftEmailInput {
  recipientName: string;
  recipientEmail: string;
  companyName: string;
  purpose: string;
  tone: string;
  contextSummary?: string;
}

export interface AIProvider {
  generateWorkflowPlan(input: GenerateWorkflowPlanInput): Promise<AIResult>;
  repairWorkflowPlan(input: RepairWorkflowPlanInput): Promise<AIResult>;
  summarizeDocuments(input: SummarizeDocumentsInput): Promise<AIResult>;
  draftEmail(input: DraftEmailInput): Promise<AIResult>;
}
