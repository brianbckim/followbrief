import { compileWorkflowPlan } from "../workflows/plan-compiler";
import type { WorkflowPlan } from "../ai/schemas";

describe("compileWorkflowPlan", () => {
  it("rejects dependencies that point forward or do not exist", () => {
    const plan: WorkflowPlan = {
      goal: "Test",
      userVisibleSummary: "Testing",
      steps: [
        {
          clientStepId: "draft",
          title: "Draft",
          toolName: "email.draft",
          input: {},
          dependsOn: ["search"],
          userVisibleReason: "Test"
        },
        {
          clientStepId: "search",
          title: "Search",
          toolName: "documents.search",
          input: { query: "Acme" },
          dependsOn: [],
          userVisibleReason: "Test"
        }
      ]
    };

    expect(() => compileWorkflowPlan(plan)).toThrow(/dependencies must reference earlier steps/);
  });
});
