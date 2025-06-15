# Component Migration Patterns & Testing Strategies

**Version:** 1.0  
**Created:** January 14, 2025  
**Based on:** Phase 0 Research (React 19, Tailwind v4, Next.js 15+, Playwright, Storybook 9)  
**Purpose:** Define reusable patterns and comprehensive testing strategies for dark mode removal

## Executive Summary

This specification establishes standardized migration patterns and testing strategies based on 2025 best practices. It provides concrete implementation templates, testing protocols, and quality gates to ensure successful component migration while maintaining code quality and user experience.

## Migration Pattern Architecture

### Core Migration Principles

1. **Semantic-Only Colors**: Replace all hard-coded and dark-mode specific colors with semantic tokens
2. **Zero Breaking Changes**: Component APIs remain unchanged
3. **Progressive Enhancement**: Maintain functionality while improving code quality
4. **Test-Driven Development**: Write tests before implementation
5. **Visual Integrity**: Ensure no unintended visual changes

### Component Migration Template

```typescript
// PATTERN: Standard Component Migration
// File: components/ui/[component].tsx

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

// Step 1: Define semantic variants using CVA
const componentVariants = cva(
  // Base classes (semantic only)
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Step 2: Define component props interface
export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  asChild?: boolean;
}

// Step 3: Implement component with semantic classes
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div";
    
    return (
      <Comp
        ref={ref}
        data-slot="component-name" // Required for all components
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Component.displayName = "Component";

export { Component };
```

### Complex Component Migration Pattern

```typescript
// PATTERN: Complex State-Based Component (e.g., Switch)
// Handles data-state attributes and complex interactions

const switchVariants = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        success: "data-[state=checked]:bg-success data-[state=unchecked]:bg-input",
        warning: "data-[state=checked]:bg-warning data-[state=unchecked]:bg-input",
        destructive: "data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Thumb component with state-based positioning
const switchThumbVariants = cva(
  "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
  {
    variants: {
      state: {
        checked: "translate-x-5",
        unchecked: "translate-x-0",
      },
    },
  }
);
```

### Status-Based Component Pattern

```typescript
// PATTERN: Status Color Mapping
// For components that display status information

import { clsx, type ClassValue } from 'clsx';

// Status color utility
export function getStatusColorClasses(score: number): string {
  if (score >= 90) return "bg-success/10 text-success border-success/20";
  if (score >= 70) return "bg-warning/10 text-warning border-warning/20";
  if (score >= 50) return "bg-info/10 text-info border-info/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
}

// Usage in component
function StatusBadge({ score }: { score: number }) {
  return (
    <div className={cn(
      "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border",
      getStatusColorClasses(score)
    )}>
      Score: {score}%
    </div>
  );
}
```

## Testing Strategy Framework

### 1. Test-Driven Development (TDD) Workflow

```typescript
// STEP 1: Write failing tests first
// File: components/ui/__tests__/component.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from '../component';

describe('Component Migration Tests', () => {
  // Visual Regression Test
  it('should match visual snapshot', () => {
    const { container } = render(<Component>Test Content</Component>);
    expect(container).toMatchSnapshot();
  });
  
  // Semantic Color Test
  it('should use semantic colors only', () => {
    const { container } = render(<Component variant="primary" />);
    const element = container.firstChild as HTMLElement;
    
    // Should NOT contain hard-coded colors
    expect(element.className).not.toMatch(/bg-gray-/);
    expect(element.className).not.toMatch(/dark:/);
    
    // Should contain semantic colors
    expect(element.className).toMatch(/bg-primary/);
  });
  
  // Accessibility Test
  it('should meet WCAG 2.1 AA standards', async () => {
    const { container } = render(<Component>Accessible Content</Component>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  // Interaction Test
  it('should handle user interactions correctly', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Component onClick={handleClick}>Click Me</Component>);
    
    await user.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Visual Regression Testing with Playwright

```typescript
// File: tests/visual-regression/component.spec.ts
// Based on 2025 Playwright best practices

import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression', () => {
  // Component-level visual testing
  test('component renders correctly in all variants', async ({ page }) => {
    await page.goto('/storybook/?path=/story/ui-component--all-variants');
    
    // Take screenshots of each variant
    const variants = ['default', 'primary', 'secondary', 'destructive', 'outline', 'ghost'];
    
    for (const variant of variants) {
      await page.locator(`[data-variant="${variant}"]`).screenshot({
        path: `screenshots/component-${variant}.png`,
        animations: 'disabled',
      });
    }
    
    // Compare with baseline
    await expect(page).toHaveScreenshot('component-all-variants.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow minor rendering differences
      threshold: 0.2, // 20% difference threshold
    });
  });
  
  // Before/After migration comparison
  test('migration preserves visual appearance', async ({ page }) => {
    // Capture baseline before migration
    await page.goto('/components/old-component');
    const beforeMigration = await page.screenshot();
    
    // Navigate to migrated component
    await page.goto('/components/new-component');
    const afterMigration = await page.screenshot();
    
    // Compare screenshots
    expect(afterMigration).toMatchSnapshot('migration-comparison.png', {
      maxDiffPixelRatio: 0.01, // Allow 1% difference
    });
  });
});
```

### 3. Storybook 9 Integration Testing

```typescript
// File: components/ui/component.stories.tsx
// Storybook 9 with visual testing setup

import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Component } from './component';

const meta = {
  title: 'UI/Component',
  component: Component,
  parameters: {
    // Chromatic visual testing configuration
    chromatic: { 
      pauseAnimationAtEnd: true,
      disableSnapshot: false,
    },
  },
  tags: ['autodocs', 'visual-test'],
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

// Test all variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <Component variant="default">Default</Component>
      <Component variant="primary">Primary</Component>
      <Component variant="secondary">Secondary</Component>
      <Component variant="destructive">Destructive</Component>
      <Component variant="outline">Outline</Component>
      <Component variant="ghost">Ghost</Component>
    </div>
  ),
};

// Interactive state testing
export const InteractiveStates: Story = {
  render: () => <Component>Interactive Component</Component>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const component = await canvas.getByText('Interactive Component');
    
    // Test hover state
    await userEvent.hover(component);
    await expect(component).toHaveClass(/hover:/);
    
    // Test focus state
    await userEvent.tab();
    await expect(component).toHaveClass(/focus-visible:/);
    
    // Test disabled state
    component.setAttribute('disabled', 'true');
    await expect(component).toHaveClass(/disabled:/);
  },
};

// Accessibility testing
export const AccessibilityCompliant: Story = {
  parameters: {
    a11y: {
      // Axe accessibility testing configuration
      config: {
        rules: {
          'color-contrast': { enabled: true },
          'valid-aria-roles': { enabled: true },
        },
      },
    },
  },
};
```

### 4. Performance Testing Strategy

```typescript
// File: tests/performance/component-bundle.test.ts

import { measureComponentBundle } from '@/tests/utils/bundle-analyzer';

describe('Component Bundle Performance', () => {
  it('should maintain bundle size targets', async () => {
    const analysis = await measureComponentBundle('component');
    
    // CSS size targets (post-migration)
    expect(analysis.css.total).toBeLessThan(2000); // 2KB per component
    expect(analysis.css.darkModeClasses).toBe(0); // No dark mode classes
    
    // JS bundle targets
    expect(analysis.js.total).toBeLessThan(5000); // 5KB per component
    
    // Performance metrics
    expect(analysis.renderTime).toBeLessThan(16); // 60fps target
  });
});

// Runtime performance testing
test('component renders within performance budget', async ({ page }) => {
  await page.goto('/performance-test/component');
  
  const metrics = await page.evaluate(() => {
    const entry = performance.getEntriesByType('navigation')[0];
    return {
      fcp: entry.responseStart, // First Contentful Paint
      lcp: entry.loadEventEnd, // Largest Contentful Paint
    };
  });
  
  expect(metrics.fcp).toBeLessThan(1800); // 1.8s FCP target
  expect(metrics.lcp).toBeLessThan(2500); // 2.5s LCP target
});
```

### 5. E2E Testing for Critical User Flows

```typescript
// File: tests/e2e/critical-flows.spec.ts
// Based on risk assessment critical paths

import { test, expect } from '@playwright/test';

test.describe('Critical User Flow - Resume Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as test user
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
  });
  
  test('resume creation flow works with migrated components', async ({ page }) => {
    await page.goto('/resume/create');
    
    // Test migrated Card component in template selection
    await expect(page.locator('[data-slot="card"]')).toBeVisible();
    await page.click('[data-template="professional"]');
    
    // Test migrated Tabs component in section navigation
    await expect(page.locator('[data-slot="tabs"]')).toBeVisible();
    await page.click('[role="tab"][data-value="experience"]');
    
    // Test migrated Textarea in content editing
    await page.fill('[data-slot="textarea"]', 'Senior Software Engineer');
    
    // Test migrated Switch in AI features
    await page.click('[data-slot="switch"][aria-label="Enable AI suggestions"]');
    
    // Verify ATS score display (Progress component)
    await expect(page.locator('[data-slot="progress"]')).toBeVisible();
    await expect(page.locator('[data-score]')).toHaveText(/\d+%/);
    
    // Save and verify
    await page.click('button:has-text("Save Resume")');
    await expect(page).toHaveURL(/\/resume\/[\w-]+$/);
  });
});
```

## Quality Gates & Validation

### Pre-Migration Checklist

```yaml
# .github/workflows/pre-migration-checks.yml
name: Pre-Migration Quality Gates

on:
  pull_request:
    paths:
      - 'components/ui/**'

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - name: Check dark mode classes
        run: |
          if grep -r "dark:" components/ui/; then
            echo "❌ Dark mode classes found"
            exit 1
          fi
          
      - name: Check hard-coded colors
        run: |
          if grep -rE "bg-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}" components/ui/; then
            echo "❌ Hard-coded color classes found"
            exit 1
          fi
          
      - name: Validate semantic tokens
        run: npm run validate:colors
        
      - name: Run visual regression tests
        run: npm run test:visual
        
      - name: Check bundle size
        run: npm run analyze:bundle
```

### Component Testing Protocol

```typescript
// Testing checklist for each component migration
export const COMPONENT_TESTING_PROTOCOL = {
  required: [
    'unit-tests',           // Jest/Vitest unit tests
    'visual-regression',    // Playwright screenshots
    'storybook-stories',    // All component states
    'accessibility-audit',  // WCAG 2.1 AA compliance
    'bundle-analysis',      // Performance metrics
  ],
  
  optional: [
    'interaction-tests',    // For interactive components
    'e2e-integration',      // For critical path components
    'cross-browser',        // For high-risk components
  ],
  
  thresholds: {
    coverage: 95,           // Test coverage requirement
    performance: {
      bundleSize: 5000,     // Max 5KB per component
      renderTime: 16,       // 60fps requirement
    },
    accessibility: {
      violations: 0,        // Zero WCAG violations
      contrastRatio: 4.5,   // Minimum contrast
    },
  },
};
```

### Migration Validation Script

```javascript
// scripts/validate-migration.js
const fs = require('fs');
const path = require('path');

async function validateMigration(componentPath) {
  const validations = {
    noDarkModeClasses: checkNoDarkMode(componentPath),
    semanticColorsOnly: checkSemanticColors(componentPath),
    dataSlotAttribute: checkDataSlot(componentPath),
    testsExist: checkTestCoverage(componentPath),
    storybookStory: checkStorybookStory(componentPath),
    visualSnapshot: checkVisualSnapshot(componentPath),
  };
  
  const results = await Promise.all(Object.values(validations));
  const allPassed = results.every(r => r.passed);
  
  if (!allPassed) {
    console.error('❌ Migration validation failed');
    process.exit(1);
  }
  
  console.log('✅ Component migration validated successfully');
}

// Validation functions
function checkNoDarkMode(file) {
  const content = fs.readFileSync(file, 'utf8');
  return {
    passed: !content.includes('dark:'),
    message: 'No dark mode classes found',
  };
}

function checkSemanticColors(file) {
  const content = fs.readFileSync(file, 'utf8');
  const hardCodedColors = /bg-(gray|white|black)-\d{2,3}/g;
  return {
    passed: !hardCodedColors.test(content),
    message: 'Uses semantic colors only',
  };
}

// Run validation
validateMigration(process.argv[2]);
```

## Rollback Procedures

### Component-Level Rollback

```bash
#!/bin/bash
# scripts/rollback-component.sh

COMPONENT=$1
BASELINE_BRANCH="dark-mode-baseline"

# Rollback single component
git checkout $BASELINE_BRANCH -- components/ui/$COMPONENT.tsx

# Rollback tests if they exist
if [ -f "components/ui/__tests__/$COMPONENT.test.tsx" ]; then
  git checkout $BASELINE_BRANCH -- components/ui/__tests__/$COMPONENT.test.tsx
fi

# Rollback stories
if [ -f "components/ui/$COMPONENT.stories.tsx" ]; then
  git checkout $BASELINE_BRANCH -- components/ui/$COMPONENT.stories.tsx
fi

# Rebuild and test
npm run build
npm run test -- --testPathPattern=$COMPONENT
```

### Monitoring During Migration

```typescript
// monitoring/migration-metrics.ts
export interface MigrationMetrics {
  component: string;
  timestamp: Date;
  metrics: {
    darkModeClassesRemoved: number;
    semanticTokensAdded: number;
    bundleSizeChange: number;
    performanceChange: number;
    visualRegressions: number;
    accessibilityIssues: number;
  };
  status: 'success' | 'failed' | 'rollback';
}

// Track migration progress
export async function trackMigration(component: string, metrics: MigrationMetrics) {
  // Log to monitoring service
  await logger.info('Component migration completed', {
    component,
    ...metrics,
  });
  
  // Check thresholds
  if (metrics.metrics.visualRegressions > 0) {
    await alertTeam('Visual regression detected', component);
  }
  
  if (metrics.metrics.bundleSizeChange > 1000) { // 1KB increase
    await alertTeam('Bundle size increased', component);
  }
}
```

## Success Criteria

### Technical Success Metrics
1. **Zero dark mode classes** in migrated components
2. **100% semantic color usage**
3. **95%+ test coverage** maintained
4. **Zero accessibility violations**
5. **<5KB bundle size** per component
6. **Zero visual regressions** (or approved changes)

### Quality Assurance Metrics
1. **All tests passing** (unit, integration, visual, E2E)
2. **Storybook stories** updated and reviewed
3. **Performance budgets** maintained
4. **Cross-browser compatibility** verified
5. **Documentation** updated

### Business Success Metrics
1. **Zero user-facing bugs** from migration
2. **No increase in support tickets**
3. **Performance improvements** measurable
4. **Development velocity** maintained

## Animation Migration Patterns
*Added: January 16, 2025 during Task 0.7 gap analysis*

### Key Finding
Tailwind v4 introduces CSS-first animation configuration using `--animate-*` theme variables, enabling @keyframes definition directly in CSS without JavaScript configuration files.

### Migration Pattern for Animations

```css
/* app/globals.css - Animation definitions in @theme */
@theme {
  /* Define custom animations */
  --animate-slide-in: slide-in 0.3s ease-out;
  --animate-fade-in: fade-in 0.2s ease-in;
  --animate-scale-up: scale-up 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Keyframes definitions */
  @keyframes slide-in {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scale-up {
    from { transform: scale(0.95); }
    to { transform: scale(1); }
  }
}
```

### Component Implementation Example

```typescript
// Migrating animated components (e.g., switch.tsx, tabs.tsx)
const animatedComponentVariants = cva(
  "transition-all duration-200 ease-in-out", // Base transition classes
  {
    variants: {
      state: {
        entering: "animate-slide-in",
        leaving: "animate-fade-out opacity-0",
        idle: ""
      }
    }
  }
);

// Using @starting-style for enter transitions (no JS required)
const TabPanel = ({ children, isActive }) => (
  <div
    className={cn(
      "opacity-100 transition-opacity duration-300",
      !isActive && "opacity-0 pointer-events-none"
    )}
    style={{
      '@starting-style': {
        opacity: 0
      }
    }}
  >
    {children}
  </div>
);
```

### Dynamic Animation Values

```typescript
// For dynamic animation values, use CSS custom properties
const AnimatedProgress = ({ value }: { value: number }) => (
  <div
    className="h-2 bg-primary transition-all duration-500 ease-out"
    style={{
      '--progress-width': `${value}%`,
      width: 'var(--progress-width)'
    }}
  />
);
```

### Performance Considerations

1. **CSS Animations vs JavaScript**: CSS animations are GPU-accelerated and more performant
2. **will-change Property**: Use sparingly for critical animations
3. **Reduced Motion**: Always respect user preferences

```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Sources
- [Tailwind CSS v4.0 Blog Post](https://tailwindcss.com/blog/tailwindcss-v4) - @starting-style support
- [Tailwind CSS Animation Docs](https://tailwindcss.com/docs/animation) - CSS-first animation patterns

## Implementation Timeline

### Week 1: High-Risk Components
- Implement migration patterns
- Set up testing infrastructure
- Migrate tabs.tsx and switch.tsx
- Validate with comprehensive tests

### Week 2: Core Components  
- Apply proven patterns
- Migrate card.tsx and textarea.tsx
- Run full regression suite
- Monitor performance metrics

### Week 3: Remaining Components
- Complete all UI component migrations
- Update all Storybook stories
- Run cross-browser testing
- Prepare for production

### Week 4: Validation & Polish
- Complete E2E testing
- Performance optimization
- Documentation updates
- Production deployment preparation

---

**Specification Status**: COMPLETE  
**Next Step**: Task 1.4 - Establish performance budgets and quality gates  
**Research Foundation**: Latest 2025 patterns from Playwright, Storybook 9, React 19