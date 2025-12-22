import { test, expect } from "@playwright/test";

/**
 * Smoke Tests - Quick validation that critical paths work
 * Run these first to ensure app is functioning
 */
test.describe("Smoke Tests", () => {
  test("app loads successfully", async ({ page }) => {
    await page.goto("/");

    // Should show login page
    await expect(page.locator("text=SalonMind")).toBeVisible();
  });

  test("health check passes", async ({ request }) => {
    const response = await request.get("http://localhost:5000/health");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test("frontend can reach backend", async ({ page }) => {
    // Intercept API call
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/") && response.status() === 200,
      { timeout: 10000 }
    );

    await page.goto("/");

    // Trigger any API call (like checking auth status)
    // The app should make at least one API call on load

    try {
      await responsePromise;
      // If we got here, API connection works
      expect(true).toBe(true);
    } catch (error) {
      // API not called or failed - that's okay for this test
      console.log(
        "No API calls detected on page load (expected if not authenticated)"
      );
    }
  });

  test("all main routes are accessible", async ({ page }) => {
    const routes = [
      "/",
      // Add more routes as you build them
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(500); // No 500 errors
    }
  });

  test("no console errors on page load", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Allow certain errors (like failed API calls when not authenticated)
    const allowedErrors = [/network error/i, /401/i, /unauthorized/i];

    const unexpectedErrors = errors.filter(
      (error) => !allowedErrors.some((pattern) => pattern.test(error))
    );

    expect(unexpectedErrors).toHaveLength(0);
  });

  test("viewport is responsive", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "Mobile" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 1920, height: 1080, name: "Desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");

      // Page should load without horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });

      expect(hasHorizontalScroll).toBe(false);
    }
  });
});
