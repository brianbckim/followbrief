import type {
  AIProvider,
  AIResult,
  DraftEmailInput,
  GenerateWorkflowPlanInput,
  RepairWorkflowPlanInput,
  SummarizeDocumentsInput
} from "./ai-provider";
import { env } from "../env";
import { buildPlanPrompt, buildRepairPrompt, PROMPT_VERSION } from "./prompts";

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  model?: string;
}

export class OpenAICompatibleProvider implements AIProvider {
  private async complete(prompt: string): Promise<AIResult> {
    const started = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${env.aiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${env.aiApiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: env.aiModel,
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "You are FollowBrief's JSON-only assistant. Return valid JSON with no prose."
            },
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI-compatible provider returned ${response.status}`);
      }

      const data = (await response.json()) as ChatCompletionResponse;
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("OpenAI-compatible provider returned no message content.");
      }

      return {
        text,
        provider: "openai-compatible",
        model: data.model ?? env.aiModel,
        promptVersion: PROMPT_VERSION,
        latencyMs: Date.now() - started
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`AI provider request failed: ${reason}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  generateWorkflowPlan(input: GenerateWorkflowPlanInput) {
    return this.complete(buildPlanPrompt(input.userMessage));
  }

  repairWorkflowPlan(input: RepairWorkflowPlanInput) {
    return this.complete(buildRepairPrompt(input.originalText, input.validationError));
  }

  summarizeDocuments(input: SummarizeDocumentsInput) {
    return this.complete(
      `Summarize these documents as JSON with summary, keyPoints, and actionItems.\nFocus: ${input.focus}\nDocuments: ${JSON.stringify(input.documents)}`
    );
  }

  draftEmail(input: DraftEmailInput) {
    return this.complete(
      `Draft a customer follow-up email as JSON with subject, body, and rationale.\nInput: ${JSON.stringify(input)}`
    );
  }
}
