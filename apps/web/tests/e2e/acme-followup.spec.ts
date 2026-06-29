import { expect, test } from "@playwright/test";

test.setTimeout(90000);

test("Acme follow-up workflow can be approved", async ({ page }) => {
  await page.goto("/assistant");

  await expect(page.getByRole("heading", { name: "Assistant console" })).toBeVisible();
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText("Found relevant notes")).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Created follow-up tasks")).toBeVisible({ timeout: 30000 });
  const openApproval = page.getByRole("link", { name: /Open approval/i });
  await expect(openApproval).toBeVisible({ timeout: 60000 });

  await openApproval.click();
  await expect(page.getByRole("heading", { name: "Approval queue" })).toBeVisible();

  await page.getByRole("button", { name: "Edit draft" }).first().click();
  const body = page.getByLabel("Body");
  await body.fill(`${await body.inputValue()}\n\nP.S. I can send the API setup checklist after you confirm the owner.`);
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft saved.")).toBeVisible();

  await page.getByRole("button", { name: "Approve" }).first().click();
  await expect(page.getByText("Draft approved. The workflow will resume.")).toBeVisible();

  await page.goto("/assistant");
  await expect(page.getByText("Workflow completed")).toBeVisible({ timeout: 30000 });

  await page.getByRole("link", { name: "Inspect" }).click();
  await expect(page.getByRole("heading", { name: "Workflow inspector" })).toBeVisible();
  await expect(page.getByText("Tool invocations")).toBeVisible();
  await expect(page.getByText("DOCUMENTS_SEARCH")).toBeVisible();
  await expect(page.getByText("EMAIL_DRAFT")).toBeVisible();
});
