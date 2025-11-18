# E2E Testing with Playwright - SalonMind

## 🎯 Overview

This directory contains end-to-end (E2E) tests for the SalonMind application using Playwright. Tests cover complete user flows, authentication, and critical business logic.

## 📁 Structure

```
tests/
├── e2e/                    # E2E test files
│   ├── auth.spec.ts        # Authentication tests
│   └── user-flow.spec.ts   # Complete user journey tests
├── fixtures/               # Test fixtures and setup
│   └── auth.fixture.ts     # Authentication fixtures
├── helpers/                # Test utilities
│   ├── pages/             # Page Object Models
│   │   ├── LoginPage.ts
│   │   └── DashboardPage.ts
│   └── test-utils.ts      # Common test utilities
└── README.md              # This file
```

## 🚀 Running Tests

### Run all tests

```bash
npm test
```

### Run tests in UI mode (recommended for development)

```bash
npm run test:ui
```

### Run tests in headed mode (see browser)

```bash
npm run test:headed
```

### Run tests in debug mode

```bash
npm run test:debug
```

### Run specific browser

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Run mobile tests

```bash
npm run test:mobile
```

### View test report

```bash
npm run test:report
```

### Record new tests (Codegen)

```bash
npm run test:codegen
```

## 🎨 Best Practices Used

### 1. **Page Object Model (POM)**

- Encapsulates page interactions
- Easier to maintain
- Reusable across tests

```typescript
const loginPage = new LoginPage(page);
await loginPage.loginWithEmail("user@test.com", "password");
```

### 2. **Custom Fixtures**

- Pre-authenticated pages
- Test data management
- Clean setup/teardown

```typescript
test("should view dashboard", async ({ authenticatedOwner: page }) => {
  // Page is already logged in and onboarded
});
```

### 3. **Test Utilities**

- Reusable helper functions
- Consistent error handling
- API mocking capabilities

```typescript
await waitForAPI(page, "/api/appointments");
await expectToast(page, "Appointment created");
```

### 4. **Multi-Browser Testing**

- Desktop: Chrome, Firefox, Safari
- Mobile: iOS Safari, Android Chrome
- Tablet: iPad

### 5. **Visual Debugging**

- Screenshots on failure
- Video recordings
- Trace files for debugging

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "../fixtures/auth.fixture";
import { LoginPage } from "../helpers/pages/LoginPage";

test.describe("Feature Name", () => {
  test("should do something", async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.goto();
    await loginPage.loginWithEmail("test@test.com", "password");

    // Assert
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
```

### Using Authenticated Fixtures

```typescript
test("should create appointment", async ({ authenticatedOwner: page }) => {
  // User is already logged in and onboarded
  await page.goto("/appointments");
  await page.click("text=New Appointment");
  // ... continue test
});
```

### Testing with Mock Data

```typescript
import { mockAPI } from "../helpers/test-utils";

test("should handle API error", async ({ page }) => {
  await mockAPI(page, "api/appointments", { error: "Server error" }, 500);

  // ... perform action that triggers API

  await expect(page.locator("text=Server error")).toBeVisible();
});
```

## 🧪 Test Categories

### 1. Authentication Tests (`auth.spec.ts`)

- Email/password login
- OTP login
- Registration
- Session management
- Error handling

### 2. User Flow Tests (`user-flow.spec.ts`)

- Complete onboarding
- Dashboard navigation
- Data persistence
- Error scenarios

### 3. Feature Tests (Create as needed)

- Appointments management
- Client management
- Staff management
- Services & products

## 🎯 Coverage Goals

- ✅ All critical user paths
- ✅ Authentication flows
- ✅ Error scenarios
- ✅ Mobile responsiveness
- ✅ Accessibility basics
- ✅ API error handling

## 🐛 Debugging Failed Tests

### 1. View in UI Mode

```bash
npm run test:ui
```

- See test execution in real-time
- Inspect locators
- View screenshots/videos

### 2. View Trace Files

```bash
npm run test:report
```

- Click on failed test
- View trace timeline
- Inspect network requests

### 3. Debug Mode

```bash
npm run test:debug
```

- Step through test
- Pause execution
- Inspect page state

## 📊 CI/CD Integration

Tests are configured to run automatically in CI with:

- Retries on failure
- Parallel execution disabled
- Screenshots and videos saved
- JSON report generated

## 🔧 Configuration

Edit `playwright.config.ts` to customize:

- Timeouts
- Retries
- Browser options
- Report settings
- Base URL

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## 🚀 Next Steps

1. Run existing tests to verify setup
2. Add tests for appointments feature
3. Add tests for client management
4. Add visual regression tests
5. Set up CI/CD pipeline

## 💡 Tips

- Use `test.only()` to run single test during development
- Use `test.skip()` to temporarily skip tests
- Use `--headed` flag to see browser during development
- Use `--debug` flag to step through tests
- Keep tests independent and isolated
- Use Page Object Model for complex pages
- Mock external APIs for consistent tests
