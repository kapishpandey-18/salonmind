import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object Model for Login Page
 * Encapsulates all login page interactions
 */
export class LoginPage {
  readonly page: Page;

  // Locators
  readonly signInTab: Locator;
  readonly signUpTab: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly phoneInput: Locator;
  readonly signInButton: Locator;
  readonly sendOTPButton: Locator;
  readonly verifyOTPButton: Locator;
  readonly otpInputs: Locator;
  readonly toggleOTPLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with more specific selectors to avoid strict mode violations
    this.signInTab = page.getByRole("tab", { name: "Sign In" });
    this.signUpTab = page.getByRole("tab", { name: "Sign Up" });
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.phoneInput = page.locator('input[type="tel"]');
    this.signInButton = page.getByRole("button", {
      name: "Sign In",
      exact: true,
    });
    this.sendOTPButton = page.getByRole("button", { name: "Send OTP" });
    this.verifyOTPButton = page.getByRole("button", { name: "Verify" });
    this.otpInputs = page.locator('input[inputmode="numeric"]');
    this.toggleOTPLink = page.locator("text=Login with OTP");
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();

    // Wait for navigation
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Login with OTP
   */
  async loginWithOTP(phone: string, otp: string) {
    // Switch to OTP method
    await this.toggleOTPLink.click();

    // Enter phone
    await this.phoneInput.fill(phone);
    await this.sendOTPButton.click();

    // Wait for OTP screen
    await expect(this.page.locator("text=Enter the OTP")).toBeVisible();

    // Enter OTP
    await this.fillOTP(otp);

    // Submit
    await this.verifyOTPButton.click();

    // Wait for navigation
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Sign up with OTP
   */
  async signUpWithOTP(phone: string, otp: string) {
    await this.signUpTab.click();

    // Enter phone
    await this.phoneInput.fill(phone);
    await this.sendOTPButton.click();

    // Wait for OTP screen
    await expect(this.page.locator("text=Enter the OTP")).toBeVisible();

    // Enter OTP
    await this.fillOTP(otp);

    // Submit
    await this.verifyOTPButton.click();

    // Wait for navigation
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Helper to fill OTP inputs
   */
  private async fillOTP(otp: string) {
    for (let i = 0; i < otp.length; i++) {
      await this.otpInputs.nth(i).fill(otp[i]);
    }
  }

  /**
   * Verify login page is displayed
   */
  async verifyPage() {
    await expect(this.page.locator("text=SalonMind")).toBeVisible();
    await expect(this.signInTab).toBeVisible();
    await expect(this.signUpTab).toBeVisible();
  }
}
