import { test, expect } from "../fixtures/auth.fixture";
import { LoginPage } from "../helpers/pages/LoginPage";

/**
 * Authentication Flow Tests
 * Tests all authentication scenarios (email, OTP, registration)
 */
test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test.describe("Login with Email/Password", () => {
    test("should successfully login with valid credentials", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.verifyPage();

      await loginPage.loginWithEmail("owner@test.com", "Test@123456");

      // Should redirect to dashboard or onboarding
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
    });

    test("should show error with invalid credentials", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.loginWithEmail("invalid@test.com", "wrongpassword");

      // Should show error message
      await expect(page.locator("text=Invalid credentials")).toBeVisible({
        timeout: 5000,
      });
    });

    test("should validate required fields", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();

      // Try to submit without filling fields
      await loginPage.signInButton.click();

      // Should show validation errors (HTML5 or custom)
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute("required");
    });
  });

  test.describe("Login with OTP", () => {
    test("should successfully login with OTP", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.loginWithOTP("9876543210", "123456");

      // Should redirect to dashboard or onboarding
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
    });

    test("should validate phone number format", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.toggleOTPLink.click();

      // Try invalid phone
      await loginPage.phoneInput.fill("123");
      await loginPage.sendOTPButton.click();

      // Should show error
      await expect(page.locator("text=/.*valid.*phone.*/i")).toBeVisible({
        timeout: 3000,
      });
    });

    test("should show resend OTP option", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.toggleOTPLink.click();

      await loginPage.phoneInput.fill("9876543210");
      await loginPage.sendOTPButton.click();

      // Should show OTP screen
      await expect(page.locator("text=Enter the OTP")).toBeVisible();

      // Should show resend link
      await expect(page.locator("text=/.*resend.*/i")).toBeVisible();
    });
  });

  test.describe("Sign Up with OTP", () => {
    test("should successfully register new user", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();

      // Use unique phone number
      const uniquePhone = `98765${Math.floor(Math.random() * 100000)}`;
      await loginPage.signUpWithOTP(uniquePhone, "123456");

      // Should redirect to onboarding
      await expect(page).toHaveURL(/.*onboarding/);
    });

    test("should switch between sign in and sign up", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();

      // Default should be Sign In
      await expect(loginPage.signInTab).toHaveClass(/active|selected/i);

      // Click Sign Up
      await loginPage.signUpTab.click();
      await expect(loginPage.signUpTab).toHaveClass(/active|selected/i);

      // Click Sign In
      await loginPage.signInTab.click();
      await expect(loginPage.signInTab).toHaveClass(/active|selected/i);
    });
  });

  test.describe("Session Management", () => {
    test("should persist session after page refresh", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.loginWithOTP("9876543210", "123456");

      // Wait for dashboard
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/);

      // Refresh page
      await page.reload();

      // Should still be logged in
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
    });

    test("should handle token expiration gracefully", async ({ page }) => {
      // This test requires backend setup to expire tokens
      // TODO: Implement when token expiration is testable
      test.skip();
    });
  });

  test.describe("UI/UX Tests", () => {
    test("should show loading state when submitting", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.emailInput.fill("owner@test.com");
      await loginPage.passwordInput.fill("Test@123456");

      // Click submit
      await loginPage.signInButton.click();

      // Should show loading state (spinner or disabled button)
      await expect(loginPage.signInButton).toBeDisabled({ timeout: 1000 });
    });

    test("should be keyboard accessible", async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();

      // Tab through form
      await page.keyboard.press("Tab"); // Email
      await page.keyboard.type("test@test.com");

      await page.keyboard.press("Tab"); // Password
      await page.keyboard.type("password");

      await page.keyboard.press("Tab"); // Submit button
      await page.keyboard.press("Enter");

      // Should attempt to submit
      await expect(page).not.toHaveURL("/");
    });

    test("should be responsive on mobile", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // All elements should be visible and clickable
      await expect(loginPage.signInTab).toBeVisible();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.signInButton).toBeVisible();
    });
  });
});
