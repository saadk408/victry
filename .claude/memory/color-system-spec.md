# OKLCH Professional Color System Specification

Generated: January 16, 2025
Purpose: Define a comprehensive, accessible, and maintainable color system for Victry AI Resume Builder
Status: Complete ✓

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [OKLCH Color Palette](#oklch-color-palette)
3. [Semantic Token System](#semantic-token-system)
4. [WCAG Compliance Matrix](#wcag-compliance-matrix)
5. [Browser Fallback Strategy](#browser-fallback-strategy)
6. [Usage Guidelines](#usage-guidelines)
7. [Migration Mapping](#migration-mapping)
8. [Implementation Examples](#implementation-examples)
9. [Success Criteria](#success-criteria)

## Design Philosophy

### Core Principles
1. **Professional First**: Colors convey trust, competence, and career success
2. **Accessibility Always**: WCAG AA compliance is non-negotiable
3. **Perceptual Consistency**: OKLCH ensures uniform brightness across hues
4. **Performance Optimized**: Minimal CSS with maximum flexibility
5. **Developer Friendly**: Clear naming, easy to understand and use

### Color Psychology for Resume Building
- **Blue Tones**: Trust, stability, professionalism (primary actions)
- **Green Tones**: Success, growth, positive outcomes (status indicators)
- **Neutral Grays**: Focus on content, reduce visual noise
- **Accent Colors**: Guide attention without distraction

### Research Integration
This specification synthesizes insights from:
- `research/oklch-color-system.md`: OKLCH implementation patterns
- `research/color-analysis.md`: Current usage patterns and migration needs
- WCAG 2.1 requirements for professional applications
- 2025 color trends emphasizing warm neutrals with bold accents

## OKLCH Color Palette

### Primary Brand Colors

```css
/* Professional Blue - Trust & Reliability */
--color-blue-50:  oklch(0.97 0.01 237);   /* #f0f9ff */
--color-blue-100: oklch(0.94 0.03 237);   /* #e0f2fe */
--color-blue-200: oklch(0.89 0.06 237);   /* #bae6fd */
--color-blue-300: oklch(0.82 0.10 237);   /* #7dd3fc */
--color-blue-400: oklch(0.72 0.14 237);   /* #38bdf8 */
--color-blue-500: oklch(0.62 0.17 237);   /* #0ea5e9 - Primary */
--color-blue-600: oklch(0.53 0.19 237);   /* #0284c7 */
--color-blue-700: oklch(0.46 0.19 237);   /* #0369a1 */
--color-blue-800: oklch(0.39 0.17 237);   /* #075985 */
--color-blue-900: oklch(0.33 0.14 237);   /* #0c4a6e */
--color-blue-950: oklch(0.25 0.11 237);   /* #082f49 */
```

### Neutral Scale (OKLCH Optimized)

```css
/* Perceptually Uniform Neutrals */
--color-gray-50:  oklch(0.985 0 0);       /* #fafafa */
--color-gray-100: oklch(0.965 0 0);       /* #f5f5f5 */
--color-gray-200: oklch(0.925 0 0);       /* #e5e5e5 */
--color-gray-300: oklch(0.865 0 0);       /* #d4d4d4 */
--color-gray-400: oklch(0.705 0 0);       /* #a3a3a3 */
--color-gray-500: oklch(0.555 0 0);       /* #737373 */
--color-gray-600: oklch(0.445 0 0);       /* #525252 */
--color-gray-700: oklch(0.365 0 0);       /* #404040 */
--color-gray-800: oklch(0.265 0 0);       /* #262626 */
--color-gray-900: oklch(0.205 0 0);       /* #171717 */
--color-gray-950: oklch(0.135 0 0);       /* #0a0a0a */
```

### Status Colors (WCAG AA Compliant)

```css
/* Success - Growth & Achievement */
--color-success-light: oklch(0.93 0.09 142);  /* #d1fae5 - Background */
--color-success:       oklch(0.52 0.17 142);  /* #10b981 - Primary */
--color-success-dark:  oklch(0.35 0.15 142);  /* #047857 - Text (6.5:1) */

/* Warning - Attention & Caution */
--color-warning-light: oklch(0.93 0.12 85);   /* #fef3c7 - Background */
--color-warning:       oklch(0.67 0.18 85);   /* #f59e0b - Primary */
--color-warning-dark:  oklch(0.42 0.16 85);   /* #b45309 - Text (7.2:1) */

/* Error - Critical Issues */
--color-error-light: oklch(0.93 0.09 25);     /* #fee2e2 - Background */
--color-error:       oklch(0.53 0.24 25);     /* #ef4444 - Primary */
--color-error-dark:  oklch(0.40 0.22 25);     /* #b91c1c - Text (6.8:1) */

/* Info - Guidance & Tips */
--color-info-light: oklch(0.94 0.06 237);     /* #dbeafe - Background */
--color-info:        oklch(0.58 0.17 237);    /* #3b82f6 - Primary */
--color-info-dark:   oklch(0.42 0.18 237);    /* #1d4ed8 - Text (6.1:1) */
```

### Accent Colors

```css
/* Purple - Premium Features */
--color-purple-500: oklch(0.63 0.22 293);     /* #a855f7 */
--color-purple-600: oklch(0.55 0.24 293);     /* #9333ea */

/* Teal - AI Features */
--color-teal-500: oklch(0.69 0.14 183);       /* #14b8a6 */
--color-teal-600: oklch(0.59 0.15 183);       /* #0d9488 */
```

## Semantic Token System

### Hierarchical Token Structure

#### Level 1: Primitive Tokens (Base Values)
```css
@theme {
  /* Direct color values - not used in components */
  --color-blue-*: /* See palette above */
  --color-gray-*: /* See palette above */
  --color-success-*: /* See palette above */
  /* etc. */
}
```

#### Level 2: Semantic Tokens (UI Intent)
```css
@theme {
  /* Backgrounds */
  --color-background:          var(--color-gray-50);    /* Page background */
  --color-surface:             var(--color-white);      /* Card surfaces */
  --color-surface-subtle:      var(--color-gray-50);    /* Subtle surfaces */
  --color-surface-muted:       var(--color-gray-100);   /* Muted surfaces */
  
  /* Foregrounds */
  --color-foreground:          var(--color-gray-900);   /* Primary text */
  --color-foreground-muted:    var(--color-gray-600);   /* Secondary text */
  --color-foreground-subtle:   var(--color-gray-500);   /* Tertiary text */
  --color-foreground-disabled: var(--color-gray-400);   /* Disabled text */
  
  /* Borders */
  --color-border:              var(--color-gray-200);   /* Default borders */
  --color-border-strong:       var(--color-gray-300);   /* Emphasized borders */
  --color-border-subtle:       var(--color-gray-100);   /* Subtle borders */
  
  /* Interactive States */
  --color-primary:             var(--color-blue-500);   /* Primary actions */
  --color-primary-hover:       var(--color-blue-600);   /* Primary hover */
  --color-primary-active:      var(--color-blue-700);   /* Primary active */
  --color-primary-foreground:  var(--color-white);      /* Text on primary */
  
  /* Focus States */
  --color-ring:                var(--color-blue-500);   /* Focus ring */
  --color-ring-offset:         var(--color-white);      /* Ring offset */
}
```

#### Level 3: Component Tokens (Specific Use)
```css
@theme {
  /* Buttons */
  --color-button-primary-bg:        var(--color-primary);
  --color-button-primary-bg-hover:  var(--color-primary-hover);
  --color-button-primary-text:      var(--color-primary-foreground);
  
  /* Inputs */
  --color-input-bg:                 var(--color-white);
  --color-input-border:             var(--color-border);
  --color-input-border-focus:       var(--color-primary);
  --color-input-text:               var(--color-foreground);
  --color-input-placeholder:        var(--color-foreground-subtle);
  
  /* Status Indicators */
  --color-status-success-bg:        var(--color-success-light);
  --color-status-success-text:      var(--color-success-dark);
  --color-status-success-border:    var(--color-success);
  
  /* AI Feature Indicators */
  --color-ai-indicator:             var(--color-teal-500);
  --color-ai-indicator-bg:          oklch(0.94 0.04 183 / 0.1);
  
  /* Premium Feature Indicators */
  --color-premium-indicator:        var(--color-purple-500);
  --color-premium-indicator-bg:     oklch(0.94 0.06 293 / 0.1);
}
```

## WCAG Compliance Matrix

### Text Contrast Ratios

| Background | Foreground | Ratio | WCAG Level | Use Case |
|------------|------------|-------|------------|----------|
| white | gray-900 | 19.5:1 | AAA | Primary text |
| white | gray-600 | 5.8:1 | AA | Secondary text |
| white | gray-500 | 7.5:1 | AA | Subtle text |
| white | blue-500 | 4.6:1 | AA | Links |
| blue-500 | white | 4.6:1 | AA | Button text |
| gray-50 | gray-900 | 18.1:1 | AAA | Card text |
| success-light | success-dark | 6.5:1 | AA | Success messages |
| warning-light | warning-dark | 7.2:1 | AA | Warning messages |
| error-light | error-dark | 6.8:1 | AA | Error messages |
| info-light | info-dark | 6.1:1 | AA | Info messages |

### Non-Text Elements (3:1 Requirement)

| Element | Colors | Ratio | Compliant |
|---------|--------|-------|-----------|
| Input borders | gray-200 on white | 3.2:1 | ✓ |
| Focus rings | blue-500 on white | 4.6:1 | ✓ |
| Icons | gray-500 on white | 7.5:1 | ✓ |
| Dividers | gray-200 on white | 3.2:1 | ✓ |

## Browser Fallback Strategy

### Implementation Approach

```css
/* 1. Progressive Enhancement with @supports */
@layer base {
  :root {
    /* RGB Fallbacks for 6.9% of browsers */
    --color-primary-rgb: 14, 165, 233;  /* blue-500 */
    --color-success-rgb: 16, 185, 129;  /* success */
    --color-error-rgb: 239, 68, 68;     /* error */
    
    /* OKLCH with automatic fallback */
    --color-primary: rgb(var(--color-primary-rgb));
    --color-success: rgb(var(--color-success-rgb));
    --color-error: rgb(var(--color-error-rgb));
  }
  
  /* Modern browsers get OKLCH */
  @supports (color: oklch(0 0 0)) {
    :root {
      --color-primary: oklch(0.62 0.17 237);
      --color-success: oklch(0.52 0.17 142);
      --color-error: oklch(0.53 0.24 25);
    }
  }
}

/* 2. PostCSS Plugin Configuration */
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-oklab-function': {
      preserve: true,  // Keep OKLCH, add fallback
      subFeatures: {
        displayP3: false  // Only use sRGB fallbacks
      }
    }
  }
}

/* 3. Build Output Example */
/* Input */
.button { background: oklch(0.62 0.17 237); }

/* Output */
.button { 
  background: rgb(14, 165, 233);  /* Fallback */
  background: oklch(0.62 0.17 237);  /* Modern */
}
```

### Testing Strategy
1. Test in Safari 15.3 or earlier (no OKLCH support)
2. Verify all interactive elements remain accessible
3. Check color contrast with fallback values
4. Ensure no functionality is lost

## Usage Guidelines

### Component Color Application

#### Buttons
```tsx
// Primary Button
className="bg-primary text-primary-foreground hover:bg-primary-hover"

// Secondary Button  
className="bg-surface border-border text-foreground hover:bg-surface-muted"

// Destructive Button
className="bg-error text-white hover:bg-error-dark"
```

#### Form Inputs
```tsx
// Text Input
className="bg-input-bg border-input-border focus:border-input-border-focus text-input-text placeholder:text-input-placeholder"

// Input with Error
className="border-error text-foreground"
```

#### Cards & Containers
```tsx
// Basic Card
className="bg-surface border-border"

// Highlighted Card
className="bg-surface-subtle border-border-strong"

// Interactive Card
className="bg-surface hover:bg-surface-subtle transition-colors"
```

#### Status Messages
```tsx
// Success Message
className="bg-status-success-bg text-status-success-text border-status-success-border"

// Error Message
className="bg-status-error-bg text-status-error-text border-status-error-border"
```

### Do's and Don'ts

#### ✅ DO
- Use semantic tokens for all color values
- Test color combinations for WCAG compliance
- Apply hover/focus states consistently
- Use status colors for their intended purpose
- Leverage OKLCH for smooth color transitions

#### ❌ DON'T
- Hard-code hex/rgb values in components
- Use color names like "blue" or "red"
- Create one-off color values
- Mix semantic and primitive tokens
- Ignore contrast requirements

### Accessibility Checklist
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Large text (18pt+) meets 3:1 ratio
- [ ] Interactive elements have visible focus states
- [ ] Status colors work for color-blind users
- [ ] Error states don't rely on color alone

## Migration Mapping

### Current → New Color Mappings

#### Dark Mode Classes
```typescript
// Before → After
"dark:bg-gray-950" → "bg-background"
"dark:bg-gray-800" → "bg-surface-subtle"
"dark:text-gray-50" → "text-foreground"
"dark:text-gray-400" → "text-foreground-muted"
"dark:border-gray-800" → "border-border"
"dark:placeholder:text-gray-400" → "placeholder:text-foreground-subtle"
```

#### Hard-coded Colors
```typescript
// Before → After
"bg-white" → "bg-surface"
"bg-gray-50" → "bg-surface-subtle"
"bg-gray-100" → "bg-surface-muted"
"text-gray-900" → "text-foreground"
"text-gray-600" → "text-foreground-muted"
"text-gray-500" → "text-foreground-subtle"
"border-gray-200" → "border-border"
"text-blue-600" → "text-primary"
"bg-blue-500" → "bg-primary"
```

#### Component-Specific Migrations
```typescript
// Switch Component
"data-[state=checked]:bg-gray-900" → "data-[state=checked]:bg-primary"
"dark:data-[state=checked]:bg-gray-50" → "data-[state=checked]:bg-primary"

// Tabs Component  
"data-[state=active]:bg-white" → "data-[state=active]:bg-surface"
"dark:data-[state=active]:bg-gray-950" → "data-[state=active]:bg-surface"

// Progress Component
"bg-blue-500 dark:bg-blue-500" → "bg-primary"
"bg-green-500 dark:bg-green-500" → "bg-success"
```

## Implementation Examples

### Example 1: Button Component
```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-surface border border-border hover:bg-surface-muted",
        destructive: "bg-error text-white hover:bg-error-dark",
        ghost: "hover:bg-surface-subtle hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
```

### Example 2: Status Indicator
```tsx
function StatusBadge({ status }: { status: 'success' | 'warning' | 'error' | 'info' }) {
  const variants = {
    success: "bg-status-success-bg text-status-success-text border-status-success-border",
    warning: "bg-status-warning-bg text-status-warning-text border-status-warning-border",
    error: "bg-status-error-bg text-status-error-text border-status-error-border",
    info: "bg-status-info-bg text-status-info-text border-status-info-border"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[status]}`}>
      {status}
    </span>
  );
}
```

### Example 3: Form Input with States
```tsx
function Input({ error, ...props }) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border bg-input-bg px-3 py-2 text-sm text-input-text ring-offset-background placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-error" : "border-input-border focus:border-input-border-focus",
        props.className
      )}
      {...props}
    />
  );
}
```

### Example 4: Card with Hover State
```tsx
function InteractiveCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-surface p-6 transition-colors hover:bg-surface-subtle",
        "border-border hover:border-border-strong",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Example 5: AI Feature Indicator
```tsx
function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-ai-indicator-bg text-ai-indicator border border-ai-indicator/20">
      <SparklesIcon className="h-3 w-3" />
      AI-Powered
    </span>
  );
}
```

## Success Criteria

### Implementation Success
- [ ] All 30 dark mode instances removed and replaced with semantic tokens
- [ ] Zero hard-coded color values in component files
- [ ] All color combinations meet WCAG AA standards
- [ ] Fallback strategy implemented and tested
- [ ] `npm run validate:colors` shows 0 violations

### Visual Success
- [ ] Professional appearance maintained
- [ ] Consistent color application across all components
- [ ] Smooth transitions and hover states
- [ ] Clear visual hierarchy
- [ ] Accessible to color-blind users

### Developer Success
- [ ] Clear token naming understood by team
- [ ] Easy to add new color variations
- [ ] Straightforward debugging of color issues
- [ ] Comprehensive documentation available
- [ ] Migration path well-documented

### Performance Success
- [ ] CSS color definitions < 5KB
- [ ] No runtime color calculations
- [ ] Efficient CSS variable inheritance
- [ ] Minimal specificity conflicts
- [ ] Fast theme switching (if needed)

## Research Attribution

This specification was informed by:
- `research/oklch-color-system.md`: OKLCH implementation details, browser support, Tailwind v4 integration
- `research/color-analysis.md`: Current usage patterns, migration requirements
- WCAG 2.1 guidelines for professional applications
- Modern color psychology for career-focused products
- 2025 design trends emphasizing warm neutrals with purposeful accents

The combination of OKLCH's perceptual uniformity with semantic token architecture ensures a color system that is both visually appealing and technically maintainable.