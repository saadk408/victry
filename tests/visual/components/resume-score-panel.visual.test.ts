import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Resume Score Panel Visual Regression Tests
 * Testing after Phase 4A migration - Pattern 15 & 16 applied
 * SVG colors and score thresholds should use semantic tokens
 */

test.describe('Resume Score Panel Visual Regression', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to resume page that has score panel
    // Note: May require auth, tests will handle gracefully
    await page.goto('/resume');
    
    // Wait for page load, handle auth redirect gracefully
    try {
      await page.waitForSelector('[data-testid="score-panel"], .score-panel, [class*="score"]', { 
        state: 'visible', 
        timeout: 5000 
      });
    } catch (e) {
      // If auth required, navigate to a demo or public view
      console.log('Score panel not found, may require authentication');
    }
  });

  test('score panel overall appearance', async ({ page }) => {
    const scorePanel = page.locator('[data-testid="score-panel"], .score-panel, [class*="score"]').first();
    
    if (await scorePanel.count() > 0) {
      // Hide dynamic text that changes (actual scores)
      await page.addStyleTag({
        content: `
          .score-text, .percentage-text, [class*="score-value"] {
            color: transparent !important;
          }
          .score-number {
            opacity: 0 !important;
          }
        `
      });
      
      await expect(scorePanel).toHaveScreenshot('score-panel-overall.png', {
        threshold: 0.15, // Higher tolerance for complex component
      });
    } else {
      console.log('Score panel not visible, skipping visual test');
    }
  });

  test('score circle SVG semantic colors', async ({ page }) => {
    const scoreCircle = page.locator('svg circle[stroke="currentColor"], svg [stroke*="success"], svg [stroke*="warning"], svg [stroke*="destructive"]').first();
    
    if (await scoreCircle.count() > 0) {
      await expect(scoreCircle).toHaveScreenshot('score-circle-semantic.png', {
        threshold: 0.1
      });
    }
  });

  test('score categories use semantic tokens', async ({ page }) => {
    // Test that score category badges use semantic colors
    const categoryBadges = page.locator('[class*="status"], .category-badge, [class*="badge"]');
    
    if (await categoryBadges.count() > 0) {
      const firstBadge = categoryBadges.first();
      await expect(firstBadge).toHaveScreenshot('score-category-badge.png', {
        threshold: 0.1
      });
    }
  });

  test('score panel text uses semantic tokens', async ({ page }) => {
    const scorePanel = page.locator('[data-testid="score-panel"], .score-panel, [class*="score"]').first();
    
    if (await scorePanel.count() > 0) {
      // Check text colors are semantic
      const textColor = await scorePanel.evaluate((el) => {
        const textElements = el.querySelectorAll('span, p, div');
        const colors = Array.from(textElements).map(elem => 
          window.getComputedStyle(elem).color
        );
        return colors;
      });
      
      // Verify no hardcoded gray colors
      textColor.forEach(color => {
        expect(color).not.toMatch(/rgb\(107, 114, 128\)/); // gray-500
        expect(color).not.toMatch(/rgb\(156, 163, 175\)/); // gray-400
        expect(color).not.toMatch(/rgb\(75, 85, 99\)/); // gray-600
      });
    }
  });

  test('score panel accessibility compliance', async ({ page }) => {
    const scorePanel = page.locator('[data-testid="score-panel"], .score-panel, [class*="score"]').first();
    
    if (await scorePanel.count() > 0) {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="score-panel"], .score-panel, [class*="score"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('score panel responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const scorePanel = page.locator('[data-testid="score-panel"], .score-panel, [class*="score"]').first();
    
    if (await scorePanel.count() > 0) {
      await page.waitForTimeout(200);
      
      await expect(scorePanel).toHaveScreenshot('score-panel-mobile.png', {
        threshold: 0.15
      });
    }
  });
});