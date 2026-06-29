import type { RiskLevel } from "@prisma/client";

export type PlanToolName =
  | "documents.search"
  | "documents.summarize"
  | "tasks.create"
  | "email.draft";

export interface RiskPolicyDecision {
  riskLevel: RiskLevel;
  approvalRequired: boolean;
}

export const riskPolicy: Record<PlanToolName, RiskPolicyDecision> = {
  "documents.search": { riskLevel: "LOW", approvalRequired: false },
  "documents.summarize": { riskLevel: "LOW", approvalRequired: false },
  "tasks.create": { riskLevel: "LOW", approvalRequired: false },
  "email.draft": { riskLevel: "MEDIUM", approvalRequired: true }
};

export function getRiskPolicy(toolName: PlanToolName): RiskPolicyDecision {
  return riskPolicy[toolName];
}
