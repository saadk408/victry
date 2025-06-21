import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * E2E Test Configuration for Critical User Flows
 * Based on risk assessment and migration patterns
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Disable animations for consistent testing
    launchOptions: {
      args: ['--force-prefers-reduced-motion']
    },
  },

  // Visual regression settings based on risk levels
  expect: {
    toMatchSnapshot: {
      // Default 10% tolerance for medium-risk components
      threshold: 0.1,
      maxDiffPixels: 100,
      animations: 'disabled',
    },
  },

  projects: [
    // Desktop Chrome - Primary testing browser
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Custom viewport for consistent testing
        viewport: { width: 1280, height: 720 },
      },
    },

    // Mobile Safari - Critical for responsive testing
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 13'],
        // Ensure mobile viewport
        viewport: { width: 375, height: 667 },
      },
    },

    // Tablet - Important for layout testing
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 },
      },
    },

    // High-risk component testing with stricter tolerances
    {
      name: 'high-risk',
      testMatch: /high-risk\.test\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        // 5% tolerance for high-risk components (tabs, switch)
        screenshot: {
          mode: 'on',
          fullPage: false,
        },
      },
      expect: {
        toMatchSnapshot: {
          threshold: 0.05,
          maxDiffPixels: 50,
        },
      },
    },

    // Accessibility testing
    {
      name: 'accessibility',
      testMatch: /\.a11y\.test\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        // Force high contrast mode for accessibility testing
        colorScheme: 'dark',
        launchOptions: {
          args: ['--force-high-contrast'],
        },
      },
    },
  ],

  // Automatically start dev server if not running
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

// Risk-based test configuration helper
export const testConfig = {
  // Component risk levels from risk assessment
  riskLevels: {
    high: {
      components: ['tabs', 'switch'],
      tolerance: 0.05,
      retries: 2,
    },
    medium: {
      components: ['card', 'textarea', 'popover'],
      tolerance: 0.1,
      retries: 1,
    },
    low: {
      components: ['progress', 'alert'],
      tolerance: 0.15,
      retries: 0,
    },
  },

  // Critical user flows that must pass
  criticalFlows: [
    'authentication',
    'resume-creation',
    'ai-analysis',
  ],

  // Performance budgets
  performanceBudgets: {
    firstContentfulPaint: 2000,
    largestContentfulPaint: 2500,
    totalBlockingTime: 300,
    cumulativeLayoutShift: 0.1,
  },

  // Accessibility standards
  a11yStandards: {
    standard: 'WCAG2AA',
    rules: {
      'color-contrast': { enabled: true },
      'focus-visible': { enabled: true },
      'aria-roles': { enabled: true },
      'keyboard-navigation': { enabled: true },
    },
  },
};