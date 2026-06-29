import { prisma } from "../db/prisma";
import { getAIProvider } from "../ai/provider-factory";
import { WorkflowPlanSchema } from "../ai/schemas";
import { parseWithSchema } from "../ai/extract-json";
import { compileWorkflowPlan } from "../workflows/plan-compiler";
import { enqueueWorkflowRun } from "../workers/queues";
import { recordWorkflowEvent } from "./workflow-service";

export async function createAssistantTurn(input: {
  threadId: string;
  content: string;
}) {
  const thread = await prisma.assistantThread.findUniqueOrThrow({
    where: { id: input.threadId },
    include: { workspace: true }
  });
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: "demo@followbrief.local" }
  });
  const aiProvider = getAIProvider();

  const planResult = await aiProvider.generateWorkflowPlan({
    userMessage: input.content,
    workspaceName: thread.workspace.name
  });

  let planText = planResult.text;
  let plan;
  try {
    plan = parseWithSchema(planText, WorkflowPlanSchema);
  } catch (error) {
    const repair = await aiProvider.repairWorkflowPlan({
      originalText: planText,
      validationError: error instanceof Error ? error.message : String(error)
    });
    planText = repair.text;
    plan = parseWithSchema(planText, WorkflowPlanSchema);
  }

  const compiledSteps = compileWorkflowPlan(plan);

  const result = await prisma.$transaction(async (tx) => {
    const userMessage = await tx.assistantMessage.create({
      data: {
        threadId: thread.id,
        role: "USER",
        content: input.content
      }
    });

    const run = await tx.workflowRun.create({
      data: {
        workspaceId: thread.workspaceId,
        threadId: thread.id,
        goal: plan.goal,
        status: "QUEUED",
        createdById: user.id,
        steps: {
          create: compiledSteps.map((step) => ({
            index: step.index,
            title: step.title,
            toolName: step.toolName,
            inputJson: step.inputJson
          }))
        }
      },
      include: { steps: { orderBy: { index: "asc" } } }
    });

    const assistantMessage = await tx.assistantMessage.create({
      data: {
        threadId: thread.id,
        workflowRunId: run.id,
        role: "ASSISTANT",
        content: plan.userVisibleSummary
      }
    });

    await tx.assistantThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() }
    });

    return { userMessage, assistantMessage, run };
  });

  await recordWorkflowEvent({
    workflowRunId: result.run.id,
    type: "RUN_QUEUED",
    message: "Workflow queued",
    payloadJson: {
      provider: planResult.provider,
      model: planResult.model,
      promptVersion: planResult.promptVersion
    }
  });
  await enqueueWorkflowRun(result.run.id);

  return {
    message: result.userMessage,
    assistantMessage: result.assistantMessage,
    run: result.run
  };
}
