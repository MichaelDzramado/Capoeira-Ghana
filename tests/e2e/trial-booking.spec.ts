import { test, expect } from "@playwright/test";

test.describe("Trial Booking", () => {
  test("visitor can submit a trial booking", async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`;

    await page.goto("/book-a-trial");

    await expect(
      page.getByRole("heading", {
        name: /book your first capoeira experience/i,
      }),
    ).toBeVisible();

    await page.getByLabel(/full name/i).fill("E2E Trial Visitor");
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/phone/i).fill("0240000000");
    await page.getByLabel(/age/i).fill("27");

    const programSelect = page.getByLabel(/program/i);
    const classSelect = page.getByLabel(/preferred class/i);

    await programSelect.selectOption({
      label: "Capoeira Fundamentals",
    });

    await expect(classSelect).toContainText("Tuesday Fundamentals", {
      timeout: 10000,
    });

    await classSelect.selectOption(
      "40000000-0000-0000-0000-000000000002",
    );

    await expect(classSelect).toHaveValue(
      "40000000-0000-0000-0000-000000000002",
    );

    await page.getByLabel(/preferred date/i).fill("2026-09-25");

    await page
      .getByLabel(/anything you'd like us to know/i)
      .fill("Automated Playwright verification.");

    await page.getByRole("button", {
      name: /book my trial/i,
    }).click();

    // Verify the success state rendered after the API returned 201.
    await expect(
      page.getByText("TRIAL REQUEST RECEIVED"),
    ).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page.getByText("Your Capoeira journey starts here."),
    ).toBeVisible();

    await expect(
      page.getByText(/we've received your trial request/i),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /book another trial/i,
      }),
    ).toBeVisible();
  });
});
