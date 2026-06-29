import { MockProvider } from "../ai/mock-provider";
import { parseWithSchema } from "../ai/extract-json";
import { WorkflowPlanSchema } from "../ai/schemas";

describe("MockProvider", () => {
  it("returns the full Acme workflow for the Acme demo prompt", async () => {
    const provider = new MockProvider();

    const result = await provider.generateWorkflowPlan({
      workspaceName: "FollowBrief Demo",
      userMessage:
        "Find last week's Acme meeting notes, draft a follow-up email to Sarah, and create next-step tasks for our team."
    });
    const plan = parseWithSchema(result.text, WorkflowPlanSchema);

    expect(plan.steps.map((step) => step.toolName)).toEqual([
      "documents.search",
      "documents.summarize",
      "tasks.create",
      "email.draft"
    ]);
  });

  it("returns demo guidance instead of silently running Acme for unrelated prompts", async () => {
    const provider = new MockProvider();

    const result = await provider.generateWorkflowPlan({
      workspaceName: "FollowBrief Demo",
      userMessage: "Plan a launch checklist for a different customer."
    });
    const plan = parseWithSchema(result.text, WorkflowPlanSchema);

    expect(plan.userVisibleSummary).toContain("deterministic Acme follow-up scenario");
    expect(plan.steps.map((step) => step.toolName)).toEqual(["documents.search"]);
  });
});
