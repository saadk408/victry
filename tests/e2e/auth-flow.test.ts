import { test, expect } from '@playwright/test';

// Test configuration for authentication flows
test.describe('Authentication Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
  });

  test.describe('Login Flow', () => {
    test('should successfully log in with valid credentials', async ({ page }) => {
      // Click sign in button
      await page.getByRole('link', { name: /sign in/i }).click();
      
      // Wait for login page to load
      await expect(page).toHaveURL('/login');
      
      // Fill in email and password
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password').fill('testpassword123');
      
      // Submit the form
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Should redirect to dashboard after successful login
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
      
      // Verify user is logged in by checking for dashboard elements
      await expect(page.getByText(/welcome back/i)).toBeVisible();
    });

    test('should show error message for invalid credentials', async ({ page }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Fill in invalid credentials
      await page.getByLabel('Email').fill('invalid@example.com');
      await page.getByLabel('Password').fill('wrongpassword');
      
      // Submit the form
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Should show error message
      await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 5000 });
      
      // Should remain on login page
      await expect(page).toHaveURL('/login');
    });

    test('should handle OAuth login flow', async ({ page }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Test Google OAuth button
      const googleButton = page.getByRole('button', { name: /continue with google/i });
      await expect(googleButton).toBeVisible();
      
      // Test GitHub OAuth button
      const githubButton = page.getByRole('button', { name: /continue with github/i });
      await expect(githubButton).toBeVisible();
      
      // Note: We can't fully test OAuth flows as they redirect to external services
      // But we can verify the buttons exist and have correct attributes
      await expect(googleButton).toHaveAttribute('data-provider', 'google');
      await expect(githubButton).toHaveAttribute('data-provider', 'github');
    });
  });

  test.describe('Registration Flow', () => {
    test('should successfully register a new user', async ({ page }) => {
      // Navigate to registration page
      await page.goto('/register');
      
      // Fill in registration form
      const timestamp = Date.now();
      const email = `newuser${timestamp}@example.com`;
      
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill('SecurePassword123!');
      await page.getByLabel('Confirm Password').fill('SecurePassword123!');
      
      // Accept terms if present
      const termsCheckbox = page.getByRole('checkbox', { name: /terms/i });
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }
      
      // Submit registration
      await page.getByRole('button', { name: /sign up|register/i }).click();
      
      // Should redirect to dashboard or onboarding
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/register');
      
      // Try weak password
      await page.getByLabel('Password').fill('weak');
      await page.getByLabel('Email').click(); // Trigger blur event
      
      // Should show password requirements
      await expect(page.getByText(/password must be at least/i)).toBeVisible();
    });

    test('should prevent duplicate email registration', async ({ page }) => {
      await page.goto('/register');
      
      // Try to register with existing email
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password').fill('SecurePassword123!');
      await page.getByLabel('Confirm Password').fill('SecurePassword123!');
      
      await page.getByRole('button', { name: /sign up|register/i }).click();
      
      // Should show error about email already in use
      await expect(page.getByText(/email.*already.*use|already registered/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should handle forgot password flow', async ({ page }) => {
      await page.goto('/login');
      
      // Click forgot password link
      await page.getByRole('link', { name: /forgot password/i }).click();
      
      // Should navigate to password reset page
      await expect(page).toHaveURL('/forgot-password');
      
      // Enter email
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByRole('button', { name: /send reset link/i }).click();
      
      // Should show success message
      await expect(page.getByText(/check your email|reset link sent/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Logout Flow', () => {
    test('should successfully log out user', async ({ page }) => {
      // First log in
      await page.goto('/login');
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password').fill('testpassword123');
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Wait for dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
      
      // Find and click logout button
      await page.getByRole('button', { name: /sign out|log out/i }).click();
      
      // Should redirect to homepage
      await expect(page).toHaveURL('/');
      
      // Should show sign in button again
      await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/login');
      
      // All form elements should be visible and functional
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
      
      // OAuth buttons should be visible
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/login');
      
      // Verify layout adapts properly
      const formContainer = page.locator('form').first();
      await expect(formContainer).toBeVisible();
      
      // Check that form is centered and not too wide
      const box = await formContainer.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(600);
    });
  });
});