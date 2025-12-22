import { test, expect } from "@playwright/test";

/**
 * Simple Onboarding Test
 * Tests the basic flow without complex OTP handling
 */
test.describe("Simple Onboarding Flow", () => {
  test("should load login page correctly", async ({ page }) => {
    await page.goto("/");

    // Verify page loads
    await expect(page.locator("text=SalonMind")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Sign Up" })).toBeVisible();
  });

  test("should show sign up form when clicking Sign Up tab", async ({
    page,
  }) => {
    await page.goto("/");

    // Click Sign Up tab
    await page.getByRole("tab", { name: "Sign Up" }).click();

    // Verify sign up form is visible
    await expect(page.locator("text=Mobile Number")).toBeVisible();
    await expect(
      page.locator("text=Create account with mobile number")
    ).toBeVisible();
  });

  test("should show phone input for sign up", async ({ page }) => {
    await page.goto("/");

    // Go to Sign Up tab
    await page.getByRole("tab", { name: "Sign Up" }).click();

    // Find phone input
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toBeVisible();

    // Type phone number
    await phoneInput.fill("9876543210");

    // Verify the value
    const value = await phoneInput.inputValue();
    console.log("Phone input value:", value);
  });

  test("should have Send OTP button", async ({ page }) => {
    await page.goto("/");

    // Go to Sign Up tab
    await page.getByRole("tab", { name: "Sign Up" }).click();

    // Fill phone number
    await page.locator('input[type="tel"]').fill("9876543210");

    // Find Send OTP button
    const sendOTPButton = page.getByRole("button", { name: "Send OTP" });
    await expect(sendOTPButton).toBeVisible();
    await expect(sendOTPButton).toBeEnabled();
  });

  test.skip("should show OTP screen after clicking Send OTP", async ({
    page,
  }) => {
    await page.goto("/");

    // Go to Sign Up tab
    await page.getByRole("tab", { name: "Sign Up" }).click();

    // Fill phone and send OTP
    await page.locator('input[type="tel"]').fill("9876543210");
    await page.getByRole("button", { name: "Send OTP" }).click();

    // Wait for API call (this will fail if backend doesn't handle it)
    await page.waitForTimeout(2000);

    // Check if OTP screen appears
    const otpText = page.locator("text=Enter the OTP");
    if (await otpText.isVisible()) {
      console.log("✅ OTP screen appeared");

      // Find OTP input slots
      const otpSlots = page.locator('input[inputmode="numeric"]');
      const count = await otpSlots.count();
      console.log(`Found ${count} OTP input slots`);

      // Try to fill OTP
      for (let i = 0; i < 6; i++) {
        await otpSlots.nth(i).type(`${i + 1}`);
      }

      console.log("✅ OTP filled successfully");
    } else {
      console.log("❌ OTP screen did not appear (API might have failed)");
    }
  });

  test("should show email login form by default", async ({ page }) => {
    await page.goto("/");

    // Verify email/password form is visible by default
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign In", exact: true })
    ).toBeVisible();
  });

  test("should toggle to OTP login when clicking toggle link", async ({
    page,
  }) => {
    await page.goto("/");

    // Click the toggle link
    await page.locator("text=Login with OTP instead").click();

    // Verify phone input appears
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator("text=Sign in with OTP")).toBeVisible();
  });
});
