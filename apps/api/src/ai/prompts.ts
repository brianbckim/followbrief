export const PROMPT_VERSION = "followbrief-v1";

export function buildPlanPrompt(userMessage: string) {
  return `Create a JSON workflow plan for this customer follow-up request. Use only documents.search, documents.summarize, tasks.create, and email.draft. Request: ${userMessage}`;
}

export function buildRepairPrompt(originalText: string, validationError: string) {
  return `Repair this JSON workflow plan so it matches the FollowBrief schema.\n\nError:\n${validationError}\n\nOriginal:\n${originalText}`;
}
