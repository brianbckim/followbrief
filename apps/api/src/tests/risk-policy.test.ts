import { getRiskPolicy } from "../workflows/risk-policy";
import { listTools } from "../tools/tool-registry";

describe("risk policy", () => {
  it("requires approval for email drafts", () => {
    expect(getRiskPolicy("email.draft")).toEqual({
      riskLevel: "MEDIUM",
      approvalRequired: true
    });
  });

  it("does not require approval for task creation", () => {
    expect(getRiskPolicy("tasks.create").approvalRequired).toBe(false);
  });

  it("matches tool metadata used by the runtime registry", () => {
    for (const tool of listTools()) {
      expect({
        riskLevel: tool.riskLevel,
        approvalRequired: tool.approvalRequired
      }).toEqual(getRiskPolicy(tool.planName));
    }
  });
});
