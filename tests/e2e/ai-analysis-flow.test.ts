import { test, expect } from '@playwright/test';

// Test configuration for AI analysis features
test.describe('AI Analysis Features E2E Tests', () => {
  // Assume user is logged in with premium subscription
  test.use({ storageState: './tests/visual/auth.setup.ts' });

  test.beforeEach(async ({ page }) => {
    // Navigate to resume editor with AI features
    await page.goto('/resume/edit/test-resume-id');
  });

  test.describe('ATS Score Analysis', () => {
    test('should calculate and display ATS score', async ({ page }) => {
      // Click on ATS Score panel
      await page.getByRole('button', { name: /ats score/i }).click();
      
      // Should show score calculation
      await expect(page.locator('[data-ats-score]')).toBeVisible();
      
      // Score should be between 0-100
      const scoreText = await page.locator('[data-ats-score]').textContent();
      const score = parseInt(scoreText || '0');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      
      // Should show score breakdown
      await expect(page.getByText(/keyword optimization/i)).toBeVisible();
      await expect(page.getByText(/formatting/i)).toBeVisible();
      await expect(page.getByText(/content quality/i)).toBeVisible();
    });

    test('should provide improvement suggestions', async ({ page }) => {
      // Open ATS analysis
      await page.getByRole('button', { name: /ats score/i }).click();
      
      // Click on suggestions
      await page.getByRole('button', { name: /view suggestions/i }).click();
      
      // Should show improvement suggestions
      const suggestions = page.locator('[data-suggestions-list]');
      await expect(suggestions).toBeVisible();
      
      // Should have at least one suggestion
      const suggestionItems = suggestions.locator('[data-suggestion-item]');
      await expect(suggestionItems).toHaveCount(1, { timeout: 5000 });
      
      // Suggestion should have actionable content
      const firstSuggestion = suggestionItems.first();
      await expect(firstSuggestion).toContainText(/add|improve|include|optimize/i);
    });

    test('should update score in real-time', async ({ page }) => {
      // Get initial ATS score
      await page.getByRole('button', { name: /ats score/i }).click();
      const initialScoreElement = page.locator('[data-ats-score]');
      const initialScore = parseInt(await initialScoreElement.textContent() || '0');
      
      // Add a skill to improve score
      const skillsSection = page.locator('[data-section="skills"]');
      const skillInput = skillsSection.getByPlaceholder('Add a skill');
      await skillInput.fill('Project Management');
      await skillInput.press('Enter');
      
      // Wait for score update
      await page.waitForTimeout(2000); // Allow time for recalculation
      
      // Score should have changed
      const updatedScore = parseInt(await initialScoreElement.textContent() || '0');
      expect(updatedScore).not.toBe(initialScore);
    });
  });

  test.describe('Job Matching', () => {
    test('should analyze job posting and match resume', async ({ page }) => {
      // Click job match button
      await page.getByRole('button', { name: /job match|match job/i }).click();
      
      // Paste job description
      const jobDescriptionInput = page.getByPlaceholder(/paste job description/i);
      await jobDescriptionInput.fill(`
        Senior Software Engineer
        Requirements:
        - 5+ years of experience in software development
        - Strong proficiency in JavaScript, React, and Node.js
        - Experience with cloud platforms (AWS, GCP)
        - Excellent problem-solving skills
      `);
      
      // Analyze match
      await page.getByRole('button', { name: /analyze match/i }).click();
      
      // Should show match percentage
      await expect(page.locator('[data-match-score]')).toBeVisible({ timeout: 10000 });
      
      // Should show matched keywords
      await expect(page.getByText(/matched keywords/i)).toBeVisible();
      await expect(page.locator('[data-matched-keywords]')).toBeVisible();
      
      // Should show missing keywords
      await expect(page.getByText(/missing keywords/i)).toBeVisible();
      await expect(page.locator('[data-missing-keywords]')).toBeVisible();
    });

    test('should provide tailoring suggestions', async ({ page }) => {
      // Perform job match first
      await page.getByRole('button', { name: /job match/i }).click();
      await page.getByPlaceholder(/paste job description/i).fill('Software Engineer role requiring React expertise');
      await page.getByRole('button', { name: /analyze match/i }).click();
      
      // Wait for analysis
      await expect(page.locator('[data-match-score]')).toBeVisible({ timeout: 10000 });
      
      // Click tailoring suggestions
      await page.getByRole('button', { name: /tailor resume|get suggestions/i }).click();
      
      // Should show tailoring suggestions
      const suggestions = page.locator('[data-tailoring-suggestions]');
      await expect(suggestions).toBeVisible();
      
      // Should have specific suggestions
      await expect(suggestions).toContainText(/add|emphasize|highlight|include/i);
    });
  });

  test.describe('AI Content Generation', () => {
    test('should generate professional summary', async ({ page }) => {
      // Navigate to summary section
      const summarySection = page.locator('[data-section="summary"]');
      
      // Click AI generate button
      await summarySection.getByRole('button', { name: /generate with ai|ai write/i }).click();
      
      // Should show generation options or modal
      await expect(page.locator('[data-ai-generator]')).toBeVisible();
      
      // Select tone/style if available
      const toneSelector = page.locator('[data-tone-selector]');
      if (await toneSelector.isVisible()) {
        await toneSelector.selectOption('professional');
      }
      
      // Generate content
      await page.getByRole('button', { name: /generate/i }).click();
      
      // Should show generated content
      await expect(page.locator('[data-generated-content]')).toBeVisible({ timeout: 15000 });
      
      // Should be able to accept or reject
      await expect(page.getByRole('button', { name: /accept|use this/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /regenerate|try again/i })).toBeVisible();
    });

    test('should enhance bullet points', async ({ page }) => {
      // Add a basic bullet point to experience
      const experienceSection = page.locator('[data-section="experience"]');
      const bulletInput = experienceSection.locator('textarea').first();
      await bulletInput.fill('Developed web applications');
      
      // Click enhance button
      await experienceSection.getByRole('button', { name: /enhance|improve with ai/i }).click();
      
      // Should show enhanced version
      await expect(page.locator('[data-enhanced-content]')).toBeVisible({ timeout: 10000 });
      
      // Enhanced content should be more detailed
      const enhancedText = await page.locator('[data-enhanced-content]').textContent();
      expect(enhancedText?.length).toBeGreaterThan(30);
      expect(enhancedText).toMatch(/developed|built|created/i);
    });

    test('should suggest action verbs', async ({ page }) => {
      // Focus on experience description
      const experienceSection = page.locator('[data-section="experience"]');
      const descriptionField = experienceSection.locator('textarea').first();
      await descriptionField.click();
      
      // Type weak verb
      await descriptionField.fill('Was responsible for team projects');
      
      // Should show action verb suggestions
      const suggestions = page.locator('[data-action-verb-suggestions]');
      if (await suggestions.isVisible({ timeout: 2000 })) {
        // Click a suggestion
        await suggestions.locator('button').first().click();
        
        // Text should be updated
        const updatedText = await descriptionField.inputValue();
        expect(updatedText).toMatch(/led|managed|directed|oversaw/i);
      }
    });
  });

  test.describe('Keyword Optimization', () => {
    test('should analyze and suggest keywords', async ({ page }) => {
      // Open keyword analyzer
      await page.getByRole('button', { name: /keyword.*analysis/i }).click();
      
      // Should show current keywords
      await expect(page.locator('[data-current-keywords]')).toBeVisible();
      
      // Paste target job description
      const jobInput = page.getByPlaceholder(/target job description/i);
      if (await jobInput.isVisible()) {
        await jobInput.fill('Senior React Developer with TypeScript experience');
        await page.getByRole('button', { name: /analyze/i }).click();
      }
      
      // Should show keyword recommendations
      await expect(page.locator('[data-keyword-recommendations]')).toBeVisible({ timeout: 10000 });
      
      // Should categorize keywords
      await expect(page.getByText(/technical skills/i)).toBeVisible();
      await expect(page.getByText(/soft skills/i)).toBeVisible();
    });

    test('should highlight keyword density', async ({ page }) => {
      // Enable keyword highlighting
      const highlightToggle = page.locator('[data-keyword-highlight-toggle]');
      if (await highlightToggle.isVisible()) {
        await highlightToggle.click();
      }
      
      // Keywords should be highlighted in resume
      const highlightedKeywords = page.locator('[data-keyword-highlight]');
      await expect(highlightedKeywords).toHaveCount(1, { timeout: 5000 });
      
      // Hover over keyword to see density
      await highlightedKeywords.first().hover();
      
      // Should show tooltip with frequency
      const tooltip = page.locator('[role="tooltip"]');
      if (await tooltip.isVisible({ timeout: 2000 })) {
        await expect(tooltip).toContainText(/appears|frequency|times/i);
      }
    });
  });

  test.describe('AI Tailoring Controls', () => {
    test('should toggle AI assistance features', async ({ page }) => {
      // Open AI settings
      await page.getByRole('button', { name: /ai settings|ai controls/i }).click();
      
      // Should show toggle switches
      const aiPanel = page.locator('[data-ai-settings-panel]');
      await expect(aiPanel).toBeVisible();
      
      // Toggle real-time suggestions
      const realtimeToggle = aiPanel.locator('[data-toggle="realtime-suggestions"]');
      await realtimeToggle.click();
      
      // Setting should be saved
      await page.reload();
      await page.getByRole('button', { name: /ai settings/i }).click();
      await expect(realtimeToggle).toHaveAttribute('aria-checked', 'true');
    });

    test('should respect AI feature preferences', async ({ page }) => {
      // Disable AI suggestions
      await page.getByRole('button', { name: /ai settings/i }).click();
      await page.locator('[data-toggle="ai-suggestions"]').click();
      
      // Close settings
      await page.keyboard.press('Escape');
      
      // AI buttons should be hidden or disabled
      const aiButtons = page.locator('button:has-text("AI"), button:has-text("Generate")');
      for (const button of await aiButtons.all()) {
        const isDisabled = await button.isDisabled();
        const isHidden = await button.isHidden();
        expect(isDisabled || isHidden).toBe(true);
      }
    });
  });

  test.describe('Premium Features Gate', () => {
    test('should show upgrade prompt for non-premium users', async ({ page, context }) => {
      // Clear premium status from storage state
      await context.addCookies([{ name: 'subscription_tier', value: 'free', domain: 'localhost', path: '/' }]);
      
      await page.goto('/resume/edit/test-resume-id');
      
      // Try to access AI features
      await page.getByRole('button', { name: /ai|generate/i }).first().click();
      
      // Should show upgrade modal
      await expect(page.getByText(/upgrade to premium/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /upgrade now/i })).toBeVisible();
    });
  });

  test.describe('Responsive AI Features', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // AI features should be accessible via mobile menu
      const mobileAIButton = page.getByRole('button', { name: /ai features/i });
      await expect(mobileAIButton).toBeVisible();
      
      await mobileAIButton.click();
      
      // Should show AI options in mobile-friendly format
      await expect(page.getByRole('button', { name: /ats score/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /job match/i })).toBeVisible();
    });

    test('should adapt AI panels for tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Open ATS score panel
      await page.getByRole('button', { name: /ats score/i }).click();
      
      // Panel should be appropriately sized
      const panel = page.locator('[data-ats-panel]');
      const box = await panel.boundingBox();
      
      // Should not take full width on tablet
      expect(box?.width).toBeLessThan(700);
    });
  });
});