import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Button Component Visual Regression Tests
 * Testing UI button component during dark mode removal migration
 */

test.describe('Button Visual Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to sign-in page which has buttons without auth requirement
    await page.goto('/sign-in');
    
    // Wait for page to be fully loaded
    await page.waitForSelector('form', { state: 'visible' });
    await page.waitForTimeout(500);
  });

  test('primary button visual comparison', async ({ page }) => {
    // Look for primary buttons on dashboard
    const primaryButton = page.locator('button').filter({ hasText: 'Create Resume' }).first();
    
    if (await primaryButton.count() > 0) {
      await expect(primaryButton).toHaveScreenshot('button-primary-default.png', {
        threshold: 0.1
      });
    } else {
      // Fallback to any primary-styled button
      const button = page.locator('button[class*="primary"], button[class*="bg-primary"]').first();
      await expect(button).toHaveScreenshot('button-primary-default.png', {
        threshold: 0.1
      });
    }
  });

  test('secondary button visual comparison', async ({ page }) => {
    // Look for secondary buttons 
    const secondaryButton = page.locator('button[class*="secondary"], button[class*="variant"]').first();
    
    if (await secondaryButton.count() > 0) {
      await expect(secondaryButton).toHaveScreenshot('button-secondary-default.png', {
        threshold: 0.1
      });
    }
  });

  test('button hover state visual comparison', async ({ page }) => {
    const button = page.locator('button').first();
    
    // Trigger hover state
    await button.hover();
    await page.waitForTimeout(100);
    
    await expect(button).toHaveScreenshot('button-hover.png', {
      threshold: 0.1
    });
  });

  test('button focus state visual comparison', async ({ page }) => {
    const button = page.locator('button').first();
    
    // Trigger focus state
    await button.focus();
    await page.waitForTimeout(100);
    
    await expect(button).toHaveScreenshot('button-focus.png', {
      threshold: 0.1
    });
  });

  test('disabled button visual comparison', async ({ page }) => {
    // Navigate to sign-in page which has disabled states
    await page.goto('/sign-in');
    await page.waitForSelector('form', { state: 'visible' });
    
    const submitButton = page.locator('button[type="submit"]');
    
    // Button should be disabled when form is empty
    await expect(submitButton).toHaveScreenshot('button-disabled.png', {
      threshold: 0.1
    });
  });

  test('button accessibility compliance', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('button')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('button responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const button = page.locator('button').first();
    await page.waitForTimeout(200);
    
    await expect(button).toHaveScreenshot('button-mobile.png', {
      threshold: 0.1
    });
  });

  test('button semantic token compliance', async ({ page }) => {
    const button = page.locator('button').first();
    
    // Get computed styles
    const backgroundColor = await button.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    const color = await button.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // Verify no hardcoded colors (should use semantic tokens)
    expect(backgroundColor).not.toMatch(/rgb\(243, 244, 246\)/); // gray-50
    expect(backgroundColor).not.toMatch(/rgb\(255, 255, 255\)/); // white
    expect(color).not.toMatch(/rgb\(17, 24, 39\)/); // gray-900
    
    console.log(`Button colors - Background: ${backgroundColor}, Text: ${color}`);
  });
});