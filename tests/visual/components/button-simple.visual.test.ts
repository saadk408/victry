import { test, expect } from '@playwright/test';

/**
 * Simple Button Visual Test - Validates Testing Infrastructure
 */
test.describe('Button Visual Test - Infrastructure Validation', () => {
  
  test('sign-in button visual test', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/sign-in');
    
    // Wait for form to be loaded
    await page.waitForSelector('form', { state: 'visible' });
    
    // Find the sign-in button
    const signInButton = page.locator('button[type="submit"]');
    
    // Take screenshot for visual comparison
    await expect(signInButton).toHaveScreenshot('sign-in-button.png', {
      threshold: 0.1
    });
  });
  
  test('page visual regression test', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      threshold: 0.1
    });
  });
});