# Playwright Visual Regression Configuration Research

Generated: January 16, 2025
Purpose: Fill gap identified in Task 0.7
Priority: IMPORTANT

## Gap Description
Essential for validating no visual breaks during migration. Playwright was mentioned in migration-patterns.md but no specific setup or configuration details were provided.

## Research Findings

### Basic Visual Regression Setup

Playwright includes built-in visual comparison features requiring no additional packages. The framework captures screenshots to establish baselines and compares future results.

```javascript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',
    
    // Screenshot options
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    
    // Visual regression options
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
  },

  // Configure visual regression settings
  expect: {
    // Threshold for pixel differences (0-1, default 0.2)
    toMatchSnapshot: { 
      threshold: 0.2,
      maxDiffPixels: 100,
      animations: 'disabled',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

### Component Visual Regression Tests

```typescript
// tests/visual/components.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to component showcase or Storybook
    await page.goto('/storybook');
  });

  test('Card component visual test', async ({ page }) => {
    await page.goto('/iframe.html?id=ui-card--default');
    
    // Wait for component to be fully rendered
    await page.waitForLoadState('networkidle');
    
    // Take screenshot excluding dynamic content
    await expect(page).toHaveScreenshot('card-default.png', {
      fullPage: false,
      clip: { x: 0, y: 0, width: 400, height: 300 },
      mask: [page.locator('[data-dynamic]')], // Mask dynamic elements
    });
  });

  test('Button variants visual test', async ({ page }) => {
    await page.goto('/iframe.html?id=ui-button--all-variants');
    
    const buttons = page.locator('[data-slot="button"]');
    
    // Test each button variant
    for (let i = 0; i < await buttons.count(); i++) {
      await expect(buttons.nth(i)).toHaveScreenshot(`button-variant-${i}.png`);
    }
  });
});
```

### Baseline Management Strategy

```javascript
// tests/visual/baseline-setup.ts
import { test as setup } from '@playwright/test';
import fs from 'fs-extra';
import path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const BASELINES_DIR = path.join(__dirname, 'screenshots-baseline');

setup('create baseline screenshots', async ({ page }) => {
  // Ensure baseline directory exists
  await fs.ensureDir(BASELINES_DIR);
  
  // List of components to baseline
  const components = [
    { name: 'card', url: '/components/card' },
    { name: 'button', url: '/components/button' },
    { name: 'badge', url: '/components/badge' },
    { name: 'tabs', url: '/components/tabs' },
    { name: 'switch', url: '/components/switch' },
  ];
  
  for (const component of components) {
    await page.goto(component.url);
    await page.waitForLoadState('networkidle');
    
    // Capture baseline
    await page.screenshot({
      path: path.join(BASELINES_DIR, `${component.name}-baseline.png`),
      fullPage: true,
    });
  }
});
```

### CI Integration with GitHub Actions

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests

on:
  pull_request:
    paths:
      - 'components/**'
      - 'app/**/*.css'

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        
      - name: Run dev server
        run: |
          npm run dev &
          npx wait-on http://localhost:3000
          
      - name: Run visual regression tests
        run: npx playwright test tests/visual
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
          
      - name: Upload diff images
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: test-results/
```

### Handling Dynamic Content

```typescript
// tests/visual/helpers.ts
export async function preparePageForScreenshot(page) {
  // Disable animations
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  });
  
  // Hide volatile elements
  await page.addStyleTag({
    content: `
      [data-testid="timestamp"],
      [data-testid="random-content"],
      .advertisement,
      iframe {
        visibility: hidden !important;
      }
    `
  });
  
  // Mock date/time
  await page.addInitScript(() => {
    // Lock date to specific value
    Date.now = () => new Date('2024-01-01T00:00:00Z').getTime();
  });
}

// Usage in tests
test('consistent screenshot with dynamic content', async ({ page }) => {
  await page.goto('/dashboard');
  await preparePageForScreenshot(page);
  
  await expect(page).toHaveScreenshot('dashboard.png', {
    fullPage: true,
    animations: 'disabled',
  });
});
```

### Docker Container for Consistency

```dockerfile
# Dockerfile.playwright
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Run tests in container
CMD ["npx", "playwright", "test", "--reporter=list"]
```

```json
// package.json scripts
{
  "scripts": {
    "test:visual": "playwright test tests/visual",
    "test:visual:docker": "docker build -f Dockerfile.playwright -t playwright-tests . && docker run --rm playwright-tests",
    "test:visual:update": "playwright test tests/visual --update-snapshots"
  }
}
```

## Implementation Guidelines

### Step 1: Initial Setup
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Step 2: Configure Tolerance
```javascript
// For component migration, use strict settings
expect: {
  toMatchSnapshot: {
    threshold: 0.1, // 10% difference tolerance
    maxDiffPixels: 50, // Allow up to 50 pixels difference
  }
}
```

### Step 3: Baseline Creation
```bash
# Create initial baselines
npm run test:visual:update

# Commit baselines
git add tests/visual/**/*.png
git commit -m "test: add visual regression baselines"
```

### Step 4: Integration with Migration
```typescript
// Run before and after migration
test('migration visual comparison', async ({ page }) => {
  // Before migration
  await page.goto('/components/card?version=before');
  const before = await page.screenshot();
  
  // After migration
  await page.goto('/components/card?version=after');
  await expect(page).toHaveScreenshot('card-migrated.png');
  
  // Compare programmatically if needed
  expect(await page.screenshot()).toMatchSnapshot(before);
});
```

## Sources Verified
- [Playwright Visual Testing Guide](https://playwright.dev/docs/test-snapshots) - Official documentation
- [CSS-Tricks Playwright Article](https://css-tricks.com/automated-visual-regression-testing-with-playwright/) - Practical examples
- [Playwright Visual Testing Blog](https://blog.scottlogic.com/2025/02/12/playwright-visual-testing.html) - 2025 best practices