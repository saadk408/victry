# Tailwind CSS v4 CSS-First Configuration Specification

**Version:** 1.0  
**Created:** January 14, 2025  
**Based on:** Phase 0 Research & Phase 1 Color System Specification  
**Purpose:** Guide the migration to Tailwind v4 CSS-first architecture without dark mode

## Executive Summary

This specification defines the complete Tailwind CSS v4 configuration strategy for Victry's dark mode removal project. It leverages the CSS-first approach introduced in Tailwind v4, eliminating JavaScript configuration files in favor of native CSS @theme directives.

## Current State Analysis

### Existing Configuration
- **Tailwind Version**: 4.1.7 (latest)
- **PostCSS Plugin**: @tailwindcss/postcss 4.1.7
- **Configuration Type**: CSS-first with @theme directive
- **Dark Mode**: Currently implemented with @custom-variant

### Migration Requirements
1. Remove dark mode variant and all dark: prefixed classes
2. Consolidate dual color systems (OKLCH + HSL) into single OKLCH system
3. Optimize bundle size by removing unused utilities
4. Implement semantic-only color approach
5. Add validation tooling for color compliance

## Tailwind v4 CSS-First Architecture

### 1. Core Configuration Structure

```css
/* app/globals.css - Complete specification */
@import "tailwindcss";

/* Remove dark mode variant completely */
/* @custom-variant dark (&:is(.dark *)); -- TO BE REMOVED */

@theme {
  /* === OKLCH Professional Color System === */
  /* Primary Brand Colors */
  --color-primary: oklch(0.45 0.15 231);         /* Professional blue */
  --color-primary-foreground: oklch(1 0 0);      /* White on primary */
  
  --color-secondary: oklch(0.65 0.12 190);       /* Modern cyan */
  --color-secondary-foreground: oklch(0.15 0 0); /* Dark on secondary */
  
  --color-accent: oklch(0.70 0.18 45);           /* Energetic orange */
  --color-accent-foreground: oklch(0.15 0 0);    /* Dark on accent */
  
  /* Neutral Scale */
  --color-background: oklch(1 0 0);              /* Pure white */
  --color-foreground: oklch(0.09 0 0);           /* Deep black */
  
  --color-card: oklch(0.99 0 0);                 /* Off-white cards */
  --color-card-foreground: oklch(0.09 0 0);      /* Card text */
  
  --color-popover: oklch(1 0 0);                 /* Popover background */
  --color-popover-foreground: oklch(0.09 0 0);   /* Popover text */
  
  --color-muted: oklch(0.96 0 0);                /* Subtle backgrounds */
  --color-muted-foreground: oklch(0.45 0 0);     /* Secondary text */
  
  /* Borders & Inputs */
  --color-border: oklch(0.85 0 0);               /* Default borders */
  --color-input: oklch(0.98 0 0);                /* Input backgrounds */
  --color-ring: oklch(0.45 0.15 231);            /* Focus rings (primary) */
  
  /* Status Colors (WCAG AA Compliant) */
  --color-success: oklch(0.35 0.15 145);         /* 6.5:1 contrast */
  --color-success-foreground: oklch(1 0 0);
  
  --color-warning: oklch(0.30 0.15 85);          /* 8.2:1 contrast */
  --color-warning-foreground: oklch(1 0 0);
  
  --color-destructive: oklch(0.35 0.25 25);      /* 6.8:1 contrast */
  --color-destructive-foreground: oklch(1 0 0);
  
  --color-info: oklch(0.35 0.18 240);            /* 6.1:1 contrast */
  --color-info-foreground: oklch(1 0 0);
  
  /* Chart/Visualization Colors */
  --color-chart-1: oklch(0.55 0.20 231);         /* Primary blue */
  --color-chart-2: oklch(0.60 0.18 145);         /* Success green */
  --color-chart-3: oklch(0.65 0.20 45);          /* Accent orange */
  --color-chart-4: oklch(0.55 0.15 290);         /* Purple */
  --color-chart-5: oklch(0.60 0.17 85);          /* Warning amber */
  
  /* === Typography System === */
  --font-sans: "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif";
  --font-mono: "JetBrains Mono", "Consolas", "Monaco", "Courier New", "monospace";
  
  /* === Spacing & Layout === */
  --radius: 0.5rem;
  --radius-sm: calc(var(--radius) - 0.25rem);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 0.25rem);
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  
  /* === Responsive Breakpoints === */
  --breakpoint-sm: 40rem;   /* 640px */
  --breakpoint-md: 48rem;   /* 768px */
  --breakpoint-lg: 64rem;   /* 1024px */
  --breakpoint-xl: 80rem;   /* 1280px */
  --breakpoint-2xl: 96rem;  /* 1536px */
  
  /* === Animation System === */
  --ease-smooth: cubic-bezier(0.3, 0, 0, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.5, 1.5, 0.5, 0);
  
  /* === Shadows (Optimized) === */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06);
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  
  /* Remove all legacy HSL colors */
  /* --background, --foreground, etc. - TO BE REMOVED */
}
```

### 2. PostCSS Configuration (No Changes Required)

```javascript
// postcss.config.mjs - Current configuration is optimal
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  }
};
```

### 3. Semantic Utility Classes

```css
/* Generate semantic utilities only */
@layer utilities {
  /* Background utilities */
  .bg-background { background-color: var(--color-background); }
  .bg-foreground { background-color: var(--color-foreground); }
  .bg-card { background-color: var(--color-card); }
  .bg-popover { background-color: var(--color-popover); }
  .bg-primary { background-color: var(--color-primary); }
  .bg-secondary { background-color: var(--color-secondary); }
  .bg-muted { background-color: var(--color-muted); }
  .bg-accent { background-color: var(--color-accent); }
  .bg-destructive { background-color: var(--color-destructive); }
  .bg-success { background-color: var(--color-success); }
  .bg-warning { background-color: var(--color-warning); }
  .bg-info { background-color: var(--color-info); }
  
  /* Text utilities */
  .text-background { color: var(--color-background); }
  .text-foreground { color: var(--color-foreground); }
  .text-card-foreground { color: var(--color-card-foreground); }
  .text-popover-foreground { color: var(--color-popover-foreground); }
  .text-primary { color: var(--color-primary); }
  .text-primary-foreground { color: var(--color-primary-foreground); }
  .text-secondary { color: var(--color-secondary); }
  .text-secondary-foreground { color: var(--color-secondary-foreground); }
  .text-muted-foreground { color: var(--color-muted-foreground); }
  .text-accent-foreground { color: var(--color-accent-foreground); }
  .text-destructive-foreground { color: var(--color-destructive-foreground); }
  .text-success-foreground { color: var(--color-success-foreground); }
  .text-warning-foreground { color: var(--color-warning-foreground); }
  .text-info-foreground { color: var(--color-info-foreground); }
  
  /* Border utilities */
  .border-border { border-color: var(--color-border); }
  .border-input { border-color: var(--color-input); }
  .border-primary { border-color: var(--color-primary); }
  .border-secondary { border-color: var(--color-secondary); }
  .border-destructive { border-color: var(--color-destructive); }
  .border-success { border-color: var(--color-success); }
  .border-warning { border-color: var(--color-warning); }
  
  /* Ring utilities */
  .ring-ring { --tw-ring-color: var(--color-ring); }
  .ring-primary { --tw-ring-color: var(--color-primary); }
  
  /* Opacity variants using color-mix() */
  .bg-primary\/90 { background-color: color-mix(in oklch, var(--color-primary) 90%, transparent); }
  .bg-secondary\/80 { background-color: color-mix(in oklch, var(--color-secondary) 80%, transparent); }
  .bg-destructive\/90 { background-color: color-mix(in oklch, var(--color-destructive) 90%, transparent); }
  .bg-muted\/50 { background-color: color-mix(in oklch, var(--color-muted) 50%, transparent); }
}
```

### 4. Animation System Optimization

```css
/* Optimized animation keyframes */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}

/* Animation utilities */
@layer utilities {
  .animate-in { animation: fade-in 0.2s var(--ease-smooth); }
  .animate-fade-in-up { animation: fade-in-up 0.3s var(--ease-smooth); }
  .animate-scale-in { animation: scale-in 0.2s var(--ease-smooth); }
}
```

### 5. Performance Optimizations

```css
/* Critical CSS extraction markers */
@layer critical {
  /* Mark critical above-the-fold styles */
  .hero-section { /* styles */ }
  .main-navigation { /* styles */ }
}

/* Optimize repaints and reflows */
@layer utilities {
  .gpu-accelerated {
    transform: translateZ(0);
    will-change: transform;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  
  .contain-paint {
    contain: paint;
  }
  
  .contain-layout {
    contain: layout;
  }
  
  .contain-strict {
    contain: strict;
  }
}
```

## Migration Strategy

### Phase 1: Remove Dark Mode Infrastructure

1. **Remove dark mode variant**
   ```css
   /* DELETE: @custom-variant dark (&:is(.dark *)); */
   ```

2. **Remove dark mode color variables**
   ```css
   /* DELETE: .dark { ... } block entirely */
   ```

3. **Remove next-themes integration**
   - Remove ThemeProvider from layout
   - Remove theme switching components
   - Clean up localStorage theme persistence

### Phase 2: Consolidate Color System

1. **Remove legacy HSL variables**
   - Delete all HSL color definitions
   - Update any remaining HSL references to OKLCH

2. **Update utility generation**
   - Remove duplicate color utilities
   - Ensure all utilities use CSS variables

3. **Optimize bundle size**
   - Remove unused animation keyframes
   - Consolidate similar utilities
   - Enable CSS tree-shaking

### Phase 3: Implement Validation

1. **Create color validation script**
   ```javascript
   // scripts/validate-colors.js
   const validateColors = require('./lib/validate-colors');
   
   validateColors({
     allowedPatterns: [
       'bg-background', 'text-foreground',
       'bg-primary', 'text-primary-foreground',
       // ... other semantic tokens
     ],
     forbiddenPatterns: [
       'dark:', 'bg-gray-', 'text-gray-',
       'bg-white', 'bg-black',
       // ... other hard-coded colors
     ]
   });
   ```

2. **Add npm scripts**
   ```json
   {
     "scripts": {
       "validate:colors": "node scripts/validate-colors.js",
       "audit:styles": "node scripts/audit-styles.js"
     }
   }
   ```

## Bundle Size Targets

### Current State
- **Total CSS**: ~450KB (uncompressed)
- **Dark mode CSS**: ~25-30KB
- **Unused utilities**: ~50KB

### Post-Migration Targets
- **Total CSS**: <400KB (uncompressed)
- **Compressed CSS**: <50KB
- **Critical CSS**: <14KB inline
- **Route-specific CSS**: <10KB per route

## Quality Assurance

### Automated Checks
1. **Color validation**: 0 hard-coded colors
2. **Bundle analysis**: Meet size targets
3. **Visual regression**: No unexpected changes
4. **Accessibility**: WCAG 2.1 AA compliance

### Manual Verification
1. Component visual consistency
2. Interactive state preservation
3. Animation smoothness
4. Print style compatibility

## Component Migration Patterns

### Before (with dark mode)
```tsx
className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50"
```

### After (semantic only)
```tsx
className="bg-background text-foreground"
```

### Complex Example
```tsx
// Before
<div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800">

// After
<div className="bg-muted border-border hover:bg-muted/80">
```

## Browser Compatibility

### Required Support
- Chrome 111+ (OKLCH support)
- Safari 16.4+ (OKLCH support)
- Firefox 128+ (OKLCH support)

### Fallback Strategy
```css
/* Automatic fallback for older browsers */
@supports not (color: oklch(0 0 0)) {
  :root {
    --color-primary: #3B82F6;
    --color-secondary: #06B6D4;
    /* ... other fallbacks */
  }
}
```

## Performance Monitoring

### Key Metrics
1. **CSS Parse Time**: <50ms
2. **First Paint**: <1s
3. **Critical CSS Size**: <14KB
4. **Total Bundle**: <50KB compressed

### Monitoring Tools
- Lighthouse CI
- Bundle analyzer
- Chrome DevTools Coverage
- Performance budget enforcement

## Rollback Procedures

### Component Level
```bash
git checkout main -- app/globals.css
npm run build
```

### Full Rollback
```bash
git revert --no-edit HEAD
npm run build && npm run deploy
```

## Success Criteria

1. ✅ Zero dark mode classes remaining
2. ✅ All components use semantic colors
3. ✅ Bundle size reduced by 25-30KB
4. ✅ Build time improved by 10-15%
5. ✅ WCAG 2.1 AA compliance maintained
6. ✅ Zero visual regressions
7. ✅ All tests passing

---

**Specification Status**: COMPLETE  
**Next Step**: Task 1.3 - Define component migration patterns and testing strategies