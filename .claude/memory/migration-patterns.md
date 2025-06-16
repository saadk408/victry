# Component Migration Patterns and Testing Strategies

Generated: January 16, 2025
Purpose: Define comprehensive patterns for migrating components from dark mode to semantic color system
Status: Complete ✓

## Table of Contents
1. [Migration Philosophy](#migration-philosophy)
2. [Component Migration Template](#component-migration-template)
3. [Risk-Based Migration Order](#risk-based-migration-order)
4. [Testing Strategy](#testing-strategy)
5. [Dark Mode Removal Patterns](#dark-mode-removal-patterns)
6. [Semantic Color Application](#semantic-color-application)
7. [Dependency Handling](#dependency-handling)
8. [Rollback Procedures](#rollback-procedures)
9. [Success Validation](#success-validation)
10. [Common Pitfalls](#common-pitfalls)

## Migration Philosophy

### Core Principles
1. **Zero Visual Regression**: Users see no unintended changes
2. **Progressive Enhancement**: Migrate incrementally with validation
3. **Dependency Awareness**: Handle cascading component relationships
4. **Testing First**: Write tests before migration begins
5. **Rollback Ready**: Every change must be reversible

### Research Integration
This specification synthesizes:
- `research/risk-assessment.md`: Component priorities and dependencies
- `research/playwright-visual-regression.md`: Testing configurations
- `color-system-spec.md`: Semantic token mappings
- `tailwind-v4-spec.md`: CSS-first patterns

## Component Migration Template

### Pre-Migration Checklist

```markdown
## Component: [component-name].tsx
Migration Priority: [HIGH/MEDIUM/LOW]
Risk Score: [X.X/10]
Dependencies: [List of dependent components]

### Pre-Migration Tasks
- [ ] Create feature branch: `feat/migrate-[component-name]`
- [ ] Capture visual regression baseline
- [ ] Document current dark mode classes
- [ ] Identify all component variants
- [ ] Review dependent components
- [ ] Write migration tests
```

### Step-by-Step Migration Process

#### Step 1: Analyze Current Implementation
```typescript
// 1. Document all dark mode classes in component
// Example from switch.tsx (16 dark classes):
const darkClasses = [
  'dark:data-[state=checked]:bg-gray-50',
  'dark:data-[state=unchecked]:bg-gray-800',
  'dark:focus-visible:ring-gray-300',
  'dark:border-gray-700',
  // ... document all
];

// 2. Map to semantic equivalents
const colorMappings = {
  'dark:bg-gray-950': 'bg-background',
  'dark:bg-gray-800': 'bg-surface-subtle',
  'dark:text-gray-50': 'text-foreground',
  'dark:text-gray-400': 'text-foreground-muted',
  'dark:border-gray-800': 'border-border',
};
```

#### Step 2: Create Test Suite
```typescript
// tests/components/[component-name].test.tsx
import { test, expect } from '@playwright/test';
import { preparePageForScreenshot } from '../helpers';

test.describe('[ComponentName] Migration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/[component-name]');
    await preparePageForScreenshot(page);
  });

  // Visual regression test
  test('maintains visual consistency', async ({ page }) => {
    await expect(page.locator('[data-testid="component"]')).toHaveScreenshot(
      '[component-name]-default.png'
    );
  });

  // Interaction tests
  test('interactive states work correctly', async ({ page }) => {
    const component = page.locator('[data-testid="component"]');
    
    // Hover state
    await component.hover();
    await expect(component).toHaveScreenshot('[component-name]-hover.png');
    
    // Focus state
    await component.focus();
    await expect(component).toHaveScreenshot('[component-name]-focus.png');
    
    // Active state
    await component.click();
    await expect(component).toHaveScreenshot('[component-name]-active.png');
  });

  // Accessibility test
  test('meets WCAG requirements', async ({ page }) => {
    const results = await page.evaluate(() => {
      // @ts-ignore
      return window.axe.run();
    });
    expect(results.violations).toHaveLength(0);
  });
});
```

#### Step 3: Apply Semantic Colors
```typescript
// Before (with dark mode)
className={cn(
  "rounded-lg border bg-white text-gray-950 shadow-xs",
  "dark:bg-gray-950 dark:text-gray-50 dark:border-gray-800",
  className
)}

// After (semantic only)
className={cn(
  "rounded-lg border bg-surface text-foreground shadow-xs",
  className
)}
```

#### Step 4: Update Component Variants
```typescript
// Example: Button variants with semantic colors
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-surface border border-border hover:bg-surface-muted",
        destructive: "bg-error text-white hover:bg-error-dark",
        ghost: "hover:bg-surface-subtle hover:text-foreground",
      }
    }
  }
);
```

#### Step 5: Validate Changes
```bash
# Run component tests
npm test -- tests/components/[component-name].test.tsx

# Check visual regression
npm run test:visual -- --grep "[component-name]"

# Verify no TypeScript errors
npm run type-check

# Check accessibility
npm run test:a11y -- [component-name]
```

## Risk-Based Migration Order

### Phase 1: High-Risk Components (Week 1)

#### 1. tabs.tsx - Critical Navigation Component
```typescript
// Risk Score: 8.5/10
// Dependencies: Resume sections, AI controls
// Dark Classes: 13

// Migration Focus Areas:
// - data-[state=active] styling
// - Focus-visible states
// - Ring color coordination

// Special Considerations:
test('tabs maintain active state visibility', async ({ page }) => {
  const tab = page.locator('[role="tab"][data-state="active"]');
  await expect(tab).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(tab).toHaveCSS('color', 'rgb(23, 23, 23)');
});
```

#### 2. switch.tsx - Complex State Management
```typescript
// Risk Score: 8.2/10
// Dependencies: AI features, settings
// Dark Classes: 16 (highest)

// Migration Focus Areas:
// - data-[state=checked] transitions
// - Accessibility preservation
// - Animation continuity

// Special Considerations:
test('switch accessibility maintained', async ({ page }) => {
  const switchEl = page.locator('[role="switch"]');
  await expect(switchEl).toHaveAttribute('aria-checked', 'false');
  await switchEl.click();
  await expect(switchEl).toHaveAttribute('aria-checked', 'true');
});
```

### Phase 2: Medium-Risk Components (Week 2)

#### 3. card.tsx - Foundation Component
```typescript
// Risk Score: 7.1/10
// Dependencies: Auth, resume, AI features
// Dark Classes: 3

// Simple migration but high usage
const cardClasses = cn(
  "rounded-lg border bg-surface text-foreground shadow-xs",
  interactive && "hover:bg-surface-subtle transition-colors",
  className
);
```

#### 4. textarea.tsx - Form Input Component
```typescript
// Risk Score: 6.3/10
// Dependencies: Resume editing, forms
// Dark Classes: 7

// Focus on form states
const textareaClasses = cn(
  "flex min-h-[80px] w-full rounded-md border bg-surface px-3 py-2",
  "text-foreground placeholder:text-foreground-subtle",
  "focus:border-primary focus:ring-2 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
  className
);
```

### Phase 3: Low-Risk Components (Week 3)

#### 5. progress.tsx - Status Indicator
```typescript
// Risk Score: 4.1/10
// Dependencies: ATS score display
// Dark Classes: 6

// Status color preservation
const progressVariants = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};
```

## Testing Strategy

### Visual Regression Test Setup

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: false,
    },
  },
  
  expect: {
    toMatchSnapshot: { 
      threshold: 0.1, // 10% tolerance for migration
      maxDiffPixels: 50,
      animations: 'disabled',
    },
  },
});
```

### Test Categories by Component Risk

#### High-Risk Component Tests
```typescript
// Comprehensive test suite for tabs, switch
describe('High-Risk Component: Tabs', () => {
  // 1. Visual consistency across all states
  test.describe('Visual Regression', () => {
    const states = ['default', 'hover', 'focus', 'active', 'disabled'];
    
    for (const state of states) {
      test(`${state} state appearance`, async ({ page }) => {
        // Test implementation
      });
    }
  });

  // 2. Interaction flows
  test.describe('User Interactions', () => {
    test('tab switching preserves content', async ({ page }) => {
      // Verify content persistence
    });
    
    test('keyboard navigation works', async ({ page }) => {
      // Test arrow key navigation
    });
  });

  // 3. Integration with parent components
  test.describe('Integration Tests', () => {
    test('works within resume builder', async ({ page }) => {
      await page.goto('/resume/edit');
      // Test tabs in context
    });
  });
});
```

#### Medium-Risk Component Tests
```typescript
// Focused test suite for card, textarea
describe('Medium-Risk Component: Card', () => {
  // 1. Basic visual regression
  test('default appearance', async ({ page }) => {
    await expect(page.locator('.card')).toHaveScreenshot();
  });

  // 2. Variant testing
  test.describe('Card Variants', () => {
    const variants = ['default', 'interactive', 'bordered'];
    
    for (const variant of variants) {
      test(`${variant} variant`, async ({ page }) => {
        // Test each variant
      });
    }
  });
});
```

#### Low-Risk Component Tests
```typescript
// Minimal test suite for progress, alert
describe('Low-Risk Component: Progress', () => {
  // Single visual test per variant
  test('progress bar variants', async ({ page }) => {
    const variants = ['default', 'success', 'warning', 'error'];
    
    for (const variant of variants) {
      await expect(
        page.locator(`.progress-${variant}`)
      ).toHaveScreenshot(`progress-${variant}.png`);
    }
  });
});
```

### Accessibility Testing Requirements

```typescript
// helpers/accessibility.ts
import { test } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

export async function testAccessibility(page, componentSelector) {
  await injectAxe(page);
  
  // Component-specific checks
  await checkA11y(page, componentSelector, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    },
    axeOptions: {
      rules: {
        'color-contrast': { enabled: true },
        'focus-visible': { enabled: true },
        'aria-roles': { enabled: true },
      }
    }
  });
}

// Usage in tests
test('component meets WCAG AA', async ({ page }) => {
  await testAccessibility(page, '[data-testid="component"]');
});
```

### Performance Testing

```typescript
// helpers/performance.ts
export async function measureComponentPerformance(page, componentUrl) {
  const metrics = await page.evaluate(() => {
    return {
      renderTime: performance.now(),
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
      layoutShifts: performance
        .getEntriesByType('layout-shift')
        .reduce((sum, entry) => sum + entry.value, 0),
    };
  });
  
  return metrics;
}

// Performance regression test
test('component performance unchanged', async ({ page }) => {
  const before = await measureComponentPerformance(page, '/old-component');
  const after = await measureComponentPerformance(page, '/new-component');
  
  expect(after.renderTime).toBeLessThanOrEqual(before.renderTime * 1.1);
  expect(after.layoutShifts).toBeLessThanOrEqual(before.layoutShifts);
});
```

## Dark Mode Removal Patterns

### Pattern 1: Simple Background/Foreground
```typescript
// Before
className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50"

// After
className="bg-surface text-foreground"
```

### Pattern 2: Complex State-Based Classes
```typescript
// Before (switch.tsx example)
className={cn(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
  "border-2 border-transparent transition-colors",
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-800",
  "data-[state=checked]:bg-gray-900 dark:data-[state=checked]:bg-gray-50"
)}

// After
className={cn(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
  "border-2 border-transparent transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "data-[state=unchecked]:bg-surface-muted",
  "data-[state=checked]:bg-primary"
)}
```

### Pattern 3: Hover/Focus States
```typescript
// Before
className={cn(
  "hover:bg-gray-100 dark:hover:bg-gray-800",
  "focus:ring-gray-950 dark:focus:ring-gray-300"
)}

// After
className={cn(
  "hover:bg-surface-subtle",
  "focus:ring-ring"
)}
```

### Pattern 4: Border Colors
```typescript
// Before
className="border-gray-200 dark:border-gray-800"

// After
className="border-border"
```

### Pattern 5: Status Colors
```typescript
// Before (progress.tsx)
const colorClasses = {
  blue: "bg-blue-500 dark:bg-blue-500",
  green: "bg-green-500 dark:bg-green-500", 
  red: "bg-red-500 dark:bg-red-500",
};

// After
const colorClasses = {
  primary: "bg-primary",
  success: "bg-success",
  error: "bg-error",
};
```

## Semantic Color Application

### Color Token Usage Guidelines

```typescript
// 1. Background Hierarchy
"bg-background"     // Page background
"bg-surface"        // Card/component background
"bg-surface-subtle" // Subtle backgrounds
"bg-surface-muted"  // Muted backgrounds

// 2. Text Hierarchy
"text-foreground"        // Primary text
"text-foreground-muted"  // Secondary text
"text-foreground-subtle" // Tertiary text
"text-foreground-disabled" // Disabled text

// 3. Interactive States
"bg-primary hover:bg-primary-hover active:bg-primary-active"
"focus:ring-ring focus:ring-offset-2"

// 4. Status Indicators
"bg-success text-success-dark"     // Success states
"bg-warning text-warning-dark"     // Warning states
"bg-error text-error-dark"         // Error states
"bg-info text-info-dark"           // Info states
```

### Component-Specific Applications

#### Form Inputs
```typescript
// Input field pattern
const inputClasses = cn(
  "flex h-10 w-full rounded-md border px-3 py-2 text-sm",
  "bg-surface text-foreground",
  "border-border focus:border-primary",
  "placeholder:text-foreground-subtle",
  "focus:outline-none focus:ring-2 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
  error && "border-error focus:border-error focus:ring-error",
  className
);
```

#### Interactive Cards
```typescript
// Card with hover effect
const cardClasses = cn(
  "rounded-lg border p-6",
  "bg-surface text-foreground",
  "border-border",
  interactive && [
    "transition-all duration-200",
    "hover:bg-surface-subtle",
    "hover:border-border-strong",
    "hover:shadow-md",
    "cursor-pointer"
  ],
  className
);
```

## Dependency Handling

### Component Dependency Matrix

```typescript
// dependency-map.ts
export const componentDependencies = {
  // UI Layer Dependencies
  'button': [],
  'input': [],
  'card': [],
  'tabs': [],
  'form': ['input', 'button'],
  'textarea': ['input'],
  'switch': [],
  'popover': ['card'],
  'alert': ['card'],
  'progress': [],
  
  // Feature Layer Dependencies
  'login-form': ['button', 'input', 'card'],
  'register-form': ['button', 'input', 'card', 'form'],
  'section-editor': ['card', 'tabs', 'input', 'button', 'textarea'],
  'ats-score': ['progress', 'card'],
  'ai-suggestion': ['card', 'button'],
  'tailoring-controls': ['tabs', 'switch'],
};

// Helper to get migration order
export function getMigrationOrder(component: string): string[] {
  const deps = componentDependencies[component] || [];
  const order = [];
  
  // Recursively get all dependencies
  function addDeps(comp: string) {
    const compDeps = componentDependencies[comp] || [];
    for (const dep of compDeps) {
      if (!order.includes(dep)) {
        addDeps(dep);
        order.push(dep);
      }
    }
  }
  
  addDeps(component);
  order.push(component);
  
  return order;
}
```

### Handling Cascading Changes

```typescript
// When migrating a parent component
async function migrateWithDependencies(componentName: string) {
  const migrationOrder = getMigrationOrder(componentName);
  
  for (const component of migrationOrder) {
    // 1. Check if already migrated
    if (await isComponentMigrated(component)) {
      continue;
    }
    
    // 2. Run pre-migration tests
    await runTests(`pre-migration/${component}`);
    
    // 3. Apply migration
    await migrateComponent(component);
    
    // 4. Run post-migration tests
    await runTests(`post-migration/${component}`);
    
    // 5. Update migration status
    await markComponentMigrated(component);
  }
}
```

## Rollback Procedures

### Component-Level Rollback

```bash
#!/bin/bash
# rollback-component.sh

COMPONENT=$1
BASELINE_BRANCH="dark-mode-baseline"

# Function to rollback single component
rollback_component() {
  echo "Rolling back $COMPONENT..."
  
  # Restore component file
  git checkout $BASELINE_BRANCH -- "components/ui/${COMPONENT}.tsx"
  
  # Restore associated tests
  git checkout $BASELINE_BRANCH -- "tests/components/${COMPONENT}.test.tsx"
  
  # Restore visual baselines
  git checkout $BASELINE_BRANCH -- "tests/visual/screenshots/${COMPONENT}-*.png"
  
  echo "Rollback complete for $COMPONENT"
}

# Execute rollback
rollback_component

# Rebuild and test
npm run build
npm test -- --grep $COMPONENT
```

### Feature-Level Rollback

```typescript
// rollback-strategies.ts
export const rollbackStrategies = {
  // Level 1: Single component (5 min)
  component: async (componentName: string) => {
    await exec(`git checkout dark-mode-baseline -- components/ui/${componentName}.tsx`);
    await exec('npm run build');
    await exec('npm test');
  },
  
  // Level 2: Feature area (15 min)
  feature: async (featureName: string) => {
    const components = getFeatureComponents(featureName);
    for (const comp of components) {
      await rollbackStrategies.component(comp);
    }
  },
  
  // Level 3: Complete rollback (30 min)
  complete: async () => {
    await exec('git revert --no-edit dark-mode-removal-start..HEAD');
    await exec('npm run build');
    await exec('npm run test:all');
  },
};
```

### Rollback Decision Matrix

```typescript
// Automated rollback triggers
const rollbackTriggers = {
  visualRegression: {
    threshold: 5, // >5 visual test failures
    action: 'component',
    priority: 'HIGH',
  },
  
  accessibilityFailure: {
    threshold: 1, // Any WCAG failure
    action: 'component',
    priority: 'CRITICAL',
  },
  
  performanceRegression: {
    threshold: 20, // >20% slower
    action: 'feature',
    priority: 'HIGH',
  },
  
  userFlowBreakage: {
    threshold: 1, // Any critical flow broken
    action: 'complete',
    priority: 'CRITICAL',
  },
};
```

## Success Validation

### Component Migration Checklist

```typescript
// validation-checklist.ts
export interface MigrationValidation {
  component: string;
  checks: {
    // Visual checks
    visualRegression: boolean;
    allStatesChecked: boolean;
    responsiveChecked: boolean;
    
    // Functional checks
    interactionsWork: boolean;
    animationsSmooth: boolean;
    eventsFireCorrectly: boolean;
    
    // Code quality checks
    noHardcodedColors: boolean;
    semanticTokensUsed: boolean;
    typescriptValid: boolean;
    
    // Performance checks
    renderTimeAcceptable: boolean;
    noCLS: boolean;
    bundleSizeReduced: boolean;
    
    // Accessibility checks
    wcagCompliant: boolean;
    keyboardNavigable: boolean;
    screenReaderTested: boolean;
  };
}

// Validation runner
export async function validateMigration(
  component: string
): Promise<MigrationValidation> {
  const validation: MigrationValidation = {
    component,
    checks: {
      // Run all validation checks
      visualRegression: await checkVisualRegression(component),
      allStatesChecked: await checkAllStates(component),
      responsiveChecked: await checkResponsive(component),
      // ... etc
    },
  };
  
  // All checks must pass
  const allPassed = Object.values(validation.checks).every(v => v === true);
  
  if (!allPassed) {
    throw new Error(`Migration validation failed for ${component}`);
  }
  
  return validation;
}
```

### Success Metrics

```typescript
// Per-component success criteria
const successCriteria = {
  // Technical metrics
  visualTestsPass: 100, // %
  accessibilityScore: 100, // WCAG AA
  performanceImproved: true,
  bundleSizeReduced: true,
  
  // Code quality metrics
  noColorHardcoding: true,
  semanticTokenCoverage: 100, // %
  testCoverage: 95, // %
  
  // User experience metrics
  noVisualBreaks: true,
  interactionsPreserved: true,
  animationsContinuous: true,
};
```

## Common Pitfalls

### Pitfall 1: Incomplete State Coverage
```typescript
// ❌ Wrong: Only testing default state
test('button looks correct', async ({ page }) => {
  await expect(page.locator('.btn')).toHaveScreenshot();
});

// ✅ Correct: Test all states
test.describe('button states', () => {
  const states = ['default', 'hover', 'focus', 'active', 'disabled'];
  
  for (const state of states) {
    test(`${state} state`, async ({ page }) => {
      const button = page.locator('.btn');
      
      switch (state) {
        case 'hover':
          await button.hover();
          break;
        case 'focus':
          await button.focus();
          break;
        case 'active':
          await button.click({ delay: 100 });
          break;
        case 'disabled':
          await button.evaluate(el => el.disabled = true);
          break;
      }
      
      await expect(button).toHaveScreenshot(`button-${state}.png`);
    });
  }
});
```

### Pitfall 2: Missing Edge Cases
```typescript
// ❌ Wrong: Not considering data attributes
className="data-[state=active]:bg-white"

// ✅ Correct: Preserve data attribute styling
className="data-[state=active]:bg-surface"
```

### Pitfall 3: Animation Disruption
```typescript
// ❌ Wrong: Removing transition classes
className="bg-surface" // Lost transition

// ✅ Correct: Preserve animations
className="bg-surface transition-colors duration-200"
```

### Pitfall 4: Context Loss
```typescript
// ❌ Wrong: Testing component in isolation
await page.goto('/components/card');

// ✅ Correct: Test in real contexts
const contexts = [
  '/auth/login',      // Auth context
  '/resume/edit',     // Resume context
  '/dashboard',       // Dashboard context
];

for (const context of contexts) {
  test(`card in ${context}`, async ({ page }) => {
    await page.goto(context);
    await expect(page.locator('.card').first()).toHaveScreenshot(
      `card-${context.replace(/\//g, '-')}.png`
    );
  });
}
```

### Pitfall 5: Semantic Misuse
```typescript
// ❌ Wrong: Using primary for non-primary actions
<Button variant="primary">Cancel</Button>

// ✅ Correct: Use appropriate semantic variants
<Button variant="secondary">Cancel</Button>
<Button variant="primary">Save</Button>
```

## Research Attribution

This specification synthesizes insights from:
- `research/risk-assessment.md`: Component risk scores, dependency analysis, migration priorities
- `research/playwright-visual-regression.md`: Testing configurations, CI integration patterns
- `color-system-spec.md`: Semantic token mappings and usage guidelines
- `tailwind-v4-spec.md`: CSS-first patterns and migration syntax
- Modern testing best practices for component library migrations

The combination of risk-based prioritization with comprehensive testing ensures successful dark mode removal while maintaining visual consistency and user experience.