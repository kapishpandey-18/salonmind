import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Custom test fixtures for SalonMind
 * Provides authenticated pages and common test utilities
 */

// Test data
export const testUsers = {
  owner: {
    phone: "+919876543210",
    otp: "123456",
    email: "owner@test.com",
    password: "Test@123456",
  },
  manager: {
    phone: "+919876543211",
    otp: "123456",
    email: "manager@test.com",
    password: "Test@123456",
  },
  staff: {
    phone: "+919876543212",
    otp: "123456",
    email: "staff@test.com",
    password: "Test@123456",
  },
};

export const testSalon = {
  name: "Test Salon",
  email: "salon@test.com",
  phone: "9876543210",
  address: "Test Address",
  city: "Mumbai",
  state: "Maharashtra",
  zipCode: "400001",
  country: "India",
};

// Helper functions
class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with OTP flow
   */
  async loginWithOTP(phone: string, otp: string) {
    await this.page.goto("/");

    // Click Sign Up tab
    await this.page.click('button:has-text("Sign Up")');

    // Enter phone number
    const phoneInput = this.page.locator('input[type="tel"]');
    await phoneInput.fill(phone.replace("+91", ""));

    // Send OTP
    await this.page.click('button:has-text("Send OTP")');

    // Wait for OTP screen
    await this.page.waitForSelector("text=Enter the OTP");

    // Fill OTP
    const otpInputs = this.page.locator('input[inputmode="numeric"]');
    for (let i = 0; i < otp.length; i++) {
      await otpInputs.nth(i).fill(otp[i]);
    }

    // Submit OTP
    await this.page.click('button:has-text("Verify")');

    // Wait for navigation
    await this.page.waitForNavigation();
  }

  /**
   * Login with email/password
   */
  async loginWithEmail(email: string, password: string) {
    await this.page.goto("/");

    // Should be on Sign In by default
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);

    await this.page.click('button:has-text("Sign In")');

    // Wait for navigation
    await this.page.waitForNavigation();
  }

  /**
   * Complete onboarding flow
   */
  async completeOnboarding(data: typeof testSalon & { ownerName: string }) {
    // Should be on onboarding page
    await expect(this.page).toHaveURL(/.*onboarding/);

    // Step 1: Owner Information
    await this.page.fill('input[name="ownerName"]', data.ownerName);
    await this.page.click('button:has-text("Next")');

    // Step 2: Salon Details
    await this.page.fill('input[name="salonName"]', data.name);
    await this.page.fill('input[name="salonEmail"]', data.email);
    await this.page.fill('input[name="salonPhoneNumber"]', data.phone);
    await this.page.click('button:has-text("Next")');

    // Step 3: Address
    await this.page.fill('input[name="salonAddress"]', data.address);
    await this.page.fill('input[name="salonCity"]', data.city);
    await this.page.fill('input[name="salonState"]', data.state);
    await this.page.fill('input[name="salonZipCode"]', data.zipCode);
    await this.page.click('button:has-text("Next")');

    // Continue through remaining steps (adjust based on your actual steps)
    // For now, clicking Next until we reach the end
    for (let i = 0; i < 5; i++) {
      await this.page.click('button:has-text("Next")');
      await this.page.waitForTimeout(500);
    }

    // Submit onboarding
    await this.page.click('button:has-text("Complete")');

    // Wait for dashboard
    await this.page.waitForURL(/.*dashboard/);
  }

  /**
   * Logout
   */
  async logout() {
    // Click profile/menu
    await this.page.click('[aria-label="User menu"]');
    await this.page.click("text=Logout");

    // Should redirect to login
    await this.page.waitForURL("/");
  }
}

// Extend base test with custom fixtures
type CustomFixtures = {
  authHelper: AuthHelper;
  authenticatedPage: Page;
  authenticatedOwner: Page;
};

export const test = base.extend<CustomFixtures>({
  // Auth helper fixture
  authHelper: async ({ page }, use) => {
    const helper = new AuthHelper(page);
    await use(helper);
  },

  // Authenticated page fixture (generic)
  authenticatedPage: async ({ page }, use) => {
    const helper = new AuthHelper(page);
    await helper.loginWithOTP(testUsers.owner.phone, testUsers.owner.otp);
    await use(page);
  },

  // Authenticated owner with completed onboarding
  authenticatedOwner: async ({ page }, use) => {
    const helper = new AuthHelper(page);
    await helper.loginWithOTP(testUsers.owner.phone, testUsers.owner.otp);
    await helper.completeOnboarding({
      ownerName: "Test Owner",
      ...testSalon,
    });
    await use(page);
  },
});

export { expect };
