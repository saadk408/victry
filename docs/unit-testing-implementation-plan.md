# Unit Testing Implementation Plan

## Executive Summary

This document provides a comprehensive implementation plan for achieving 90%+ test coverage across all password reset components and establishing a robust testing foundation for the Victry application. The plan covers unit tests, integration tests, end-to-end tests, and CI/CD integration.

**Estimated Time**: 12-16 hours
**Priority**: High (Quality assurance)
**Dependencies**: Jest, React Testing Library, MSW

## Table of Contents

1. [Testing Architecture](#testing-architecture)
2. [Coverage Requirements](#coverage-requirements)
3. [Test Environment Setup](#test-environment-setup)
4. [Component Testing Strategy](#component-testing-strategy)
5. [API Route Testing](#api-route-testing)
6. [Integration Testing](#integration-testing)
7. [End-to-End Testing](#end-to-end-testing)
8. [Mock Strategies](#mock-strategies)
9. [Test Data Management](#test-data-management)
10. [Performance Testing](#performance-testing)
11. [CI/CD Integration](#cicd-integration)
12. [Accessibility Testing](#accessibility-testing)
13. [Visual Regression Testing](#visual-regression-testing)
14. [Maintenance & Best Practices](#maintenance--best-practices)

## Testing Architecture

### Test Pyramid Structure

```
                 /\
                /  \
               /E2E \     <- 10% (Slow, Expensive)
              /______\
             /        \
            /Integration\ <- 20% (Medium Speed)
           /____________\
          /              \
         /   Unit Tests   \ <- 70% (Fast, Cheap)
        /________________\
```

### Directory Structure

```
__tests__/
├── unit/                          # Fast unit tests
│   ├── components/
│   │   └── auth/
│   │       ├── forgot-password-form.test.tsx
│   │       ├── reset-password-form.test.tsx
│   │       ├── oauth-buttons.test.tsx
│   │       └── auth-guard.test.tsx
│   ├── api/
│   │   └── auth/
│   │       ├── forgot-password.test.ts
│   │       ├── confirm.test.ts
│   │       └── reset-password.test.ts
│   ├── lib/
│   │   ├── utils/
│   │   │   ├── rate-limiter.test.ts
│   │   │   ├── password-validation.test.ts
│   │   │   └── email-validation.test.ts
│   │   ├── supabase/
│   │   │   ├── auth-utils.test.ts
│   │   │   └── client.test.ts
│   │   └── services/
│   │       └── email-service.test.ts
│   └── hooks/
│       ├── use-auth.test.ts
│       └── use-password-reset.test.ts
├── integration/                   # API and service integration
│   ├── auth-flow.test.ts
│   ├── password-reset-flow.test.ts
│   ├── rate-limiting.test.ts
│   └── email-delivery.test.ts
├── e2e/                          # End-to-end user flows
│   ├── auth-flows.spec.ts
│   ├── password-reset.spec.ts
│   └── accessibility.spec.ts
├── fixtures/                     # Test data
│   ├── users.json
│   ├── emails.json
│   └── responses.json
├── mocks/                        # Mock implementations
│   ├── supabase.ts
│   ├── email-service.ts
│   └── handlers/
│       ├── auth.ts
│       └── users.ts
└── utils/                        # Test utilities
    ├── setup.ts
    ├── custom-matchers.ts
    ├── test-helpers.ts
    └── db-helpers.ts
```

## Coverage Requirements

### Target Coverage Thresholds

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Stricter for critical authentication code
    './app/api/auth/**': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './components/auth/**': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './lib/supabase/**': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './lib/utils/rate-limiter.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!**/.next/**',
  ],
};
```

### Coverage Tracking

```typescript
// scripts/coverage-check.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CoverageReport {
  lines: { pct: number };
  functions: { pct: number };
  branches: { pct: number };
  statements: { pct: number };
}

async function checkCoverage(): Promise<void> {
  try {
    const { stdout } = await execAsync('npm run test:coverage -- --json');
    const coverage: CoverageReport = JSON.parse(stdout);
    
    const thresholds = {
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    };
    
    const failures: string[] = [];
    
    Object.entries(thresholds).forEach(([key, threshold]) => {
      const actual = coverage[key as keyof CoverageReport].pct;
      if (actual < threshold) {
        failures.push(`${key}: ${actual}% < ${threshold}%`);
      }
    });
    
    if (failures.length > 0) {
      console.error('Coverage thresholds not met:');
      failures.forEach(failure => console.error(`  ${failure}`));
      process.exit(1);
    }
    
    console.log('✅ All coverage thresholds met!');
  } catch (error) {
    console.error('Coverage check failed:', error);
    process.exit(1);
  }
}

checkCoverage();
```

## Test Environment Setup

### 1. Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageDirectory: 'coverage',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  maxWorkers: '50%',
  // Custom test environment for API routes
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/unit/components/**/*.test.{ts,tsx}'],
    },
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/unit/api/**/*.test.{ts,tsx}'],
    },
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### 2. Test Setup

```typescript
// jest.setup.js
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { server } from './__tests__/mocks/server';
import { loadEnvConfig } from '@next/env';

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createActionClient: jest.fn(),
  createServerClient: jest.fn(),
  createBrowserClient: jest.fn(),
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Start MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Increase timeout for integration tests
jest.setTimeout(30000);

// Console error suppression for expected errors
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

### 3. Mock Service Worker Setup

```typescript
// __tests__/mocks/server.ts
import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';
import { userHandlers } from './handlers/users';

export const server = setupServer(
  ...authHandlers,
  ...userHandlers,
);
```

```typescript
// __tests__/mocks/handlers/auth.ts
import { rest } from 'msw';

export const authHandlers = [
  rest.post('/api/auth/forgot-password', (req, res, ctx) => {
    return res(
      ctx.json({
        message: 'If your email is registered, you will receive a reset link.',
      }),
    );
  }),

  rest.post('/api/auth/reset-password', (req, res, ctx) => {
    return res(
      ctx.json({
        message: 'Password updated successfully.',
      }),
    );
  }),

  rest.get('/api/auth/confirm', (req, res, ctx) => {
    const tokenHash = req.url.searchParams.get('token_hash');
    
    if (!tokenHash) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Missing token' }),
      );
    }

    if (tokenHash === 'invalid') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Invalid or expired token' }),
      );
    }

    return res(ctx.json({ success: true }));
  }),
];
```

## Component Testing Strategy

### 1. Forgot Password Form Testing

```typescript
// __tests__/unit/components/auth/forgot-password-form.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { server } from '@/__tests__/mocks/server';
import { rest } from 'msw';

expect.extend(toHaveNoViolations);

// Mock react-hook-form for controlled testing
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: () => ({}),
    handleSubmit: (fn: Function) => fn,
    formState: { errors: {}, isSubmitting: false },
    reset: jest.fn(),
  }),
}));

describe('ForgotPasswordForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<ForgotPasswordForm />);
  });

  describe('Rendering', () => {
    it('should render all form elements', () => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
      expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('noValidate');
    });

    it('should have proper ARIA labels', () => {
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(emailInput).toBeRequired();
    });
  });

  describe('Validation', () => {
    it('should validate email format', async () => {
      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur event
      
      await waitFor(() => {
        expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
      });
    });

    it('should require email field', async () => {
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      expect(screen.getByText(/sending.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should handle successful submission', async () => {
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    it('should handle server errors', async () => {
      server.use(
        rest.post('/api/auth/forgot-password', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: { message: 'Server error' } }),
          );
        }),
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    it('should handle rate limiting', async () => {
      server.use(
        rest.post('/api/auth/forgot-password', (req, res, ctx) => {
          return res(
            ctx.status(429),
            ctx.json({ 
              error: { 
                message: 'Too many requests',
                code: 'RATE_LIMIT_EXCEEDED' 
              },
              retryAfter: 300,
            }),
          );
        }),
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
        expect(screen.getByText(/5 minutes/i)).toBeInTheDocument();
      });
    });

    it('should reset form after successful submission', async () => {
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(emailInput).toHaveValue('');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ForgotPasswordForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      emailInput.focus();
      expect(emailInput).toHaveFocus();
      
      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('should announce form errors to screen readers', async () => {
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorElement = screen.getByText(/email is required/i);
        expect(errorElement).toHaveAttribute('role', 'alert');
        expect(errorElement).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      server.use(
        rest.post('/api/auth/forgot-password', (req, res) => {
          return res.networkError('Network error');
        }),
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should handle malformed responses', async () => {
      server.use(
        rest.post('/api/auth/forgot-password', (req, res, ctx) => {
          return res(ctx.text('Invalid JSON'));
        }),
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Internationalization', () => {
    it('should display error messages in correct language', async () => {
      // Mock locale context
      jest.doMock('@/lib/i18n', () => ({
        useTranslation: () => ({
          t: (key: string) => key === 'email.required' ? 'Email es requerido' : key,
        }),
      }));

      const { rerender } = render(<ForgotPasswordForm />);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
      });
    });
  });
});
```

### 2. Reset Password Form Testing

```typescript
// __tests__/unit/components/auth/reset-password-form.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { server } from '@/__tests__/mocks/server';
import { rest } from 'msw';

// Mock useSearchParams for token
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => key === 'token' ? 'valid-token' : null,
  }),
}));

describe('ResetPasswordForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<ResetPasswordForm />);
  });

  describe('Password Validation', () => {
    it('should enforce minimum password length', async () => {
      const passwordInput = screen.getByLabelText(/new password/i);
      
      await user.type(passwordInput, '123');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should require password confirmation', async () => {
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(passwordInput, 'newpassword123');
      await user.type(confirmInput, 'different123');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should show password strength indicator', async () => {
      const passwordInput = screen.getByLabelText(/new password/i);
      
      await user.type(passwordInput, 'weak');
      expect(screen.getByText(/weak/i)).toBeInTheDocument();
      
      await user.clear(passwordInput);
      await user.type(passwordInput, 'StrongP@ssw0rd123');
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });

    it('should validate password complexity', async () => {
      const passwordInput = screen.getByLabelText(/new password/i);
      
      await user.type(passwordInput, 'onlylowercase');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/include uppercase/i)).toBeInTheDocument();
        expect(screen.getByText(/include numbers/i)).toBeInTheDocument();
        expect(screen.getByText(/include special characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should handle successful password reset', async () => {
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      await user.type(passwordInput, 'NewP@ssw0rd123');
      await user.type(confirmInput, 'NewP@ssw0rd123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle expired token', async () => {
      server.use(
        rest.post('/api/auth/reset-password', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ 
              error: { 
                message: 'Token expired',
                code: 'TOKEN_EXPIRED' 
              } 
            }),
          );
        }),
      );

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      await user.type(passwordInput, 'NewP@ssw0rd123');
      await user.type(confirmInput, 'NewP@ssw0rd123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/token expired/i)).toBeInTheDocument();
        expect(screen.getByText(/request a new password reset/i)).toBeInTheDocument();
      });
    });
  });

  describe('Security Features', () => {
    it('should show/hide password functionality', async () => {
      const passwordInput = screen.getByLabelText(/new password/i);
      const toggleButton = screen.getByLabelText(/show password/i);
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument();
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should prevent password manager autofill on confirm field', () => {
      const confirmInput = screen.getByLabelText(/confirm password/i);
      expect(confirmInput).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should clear form data on unmount', () => {
      const { unmount } = render(<ResetPasswordForm />);
      const passwordInput = screen.getByLabelText(/new password/i);
      
      // Simulate user input
      fireEvent.change(passwordInput, { target: { value: 'secret' } });
      
      // Component unmounts, sensitive data should be cleared
      unmount();
      
      // Re-render should have empty fields
      render(<ResetPasswordForm />);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      expect(newPasswordInput).toHaveValue('');
    });
  });
});
```

## API Route Testing

### 1. Forgot Password API Testing

```typescript
// __tests__/unit/api/auth/forgot-password.test.ts
import { POST } from '@/app/api/auth/forgot-password/route';
import { createMockRequest } from '@/__tests__/utils/mock-request';
import { createActionClient } from '@/lib/supabase/client';
import * as rateLimiter from '@/lib/utils/rate-limiter';

// Mock dependencies
jest.mock('@/lib/supabase/client');
jest.mock('@/lib/utils/rate-limiter');

const mockSupabase = {
  auth: {
    resetPasswordForEmail: jest.fn(),
  },
};

const mockRateLimiter = {
  checkPasswordResetRateLimit: jest.fn(),
};

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createActionClient as jest.Mock).mockReturnValue(mockSupabase);
    (rateLimiter.checkPasswordResetRateLimit as jest.Mock).mockImplementation(
      mockRateLimiter.checkPasswordResetRateLimit
    );
  });

  describe('Input Validation', () => {
    it('should reject invalid email format', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: { email: 'invalid-email' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_INVALID_FORMAT');
      expect(data.error.message).toContain('valid email');
    });

    it('should reject missing email', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {},
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_INVALID_DATA');
    });

    it('should sanitize email input', async () => {
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetAt: new Date(),
      });

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const request = createMockRequest({
        method: 'POST',
        body: { email: '  Test@EXAMPLE.com  ' },
      });

      await POST(request);

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(Object)
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + 300000), // 5 minutes
        retryAfter: 300,
      });

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(data.retryAfter).toBe(300);
      expect(response.headers.get('Retry-After')).toBe('300');
    });

    it('should include rate limit headers', async () => {
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetAt: new Date(),
      });

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
      });

      const response = await POST(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('3');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('2');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('Email Service Integration', () => {
    it('should send password reset email successfully', async () => {
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetAt: new Date(),
      });

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('check your email');
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: expect.stringContaining('/auth/confirm'),
        }
      );
    });

    it('should handle Supabase errors gracefully', async () => {
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetAt: new Date(),
      });

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'User not found', status: 404 },
      });

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'nonexistent@example.com' },
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still return success to prevent email enumeration
      expect(response.status).toBe(200);
      expect(data.message).toContain('check your email');
    });

    it('should handle service unavailable errors', async () => {
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetAt: new Date(),
      });

      mockSupabase.auth.resetPasswordForEmail.mockRejectedValue(
        new Error('Service temporarily unavailable')
      );

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error.code).toBe('SERVICE_UNAVAILABLE');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetAt: new Date(),
      });

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
      });

      const response = await POST(request);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });

  describe('Logging and Monitoring', () => {
    it('should log successful requests', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetAt: new Date(),
      });

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      await POST(request);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Password reset requested'),
        expect.objectContaining({
          email: 'test@example.com',
          ip: '192.168.1.1',
        })
      );

      logSpy.mockRestore();
    });

    it('should log rate limit violations', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      mockRateLimiter.checkPasswordResetRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(),
        retryAfter: 300,
      });

      const request = createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      await POST(request);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit exceeded'),
        expect.objectContaining({
          email: 'test@example.com',
          ip: '192.168.1.1',
        })
      );

      warnSpy.mockRestore();
    });
  });
});
```

## Integration Testing

### 1. Password Reset Flow Integration

```typescript
// __tests__/integration/password-reset-flow.test.ts
import { createTestUser, deleteTestUser } from '@/__tests__/utils/test-helpers';
import { createServerClient } from '@/lib/supabase/client';

describe('Password Reset Flow Integration', () => {
  let testUser: any;
  let supabase: any;

  beforeAll(async () => {
    supabase = createServerClient();
    testUser = await createTestUser({
      email: 'integration-test@example.com',
      password: 'oldpassword123',
    });
  });

  afterAll(async () => {
    if (testUser) {
      await deleteTestUser(testUser.id);
    }
  });

  it('should complete full password reset flow', async () => {
    // 1. Request password reset
    const resetResponse = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email }),
    });

    expect(resetResponse.ok).toBe(true);
    const resetData = await resetResponse.json();
    expect(resetData.message).toContain('check your email');

    // 2. Simulate email click (get token from test helper)
    const resetToken = await getLatestPasswordResetToken(testUser.email);
    expect(resetToken).toBeDefined();

    // 3. Verify token via confirm endpoint
    const confirmResponse = await fetch(
      `/api/auth/confirm?token_hash=${resetToken.token_hash}&type=recovery`,
      { method: 'GET' }
    );

    expect(confirmResponse.ok).toBe(true);

    // 4. Reset password
    const newPasswordResponse = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resetToken.access_token}`,
      },
      body: JSON.stringify({ 
        password: 'newpassword123',
        token: resetToken.token_hash,
      }),
    });

    expect(newPasswordResponse.ok).toBe(true);

    // 5. Verify user can login with new password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: 'newpassword123',
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();

    // 6. Verify old password no longer works
    const { error: oldPasswordError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: 'oldpassword123',
    });

    expect(oldPasswordError).toBeDefined();
    expect(oldPasswordError.message).toContain('Invalid');
  });

  it('should prevent token reuse', async () => {
    // Request reset
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email }),
    });

    const resetToken = await getLatestPasswordResetToken(testUser.email);

    // Use token once
    const firstResponse = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resetToken.access_token}`,
      },
      body: JSON.stringify({ 
        password: 'password1',
        token: resetToken.token_hash,
      }),
    });

    expect(firstResponse.ok).toBe(true);

    // Try to use token again
    const secondResponse = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resetToken.access_token}`,
      },
      body: JSON.stringify({ 
        password: 'password2',
        token: resetToken.token_hash,
      }),
    });

    expect(secondResponse.status).toBe(400);
    const errorData = await secondResponse.json();
    expect(errorData.error.code).toBe('TOKEN_USED');
  });

  it('should handle concurrent reset requests', async () => {
    const promises = Array.from({ length: 5 }, () =>
      fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email }),
      })
    );

    const responses = await Promise.all(promises);

    // First few should succeed, later ones should be rate limited
    const successful = responses.filter(r => r.ok).length;
    const rateLimited = responses.filter(r => r.status === 429).length;

    expect(successful).toBeGreaterThan(0);
    expect(rateLimited).toBeGreaterThan(0);
    expect(successful + rateLimited).toBe(5);
  });
});
```

## Test Data Management

### 1. Test Helpers

```typescript
// __tests__/utils/test-helpers.ts
import { createServerClient } from '@/lib/supabase/client';
import { randomBytes } from 'crypto';

const supabase = createServerClient();

export interface TestUser {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

export async function createTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
  const timestamp = Date.now();
  const email = overrides.email || `test-${timestamp}@example.com`;
  const password = overrides.password || `TestPass${timestamp}!`;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    ...overrides,
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  return {
    id: data.user.id,
    email,
    password,
    created_at: data.user.created_at,
  };
}

export async function deleteTestUser(userId: string): Promise<void> {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  
  if (error) {
    console.warn(`Failed to delete test user ${userId}:`, error.message);
  }
}

export async function createTestUsers(count: number): Promise<TestUser[]> {
  const users = await Promise.all(
    Array.from({ length: count }, () => createTestUser())
  );
  
  return users;
}

export async function cleanupTestUsers(): Promise<void> {
  // Clean up users created in the last hour (test isolation)
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  
  const { data: users } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });

  if (users?.users) {
    const testUsers = users.users.filter(user => 
      user.email?.includes('test-') && 
      user.created_at > oneHourAgo
    );

    await Promise.all(
      testUsers.map(user => deleteTestUser(user.id))
    );
  }
}

export async function getLatestPasswordResetToken(email: string): Promise<any> {
  // Mock implementation - in real tests, you'd need to:
  // 1. Check test email service or database
  // 2. Extract token from email content
  // 3. Return parsed token data
  
  return {
    token_hash: `test-token-${randomBytes(32).toString('hex')}`,
    access_token: `test-access-${randomBytes(32).toString('hex')}`,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  };
}

export function createMockRequest(options: {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  ip?: string;
}): Request {
  const url = new URL('http://localhost:3000/api/test');
  
  // Add query parameters
  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    'x-forwarded-for': options.ip || '127.0.0.1',
    ...options.headers,
  });
  
  return new Request(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

// Custom Jest matchers for better assertions
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      message: () => 
        pass 
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email`,
      pass,
    };
  },
  
  toBeSecurePassword(received: string) {
    const hasMinLength = received.length >= 8;
    const hasUppercase = /[A-Z]/.test(received);
    const hasLowercase = /[a-z]/.test(received);
    const hasNumber = /\d/.test(received);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(received);
    
    const pass = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    
    return {
      message: () => 
        pass 
          ? `Expected ${received} not to be a secure password`
          : `Expected ${received} to be a secure password (8+ chars, uppercase, lowercase, number, special char)`,
      pass,
    };
  },
});

// Global test database setup/teardown
export async function setupTestDatabase(): Promise<void> {
  // Set up test-specific database state
  // This could include:
  // - Creating test schemas
  // - Seeding test data
  // - Setting up test-specific RLS policies
}

export async function teardownTestDatabase(): Promise<void> {
  // Clean up test database
  await cleanupTestUsers();
  // Clean up any other test data
}
```

### 2. Fixture Data

```typescript
// __tests__/fixtures/users.ts
export const testUsers = {
  validUser: {
    email: 'valid@example.com',
    password: 'ValidPass123!',
    name: 'Valid User',
  },
  
  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    name: 'Admin User',
    role: 'admin',
  },
  
  unconfirmedUser: {
    email: 'unconfirmed@example.com',
    password: 'UnconfirmedPass123!',
    name: 'Unconfirmed User',
    email_confirmed: false,
  },
};

export const invalidEmails = [
  'not-an-email',
  '@example.com',
  'user@',
  'user..double.dot@example.com',
  'user@example',
  '',
  ' ',
  'user with spaces@example.com',
];

export const weakPasswords = [
  '',
  '123',
  'password',
  '12345678',
  'Password',
  'Password123',
];

export const strongPasswords = [
  'StrongP@ssw0rd!',
  'MySecure123!Pass',
  'C0mpl3x!P@ssw0rd',
  'Un1qu3_P@ssw0rd!',
];
```

## CI/CD Integration

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start Supabase
        run: supabase start

      - name: Run type checking
        run: npm run type-check

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit -- --coverage --watchAll=false
        env:
          NODE_ENV: test
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_TEST }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY_TEST }}

      - name: Run integration tests
        run: npm run test:integration -- --watchAll=false
        env:
          NODE_ENV: test
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_TEST }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY_TEST }}

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NODE_ENV: test
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_TEST }}

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info

  lighthouse:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Start application
        run: npm start &
        
      - name: Wait for app to be ready
        run: npx wait-on http://localhost:3000

      - name: Run Lighthouse CI
        run: npx lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### 2. Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "playwright test",
    "test:a11y": "jest --testPathPattern=accessibility",
    "test:visual": "jest --testPathPattern=visual-regression",
    "test:performance": "jest --testPathPattern=performance",
    "test:ci": "npm run test:unit && npm run test:integration",
    "test:smoke": "jest --testPathPattern=smoke",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "coverage:open": "open coverage/lcov-report/index.html",
    "coverage:ci": "jest --coverage --coverageReporters=lcov",
    "type-check": "tsc --noEmit",
    "lint:test": "eslint __tests__ --ext .ts,.tsx",
    "pre-commit": "npm run type-check && npm run lint && npm run test:ci"
  }
}
```

## Success Metrics

### 1. Coverage Targets

| Component | Target | Critical Paths |
|-----------|--------|----------------|
| API Routes | 95% | All error paths, validation, rate limiting |
| Auth Components | 90% | Form validation, error states, loading states |
| Utilities | 100% | Rate limiter, validators, error handlers |
| Services | 90% | External API calls, error handling |
| Hooks | 85% | State management, side effects |

### 2. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Execution | <2 minutes | Total CI time for unit + integration |
| Unit Test Speed | <30ms avg | Per test execution time |
| Coverage Generation | <10 seconds | Time to generate coverage report |
| Memory Usage | <512MB | Peak memory during test run |
| Test Flakiness | <1% | Failed tests that pass on retry |

### 3. Quality Gates

```typescript
// scripts/quality-gates.ts
interface QualityGate {
  name: string;
  threshold: number;
  actual: number;
  passed: boolean;
}

async function checkQualityGates(): Promise<void> {
  const gates: QualityGate[] = [
    { name: 'Line Coverage', threshold: 70, actual: 0, passed: false },
    { name: 'Branch Coverage', threshold: 70, actual: 0, passed: false },
    { name: 'Function Coverage', threshold: 70, actual: 0, passed: false },
    { name: 'Critical Path Coverage', threshold: 95, actual: 0, passed: false },
    { name: 'Test Performance', threshold: 120, actual: 0, passed: false }, // seconds
  ];

  // Check each gate
  const failedGates = gates.filter(gate => !gate.passed);
  
  if (failedGates.length > 0) {
    console.error('Quality gates failed:');
    failedGates.forEach(gate => {
      console.error(`  ${gate.name}: ${gate.actual} < ${gate.threshold}`);
    });
    process.exit(1);
  }
  
  console.log('✅ All quality gates passed!');
}
```

## Conclusion

This comprehensive unit testing implementation plan provides a robust foundation for ensuring code quality and reliability in the Victry application. The testing strategy covers all critical paths, includes comprehensive error handling scenarios, and establishes quality gates for continuous improvement.

### Implementation Priority

1. **Week 1**: Set up testing infrastructure and core unit tests
2. **Week 2**: Implement integration tests and CI/CD integration  
3. **Week 3**: Add performance tests and quality gates

### Long-term Benefits

- **Reduced Bug Rate**: 90%+ test coverage prevents regressions
- **Faster Development**: Confident refactoring with comprehensive tests
- **Better Documentation**: Tests serve as living documentation
- **Improved Code Quality**: Test-driven development practices

This investment in testing infrastructure will pay dividends in reduced maintenance costs, faster feature development, and improved user experience.