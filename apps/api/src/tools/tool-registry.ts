import type { ToolName } from "@prisma/client";
import type { ToolDefinition } from "./tool-definition";
import { documentsSearchTool } from "./documents-search";
import { documentsSummarizeTool } from "./documents-summarize";
import { emailDraftTool } from "./email-draft";
import { tasksCreateTool } from "./tasks-create";

const tools: Record<ToolName, ToolDefinition> = {
  DOCUMENTS_SEARCH: documentsSearchTool,
  DOCUMENTS_SUMMARIZE: documentsSummarizeTool,
  EMAIL_DRAFT: emailDraftTool,
  TASKS_CREATE: tasksCreateTool
};

export function getTool(name: ToolName): ToolDefinition {
  const tool = tools[name];
  if (!tool) {
    throw new Error(`No tool registered for ${name}`);
  }
  return tool;
}

export function listTools() {
  return Object.values(tools);
}
