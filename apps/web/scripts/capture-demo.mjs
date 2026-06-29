import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");
const assetsDir = resolve(repoRoot, "docs/assets");
const baseURL = process.env.CAPTURE_BASE_URL ?? "http://127.0.0.1:3000";

async function screenshot(page, name) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: resolve(assetsDir, name)
  });
}

async function startWorkflowAndWaitForApproval(page) {
  await page.goto(`${baseURL}/assistant`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Assistant console" })).toBeVisible();

  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Found relevant notes")).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Created follow-up tasks")).toBeVisible({ timeout: 30000 });

  const openApproval = page.getByRole("link", { name: /Open approval/i });
  await expect(openApproval).toBeVisible({ timeout: 60000 });
  const inspectHref = await page.getByRole("link", { name: "Inspect" }).first().getAttribute("href");

  if (!inspectHref) {
    throw new Error("Could not locate the inspector link for the active workflow run.");
  }

  return { openApproval, inspectHref };
}

await mkdir(assetsDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

try {
  const { openApproval, inspectHref } = await startWorkflowAndWaitForApproval(page);
  await screenshot(page, "assistant-waiting-for-review.png");

  await openApproval.click();
  await expect(page.getByRole("heading", { name: "Approval queue" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" }).first()).toBeVisible();
  await screenshot(page, "approval-email-draft.png");

  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByText("Draft approved. The workflow will resume.")).toBeVisible();

  await page.goto(`${baseURL}${inspectHref}`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Workflow inspector" })).toBeVisible();
  await expect(page.getByText("Completed").first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Tool invocations")).toBeVisible();
  await expect(page.getByText("DOCUMENTS_SEARCH")).toBeVisible();
  await expect(page.getByText("EMAIL_DRAFT")).toBeVisible();
  await screenshot(page, "run-inspector.png");

  const secondRun = await startWorkflowAndWaitForApproval(page);
  await secondRun.openApproval.click();
  await expect(page.getByRole("heading", { name: "Approval queue" })).toBeVisible();
  await page
    .getByPlaceholder("Reason for rejecting")
    .fill("Use the created tasks, but do not finalize the customer email yet.");
  await page.getByRole("button", { name: "Reject" }).first().click();
  await expect(page.getByText("Email draft rejected. Follow-up tasks were still created.")).toBeVisible();

  await page.goto(`${baseURL}/health`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Product health" })).toBeVisible();
  await expect(page.getByText("Runs in last 24 hours")).toBeVisible();
  await expect(
    page.locator("section", { hasText: "Runs in last 24 hours" }).locator("p").last()
  ).toHaveText(/^([2-9]|[1-9][0-9]+)$/);
  await expect(
    page.locator("section", { hasText: "Success rate" }).locator("p").last()
  ).toHaveText("100%");
  await expect(
    page.locator("section", { hasText: "95th percentile step latency" }).locator("p").last()
  ).toHaveText(/^[0-9]+ ms$/);
  await screenshot(page, "product-health.png");
} finally {
  await browser.close();
}
