import fs from "node:fs";
import path from "node:path";
import { WorkflowPlanSchema } from "../ai/schemas";
import { parseWithSchema } from "../ai/extract-json";

const fixturesDir = path.resolve(process.cwd(), "../../fixtures/ai");

describe("WorkflowPlanSchema", () => {
  it("accepts the valid Acme plan", () => {
    const text = fs.readFileSync(path.join(fixturesDir, "acme-followup-plan.json"), "utf8");
    const plan = parseWithSchema(text, WorkflowPlanSchema);

    expect(plan.steps.map((step) => step.toolName)).toEqual([
      "documents.search",
      "documents.summarize",
      "tasks.create",
      "email.draft"
    ]);
  });

  it("accepts the deterministic demo guidance plan", () => {
    const text = fs.readFileSync(path.join(fixturesDir, "demo-guidance-plan.json"), "utf8");
    const plan = parseWithSchema(text, WorkflowPlanSchema);

    expect(plan.userVisibleSummary).toContain("Demo mode is optimized");
    expect(plan.steps.map((step) => step.toolName)).toEqual(["documents.search"]);
  });

  it("rejects unknown tools", () => {
    const text = fs.readFileSync(path.join(fixturesDir, "invalid-plan.json"), "utf8");
    expect(() => parseWithSchema(text, WorkflowPlanSchema)).toThrow();
  });
});
