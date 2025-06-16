import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Component Migration Test Template
 * Use this template for testing UI components during dark mode removal migration
 * 
 * Instructions:
 * 1. Copy this file and rename to [component-name].visual.test.ts
 * 2. Replace COMPONENT_NAME with actual component name
 * 3. Update component selectors and test scenarios
 * 4. Adjust tolerance levels based on component risk level
 */

// Component configuration
const COMPONENT_NAME = 'REPLACE_WITH_COMPONENT_NAME';
const COMPONENT_SELECTOR = '[data-testid="REPLACE_WITH_SELECTOR"]';
const COMPONENT_PAGE = '/REPLACE_WITH_PAGE_PATH';

// Risk-based tolerance levels (from migration-patterns.md)
const TOLERANCE_LEVELS = {
  high: 0.05,    // 5% for high-risk components (tabs, switch, etc.)
  medium: 0.10,  // 10% for medium-risk components  
  low: 0.15      // 15% for low-risk components
};

// Set component risk level here
const COMPONENT_RISK = 'medium'; // Change to 'high', 'medium', or 'low'

test.describe(`${COMPONENT_NAME} Visual Regression Tests`, () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to page containing the component
    await page.goto(COMPONENT_PAGE);
    
    // Wait for component to be fully loaded
    await page.waitForSelector(COMPONENT_SELECTOR, { state: 'visible' });
    
    // Wait for any animations or dynamic content to settle
    await page.waitForTimeout(500);
  });

  test('default state visual comparison', async ({ page }) => {
    const component = page.locator(COMPONENT_SELECTOR);
    
    await expect(component).toHaveScreenshot(`${COMPONENT_NAME}-default.png`, {
      threshold: TOLERANCE_LEVELS[COMPONENT_RISK as keyof typeof TOLERANCE_LEVELS]
    });
  });

  test('hover state visual comparison', async ({ page }) => {
    const component = page.locator(COMPONENT_SELECTOR);
    
    // Trigger hover state
    await component.hover();
    await page.waitForTimeout(100); // Allow hover animation
    
    await expect(component).toHaveScreenshot(`${COMPONENT_NAME}-hover.png`, {
      threshold: TOLERANCE_LEVELS[COMPONENT_RISK as keyof typeof TOLERANCE_LEVELS]
    });
  });

  test('focus state visual comparison', async ({ page }) => {
    const component = page.locator(COMPONENT_SELECTOR);
    
    // Trigger focus state
    await component.focus();
    await page.waitForTimeout(100); // Allow focus animation
    
    await expect(component).toHaveScreenshot(`${COMPONENT_NAME}-focus.png`, {
      threshold: TOLERANCE_LEVELS[COMPONENT_RISK as keyof typeof TOLERANCE_LEVELS]
    });
  });

  test('disabled state visual comparison', async ({ page }) => {
    // Skip if component doesn't support disabled state
    const disabledComponent = page.locator(`${COMPONENT_SELECTOR}[disabled], ${COMPONENT_SELECTOR}[aria-disabled="true"]`);
    
    if (await disabledComponent.count() > 0) {
      await expect(disabledComponent).toHaveScreenshot(`${COMPONENT_NAME}-disabled.png`, {
        threshold: TOLERANCE_LEVELS[COMPONENT_RISK as keyof typeof TOLERANCE_LEVELS]
      });
    } else {
      test.skip('Component does not support disabled state');
    }
  });

  test('accessibility compliance validation', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include(COMPONENT_SELECTOR)
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('responsive design - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const component = page.locator(COMPONENT_SELECTOR);
    await page.waitForTimeout(200); // Allow responsive reflow
    
    await expect(component).toHaveScreenshot(`${COMPONENT_NAME}-mobile.png`, {
      threshold: TOLERANCE_LEVELS[COMPONENT_RISK as keyof typeof TOLERANCE_LEVELS]
    });
  });

  test('responsive design - tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const component = page.locator(COMPONENT_SELECTOR);
    await page.waitForTimeout(200); // Allow responsive reflow
    
    await expect(component).toHaveScreenshot(`${COMPONENT_NAME}-tablet.png`, {
      threshold: TOLERANCE_LEVELS[COMPONENT_RISK as keyof typeof TOLERANCE_LEVELS]
    });
  });

  test('integration with parent components', async ({ page }) => {
    // Test component within its parent context
    const parentSelector = `${COMPONENT_SELECTOR}`.replace(/\[data-testid="[^"]*"\]/, '').trim() || 'body';
    const parent = page.locator(parentSelector).first();
    
    await expect(parent).toHaveScreenshot(`${COMPONENT_NAME}-integration.png`, {
      threshold: TOLERANCE_LEVELS[COMPONENT_RISK as keyof typeof TOLERANCE_LEVELS]
    });
  });

  test('performance regression check', async ({ page }) => {
    // Measure component rendering performance
    const startTime = Date.now();
    
    await page.reload();
    await page.waitForSelector(COMPONENT_SELECTOR, { state: 'visible' });
    
    const renderTime = Date.now() - startTime;
    
    // Assert rendering completes within reasonable time (adjust as needed)
    expect(renderTime).toBeLessThan(3000); // 3 seconds max
  });

  test('semantic token compliance', async ({ page }) => {
    // Check that component uses semantic color tokens, not hardcoded colors
    const component = page.locator(COMPONENT_SELECTOR);
    
    // Get computed styles
    const backgroundColor = await component.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    const color = await component.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // Verify no hardcoded gray colors are used (should use semantic tokens)
    expect(backgroundColor).not.toMatch(/rgb\(243, 244, 246\)/); // gray-50
    expect(backgroundColor).not.toMatch(/rgb\(255, 255, 255\)/); // white
    expect(color).not.toMatch(/rgb\(17, 24, 39\)/); // gray-900
    
    console.log(`Component colors - Background: ${backgroundColor}, Text: ${color}`);
  });
});

/**
 * Additional test scenarios for specific component types:
 * 
 * For Form Components:
 * - Error state visual comparison
 * - Valid state visual comparison
 * - Required field indicators
 * 
 * For Interactive Components:
 * - Active/pressed state
 * - Loading state
 * - Success/error feedback states
 * 
 * For Navigation Components:
 * - Selected/current page indicator
 * - Breadcrumb states
 * - Menu open/closed states
 * 
 * For Data Components:
 * - Empty state
 * - Loading state
 * - Error state
 * - Pagination states
 */