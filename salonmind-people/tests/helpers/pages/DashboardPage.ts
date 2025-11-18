import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object Model for Dashboard
 */
export class DashboardPage {
  readonly page: Page;

  // Locators
  readonly heading: Locator;
  readonly sidebar: Locator;
  readonly appointmentsLink: Locator;
  readonly clientsLink: Locator;
  readonly servicesLink: Locator;
  readonly staffLink: Locator;
  readonly productsLink: Locator;
  readonly revenueLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.locator('h1:has-text("Dashboard")');
    this.sidebar = page.locator("aside");
    this.appointmentsLink = page.locator('a:has-text("Appointments")');
    this.clientsLink = page.locator('a:has-text("Clients")');
    this.servicesLink = page.locator('a:has-text("Services")');
    this.staffLink = page.locator('a:has-text("Staff")');
    this.productsLink = page.locator('a:has-text("Products")');
    this.revenueLink = page.locator('a:has-text("Revenue")');
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.page.goto("/dashboard");
  }

  /**
   * Verify dashboard is loaded
   */
  async verifyPage() {
    await expect(this.heading).toBeVisible();
    await expect(this.sidebar).toBeVisible();
  }

  /**
   * Navigate to appointments
   */
  async navigateToAppointments() {
    await this.appointmentsLink.click();
    await this.page.waitForURL(/.*appointments/);
  }

  /**
   * Navigate to clients
   */
  async navigateToClients() {
    await this.clientsLink.click();
    await this.page.waitForURL(/.*clients/);
  }

  /**
   * Navigate to services
   */
  async navigateToServices() {
    await this.servicesLink.click();
    await this.page.waitForURL(/.*services/);
  }

  /**
   * Navigate to staff
   */
  async navigateToStaff() {
    await this.staffLink.click();
    await this.page.waitForURL(/.*staff/);
  }

  /**
   * Get today's stats
   */
  async getTodayStats() {
    const stats = {
      appointments: await this.page
        .locator('[data-testid="today-appointments"]')
        .textContent(),
      revenue: await this.page
        .locator('[data-testid="today-revenue"]')
        .textContent(),
      clients: await this.page
        .locator('[data-testid="today-clients"]')
        .textContent(),
    };
    return stats;
  }
}
