import { test, expect } from '@playwright/test';

// Test configuration for resume creation flows
test.describe('Resume Creation Flow E2E Tests', () => {
  // Assume user is already logged in for these tests
  test.use({ storageState: './tests/visual/auth.setup.ts' });

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
  });

  test.describe('Create New Resume', () => {
    test('should create a new resume from scratch', async ({ page }) => {
      // Click create new resume button
      await page.getByRole('button', { name: /create new resume/i }).click();
      
      // Should navigate to resume editor
      await expect(page).toHaveURL(/\/resume\/edit/);
      
      // Fill in basic information
      await page.getByPlaceholder('Your Name').fill('John Doe');
      await page.getByPlaceholder('Email').fill('john.doe@example.com');
      await page.getByPlaceholder('Phone').fill('(555) 123-4567');
      await page.getByPlaceholder('Location').fill('San Francisco, CA');
      
      // Add professional summary
      const summarySection = page.locator('[data-section="summary"]');
      await summarySection.getByRole('button', { name: /add summary/i }).click();
      await summarySection.locator('textarea').fill('Experienced software engineer with 5+ years of expertise in full-stack development.');
      
      // Save the resume
      await page.getByRole('button', { name: /save/i }).click();
      
      // Should show success message
      await expect(page.getByText(/resume saved successfully/i)).toBeVisible({ timeout: 5000 });
    });

    test('should create resume from template', async ({ page }) => {
      // Navigate to templates
      await page.getByRole('link', { name: /templates/i }).click();
      
      // Select a template
      const templateCard = page.locator('[data-template]').first();
      await templateCard.click();
      
      // Preview template
      await expect(page.getByRole('button', { name: /use this template/i })).toBeVisible();
      await page.getByRole('button', { name: /use this template/i }).click();
      
      // Should navigate to editor with template loaded
      await expect(page).toHaveURL(/\/resume\/edit/);
      
      // Verify template content is loaded
      await expect(page.locator('[data-section="experience"]')).toBeVisible();
      await expect(page.locator('[data-section="education"]')).toBeVisible();
      await expect(page.locator('[data-section="skills"]')).toBeVisible();
    });
  });

  test.describe('Resume Editor Features', () => {
    test('should add work experience', async ({ page }) => {
      // Navigate to existing resume
      await page.goto('/resume/edit/test-resume-id');
      
      // Add work experience
      const experienceSection = page.locator('[data-section="experience"]');
      await experienceSection.getByRole('button', { name: /add experience/i }).click();
      
      // Fill in experience details
      await page.getByLabel('Job Title').fill('Senior Software Engineer');
      await page.getByLabel('Company').fill('Tech Corp');
      await page.getByLabel('Location').fill('San Francisco, CA');
      await page.getByLabel('Start Date').fill('2020-01');
      await page.getByLabel('End Date').fill('2023-12');
      
      // Add job description
      await page.getByLabel('Description').fill('• Led development of microservices architecture\n• Mentored junior developers\n• Improved system performance by 40%');
      
      // Save the experience
      await page.getByRole('button', { name: /save experience/i }).click();
      
      // Verify experience was added
      await expect(experienceSection.getByText('Senior Software Engineer')).toBeVisible();
      await expect(experienceSection.getByText('Tech Corp')).toBeVisible();
    });

    test('should add education', async ({ page }) => {
      await page.goto('/resume/edit/test-resume-id');
      
      const educationSection = page.locator('[data-section="education"]');
      await educationSection.getByRole('button', { name: /add education/i }).click();
      
      // Fill in education details
      await page.getByLabel('Degree').fill('Bachelor of Science in Computer Science');
      await page.getByLabel('School').fill('University of California, Berkeley');
      await page.getByLabel('Graduation Date').fill('2019-05');
      await page.getByLabel('GPA').fill('3.8');
      
      await page.getByRole('button', { name: /save education/i }).click();
      
      // Verify education was added
      await expect(educationSection.getByText('Bachelor of Science')).toBeVisible();
      await expect(educationSection.getByText('University of California')).toBeVisible();
    });

    test('should add and manage skills', async ({ page }) => {
      await page.goto('/resume/edit/test-resume-id');
      
      const skillsSection = page.locator('[data-section="skills"]');
      
      // Add skills
      const skillInput = skillsSection.getByPlaceholder('Add a skill');
      await skillInput.fill('JavaScript');
      await skillInput.press('Enter');
      
      await skillInput.fill('React');
      await skillInput.press('Enter');
      
      await skillInput.fill('Node.js');
      await skillInput.press('Enter');
      
      // Verify skills were added
      await expect(skillsSection.getByText('JavaScript')).toBeVisible();
      await expect(skillsSection.getByText('React')).toBeVisible();
      await expect(skillsSection.getByText('Node.js')).toBeVisible();
      
      // Remove a skill
      await skillsSection.getByText('React').locator('..').getByRole('button', { name: /remove/i }).click();
      
      // Verify skill was removed
      await expect(skillsSection.getByText('React')).not.toBeVisible();
    });

    test('should reorder sections', async ({ page }) => {
      await page.goto('/resume/edit/test-resume-id');
      
      // Find drag handles
      const experienceHandle = page.locator('[data-section="experience"] [data-drag-handle]');
      const educationHandle = page.locator('[data-section="education"] [data-drag-handle]');
      
      // Get initial positions
      const experienceBox = await experienceHandle.boundingBox();
      const educationBox = await educationHandle.boundingBox();
      
      if (experienceBox && educationBox) {
        // Drag experience section below education
        await experienceHandle.dragTo(educationHandle);
        
        // Verify order changed
        const newExperienceBox = await experienceHandle.boundingBox();
        expect(newExperienceBox?.y).toBeGreaterThan(educationBox.y);
      }
    });
  });

  test.describe('Resume Preview and Export', () => {
    test('should preview resume in different formats', async ({ page }) => {
      await page.goto('/resume/edit/test-resume-id');
      
      // Click preview button
      await page.getByRole('button', { name: /preview/i }).click();
      
      // Should show preview modal or navigate to preview page
      await expect(page.locator('[data-resume-preview]')).toBeVisible();
      
      // Switch between different preview formats if available
      const formatSelector = page.locator('[data-format-selector]');
      if (await formatSelector.isVisible()) {
        await formatSelector.selectOption('modern');
        await formatSelector.selectOption('traditional');
        await formatSelector.selectOption('creative');
      }
    });

    test('should export resume as PDF', async ({ page }) => {
      await page.goto('/resume/edit/test-resume-id');
      
      // Set up download promise before clicking
      const downloadPromise = page.waitForEvent('download');
      
      // Click export/download button
      await page.getByRole('button', { name: /download|export/i }).click();
      
      // If there's a format selection modal
      const pdfOption = page.getByRole('button', { name: /pdf/i });
      if (await pdfOption.isVisible({ timeout: 2000 })) {
        await pdfOption.click();
      }
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });
  });

  test.describe('Resume Management', () => {
    test('should list all user resumes', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should show resume list
      const resumeList = page.locator('[data-resume-list]');
      await expect(resumeList).toBeVisible();
      
      // Should have at least one resume
      const resumeCards = resumeList.locator('[data-resume-card]');
      await expect(resumeCards).toHaveCount(1, { timeout: 5000 });
    });

    test('should duplicate a resume', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Find a resume card
      const resumeCard = page.locator('[data-resume-card]').first();
      
      // Click more options
      await resumeCard.getByRole('button', { name: /more options/i }).click();
      
      // Click duplicate
      await page.getByRole('menuitem', { name: /duplicate/i }).click();
      
      // Should show success message
      await expect(page.getByText(/resume duplicated/i)).toBeVisible({ timeout: 5000 });
      
      // Should have one more resume
      const resumeCards = page.locator('[data-resume-card]');
      const initialCount = await resumeCards.count();
      await expect(resumeCards).toHaveCount(initialCount + 1);
    });

    test('should delete a resume', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Count initial resumes
      const resumeCards = page.locator('[data-resume-card]');
      const initialCount = await resumeCards.count();
      
      // Find a resume card
      const resumeCard = resumeCards.last();
      
      // Click more options
      await resumeCard.getByRole('button', { name: /more options/i }).click();
      
      // Click delete
      await page.getByRole('menuitem', { name: /delete/i }).click();
      
      // Confirm deletion
      await page.getByRole('button', { name: /confirm delete/i }).click();
      
      // Should show success message
      await expect(page.getByText(/resume deleted/i)).toBeVisible({ timeout: 5000 });
      
      // Should have one less resume
      await expect(resumeCards).toHaveCount(initialCount - 1);
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/resume/edit/test-resume-id');
      
      // Mobile menu should be visible
      const mobileMenu = page.getByRole('button', { name: /menu/i });
      await expect(mobileMenu).toBeVisible();
      
      // Click mobile menu to show sections
      await mobileMenu.click();
      
      // Sections should be visible in mobile menu
      await expect(page.getByRole('menuitem', { name: /experience/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /education/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /skills/i })).toBeVisible();
    });

    test('should handle tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/resume/edit/test-resume-id');
      
      // Should show both editor and preview side by side if supported
      const editor = page.locator('[data-resume-editor]');
      const preview = page.locator('[data-resume-preview]');
      
      await expect(editor).toBeVisible();
      // Preview might be optional on tablet
      if (await preview.isVisible()) {
        const editorBox = await editor.boundingBox();
        const previewBox = await preview.boundingBox();
        
        // Verify side-by-side layout
        expect(previewBox?.x).toBeGreaterThan(editorBox?.x || 0);
      }
    });
  });
});