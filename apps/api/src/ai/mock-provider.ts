import fs from "node:fs/promises";
import path from "node:path";
import type {
  AIProvider,
  AIResult,
  DraftEmailInput,
  GenerateWorkflowPlanInput,
  RepairWorkflowPlanInput,
  SummarizeDocumentsInput
} from "./ai-provider";
import { PROMPT_VERSION } from "./prompts";

const fixturesDir = path.resolve(process.cwd(), "../../fixtures/ai");
export const ACME_DEMO_PROMPT =
  "Find last week's Acme meeting notes, draft a follow-up email to Sarah, and create next-step tasks for our team.";

async function readFixture(name: string) {
  return fs.readFile(path.join(fixturesDir, name), "utf8");
}

export function isAcmeDemoPrompt(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("acme") &&
    (normalized.includes("sarah") ||
      normalized.includes("meeting notes") ||
      normalized.includes("follow-up"))
  );
}

export class MockProvider implements AIProvider {
  async generateWorkflowPlan(input: GenerateWorkflowPlanInput): Promise<AIResult> {
    const started = Date.now();
    const normalized = input.userMessage.toLowerCase();
    const fixture = normalized.includes("invalid")
      ? "invalid-plan.json"
      : isAcmeDemoPrompt(input.userMessage)
        ? "acme-followup-plan.json"
        : "demo-guidance-plan.json";

    return {
      text: await readFixture(fixture),
      provider: "mock",
      model: "deterministic-fixture",
      promptVersion: PROMPT_VERSION,
      latencyMs: Date.now() - started
    };
  }

  async repairWorkflowPlan(_input: RepairWorkflowPlanInput): Promise<AIResult> {
    const started = Date.now();
    return {
      text: await readFixture("repaired-plan.json"),
      provider: "mock",
      model: "deterministic-fixture",
      promptVersion: PROMPT_VERSION,
      latencyMs: Date.now() - started
    };
  }

  async summarizeDocuments(_input: SummarizeDocumentsInput): Promise<AIResult> {
    const started = Date.now();
    return {
      text: await readFixture("acme-summary.json"),
      provider: "mock",
      model: "deterministic-fixture",
      promptVersion: PROMPT_VERSION,
      latencyMs: Date.now() - started
    };
  }

  async draftEmail(_input: DraftEmailInput): Promise<AIResult> {
    const started = Date.now();
    return {
      text: await readFixture("acme-email-draft.json"),
      provider: "mock",
      model: "deterministic-fixture",
      promptVersion: PROMPT_VERSION,
      latencyMs: Date.now() - started
    };
  }
}
