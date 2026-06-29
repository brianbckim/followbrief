import type { Prisma, ToolName } from "@prisma/client";
import type { WorkflowPlan, WorkflowPlanStep } from "../ai/schemas";

const toolNameMap: Record<WorkflowPlanStep["toolName"], ToolName> = {
  "documents.search": "DOCUMENTS_SEARCH",
  "documents.summarize": "DOCUMENTS_SUMMARIZE",
  "email.draft": "EMAIL_DRAFT",
  "tasks.create": "TASKS_CREATE"
};

export interface CompiledWorkflowStep {
  index: number;
  title: string;
  toolName: ToolName;
  inputJson: Prisma.InputJsonObject;
}

export function planToolToDbTool(toolName: WorkflowPlanStep["toolName"]): ToolName {
  return toolNameMap[toolName];
}

export function dbToolToPlanTool(toolName: ToolName): WorkflowPlanStep["toolName"] {
  const match = Object.entries(toolNameMap).find(([, dbName]) => dbName === toolName);
  if (!match) {
    throw new Error(`Unsupported stored tool: ${toolName}`);
  }
  return match[0] as WorkflowPlanStep["toolName"];
}

export function compileWorkflowPlan(plan: WorkflowPlan): CompiledWorkflowStep[] {
  const seen = new Set<string>();

  return plan.steps.map((step, index) => {
    if (seen.has(step.clientStepId)) {
      throw new Error(`Duplicate workflow step id: ${step.clientStepId}`);
    }

    for (const dependency of step.dependsOn) {
      if (!seen.has(dependency)) {
        throw new Error(
          `Step "${step.clientStepId}" depends on "${dependency}", but dependencies must reference earlier steps.`
        );
      }
    }

    seen.add(step.clientStepId);

    return {
      index,
      title: step.title,
      toolName: planToolToDbTool(step.toolName),
      inputJson: step.input as Prisma.InputJsonObject
    };
  });
}
