# Performance Budgets and Quality Gates Specification

Generated: January 16, 2025
Purpose: Define measurable targets and automated gates to ensure project success
Status: Complete ✓

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Performance Budgets](#performance-budgets)
3. [Quality Gates](#quality-gates)
4. [Automation Configuration](#automation-configuration)
5. [Monitoring Strategy](#monitoring-strategy)
6. [Success Criteria](#success-criteria)
7. [Rollback Triggers](#rollback-triggers)
8. [Implementation Timeline](#implementation-timeline)
9. [Measurement Methodology](#measurement-methodology)
10. [Research Attribution](#research-attribution)

## Executive Summary

### Current State vs Target State
Based on comprehensive baseline analysis from `research/performance-baseline.md`:

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **Largest Route JS** | 403 KB | 180 KB | -55% |
| **Average Route JS** | 150 KB | 50 KB | -67% |
| **Build Time** | 2000ms | 1500ms | -25% |
| **CSS Bundle** | Unknown | 50 KB | Establish |
| **Critical CSS** | Unknown | 14 KB | Establish |

### Key Objectives
1. **Reduce bundle sizes** to meet 2025 web standards
2. **Accelerate build times** for improved developer experience
3. **Ensure quality** through automated validation
4. **Prevent regression** with continuous monitoring

## Performance Budgets

### JavaScript Bundle Budgets

#### Route-Level Budgets
```javascript
const jsBudgets = {
  // Maximum sizes per route (compressed)
  routes: {
    '/': { max: 130, warn: 110 },                    // Home page
    '/auth/*': { max: 110, warn: 95 },              // Auth pages
    '/resume/[id]/edit': { max: 180, warn: 160 },   // Complex editor
    '/dashboard': { max: 150, warn: 130 },          // Dashboard
    '/*': { max: 130, warn: 110 },                  // Default for all others
  },
  
  // Shared chunks
  shared: {
    vendor: { max: 80, warn: 70 },                   // Third-party libs
    common: { max: 50, warn: 40 },                   // Shared components
    framework: { max: 60, warn: 50 },                // React/Next.js
  },
  
  // Total first load
  firstLoad: {
    max: 130,  // Hard limit (2025 standard)
    warn: 120, // Warning threshold
  }
};
```

#### Component-Level Budgets
```javascript
const componentBudgets = {
  // Individual component sizes (uncompressed)
  'ui/button': { max: 2, warn: 1.5 },
  'ui/card': { max: 2, warn: 1.5 },
  'ui/tabs': { max: 5, warn: 4 },
  'ui/switch': { max: 3, warn: 2.5 },
  'resume-editor': { max: 50, warn: 45 },
  'ai-suggestion': { max: 15, warn: 12 },
};
```

### CSS Bundle Budgets

#### Tailwind v4 CSS Targets
```javascript
const cssBudgets = {
  // Total CSS (compressed)
  total: {
    max: 50,   // KB - 2025 standard
    warn: 45,  // KB - Warning threshold
  },
  
  // Critical inline CSS
  critical: {
    max: 14,   // KB - Above-the-fold styles
    warn: 12,  // KB - Warning threshold
  },
  
  // Per-route CSS
  routes: {
    max: 10,   // KB - Route-specific styles
    warn: 8,   // KB - Warning threshold
  },
  
  // Expected reduction from dark mode removal
  darkModeReduction: {
    min: 25,   // KB - Minimum expected reduction
    target: 30 // KB - Target reduction
  }
};
```

### Build Performance Budgets

#### Development Build Targets
```javascript
const buildBudgets = {
  // With Turbopack (when stable)
  turbopack: {
    cold: { max: 1500, warn: 1200 },     // ms - First build
    hot: { max: 100, warn: 80 },         // ms - Incremental
  },
  
  // Standard builds
  webpack: {
    development: { max: 1500, warn: 1200 }, // ms
    production: { max: 3000, warn: 2500 },  // ms
  },
  
  // Type checking
  typeCheck: {
    max: 500,  // ms - Must complete quickly
    warn: 400, // ms
  }
};
```

### Core Web Vitals Budgets

#### User Experience Metrics
```javascript
const webVitalsBudgets = {
  // Largest Contentful Paint
  LCP: {
    max: 2500,  // ms - Good threshold
    warn: 2000, // ms - Target excellence
  },
  
  // First Input Delay
  FID: {
    max: 100,   // ms - Good threshold
    warn: 75,   // ms - Target excellence
  },
  
  // Cumulative Layout Shift
  CLS: {
    max: 0.1,   // Score - Good threshold
    warn: 0.05, // Score - Target excellence
  },
  
  // First Contentful Paint
  FCP: {
    max: 1800,  // ms - Good threshold
    warn: 1500, // ms - Target excellence
  }
};
```

## Quality Gates

### Code Quality Gates

#### Test Coverage Requirements
```javascript
const coverageGates = {
  // Overall coverage
  global: {
    statements: 95,    // % - Statements covered
    branches: 90,      // % - Branches covered
    functions: 95,     // % - Functions covered
    lines: 95,         // % - Lines covered
  },
  
  // Critical path coverage
  critical: {
    'components/ui/*': 100,           // % - UI components
    'components/resume/*': 98,        // % - Resume features
    'components/auth/*': 100,         // % - Auth components
    'lib/utils/status-colors': 100,   // % - Color utilities
  },
  
  // Minimum per-file
  perFile: {
    min: 80,  // % - No file below this
  }
};
```

#### Static Analysis Gates
```javascript
const codeQualityGates = {
  // TypeScript
  typescript: {
    strict: true,              // Strict mode required
    noImplicitAny: true,      // No implicit any
    errors: 0,                // Zero type errors
  },
  
  // ESLint
  eslint: {
    errors: 0,                // Zero errors allowed
    warnings: { max: 10 },    // Warning threshold
    semanticColors: {
      hardcodedColors: 0,     // No hardcoded colors
      darkModeClasses: 0,     // No dark: prefixes
    }
  },
  
  // Bundle analysis
  duplicates: {
    packages: 0,              // No duplicate packages
    threshold: '5%',          // Max duplication %
  }
};
```

### Accessibility Gates

#### WCAG Compliance Requirements
```javascript
const accessibilityGates = {
  // WCAG 2.1 Level AA
  wcag: {
    level: 'AA',
    violations: {
      critical: 0,     // No critical violations
      serious: 0,      // No serious violations
      moderate: 5,     // Max moderate violations
      minor: 10,       // Max minor violations
    }
  },
  
  // Color contrast
  contrast: {
    normal: 4.5,       // Minimum for normal text
    large: 3.0,        // Minimum for large text
    ui: 3.0,           // Minimum for UI components
  },
  
  // Keyboard navigation
  keyboard: {
    allInteractive: true,     // All interactive elements
    skipLinks: true,          // Skip navigation links
    focusVisible: true,       // Focus indicators visible
  },
  
  // Screen reader
  screenReader: {
    landmarks: true,          // ARIA landmarks present
    headingStructure: true,   // Logical heading hierarchy
    altText: 100,            // % images with alt text
  }
};
```

### Visual Regression Gates

#### Visual Testing Thresholds
```javascript
const visualRegressionGates = {
  // Playwright configuration (from research/playwright-visual-regression.md)
  playwright: {
    threshold: 0.1,          // 10% pixel difference tolerance
    maxDiffPixels: 50,       // Maximum different pixels
    animations: 'disabled',   // Consistent screenshots
  },
  
  // Component-specific tolerances
  components: {
    'high-risk': {           // tabs.tsx, switch.tsx
      threshold: 0.05,       // 5% - Stricter tolerance
      maxDiffPixels: 25,
    },
    'medium-risk': {         // card.tsx, textarea.tsx
      threshold: 0.1,        // 10% - Standard tolerance
      maxDiffPixels: 50,
    },
    'low-risk': {           // progress.tsx, alert.tsx
      threshold: 0.15,       // 15% - Relaxed tolerance
      maxDiffPixels: 75,
    }
  },
  
  // Critical user flows
  criticalFlows: {
    authentication: 0,       // 0% - No visual changes
    resumeCreation: 0.05,    // 5% - Minimal tolerance
    aiAnalysis: 0.05,        // 5% - Minimal tolerance
  }
};
```

### Performance Regression Gates

#### Runtime Performance Limits
```javascript
const performanceGates = {
  // Metrics must not regress
  regression: {
    renderTime: 1.1,         // Max 10% slower
    bundleSize: 1.0,         // No increase allowed
    memoryUsage: 1.1,        // Max 10% increase
    layoutShifts: 1.0,       // No increase in CLS
  },
  
  // Lighthouse scores
  lighthouse: {
    performance: 90,         // Minimum score
    accessibility: 100,      // Perfect score required
    bestPractices: 95,       // Near perfect
    seo: 90,                // Good SEO score
  }
};
```

## Automation Configuration

### CI/CD Pipeline Integration

#### GitHub Actions Workflow
```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  performance-budget:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        env:
          ANALYZE: true
          
      - name: Check bundle sizes
        run: |
          npm run check:bundle-size
          npm run check:route-sizes
          
      - name: Validate CSS budget
        run: npm run check:css-size
        
      - name: Upload bundle report
        uses: actions/upload-artifact@v4
        with:
          name: bundle-report
          path: .next/analyze/
          
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Type check
        run: npm run type-check
        
      - name: Lint with semantic color validation
        run: npm run lint:colors
        
      - name: Test coverage
        run: npm run test:coverage
        
      - name: Check coverage gates
        run: npm run check:coverage
        
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Start application
        run: |
          npm run build
          npm run start &
          npx wait-on http://localhost:3000
          
      - name: Run accessibility tests
        run: npm run test:a11y
        
      - name: Validate WCAG compliance
        run: npm run check:wcag
        
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
        
      - name: Run visual tests
        run: npm run test:visual
        
      - name: Upload diff images
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: test-results/
```

### Local Development Gates

#### Pre-commit Hooks
```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Type check
npm run type-check || exit 1

# Lint for hardcoded colors
npm run lint:colors || exit 1

# Check changed component sizes
npm run check:component-sizes --staged || exit 1

# Run tests for changed files
npm run test:changed || exit 1
```

#### Build-time Validation
```javascript
// scripts/validate-build.js
const fs = require('fs');
const path = require('path');

async function validateBuild() {
  const stats = JSON.parse(
    fs.readFileSync('.next/build-stats.json', 'utf8')
  );
  
  // Check route sizes
  for (const [route, size] of Object.entries(stats.routes)) {
    const budget = jsBudgets.routes[route] || jsBudgets.routes['/*'];
    if (size > budget.max * 1024) {
      throw new Error(`Route ${route} exceeds budget: ${size} > ${budget.max}KB`);
    }
  }
  
  // Check CSS size
  const cssSize = stats.css.total;
  if (cssSize > cssBudgets.total.max * 1024) {
    throw new Error(`CSS exceeds budget: ${cssSize} > ${cssBudgets.total.max}KB`);
  }
  
  console.log('✅ All budgets passed!');
}
```

## Monitoring Strategy

### Real-time Performance Monitoring

#### Client-side Monitoring
```typescript
// lib/monitoring/performance.ts
export function initPerformanceMonitoring() {
  // Core Web Vitals
  if ('web-vital' in window) {
    import('web-vitals').then(({ getCLS, getFID, getLCP, getFCP }) => {
      getCLS(metric => trackMetric('CLS', metric));
      getFID(metric => trackMetric('FID', metric));
      getLCP(metric => trackMetric('LCP', metric));
      getFCP(metric => trackMetric('FCP', metric));
    });
  }
  
  // Bundle size tracking
  if (process.env.NODE_ENV === 'production') {
    const scripts = document.querySelectorAll('script[src]');
    const totalSize = Array.from(scripts).reduce((sum, script) => {
      return sum + (script.getAttribute('data-size') || 0);
    }, 0);
    
    trackMetric('bundle-size', { value: totalSize });
  }
}

function trackMetric(name: string, metric: any) {
  // Send to monitoring service
  if (metric.value > webVitalsBudgets[name]?.max) {
    console.error(`Performance budget exceeded: ${name}`, metric);
    // Trigger alert
  }
}
```

#### Server-side Monitoring
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  // Track response time
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
  
  // Track route bundle size
  const route = request.nextUrl.pathname;
  const routeConfig = jsBudgets.routes[route] || jsBudgets.routes['/*'];
  response.headers.set('X-JS-Budget', `${routeConfig.max}KB`);
  
  return response;
}
```

### Alerting Thresholds

```javascript
const alertingConfig = {
  // Immediate alerts (page team)
  critical: {
    bundleSizeIncrease: '10%',      // Any route >10% over budget
    buildTimeIncrease: '50%',       // Build >50% slower
    coverageDrop: '5%',             // Coverage drops >5%
    wcagViolations: 1,              // Any WCAG violation
  },
  
  // Warning alerts (email)
  warning: {
    bundleSizeIncrease: '5%',       // Any route >5% over budget
    buildTimeIncrease: '25%',       // Build >25% slower
    coverageDrop: '2%',             // Coverage drops >2%
    visualRegression: 5,            // >5 visual differences
  },
  
  // Info alerts (dashboard only)
  info: {
    bundleSizeIncrease: '2%',       // Any route >2% over budget
    performanceScore: 5,            // Lighthouse drops 5 points
  }
};
```

## Success Criteria

### Phase Completion Gates

#### Phase 1-2: Architecture Setup
- [ ] Tailwind v4 CSS bundle < 50KB
- [ ] Build time < 1.5s with Turbopack
- [ ] All color validation scripts passing
- [ ] Zero hardcoded color violations

#### Phase 3: Component Migration
- [ ] 95% test coverage achieved
- [ ] Zero visual regression failures
- [ ] All WCAG AA tests passing
- [ ] Bundle size reduced by 25KB+

#### Phase 4: Testing & Validation
- [ ] All performance budgets met
- [ ] Quality gates automated in CI
- [ ] Monitoring configured
- [ ] Zero critical issues

#### Phase 5: Production Deployment
- [ ] Core Web Vitals all green
- [ ] Lighthouse scores >90
- [ ] No user-reported issues
- [ ] Performance improved by 25%+

### Definition of Done

A task is considered complete when:

```typescript
const definitionOfDone = {
  code: {
    testsPass: true,              // All tests green
    coverage: '>= 95%',           // Coverage threshold met
    typeCheck: 'passes',          // Zero TS errors
    lint: 'clean',                // Zero lint errors
    budgets: 'met',               // Within size budgets
  },
  
  quality: {
    accessible: 'WCAG AA',        // Accessibility verified
    visualRegression: 'passed',   // No unexpected changes
    performance: 'improved',      // Metrics better or same
    reviewed: true,               // Code review complete
  },
  
  documentation: {
    updated: true,                // Docs reflect changes
    examples: 'provided',         // Usage examples added
    migrationNotes: 'complete',   // Migration guide updated
  }
};
```

## Rollback Triggers

### Automatic Rollback Conditions

```javascript
const rollbackTriggers = {
  // Performance triggers
  performance: {
    errorRateIncrease: 5,         // >5% increase in errors
    responseTimeIncrease: 20,     // >20% slower responses
    bundleSizeIncrease: 50,       // >50KB unexpected increase
    conversionDrop: 10,           // >10% conversion decrease
  },
  
  // Quality triggers
  quality: {
    visualRegressionFailures: 5,   // >5 components affected
    accessibilityFailures: 1,      // Any WCAG failure
    testFailures: 10,              // >10 test failures
    coverageDrop: 5,               // >5% coverage decrease
  },
  
  // User experience triggers
  userExperience: {
    crashRate: 0.1,                // >0.1% crash rate
    userComplaints: 25,            // >25% increase in issues
    coreFlowFailure: 1,            // Any critical flow broken
  }
};

// Rollback decision matrix
function shouldRollback(metrics) {
  // Critical: Immediate rollback
  if (metrics.accessibilityFailures > 0) return { rollback: true, priority: 'CRITICAL' };
  if (metrics.coreFlowFailure > 0) return { rollback: true, priority: 'CRITICAL' };
  
  // High: Manual decision within 15 min
  if (metrics.errorRateIncrease > rollbackTriggers.performance.errorRateIncrease) {
    return { rollback: 'manual', priority: 'HIGH', timeLimit: '15min' };
  }
  
  // Medium: Team discussion within 1 hour
  if (metrics.visualRegressionFailures > rollbackTriggers.quality.visualRegressionFailures) {
    return { rollback: 'discuss', priority: 'MEDIUM', timeLimit: '1hour' };
  }
  
  return { rollback: false };
}
```

### Rollback Procedures

```bash
#!/bin/bash
# scripts/rollback.sh

LEVEL=$1  # component|feature|complete

case $LEVEL in
  component)
    echo "Rolling back component changes..."
    git checkout main -- components/ui/$2.tsx
    npm run build
    npm run test -- $2
    ;;
    
  feature)
    echo "Rolling back feature area..."
    git checkout main -- components/$2/
    npm run build
    npm run test:integration
    ;;
    
  complete)
    echo "Complete rollback initiated..."
    git revert --no-edit dark-mode-removal-start..HEAD
    npm run build
    npm run test:all
    npm run deploy:emergency
    ;;
esac
```

## Implementation Timeline

### Week 1: Foundation
- Set up performance monitoring
- Configure bundle analyzer
- Implement size checking scripts
- Create quality gate workflows

### Week 2-3: Migration
- Apply budgets to each component
- Validate after each migration
- Track metrics continuously
- Address violations immediately

### Week 4: Validation
- Complete quality audit
- Performance testing
- Final budget validation
- Production readiness check

### Post-Deployment
- Monitor all metrics for 48 hours
- Daily checks for 1 week
- Weekly reviews for 1 month
- Quarterly budget reviews

## Measurement Methodology

### Bundle Size Measurement

```javascript
// scripts/measure-bundle.js
const fs = require('fs');
const path = require('path');
const gzipSize = require('gzip-size');

async function measureBundles() {
  const buildDir = path.join(process.cwd(), '.next');
  const results = {
    routes: {},
    chunks: {},
    css: {},
    total: 0
  };
  
  // Measure route bundles
  const routesDir = path.join(buildDir, 'static/chunks/pages');
  for (const file of fs.readdirSync(routesDir)) {
    const content = fs.readFileSync(path.join(routesDir, file));
    const compressed = await gzipSize(content);
    results.routes[file] = compressed / 1024; // KB
  }
  
  // Measure CSS
  const cssDir = path.join(buildDir, 'static/css');
  for (const file of fs.readdirSync(cssDir)) {
    const content = fs.readFileSync(path.join(cssDir, file));
    const compressed = await gzipSize(content);
    results.css[file] = compressed / 1024; // KB
  }
  
  // Check against budgets
  validateBudgets(results);
  
  return results;
}
```

### Performance Testing

```javascript
// scripts/test-performance.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function testPerformance(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility'],
    port: chrome.port
  };
  
  const runnerResult = await lighthouse(url, options);
  
  // Check against budgets
  const scores = runnerResult.lhr.categories;
  if (scores.performance.score < 0.9) {
    throw new Error(`Performance score too low: ${scores.performance.score}`);
  }
  
  if (scores.accessibility.score < 1.0) {
    throw new Error(`Accessibility must be perfect: ${scores.accessibility.score}`);
  }
  
  await chrome.kill();
  return runnerResult.lhr;
}
```

### Visual Regression Testing

```typescript
// tests/visual-regression.spec.ts
import { test, expect } from '@playwright/test';
import { components } from './component-list';

for (const component of components) {
  test.describe(`Visual regression: ${component.name}`, () => {
    test('default state', async ({ page }) => {
      await page.goto(component.url);
      
      const tolerance = visualRegressionGates.components[component.risk].threshold;
      await expect(page).toHaveScreenshot(`${component.name}-default.png`, {
        threshold: tolerance,
        animations: 'disabled'
      });
    });
    
    test('all interactive states', async ({ page }) => {
      await page.goto(component.url);
      const states = ['hover', 'focus', 'active', 'disabled'];
      
      for (const state of states) {
        await page.locator(component.selector).evaluate((el, s) => {
          if (s === 'hover') el.dispatchEvent(new Event('mouseenter'));
          if (s === 'focus') el.focus();
          if (s === 'active') el.classList.add('active');
          if (s === 'disabled') el.disabled = true;
        }, state);
        
        await expect(page.locator(component.selector)).toHaveScreenshot(
          `${component.name}-${state}.png`
        );
      }
    });
  });
}
```

## Research Attribution

This specification synthesizes insights from:
- `research/performance-baseline.md`: Current metrics (403KB routes, 2s builds) and 2025 standards
- `research/nextjs-build-optimization.md`: Turbopack achieving 45.8% faster builds, critical CSS extraction
- `research/tailwind-v4.md`: 5x faster builds (100ms), 25-30KB bundle reduction potential
- `research/playwright-visual-regression.md`: Visual testing configuration with 10% tolerance
- `migration-patterns.md`: 95% test coverage target, WCAG AA compliance requirements
- Industry best practices for 2025 web performance standards

The combination of aggressive but achievable targets with comprehensive automation ensures successful dark mode removal while improving overall application performance.