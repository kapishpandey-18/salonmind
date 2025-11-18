import { test, expect, testSalon } from "../fixtures/auth.fixture";
import { LoginPage } from "../helpers/pages/LoginPage";
import { DashboardPage } from "../helpers/pages/DashboardPage";

/**
 * Complete User Flow Tests
 * Tests entire user journey from sign up to dashboard
 */
test.describe("Complete User Flows", () => {
  test.describe("New User Onboarding", () => {
    test("should complete full sign up and onboarding flow", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);

      // Step 1: Sign up with OTP
      await loginPage.goto();
      const uniquePhone = `98765${Math.floor(Math.random() * 100000)}`;
      await loginPage.signUpWithOTP(uniquePhone, "123456");

      // Step 2: Should land on onboarding
      await expect(page).toHaveURL(/.*onboarding/);
      await expect(page.locator("text=/.*owner.*info.*/i")).toBeVisible();

      // Step 3: Fill owner information
      await page.fill('input[name="ownerName"]', "Test Owner");
      await page.click('button:has-text("Next")');

      // Step 4: Fill salon details
      await page.fill('input[name="salonName"]', testSalon.name);
      await page.fill('input[name="salonEmail"]', testSalon.email);
      await page.fill('input[name="salonPhoneNumber"]', testSalon.phone);
      await page.click('button:has-text("Next")');

      // Step 5: Fill address
      await page.fill('input[name="salonAddress"]', testSalon.address);
      await page.fill('input[name="salonCity"]', testSalon.city);
      await page.fill('input[name="salonState"]', testSalon.state);
      await page.fill('input[name="salonZipCode"]', testSalon.zipCode);
      await page.click('button:has-text("Next")');

      // Continue through remaining steps
      // Adjust based on your actual onboarding flow
      for (let step = 4; step <= 7; step++) {
        await page.waitForTimeout(500);
        const nextButton = page.locator('button:has-text("Next")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
        }
      }

      // Step 6: Complete onboarding
      await page.click('button:has-text("Complete")');

      // Step 7: Should land on dashboard
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

      const dashboardPage = new DashboardPage(page);
      await dashboardPage.verifyPage();
    });

    test("should show validation errors for incomplete onboarding", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      const uniquePhone = `98765${Math.floor(Math.random() * 100000)}`;
      await loginPage.signUpWithOTP(uniquePhone, "123456");

      // Try to proceed without filling required fields
      await page.click('button:has-text("Next")');

      // Should show validation error
      await expect(page.locator("text=/.*required.*/i")).toBeVisible({
        timeout: 3000,
      });
    });

    test("should allow navigation between onboarding steps", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      const uniquePhone = `98765${Math.floor(Math.random() * 100000)}`;
      await loginPage.signUpWithOTP(uniquePhone, "123456");

      // Fill step 1
      await page.fill('input[name="ownerName"]', "Test Owner");
      await page.click('button:has-text("Next")');

      // Go back
      const backButton = page.locator('button:has-text("Back")');
      if (await backButton.isVisible()) {
        await backButton.click();

        // Should be back on step 1
        await expect(page.locator('input[name="ownerName"]')).toBeVisible();
      }
    });
  });

  test.describe("Returning User Flow", () => {
    test("should redirect onboarded user directly to dashboard", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);

      // Login with existing user (who completed onboarding)
      await loginPage.goto();
      await loginPage.loginWithEmail("owner@test.com", "Test@123456");

      // Should go directly to dashboard, not onboarding
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

      const dashboardPage = new DashboardPage(page);
      await dashboardPage.verifyPage();
    });
  });

  test.describe("Dashboard Navigation", () => {
    test("should navigate to all main sections", async ({
      authenticatedOwner: page,
    }) => {
      const dashboardPage = new DashboardPage(page);

      // Verify dashboard loads
      await dashboardPage.verifyPage();

      // Test navigation to each section
      const sections = [
        {
          name: "Appointments",
          method: () => dashboardPage.navigateToAppointments(),
        },
        { name: "Clients", method: () => dashboardPage.navigateToClients() },
        { name: "Services", method: () => dashboardPage.navigateToServices() },
        { name: "Staff", method: () => dashboardPage.navigateToStaff() },
      ];

      for (const section of sections) {
        await section.method();
        await expect(page).toHaveURL(new RegExp(section.name.toLowerCase()));

        // Go back to dashboard
        await page.goto("/dashboard");
      }
    });

    test("should show sidebar on desktop", async ({
      authenticatedOwner: page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      const dashboardPage = new DashboardPage(page);
      await dashboardPage.verifyPage();

      await expect(dashboardPage.sidebar).toBeVisible();
    });

    test("should handle mobile navigation", async ({
      authenticatedOwner: page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const dashboardPage = new DashboardPage(page);
      await dashboardPage.verifyPage();

      // On mobile, sidebar might be hidden behind hamburger menu
      const hamburger = page.locator('[aria-label="Menu"]');
      if (await hamburger.isVisible()) {
        await hamburger.click();
        await expect(dashboardPage.sidebar).toBeVisible();
      }
    });
  });

  test.describe("Data Persistence", () => {
    test("should persist data across page refreshes", async ({
      authenticatedOwner: page,
    }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.verifyPage();

      // Get initial stats
      const initialStats = await dashboardPage.getTodayStats();

      // Refresh page
      await page.reload();

      // Verify data persists
      await dashboardPage.verifyPage();
      const refreshedStats = await dashboardPage.getTodayStats();

      expect(refreshedStats).toEqual(initialStats);
    });
  });

  test.describe("Error Handling", () => {
    test("should handle API errors gracefully", async ({ page }) => {
      // Intercept API and return error
      await page.route("**/api/auth/complete-onboarding", (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ success: false, error: "Server error" }),
        });
      });

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      const uniquePhone = `98765${Math.floor(Math.random() * 100000)}`;
      await loginPage.signUpWithOTP(uniquePhone, "123456");

      // Try to complete onboarding
      await page.fill('input[name="ownerName"]', "Test Owner");
      // ... fill all fields
      await page.click('button:has-text("Complete")');

      // Should show error message
      await expect(page.locator("text=/.*error.*/i")).toBeVisible({
        timeout: 5000,
      });
    });

    test("should handle network errors", async ({ page }) => {
      // Simulate offline
      await page.context().setOffline(true);

      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.emailInput.fill("test@test.com");
      await loginPage.passwordInput.fill("password");
      await loginPage.signInButton.click();

      // Should show network error
      await expect(page.locator("text=/.*network.*error.*/i")).toBeVisible({
        timeout: 5000,
      });

      // Restore connection
      await page.context().setOffline(false);
    });
  });
});
