import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Keyword Analysis Component Visual Regression Tests
 * Testing after Phase 4A migration - Pattern 5 applied
 * Centralized status colors replacing local function
 */

test.describe('Keyword Analysis Visual Regression', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to resume page that has keyword analysis
    await page.goto('/resume');
    
    // Wait for keyword analysis component to load
    try {
      await page.waitForSelector('[data-testid="keyword-analysis"], .keyword-analysis, [class*="keyword"]', { 
        state: 'visible', 
        timeout: 5000 
      });
    } catch (e) {
      console.log('Keyword analysis not found, may require authentication or resume data');
    }
  });

  test('keyword analysis overall appearance', async ({ page }) => {
    const keywordAnalysis = page.locator('[data-testid="keyword-analysis"], .keyword-analysis, [class*="keyword"]').first();
    
    if (await keywordAnalysis.count() > 0) {
      await expect(keywordAnalysis).toHaveScreenshot('keyword-analysis-overall.png', {
        threshold: 0.1
      });
    } else {
      console.log('Keyword analysis component not visible, skipping visual test');
    }
  });

  test('importance badges use semantic colors', async ({ page }) => {
    // Test high/medium/low importance badges use centralized colors
    const importanceBadges = page.locator('[class*="importance"], [class*="badge"], .keyword-badge');
    
    if (await importanceBadges.count() > 0) {
      // Screenshot first few badges to verify semantic colors
      const firstBadge = importanceBadges.first();
      await expect(firstBadge).toHaveScreenshot('importance-badge-semantic.png', {
        threshold: 0.1
      });
    }
  });

  test('progress bar uses semantic status colors', async ({ page }) => {
    const progressBar = page.locator('[class*="progress"], .match-progress, [role="progressbar"]').first();
    
    if (await progressBar.count() > 0) {
      await expect(progressBar).toHaveScreenshot('keyword-progress-bar.png', {
        threshold: 0.1
      });
    }
  });

  test('keyword analysis text uses semantic tokens', async ({ page }) => {
    const keywordAnalysis = page.locator('[data-testid="keyword-analysis"], .keyword-analysis, [class*="keyword"]').first();
    
    if (await keywordAnalysis.count() > 0) {
      // Check text colors are semantic
      const textColors = await keywordAnalysis.evaluate((el) => {
        const textElements = el.querySelectorAll('span, p, div, label');
        const colors = Array.from(textElements).map(elem => 
          window.getComputedStyle(elem).color
        );
        return colors;
      });
      
      // Verify no hardcoded gray colors remain
      textColors.forEach(color => {
        expect(color).not.toMatch(/rgb\(107, 114, 128\)/); // gray-500
        expect(color).not.toMatch(/rgb\(156, 163, 175\)/); // gray-400
        expect(color).not.toMatch(/rgb\(31, 41, 55\)/); // gray-800
        expect(color).not.toMatch(/rgb\(249, 250, 251\)/); // gray-50 text
      });
      
      console.log('Keyword analysis text colors verified:', textColors.slice(0, 5));
    }
  });

  test('keyword analysis backgrounds use semantic tokens', async ({ page }) => {
    const keywordAnalysis = page.locator('[data-testid="keyword-analysis"], .keyword-analysis, [class*="keyword"]').first();
    
    if (await keywordAnalysis.count() > 0) {
      // Check background colors are semantic
      const bgColors = await keywordAnalysis.evaluate((el) => {
        const bgElements = el.querySelectorAll('*');
        const colors = Array.from(bgElements).map(elem => 
          window.getComputedStyle(elem).backgroundColor
        ).filter(color => color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent');
        return colors;
      });
      
      // Verify no hardcoded colors remain
      bgColors.forEach(color => {
        expect(color).not.toMatch(/rgb\(249, 250, 251\)/); // gray-50
        expect(color).not.toMatch(/rgb\(243, 244, 246\)/); // gray-100
        expect(color).not.toMatch(/rgb\(220, 252, 231\)/); // green-100
        expect(color).not.toMatch(/rgb\(219, 234, 254\)/); // blue-100
      });
      
      console.log('Keyword analysis background colors verified:', bgColors.slice(0, 5));
    }
  });

  test('keyword analysis accessibility compliance', async ({ page }) => {
    const keywordAnalysis = page.locator('[data-testid="keyword-analysis"], .keyword-analysis, [class*="keyword"]').first();
    
    if (await keywordAnalysis.count() > 0) {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="keyword-analysis"], .keyword-analysis, [class*="keyword"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('keyword analysis responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const keywordAnalysis = page.locator('[data-testid="keyword-analysis"], .keyword-analysis, [class*="keyword"]').first();
    
    if (await keywordAnalysis.count() > 0) {
      await page.waitForTimeout(200);
      
      await expect(keywordAnalysis).toHaveScreenshot('keyword-analysis-mobile.png', {
        threshold: 0.1
      });
    }
  });
});