import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DEMO_USER_ID = "user_demo";
export const DEMO_WORKSPACE_ID = "workspace_demo";
export const DEMO_THREAD_ID = "thread_demo";

function assertSafeDemoDatabase() {
  const databaseUrl =
    process.env.DATABASE_URL ?? "postgresql://followbrief:followbrief@localhost:5432/followbrief";
  const { hostname } = new URL(databaseUrl);

  if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new Error(
      "Refusing to reset demo data unless DATABASE_URL points to localhost, 127.0.0.1, or ::1."
    );
  }
}

export async function seedDemoData() {
  const user = await prisma.user.upsert({
    where: { email: "demo@followbrief.local" },
    update: { name: "Demo User" },
    create: {
      id: DEMO_USER_ID,
      name: "Demo User",
      email: "demo@followbrief.local"
    }
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: DEMO_WORKSPACE_ID },
    update: { name: "FollowBrief Demo Workspace", ownerId: user.id },
    create: {
      id: DEMO_WORKSPACE_ID,
      name: "FollowBrief Demo Workspace",
      ownerId: user.id
    }
  });

  await prisma.assistantThread.upsert({
    where: { id: DEMO_THREAD_ID },
    update: {
      workspaceId: workspace.id,
      title: "Acme follow-up workspace"
    },
    create: {
      id: DEMO_THREAD_ID,
      workspaceId: workspace.id,
      title: "Acme follow-up workspace",
      messages: {
        create: {
          role: "ASSISTANT",
          content:
            "Ready when you are. Ask me to find the Acme meeting notes, draft Sarah a follow-up, and create next-step tasks."
        }
      }
    }
  });

  const sourceItems = [
    {
      id: "source_acme_implementation",
      kind: "MEETING_NOTE" as const,
      title: "Acme Corp - Implementation Meeting Notes",
      contactName: "Sarah Kim",
      contactEmail: "sarah@acme.example",
      companyName: "Acme Corp",
      body:
        "Sarah wants a clear implementation timeline before Acme commits to the rollout. Acme needs to confirm a technical owner this week. They asked about API setup, onboarding risks, and how quickly the first team can go live. Follow-up should include the timeline, open questions, and next steps."
    },
    {
      id: "source_acme_pricing",
      kind: "CRM_NOTE" as const,
      title: "Acme Corp - Pricing and Integration Follow-up",
      contactName: "Sarah Kim",
      contactEmail: "sarah@acme.example",
      companyName: "Acme Corp",
      body:
        "Acme is comparing implementation options and cares most about onboarding speed. Sarah asked for a concise recap that connects pricing, integration effort, and the fastest route to a successful pilot."
    },
    {
      id: "source_northstar_invoice",
      kind: "CRM_NOTE" as const,
      title: "Northstar Health - Invoice Reminder Notes",
      contactName: "Maya Patel",
      contactEmail: "maya@northstar.example",
      companyName: "Northstar Health",
      body:
        "Northstar Health needs a gentle reminder about an overdue invoice and a copy of the latest statement."
    },
    {
      id: "source_betacloud_onboarding",
      kind: "MEETING_NOTE" as const,
      title: "BetaCloud - Onboarding Notes",
      contactName: "Luis Romero",
      contactEmail: "luis@betacloud.example",
      companyName: "BetaCloud",
      body:
        "BetaCloud is setting up their onboarding workspace and wants a checklist for security review, data import, and admin training."
    },
    {
      id: "source_internal_playbook",
      kind: "EMAIL_SNIPPET" as const,
      title: "Generic internal follow-up playbook",
      contactName: null,
      contactEmail: null,
      companyName: null,
      body:
        "Strong customer follow-ups recap the customer's goal, confirm owner and timeline, list open questions, and make the next meeting easy to accept."
    }
  ];

  for (const item of sourceItems) {
    await prisma.sourceItem.upsert({
      where: { id: item.id },
      update: {
        workspaceId: workspace.id,
        kind: item.kind,
        title: item.title,
        body: item.body,
        contactName: item.contactName,
        contactEmail: item.contactEmail,
        companyName: item.companyName,
        metadataJson: {}
      },
      create: {
        ...item,
        workspaceId: workspace.id,
        metadataJson: {}
      }
    });
  }
}

export async function resetDemoData() {
  assertSafeDemoDatabase();

  await prisma.toolInvocation.deleteMany();
  await prisma.workflowRunEvent.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.emailDraft.deleteMany();
  await prisma.task.deleteMany();
  await prisma.workflowRunSourceItem.deleteMany();
  await prisma.workflowStep.deleteMany();
  await prisma.assistantMessage.deleteMany();
  await prisma.workflowRun.deleteMany();
  await prisma.sourceItem.deleteMany();
  await prisma.assistantThread.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  await seedDemoData();
}

if (require.main === module) {
  const operation = process.env.RESET_DEMO_DATA === "1" ? resetDemoData : seedDemoData;

  operation()
    .then(async () => {
      await prisma.$disconnect();
      console.log(
        process.env.RESET_DEMO_DATA === "1"
          ? "Reset and seeded FollowBrief demo data."
          : "Seeded FollowBrief demo data."
      );
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
