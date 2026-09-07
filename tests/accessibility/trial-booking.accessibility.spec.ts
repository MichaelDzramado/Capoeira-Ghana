import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Trial Booking Accessibility", () => {
  test("book-a-trial page has no critical or serious accessibility violations", async ({
    page,
  }) => {
    await page.goto("/book-a-trial");

    await expect(
      page.getByRole("heading", {
        name: /book your first capoeira experience/i,
      }),
    ).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({
      page,
    }).analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (violation) =>
        violation.impact === "serious" ||
        violation.impact === "critical",
    );

    expect(seriousOrCritical).toEqual([]);
  });
});
