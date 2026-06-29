import type { AIProvider } from "./ai-provider";
import { MockProvider } from "./mock-provider";
import { OpenAICompatibleProvider } from "./openai-compatible-provider";
import { ReplayProvider } from "./replay-provider";
import { env } from "../env";

let provider: AIProvider | undefined;

export function getAIProvider(): AIProvider {
  if (provider) {
    return provider;
  }

  if (env.aiProvider === "openai-compatible") {
    provider = new OpenAICompatibleProvider();
  } else if (env.aiProvider === "replay") {
    provider = new ReplayProvider();
  } else {
    provider = new MockProvider();
  }

  return provider;
}
