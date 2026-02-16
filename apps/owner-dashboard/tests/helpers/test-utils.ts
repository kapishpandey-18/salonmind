import { Page, expect } from "@playwright/test";

/**
 * Common test utilities and helpers
 */

/**
 * Wait for API response
 */
export async function waitForAPI(page: Page, url: string, timeout = 5000) {
  return page.waitForResponse(
    (response) => response.url().includes(url) && response.status() === 200,
    { timeout }
  );
}

/**
 * Wait for loading to finish
 */
export async function waitForLoading(page: Page) {
  await page.waitForLoadState("networkidle");

  // Wait for any loading spinners to disappear
  const loader = page.locator('[data-testid="loading"], .loading, .spinner');
  if (await loader.isVisible()) {
    await loader.waitFor({ state: "hidden", timeout: 10000 });
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Fill form with data
 */
export async function fillForm(page: Page, data: Record<string, string>) {
  for (const [name, value] of Object.entries(data)) {
    const input = page.locator(
      `input[name="${name}"], textarea[name="${name}"]`
    );
    if (await input.isVisible()) {
      await input.fill(value);
    }
  }
}

/**
 * Select dropdown option
 */
export async function selectOption(
  page: Page,
  selector: string,
  value: string
) {
  await page.click(selector);
  await page.click(`text="${value}"`);
}

/**
 * Upload file
 */
export async function uploadFile(
  page: Page,
  inputSelector: string,
  filePath: string
) {
  const fileInput = page.locator(inputSelector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Wait and click (useful for flaky elements)
 */
export async function waitAndClick(
  page: Page,
  selector: string,
  timeout = 5000
) {
  await page.waitForSelector(selector, { state: "visible", timeout });
  await page.click(selector);
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Get toast/notification message
 */
export async function getToastMessage(page: Page): Promise<string | null> {
  const toast = page.locator('[role="status"], .toast, .notification').first();
  if (await toast.isVisible()) {
    return await toast.textContent();
  }
  return null;
}

/**
 * Verify toast message
 */
export async function expectToast(page: Page, message: string | RegExp) {
  const toast = page.locator('[role="status"], .toast, .notification');
  await expect(toast).toBeVisible({ timeout: 5000 });
  await expect(toast).toContainText(message);
}

/**
 * Clear all form fields
 */
export async function clearForm(page: Page) {
  const inputs = page.locator('input:not([type="hidden"]), textarea');
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    await inputs.nth(i).clear();
  }
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  const random = Math.floor(Math.random() * 1000000);
  return `test${random}@salonmind.test`;
}

/**
 * Generate random phone
 */
export function randomPhone(): string {
  const random = Math.floor(Math.random() * 100000);
  return `98765${random.toString().padStart(5, "0")}`;
}

/**
 * Format date for input
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Mock API response
 */
export async function mockAPI(
  page: Page,
  url: string,
  response: any,
  status = 200
) {
  await page.route(`**/${url}`, (route) => {
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

/**
 * Intercept and log API calls
 */
export function logAPIcalls(page: Page) {
  page.on("request", (request) => {
    if (request.url().includes("/api/")) {
      console.log("→", request.method(), request.url());
    }
  });

  page.on("response", (response) => {
    if (response.url().includes("/api/")) {
      console.log("←", response.status(), response.url());
    }
  });
}

/**
 * Wait for element to be stable (not moving)
 */
export async function waitForStable(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.waitFor({ state: "visible" });

  // Wait for element to stop moving
  let previousBox = await element.boundingBox();
  await page.waitForTimeout(100);
  let currentBox = await element.boundingBox();

  while (previousBox?.x !== currentBox?.x || previousBox?.y !== currentBox?.y) {
    previousBox = currentBox;
    await page.waitForTimeout(100);
    currentBox = await element.boundingBox();
  }
}

/**
 * Check accessibility issues
 */
export async function checkAccessibility(page: Page) {
  // Check for basic accessibility issues
  const issues: string[] = [];

  // Check for images without alt text
  const imagesWithoutAlt = await page.locator("img:not([alt])").count();
  if (imagesWithoutAlt > 0) {
    issues.push(`${imagesWithoutAlt} images without alt text`);
  }

  // Check for buttons without labels
  const buttonsWithoutLabel = await page
    .locator("button:not([aria-label]):not(:has-text)")
    .count();
  if (buttonsWithoutLabel > 0) {
    issues.push(`${buttonsWithoutLabel} buttons without labels`);
  }

  // Check for inputs without labels
  const inputsWithoutLabel = await page
    .locator("input:not([aria-label]):not([id])")
    .count();
  if (inputsWithoutLabel > 0) {
    issues.push(`${inputsWithoutLabel} inputs without labels`);
  }

  return issues;
}
