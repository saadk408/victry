# Victry Dark Mode Removal: Comprehensive Implementation Plan

## Executive Summary

This comprehensive implementation plan combines proven modernization strategies with the systematic removal of dark mode infrastructure from the Victry codebase. The approach transforms a simple color system change into a strategic platform modernization initiative that establishes technical excellence for long-term maintainability and performance.

### Strategic Approach
- **Production-Ready Only**: Leverages stable, proven technologies (Tailwind v4, Next.js 15+, React 19)
- **Risk-Mitigated**: Phased implementation with automated rollback capabilities
- **Performance-Focused**: 25-30KB bundle reduction with measurable performance improvements
- **Accessibility-First**: WCAG 2.1 AA compliance with automated validation
- **Future-Proof**: Maintains flexibility for theme system re-introduction

### Expected Outcomes
- **Technical**: 30% performance improvement, 95% test coverage, zero experimental risks
- **Business**: Faster development cycles, reduced maintenance overhead, improved user experience
- **Quality**: Comprehensive accessibility compliance, automated quality gates

---

## Current State Analysis

### Architecture Assessment
```typescript
// Current Infrastructure Requiring Migration
Theme Provider: next-themes v0.4.6 (8KB)
Dark Mode Classes: 112+ files with legacy patterns
CSS Variables: Dual OKLCH/HSL system (complexity)
Component Variants: Mixed semantic/direct color usage
Testing Coverage: Limited visual regression testing
```

### Risk Classification
```typescript
HIGH IMPACT (24 files):    components/ui/*.tsx - Core design system
MEDIUM IMPACT (63 files):  Feature components, pages
LOW IMPACT (25 files):     Analytics, admin interfaces
CRITICAL PATH:              AI features, authentication, resume builder
```

---

## Phase 1: Foundation & Modern Architecture Setup
**Timeline: Week 1 (5 days)**
**Goal: Establish modern CSS architecture and automated quality gates**

### 1.1 Tailwind CSS v4 Modernization

#### Task 1.1.1: Implement CSS-First Configuration
**File:** `/app/globals.css`

Replace existing configuration with modern Tailwind v4 approach:

```css
@import "tailwindcss";

@theme {
  /* OKLCH Professional Color System */
  --color-primary: oklch(0.45 0.15 231);         /* Professional blue */
  --color-secondary: oklch(0.65 0.12 190);       /* Trustworthy cyan */
  --color-background: oklch(1 0 0);              /* Pure white */
  --color-foreground: oklch(0.09 0 0);           /* Deep black */
  
  /* WCAG 2.1 AA Compliant Neutrals */
  --color-muted: oklch(0.96 0 0);                /* Light gray */
  --color-muted-foreground: oklch(0.45 0 0);     /* 4.61:1 contrast */
  --color-border: oklch(0.85 0 0);               /* Subtle borders */
  --color-input: oklch(0.98 0 0);                /* Input backgrounds */
  
  /* Semantic Status Colors (WCAG AA Compliant) */
  --color-success: oklch(0.35 0.15 145);         /* 6.5:1 contrast */
  --color-warning: oklch(0.30 0.15 85);          /* 8.2:1 contrast */
  --color-destructive: oklch(0.35 0.25 25);      /* 6.8:1 contrast */
  --color-info: oklch(0.35 0.18 240);            /* 6.1:1 contrast */
  
  /* Status Foreground Colors */
  --color-success-foreground: oklch(0.98 0 0);
  --color-warning-foreground: oklch(0.98 0 0);
  --color-destructive-foreground: oklch(0.98 0 0);
  --color-info-foreground: oklch(0.98 0 0);
  
  /* Professional Typography Scale */
  --font-display: "Inter", "system-ui", sans-serif;
  --font-body: "Inter", "system-ui", sans-serif;
  --font-mono: "JetBrains Mono", "Consolas", monospace;
  
  /* Resume-Optimized Spacing */
  --spacing-xs: 0.125rem;
  --spacing-sm: 0.25rem;
  --spacing-md: 0.5rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.5rem;
  --spacing-2xl: 2rem;
  
  /* Professional Radius System */
  --radius: 0.5rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

/* Remove Dark Mode Infrastructure */
/* DELETE: @custom-variant dark (&:is(.dark *)); */

/* Component Utilities */
@utility btn-primary {
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  font-weight: 500;
  transition: all 150ms ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@utility btn-secondary {
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  background-color: var(--color-secondary);
  color: var(--color-secondary-foreground);
  border: 1px solid var(--color-border);
}

@utility card-professional {
  border-radius: var(--radius-lg);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
```

#### Task 1.1.2: Create Design Token System
**File:** `/lib/design-tokens.ts`

```typescript
export const designTokens = {
  colors: {
    // Primary brand colors
    primary: 'var(--color-primary)',
    'primary-foreground': 'var(--color-primary-foreground)',
    secondary: 'var(--color-secondary)',
    'secondary-foreground': 'var(--color-secondary-foreground)',
    
    // Core neutrals
    background: 'var(--color-background)',
    foreground: 'var(--color-foreground)',
    muted: 'var(--color-muted)',
    'muted-foreground': 'var(--color-muted-foreground)',
    border: 'var(--color-border)',
    input: 'var(--color-input)',
    
    // Semantic colors
    success: 'var(--color-success)',
    'success-foreground': 'var(--color-success-foreground)',
    warning: 'var(--color-warning)',
    'warning-foreground': 'var(--color-warning-foreground)',
    destructive: 'var(--color-destructive)',
    'destructive-foreground': 'var(--color-destructive-foreground)',
    info: 'var(--color-info)',
    'info-foreground': 'var(--color-info-foreground)',
  },
  
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
    '2xl': 'var(--spacing-2xl)',
  },
  
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
} as const;

// Type-safe design token access
export type ColorToken = keyof typeof designTokens.colors;
export type SpacingToken = keyof typeof designTokens.spacing;
export type RadiusToken = keyof typeof designTokens.radius;

// Utility function for type-safe token access
export function getToken<T extends keyof typeof designTokens>(
  category: T,
  token: keyof typeof designTokens[T]
): string {
  return designTokens[category][token];
}
```

#### Task 1.1.3: Update PostCSS Configuration
**File:** `/postcss.config.js`

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
    ...(process.env.NODE_ENV === 'production' ? {
      '@fullhuman/postcss-purgecss': {
        content: [
          './src/**/*.{js,ts,jsx,tsx}',
          './components/**/*.{js,ts,jsx,tsx}',
          './app/**/*.{js,ts,jsx,tsx}',
        ],
        safelist: [
          // Preserve dynamically generated classes
          { pattern: /^(bg|text|border)-(primary|secondary|success|warning|destructive|info)$/ },
          { pattern: /^(bg|text|border)-(muted|background|foreground)/ },
          
          // Animation and transition classes
          { pattern: /^(animate|transition|duration|ease)-.+$/ },
          
          // Responsive classes
          { pattern: /^(sm|md|lg|xl|2xl):.+$/ },
        ],
        
        // Remove dark mode classes completely
        blocklist: [
          /^dark:/,
          /dark-mode/,
          /theme-dark/,
        ],
      },
      'cssnano': {
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: false,
          minifyFontValues: { removeQuotes: false }
        }]
      }
    } : {})
  },
};
```

### 1.2 Next.js Performance Optimization

#### Task 1.2.1: Configure Next.js v15+ Optimizations
**File:** `/next.config.js`

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Stable performance optimizations
  experimental: {
    // Automatic tree-shaking for these packages
    optimizePackageImports: [
      '@heroicons/react',
      'lucide-react',
      '@radix-ui/react-icons',
      'react-icons',
      'lodash',
      'date-fns',
    ],
    
    // Memory optimization
    webpackMemoryOptimizations: true,
    
    // Disable preloading for large apps
    preloadEntriesOnStart: false,
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // CSS optimization
  optimizeCss: process.env.NODE_ENV === 'production',
  
  // Bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
```

#### Task 1.2.2: Update Package.json Scripts
**File:** `/package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:analyze": "ANALYZE=true npm run build",
    "build:measure": "npm run build && npm run analyze",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:visual": "test-storybook",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN",
    "performance:budget": "size-limit",
    "accessibility:audit": "axe --dir ./out --save audit-results.json",
    "validate:colors": "node scripts/validate-colors.js",
    "migrate:colors": "node scripts/migrate-colors.js"
  }
}
```

### 1.3 Quality Assurance Infrastructure

#### Task 1.3.1: Setup Performance Budget Enforcement
**File:** `/.size-limit.json`

```json
[
  {
    "name": "CSS Bundle",
    "path": ".next/static/css/*.css",
    "limit": "25KB",
    "webpack": false
  },
  {
    "name": "Main JS Bundle",
    "path": ".next/static/chunks/main-*.js",
    "limit": "150KB",
    "webpack": false
  },
  {
    "name": "Resume Builder Page",
    "path": ".next/static/chunks/pages/resume-*.js",
    "limit": "100KB",
    "webpack": false
  },
  {
    "name": "Total Bundle",
    "path": ".next/static/**/*.{js,css}",
    "limit": "400KB",
    "webpack": false
  }
]
```

#### Task 1.3.2: Setup Accessibility Testing Infrastructure
**File:** `/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Task 1.3.3: Setup Storybook 9 with Accessibility Testing
**File:** `/.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
    '@storybook/test-runner',
    '@storybook/addon-coverage',
    '@storybook/addon-design-tokens',
  ],
  framework: '@storybook/nextjs',
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
```

**File:** `/.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/react';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'color-contrast-enhanced',
            enabled: true,
          },
        ],
      },
      options: {
        checks: { 'color-contrast': { options: { noScroll: true } } },
        restoreScroll: true,
      },
    },
  },
};

export default preview;
```

---

## Phase 2: Core UI Component Migration
**Timeline: Week 2 (5 days)**
**Goal: Migrate foundational UI components with comprehensive testing**

### 2.1 Status Color Utility System

#### Task 2.1.1: Create Advanced Status Utilities
**File:** `/lib/utils/status-colors.ts`

```typescript
import { type ClassValue } from "clsx";
import { cn } from "@/lib/utils";

export type StatusType = 'success' | 'warning' | 'destructive' | 'info' | 'default';
export type StatusVariant = 'default' | 'subtle' | 'outline' | 'solid';

export const statusColorMap: Record<StatusType, Record<StatusVariant, string>> = {
  success: {
    default: "bg-success/10 text-success border-success/20",
    subtle: "bg-success/5 text-success/80 border-success/10",
    outline: "border-success text-success bg-transparent",
    solid: "bg-success text-success-foreground border-success",
  },
  warning: {
    default: "bg-warning/10 text-warning border-warning/20",
    subtle: "bg-warning/5 text-warning/80 border-warning/10",
    outline: "border-warning text-warning bg-transparent",
    solid: "bg-warning text-warning-foreground border-warning",
  },
  destructive: {
    default: "bg-destructive/10 text-destructive border-destructive/20",
    subtle: "bg-destructive/5 text-destructive/80 border-destructive/10",
    outline: "border-destructive text-destructive bg-transparent",
    solid: "bg-destructive text-destructive-foreground border-destructive",
  },
  info: {
    default: "bg-info/10 text-info border-info/20",
    subtle: "bg-info/5 text-info/80 border-info/10",
    outline: "border-info text-info bg-transparent",
    solid: "bg-info text-info-foreground border-info",
  },
  default: {
    default: "bg-muted text-muted-foreground border-border",
    subtle: "bg-muted/50 text-muted-foreground/80 border-border/50",
    outline: "border-border text-muted-foreground bg-transparent",
    solid: "bg-muted text-foreground border-border",
  },
};

export function getStatusClasses(
  status: StatusType,
  variant: StatusVariant = 'default',
  additionalClasses?: ClassValue
): string {
  return cn(statusColorMap[status][variant], additionalClasses);
}

export function getScoreStatus(score: number): StatusType {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'info';
  return 'destructive';
}

// Color blindness safe patterns
export function getStatusIcon(status: StatusType): string {
  const icons = {
    success: '✓',
    warning: '⚠',
    destructive: '✗',
    info: 'ℹ',
    default: '○',
  };
  return icons[status];
}

// WCAG AA contrast validation
export function validateContrast(foreground: string, background: string): boolean {
  // Implementation would use a color contrast library
  // Return true if contrast ratio >= 4.5:1
  return true; // Placeholder
}
```

### 2.2 Critical UI Component Updates

#### Task 2.2.1: Update Card Component
**File:** `/components/ui/card.tsx`

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-background border-border",
        elevated: "bg-background border-border shadow-md",
        outlined: "bg-background border-2 border-border",
        professional: "bg-background border-border shadow-sm hover:shadow-md transition-shadow",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="card-title"
    className={cn("text-2xl font-semibold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn("p-6 pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

#### Task 2.2.2: Update Button Component
**File:** `/components/ui/button.tsx`

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground shadow hover:bg-success/90",
        warning: "bg-warning text-warning-foreground shadow hover:bg-warning/90",
        info: "bg-info text-info-foreground shadow hover:bg-info/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

#### Task 2.2.3: Update Badge Component
**File:** `/components/ui/badge.tsx`

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground shadow hover:bg-success/80",
        warning: "border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/80",
        info: "border-transparent bg-info text-info-foreground shadow hover:bg-info/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
```

### 2.3 Component Testing Strategy

#### Task 2.3.1: Create Component Test Suite
**File:** `/tests/components/ui.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

describe('UI Components Color Migration', () => {
  describe('Card Component', () => {
    it('should render with semantic colors', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      
      const card = screen.getByRole('article');
      expect(card).toHaveClass('bg-card', 'text-card-foreground');
      expect(card).not.toHaveClass('dark:bg-gray-950'); // No dark mode classes
    });

    it('should support variant styling', () => {
      render(<Card variant="elevated">Elevated Card</Card>);
      const card = screen.getByRole('article');
      expect(card).toHaveClass('shadow-md');
    });
  });

  describe('Button Component', () => {
    it('should render with correct semantic colors', () => {
      render(<Button variant="primary">Test Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should support status variant colors', () => {
      render(<Button variant="success">Success Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-success', 'text-success-foreground');
    });
  });

  describe('Badge Component', () => {
    it('should render status badges correctly', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-warning', 'text-warning-foreground');
    });
  });
});
```

#### Task 2.3.2: Create Visual Regression Tests
**File:** `/tests/visual/components.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression', () => {
  test('Card component variants', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ui-card--variants');
    await expect(page.locator('[data-testid="card-variants"]')).toHaveScreenshot('card-variants.png');
  });

  test('Button component variants', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ui-button--variants');
    await expect(page.locator('[data-testid="button-variants"]')).toHaveScreenshot('button-variants.png');
  });

  test('Badge component variants', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ui-badge--variants');
    await expect(page.locator('[data-testid="badge-variants"]')).toHaveScreenshot('badge-variants.png');
  });
});

test.describe('Accessibility Compliance', () => {
  test('Components meet WCAG AA standards', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=ui-card--default');
    
    await page.addScriptTag({ path: require.resolve('axe-core') });
    
    const accessibilityResults = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore
        axe.run({
          rules: {
            'color-contrast': { enabled: true },
            'color-contrast-enhanced': { enabled: true },
          },
        }, (err, results) => {
          resolve(results);
        });
      });
    });
    
    // @ts-ignore
    expect(accessibilityResults.violations).toEqual([]);
  });
});
```

---

## Phase 3: Feature Component Migration
**Timeline: Week 3 (5 days)**
**Goal: Migrate feature-specific components with comprehensive testing**

### 3.1 Resume Builder Components

#### Task 3.1.1: Update ATS Score Component
**File:** `/components/resume/ats-score.tsx`

```typescript
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusClasses, getScoreStatus, getStatusIcon } from '@/lib/utils/status-colors';
import { cn } from '@/lib/utils';

interface ATSScoreProps {
  score: number;
  maxScore?: number;
  className?: string;
  showDetails?: boolean;
}

export function ATSScore({ 
  score, 
  maxScore = 100, 
  className,
  showDetails = false 
}: ATSScoreProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const status = getScoreStatus(percentage);
  const statusIcon = getStatusIcon(status);
  
  const getScoreLabel = (percentage: number): string => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreDescription = (percentage: number): string => {
    if (percentage >= 80) return 'Your resume is well-optimized for ATS systems';
    if (percentage >= 60) return 'Your resume has good ATS compatibility with minor improvements needed';
    if (percentage >= 40) return 'Your resume needs significant improvements for ATS optimization';
    return 'Your resume requires major restructuring for ATS compatibility';
  };

  return (
    <Card className={cn("w-full", className)} variant="professional">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">ATS Compatibility Score</h3>
          <Badge 
            variant={status === 'success' ? 'success' : status === 'warning' ? 'warning' : 'destructive'}
            className="flex items-center gap-1"
          >
            <span aria-hidden="true">{statusIcon}</span>
            {getScoreLabel(percentage)}
          </Badge>
        </div>
        
        <div className="space-y-4">
          {/* Score Display */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold",
              getStatusClasses(status, 'solid')
            )}>
              {percentage}%
            </div>
            
            <div className="flex-1">
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={cn(
                    "h-3 rounded-full transition-all duration-500 ease-out",
                    status === 'success' && "bg-success",
                    status === 'warning' && "bg-warning", 
                    status === 'destructive' && "bg-destructive",
                    status === 'info' && "bg-info"
                  )}
                  style={{ width: `${percentage}%` }}
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`ATS Score: ${percentage} out of 100`}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {score} out of {maxScore} points
              </p>
            </div>
          </div>

          {/* Details */}
          {showDetails && (
            <div className={cn(
              "p-4 rounded-md border",
              getStatusClasses(status, 'subtle')
            )}>
              <p className="text-sm text-foreground">
                {getScoreDescription(percentage)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Export for Storybook
export default ATSScore;
```

#### Task 3.1.2: Update Application Tracking Component
**File:** `/components/analytics/application-tracking.tsx`

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusClasses, getStatusIcon } from '@/lib/utils/status-colors';
import { cn } from '@/lib/utils';

interface Application {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';
  appliedDate: Date;
  lastUpdate: Date;
}

interface ApplicationTrackingProps {
  applications: Application[];
  className?: string;
}

const statusConfig = {
  applied: { variant: 'info' as const, label: 'Applied', icon: '📤' },
  interviewing: { variant: 'warning' as const, label: 'Interviewing', icon: '💬' },
  offered: { variant: 'success' as const, label: 'Offered', icon: '🎉' },
  rejected: { variant: 'destructive' as const, label: 'Rejected', icon: '❌' },
  withdrawn: { variant: 'default' as const, label: 'Withdrawn', icon: '↩️' },
};

export function ApplicationTracking({ applications, className }: ApplicationTrackingProps) {
  const getStatusConfig = (status: Application['status']) => statusConfig[status];

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className={cn("w-full", className)} variant="professional">
      <CardHeader>
        <CardTitle className="text-foreground">Application Tracking</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your job applications and their current status
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className={cn(
              "text-center py-8 rounded-md border-2 border-dashed",
              "border-border bg-muted/20"
            )}>
              <p className="text-muted-foreground">No applications tracked yet</p>
              <Button variant="outline" className="mt-2">
                Add Your First Application
              </Button>
            </div>
          ) : (
            applications.map((application) => {
              const config = getStatusConfig(application.status);
              
              return (
                <div
                  key={application.id}
                  className={cn(
                    "p-4 rounded-md border bg-background",
                    "hover:shadow-md transition-shadow duration-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {application.position}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {application.company}
                      </p>
                    </div>
                    
                    <Badge 
                      variant={config.variant}
                      className="flex items-center gap-1"
                    >
                      <span aria-hidden="true">{config.icon}</span>
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Applied: {formatDate(application.appliedDate)}</span>
                    <span>Updated: {formatDate(application.lastUpdate)}</span>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ApplicationTracking;
```

### 3.2 Authentication Components

#### Task 3.2.1: Update Login Form
**File:** `/components/auth/login-form.tsx`

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  className?: string;
  onSubmit?: (data: { email: string; password: string }) => void;
}

export function LoginForm({ className, onSubmit }: LoginFormProps) {
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <Card className={cn("w-full max-w-md", className)} variant="elevated">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Welcome Back
        </CardTitle>
        <p className="text-muted-foreground">
          Sign in to your Victry account
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" variant="default">
            Sign In
          </Button>
          
          <div className="text-center">
            <Button variant="link" className="text-primary hover:text-primary/80">
              Forgot your password?
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
```

### 3.3 Migration Automation Tools

#### Task 3.3.1: Create Color Migration Script
**File:** `/scripts/migrate-colors.js`

```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const colorMigrationMap = {
  // Background colors
  'bg-white': 'bg-background',
  'bg-gray-50': 'bg-muted/20',
  'bg-gray-100': 'bg-muted/40',
  'bg-gray-200': 'bg-muted',
  'bg-gray-800': 'bg-foreground',
  'bg-gray-900': 'bg-foreground',
  'bg-gray-950': 'bg-foreground',
  
  // Text colors
  'text-black': 'text-foreground',
  'text-gray-900': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-700': 'text-foreground/80',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground/80',
  'text-gray-400': 'text-muted-foreground/60',
  
  // Status colors (legacy)
  'text-green-600': 'text-success',
  'text-green-700': 'text-success',
  'bg-green-100': 'bg-success/10',
  'bg-green-50': 'bg-success/5',
  
  'text-red-600': 'text-destructive',
  'text-red-700': 'text-destructive',
  'bg-red-100': 'bg-destructive/10',
  'bg-red-50': 'bg-destructive/5',
  
  'text-yellow-600': 'text-warning',
  'text-yellow-700': 'text-warning',
  'bg-yellow-100': 'bg-warning/10',
  'bg-yellow-50': 'bg-warning/5',
  
  'text-blue-600': 'text-info',
  'text-blue-700': 'text-info',
  'bg-blue-100': 'bg-info/10',
  'bg-blue-50': 'bg-info/5',
  
  // Border colors
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-gray-400': 'border-border',
};

const darkModePatterns = [
  /dark:[a-zA-Z0-9-_:\/]+/g,
  /dark\s*:\s*[a-zA-Z0-9-_:\/]+/g,
];

function migrateColorsInFile(filePath, dryRun = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let hasChanges = false;

  // Remove dark mode classes
  darkModePatterns.forEach(pattern => {
    const matches = modifiedContent.match(pattern);
    if (matches) {
      console.log(`Removing dark mode classes from ${filePath}:`, matches);
      modifiedContent = modifiedContent.replace(pattern, '');
      hasChanges = true;
    }
  });

  // Replace color classes
  Object.entries(colorMigrationMap).forEach(([oldColor, newColor]) => {
    const regex = new RegExp(`\\b${oldColor}\\b`, 'g');
    if (regex.test(modifiedContent)) {
      console.log(`Replacing ${oldColor} -> ${newColor} in ${filePath}`);
      modifiedContent = modifiedContent.replace(regex, newColor);
      hasChanges = true;
    }
  });

  // Clean up extra whitespace
  modifiedContent = modifiedContent.replace(/\s+/g, ' ').trim();

  if (hasChanges && !dryRun) {
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`✅ Updated: ${filePath}`);
  } else if (hasChanges && dryRun) {
    console.log(`📝 Would update: ${filePath}`);
  }

  return hasChanges;
}

function migrateColors(options = { dryRun: false, includePatterns: ['**/*.{tsx,ts,jsx,js}'], excludePatterns: ['node_modules/**', '.next/**', 'scripts/**'] }) {
  const { dryRun, includePatterns, excludePatterns } = options;
  
  const files = glob.sync(includePatterns[0], {
    ignore: excludePatterns
  });

  console.log(`🔍 Found ${files.length} files to process...`);
  
  let modifiedCount = 0;
  
  files.forEach(file => {
    const hasChanges = migrateColorsInFile(file, dryRun);
    if (hasChanges) {
      modifiedCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`Total files processed: ${files.length}`);
  console.log(`Files with changes: ${modifiedCount}`);
  
  if (dryRun) {
    console.log(`\n⚠️  DRY RUN MODE - No files were modified`);
    console.log(`Run without --dry-run to apply changes`);
  } else {
    console.log(`\n✅ Migration completed!`);
  }
}

// CLI interface
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

migrateColors({ dryRun });
```

#### Task 3.3.2: Create Color Validation Script
**File:** `/scripts/validate-colors.js`

```javascript
const fs = require('fs');
const glob = require('glob');

const forbiddenPatterns = [
  // Dark mode classes
  /dark:[a-zA-Z0-9-_:\/]+/g,
  
  // Direct color classes that should be semantic
  /\b(bg|text|border)-(gray|slate|zinc|neutral|stone)-\d{2,3}\b/g,
  /\b(bg|text|border)-(red|green|blue|yellow|orange|purple|pink)-\d{2,3}\b/g,
  
  // Old theme class names
  /dark-mode/g,
  /theme-dark/g,
];

const allowedSemanticClasses = [
  'bg-background', 'bg-foreground', 'bg-card', 'bg-card-foreground',
  'bg-popover', 'bg-popover-foreground', 'bg-primary', 'bg-primary-foreground',
  'bg-secondary', 'bg-secondary-foreground', 'bg-muted', 'bg-muted-foreground',
  'bg-accent', 'bg-accent-foreground', 'bg-destructive', 'bg-destructive-foreground',
  'bg-border', 'bg-input', 'bg-ring',
  'bg-success', 'bg-success-foreground', 'bg-warning', 'bg-warning-foreground',
  'bg-info', 'bg-info-foreground',
  
  'text-background', 'text-foreground', 'text-card', 'text-card-foreground',
  'text-popover', 'text-popover-foreground', 'text-primary', 'text-primary-foreground',
  'text-secondary', 'text-secondary-foreground', 'text-muted', 'text-muted-foreground',
  'text-accent', 'text-accent-foreground', 'text-destructive', 'text-destructive-foreground',
  'text-success', 'text-success-foreground', 'text-warning', 'text-warning-foreground',
  'text-info', 'text-info-foreground',
  
  'border-background', 'border-foreground', 'border-card', 'border-primary',
  'border-secondary', 'border-muted', 'border-accent', 'border-destructive',
  'border-border', 'border-input', 'border-ring',
  'border-success', 'border-warning', 'border-info',
];

function validateColorsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  forbiddenPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const lines = content.split('\n');
        const lineNumber = lines.findIndex(line => line.includes(match)) + 1;
        
        issues.push({
          file: filePath,
          line: lineNumber,
          issue: match,
          type: index === 0 ? 'dark-mode-class' : 'direct-color-class',
          severity: 'error'
        });
      });
    }
  });

  return issues;
}

function validateColors() {
  const files = glob.sync('**/*.{tsx,ts,jsx,js}', {
    ignore: ['node_modules/**', '.next/**', 'scripts/**', 'tests/**']
  });

  console.log(`🔍 Validating ${files.length} files for color compliance...`);
  
  let totalIssues = 0;
  const issuesByType = {
    'dark-mode-class': 0,
    'direct-color-class': 0
  };

  files.forEach(file => {
    const issues = validateColorsInFile(file);
    
    if (issues.length > 0) {
      console.log(`\n❌ ${file}:`);
      
      issues.forEach(issue => {
        console.log(`  Line ${issue.line}: ${issue.issue} (${issue.type})`);
        issuesByType[issue.type]++;
        totalIssues++;
      });
    }
  });

  console.log(`\n📊 Validation Summary:`);
  console.log(`Total files checked: ${files.length}`);
  console.log(`Total issues found: ${totalIssues}`);
  console.log(`Dark mode classes: ${issuesByType['dark-mode-class']}`);
  console.log(`Direct color classes: ${issuesByType['direct-color-class']}`);
  
  if (totalIssues === 0) {
    console.log(`\n✅ All files pass color validation!`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Fix these issues before proceeding with migration`);
    console.log(`\n💡 Recommended actions:`);
    console.log(`1. Run color migration script: npm run migrate:colors`);
    console.log(`2. Review and manually fix remaining issues`);
    console.log(`3. Run validation again: npm run validate:colors`);
    process.exit(1);
  }
}

validateColors();
```

---

## Phase 4: Testing & Quality Assurance
**Timeline: Week 4 (5 days)**
**Goal: Comprehensive testing and performance validation**

### 4.1 Automated Testing Infrastructure

#### Task 4.1.1: Setup Comprehensive E2E Testing
**File:** `/tests/e2e/critical-flows.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Setup common prerequisites
    await page.goto('/');
  });

  test('Complete resume creation flow', async ({ page }) => {
    // Navigate to resume creation
    await page.click('[data-testid="create-resume-button"]');
    await expect(page).toHaveURL(/.*\/resume\/create/);
    
    // Fill out personal information
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john.doe@example.com');
    
    // Verify color consistency
    const resumeForm = page.locator('[data-testid="resume-form"]');
    await expect(resumeForm).toHaveClass(/bg-background/);
    
    // Test AI features work with new colors
    await page.click('[data-testid="ai-suggestions-button"]');
    const aiPanel = page.locator('[data-testid="ai-panel"]');
    await expect(aiPanel).toBeVisible();
    await expect(aiPanel).toHaveClass(/bg-card/);
    
    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('resume-creation-flow.png');
  });

  test('Authentication flow visual consistency', async ({ page }) => {
    await page.goto('/login');
    
    // Verify login form styling
    const loginForm = page.locator('[data-testid="login-form"]');
    await expect(loginForm).toHaveClass(/bg-card/);
    
    // Test form interactions
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    
    // Verify input styling
    const emailInput = page.locator('[name="email"]');
    await expect(emailInput).toHaveClass(/bg-input/);
    await expect(emailInput).toHaveClass(/border-border/);
    
    await expect(page).toHaveScreenshot('login-form.png');
  });

  test('AI analysis features maintain functionality', async ({ page }) => {
    // Mock API responses
    await page.route('**/api/ai/analyze-job', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          skills: ['React', 'TypeScript', 'Node.js'],
          requirements: ['3+ years experience', 'Bachelor degree'],
          matchScore: 85
        })
      });
    });

    await page.goto('/job-analysis');
    
    // Test job analysis functionality
    await page.fill('[data-testid="job-description-input"]', 'Software Engineer position requiring React and TypeScript experience...');
    await page.click('[data-testid="analyze-button"]');
    
    // Verify results display with correct colors
    const results = page.locator('[data-testid="analysis-results"]');
    await expect(results).toBeVisible();
    
    const scoreCard = page.locator('[data-testid="score-card"]');
    await expect(scoreCard).toHaveClass(/bg-success/); // Should use semantic success color
    
    await expect(page).toHaveScreenshot('ai-analysis-results.png');
  });

  test('Responsive design maintains color consistency', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    await expect(page).toHaveScreenshot('dashboard-mobile.png');
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('dashboard-tablet.png');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('dashboard-desktop.png');
  });
});

test.describe('Accessibility Validation', () => {
  test('WCAG AA compliance across key pages', async ({ page }) => {
    const pages = ['/login', '/dashboard', '/resume/create', '/settings'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Inject axe-core
      await page.addScriptTag({ path: require.resolve('axe-core') });
      
      // Run accessibility audit
      const accessibilityResults = await page.evaluate(() => {
        return new Promise((resolve) => {
          // @ts-ignore
          axe.run({
            rules: {
              'color-contrast': { enabled: true },
              'color-contrast-enhanced': { enabled: true },
            },
          }, (err, results) => {
            resolve(results);
          });
        });
      });
      
      // @ts-ignore
      expect(accessibilityResults.violations.length).toBe(0);
      console.log(`✅ ${pagePath} passes accessibility audit`);
    }
  });
});
```

#### Task 4.1.2: Performance Testing Suite
**File:** `/tests/performance/bundle-size.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Performance Validation', () => {
  test('CSS bundle size within limits', async () => {
    const buildDir = path.join(process.cwd(), '.next/static/css');
    
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build directory not found. Run npm run build first.');
    }
    
    const cssFiles = fs.readdirSync(buildDir).filter(file => file.endsWith('.css'));
    let totalSize = 0;
    
    cssFiles.forEach(file => {
      const filePath = path.join(buildDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      console.log(`CSS file: ${file} - ${(stats.size / 1024).toFixed(2)}KB`);
    });
    
    console.log(`Total CSS bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
    expect(totalSize).toBeLessThan(25 * 1024); // 25KB limit
  });

  test('JavaScript bundle size within limits', async () => {
    const buildDir = path.join(process.cwd(), '.next/static/chunks');
    
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build directory not found. Run npm run build first.');
    }
    
    const jsFiles = fs.readdirSync(buildDir).filter(file => file.endsWith('.js'));
    let totalSize = 0;
    
    jsFiles.forEach(file => {
      const filePath = path.join(buildDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });
    
    console.log(`Total JS bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
    expect(totalSize).toBeLessThan(400 * 1024); // 400KB limit
  });

  test('Core Web Vitals performance', async ({ page }) => {
    await page.goto('/');
    
    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    console.log(`LCP: ${lcp}ms`);
    expect(lcp).toBeLessThan(2500); // LCP should be under 2.5s
    
    // Measure CLS (Cumulative Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // @ts-ignore
            if (!entry.hadRecentInput) {
              // @ts-ignore
              clsValue += entry.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => resolve(clsValue), 3000);
      });
    });
    
    console.log(`CLS: ${cls}`);
    expect(cls).toBeLessThan(0.1); // CLS should be under 0.1
  });
});
```

### 4.2 Continuous Integration Setup

#### Task 4.2.1: GitHub Actions Workflow
**File:** `/.github/workflows/color-migration-ci.yml`

```yaml
name: Color Migration CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate-colors:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate color usage
        run: npm run validate:colors
      
      - name: Build application
        run: npm run build
      
      - name: Check bundle sizes
        run: npm run performance:budget

  visual-regression:
    runs-on: ubuntu-latest
    needs: validate-colors
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Storybook
        run: npm run build-storybook
      
      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          onlyChanged: true
          exitZeroOnChanges: true

  accessibility-testing:
    runs-on: ubuntu-latest
    needs: validate-colors
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run accessibility tests
        run: npm run test:e2e -- --grep="Accessibility"
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: accessibility-test-results
          path: test-results/

  e2e-testing:
    runs-on: ubuntu-latest
    needs: [validate-colors, visual-regression]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Start application
        run: npm run start &
        
      - name: Wait for application
        run: npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: e2e-test-results
          path: test-results/

  performance-testing:
    runs-on: ubuntu-latest
    needs: validate-colors
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run performance tests
        run: npm run test:e2e -- tests/performance/
      
      - name: Generate performance report
        run: |
          echo "## Performance Report" >> $GITHUB_STEP_SUMMARY
          echo "Bundle size validation passed ✅" >> $GITHUB_STEP_SUMMARY
          echo "Core Web Vitals within limits ✅" >> $GITHUB_STEP_SUMMARY

  deployment-ready:
    runs-on: ubuntu-latest
    needs: [validate-colors, visual-regression, accessibility-testing, e2e-testing, performance-testing]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deployment ready notification
        run: |
          echo "🚀 All quality gates passed! Ready for deployment."
          echo "✅ Color validation passed"
          echo "✅ Visual regression tests passed"
          echo "✅ Accessibility tests passed"
          echo "✅ E2E tests passed"
          echo "✅ Performance tests passed"
```

---

## Phase 5: Performance Optimization & Production Deployment
**Timeline: Week 5 (3 days)**
**Goal: Final optimization and production deployment**

### 5.1 Advanced Optimization

#### Task 5.1.1: Implement Critical CSS
**File:** `/lib/critical-css.ts`

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

export async function getCriticalCSS(): Promise<string> {
  // Extract critical CSS for above-the-fold content
  const criticalStyles = `
    /* Critical path CSS */
    :root {
      --color-background: oklch(1 0 0);
      --color-foreground: oklch(0.09 0 0);
      --color-primary: oklch(0.45 0.15 231);
      --color-border: oklch(0.85 0 0);
    }
    
    body {
      background-color: var(--color-background);
      color: var(--color-foreground);
      font-family: "Inter", system-ui, sans-serif;
    }
    
    .header {
      background-color: var(--color-background);
      border-bottom: 1px solid var(--color-border);
    }
    
    .main-navigation {
      background-color: var(--color-background);
    }
    
    .hero-section {
      background-color: var(--color-background);
    }
  `;
  
  return criticalStyles.replace(/\s+/g, ' ').trim();
}
```

#### Task 5.1.2: Update Layout for Critical CSS
**File:** `/app/layout.tsx`

```typescript
import { Inter } from 'next/font/google';
import { getCriticalCSS } from '@/lib/critical-css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const criticalCSS = await getCriticalCSS();
  
  return (
    <html lang="en" className="light">
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Critical CSS inline */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Non-critical CSS with preload */}
        <link 
          rel="preload" 
          href="/styles/main.css" 
          as="style" 
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link rel="stylesheet" href="/styles/main.css" />
        </noscript>
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### 5.2 Production Monitoring

#### Task 5.2.1: Setup Performance Monitoring
**File:** `/lib/monitoring/performance-monitor.ts`

```typescript
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  init() {
    if (typeof window === 'undefined') return;
    
    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
  }
  
  private observeLCP() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.sendMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  private observeFID() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.sendMetric('FID', entry.processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });
  }
  
  private observeCLS() {
    let clsValue = 0;
    
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // @ts-ignore
        if (!entry.hadRecentInput) {
          // @ts-ignore
          clsValue += entry.value;
        }
      }
      
      this.sendMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  private observeFCP() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.sendMetric('FCP', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['paint'] });
  }
  
  private sendMetric(metric: string, value: number) {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        metric_name: metric,
        metric_value: Math.round(value),
        metric_delta: Math.round(value),
      });
    }
    
    // Log for debugging
    console.log(`Performance Metric - ${metric}: ${Math.round(value)}ms`);
  }
  
  measureBundleSize() {
    if (typeof window === 'undefined') return;
    
    // Measure CSS bundle size
    const cssSheets = Array.from(document.styleSheets);
    let totalCSSSize = 0;
    
    cssSheets.forEach(sheet => {
      if (sheet.href) {
        fetch(sheet.href)
          .then(response => response.text())
          .then(css => {
            totalCSSSize += new Blob([css]).size;
            this.sendMetric('CSS_Bundle_Size', totalCSSSize);
          });
      }
    });
  }
}

// Initialize in browser
if (typeof window !== 'undefined') {
  const monitor = PerformanceMonitor.getInstance();
  monitor.init();
  
  // Measure bundle size after load
  window.addEventListener('load', () => {
    setTimeout(() => monitor.measureBundleSize(), 1000);
  });
}
```

---

## Task Tracking Checklist

### Phase 1: Foundation & Modern Architecture Setup ⏳
- [ ] 1.1.1: Implement CSS-First Configuration in globals.css
- [ ] 1.1.2: Create Design Token System
- [ ] 1.1.3: Update PostCSS Configuration
- [ ] 1.2.1: Configure Next.js v15+ Optimizations
- [ ] 1.2.2: Update Package.json Scripts
- [ ] 1.3.1: Setup Performance Budget Enforcement
- [ ] 1.3.2: Setup Accessibility Testing Infrastructure
- [ ] 1.3.3: Setup Storybook 9 with Accessibility Testing

### Phase 2: Core UI Component Migration ⏳
- [ ] 2.1.1: Create Advanced Status Utilities
- [ ] 2.2.1: Update Card Component
- [ ] 2.2.2: Update Button Component
- [ ] 2.2.3: Update Badge Component
- [ ] 2.3.1: Create Component Test Suite
- [ ] 2.3.2: Create Visual Regression Tests

### Phase 3: Feature Component Migration ⏳
- [ ] 3.1.1: Update ATS Score Component
- [ ] 3.1.2: Update Application Tracking Component
- [ ] 3.2.1: Update Login Form
- [ ] 3.3.1: Create Color Migration Script
- [ ] 3.3.2: Create Color Validation Script

### Phase 4: Testing & Quality Assurance ⏳
- [ ] 4.1.1: Setup Comprehensive E2E Testing
- [ ] 4.1.2: Performance Testing Suite
- [ ] 4.2.1: GitHub Actions Workflow

### Phase 5: Performance Optimization & Production Deployment ⏳
- [ ] 5.1.1: Implement Critical CSS
- [ ] 5.1.2: Update Layout for Critical CSS
- [ ] 5.2.1: Setup Performance Monitoring

---

## Success Metrics & Validation

### Technical Success Metrics
- [ ] **Bundle Size**: 25KB+ CSS reduction achieved
- [ ] **Performance**: LCP improvement of 100-150ms
- [ ] **Build Time**: CSS compilation time reduced by 30%+
- [ ] **Component Count**: 0 components using dark mode classes
- [ ] **Test Coverage**: 95%+ test pass rate maintained
- [ ] **Accessibility**: 100% WCAG 2.1 AA compliance

### Quality Assurance Metrics
- [ ] **Visual Regressions**: 0 visual bugs reported
- [ ] **Cross-Browser**: 98% compatibility across target browsers
- [ ] **User Flows**: All critical flows functional and tested
- [ ] **Performance Budget**: All bundles within defined limits

### Business Success Metrics
- [ ] **User Satisfaction**: No complaints about visual changes
- [ ] **Core Web Vitals**: Scores improved or maintained
- [ ] **Development Velocity**: 30% faster feature development
- [ ] **Maintenance**: 50% reduction in color-related issues

---

## Risk Mitigation & Rollback Procedures

### Automated Rollback Triggers
```typescript
// Monitoring thresholds that trigger automatic rollback
const rollbackThresholds = {
  errorRate: 5,           // 5% error rate increase
  performanceRegression: 20, // 20% performance decrease
  accessibilityFailures: 1,  // Any accessibility failures
  bundleSizeIncrease: 50,    // 50KB bundle size increase
};
```

### Rollback Levels

#### Level 1: Component-Specific Rollback
```bash
# Rollback specific components
git checkout dark-mode-removal-baseline -- components/ui/card.tsx
git checkout dark-mode-removal-baseline -- components/ui/button.tsx
```

#### Level 2: Feature Area Rollback
```bash
# Rollback entire feature areas
git checkout dark-mode-removal-baseline -- components/resume/
git checkout dark-mode-removal-baseline -- components/auth/
```

#### Level 3: Complete System Rollback
```bash
# Complete revert to pre-migration state
git revert --no-edit HEAD~20
```

---

## Future Considerations

### Theme System Re-introduction Path
If business requirements change and dark mode needs to be re-added:

1. **Infrastructure**: Minimal theme provider kept dormant for easy re-enabling
2. **Components**: All components designed with semantic tokens for easy theme addition
3. **Design System**: Color architecture supports dual themes without major refactoring
4. **Timeline**: Estimated 2-3 weeks for complete dark mode re-implementation

### Monitoring & Maintenance
- Monthly bundle size analysis and optimization
- Quarterly accessibility audits with automated compliance checks
- Continuous performance monitoring with real user metrics
- Annual design system evolution planning

This comprehensive implementation plan ensures a successful dark mode removal while establishing a foundation for long-term technical excellence, maintainability, and performance optimization.