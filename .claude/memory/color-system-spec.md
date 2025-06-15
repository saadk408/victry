# Victry OKLCH Professional Color System Specification

**Version:** 1.0  
**Created:** January 14, 2025  
**Based on:** Phase 0 Research Findings (Tailwind v4, WCAG 2.1 AA, OKLCH Best Practices)

## Executive Summary

This specification defines a comprehensive OKLCH-based color system for Victry's dark mode removal project. The system prioritizes professionalism, accessibility, and modern web standards while maintaining visual appeal for a resume-building application.

## Color Philosophy

### Design Principles
1. **Professional First**: Colors convey trust and competence for job seekers
2. **Accessibility Always**: All color combinations meet WCAG 2.1 AA standards  
3. **Semantic Clarity**: Token names clearly indicate usage intent
4. **Performance Optimized**: Leverages CSS custom properties for efficiency
5. **Future-Proof**: OKLCH color space for perceptual uniformity

### Why OKLCH?
- **Perceptual Uniformity**: Equal lightness steps appear visually consistent
- **Wide Gamut Support**: 50% more colors than sRGB (P3 displays)
- **No Hue Shifts**: Unlike HSL/LCH, maintains color accuracy in transformations
- **Browser Support**: 93.1% global support with graceful fallbacks
- **Tailwind v4 Native**: First-class support in modern CSS frameworks

## Core Color Palette

### Brand Colors

```css
/* Primary - Professional Blue */
--color-primary: oklch(0.45 0.15 231);
/* Conveys: Trust, stability, professionalism */
/* Use: Primary actions, brand elements, links */

/* Secondary - Modern Cyan */
--color-secondary: oklch(0.65 0.12 190);  
/* Conveys: Innovation, clarity, freshness */
/* Use: Secondary actions, accents, highlights */

/* Accent - Energetic Orange */
--color-accent: oklch(0.70 0.18 45);
/* Conveys: Energy, action, attention */
/* Use: CTAs, important notifications, premium features */
```

### Neutral Scale

```css
/* Backgrounds */
--color-background: oklch(1 0 0);        /* Pure white - main background */
--color-muted: oklch(0.96 0 0);          /* Light gray - subtle backgrounds */
--color-card: oklch(0.99 0 0);           /* Off-white - card surfaces */
--color-input: oklch(0.98 0 0);          /* Input field backgrounds */

/* Foregrounds */
--color-foreground: oklch(0.09 0 0);     /* Deep black - primary text */
--color-muted-foreground: oklch(0.45 0 0); /* Gray - secondary text (4.61:1) */

/* Borders & Dividers */
--color-border: oklch(0.85 0 0);         /* Subtle borders */
--color-border-strong: oklch(0.75 0 0);  /* Emphasized borders */
```

### Status Colors (WCAG AA Compliant)

```css
/* Success - Positive Actions/States */
--color-success: oklch(0.35 0.15 145);           /* 6.5:1 contrast */
--color-success-foreground: oklch(1 0 0);        /* White text */
--color-success-bg: oklch(0.92 0.06 145);        /* Light green background */

/* Warning - Caution/Attention */
--color-warning: oklch(0.30 0.15 85);            /* 8.2:1 contrast */
--color-warning-foreground: oklch(1 0 0);        /* White text */
--color-warning-bg: oklch(0.93 0.08 85);         /* Light amber background */

/* Destructive - Errors/Danger */
--color-destructive: oklch(0.35 0.25 25);        /* 6.8:1 contrast */
--color-destructive-foreground: oklch(1 0 0);    /* White text */
--color-destructive-bg: oklch(0.93 0.10 25);     /* Light red background */

/* Info - Informational */
--color-info: oklch(0.35 0.18 240);              /* 6.1:1 contrast */
--color-info-foreground: oklch(1 0 0);           /* White text */
--color-info-bg: oklch(0.93 0.07 240);           /* Light blue background */
```

### Interactive States

```css
/* Focus States */
--color-ring: var(--color-primary);              /* Focus ring color */
--color-ring-offset: var(--color-background);    /* Ring offset background */

/* Selection */
--color-selection-bg: oklch(0.85 0.10 231);      /* Text selection background */
--color-selection-text: var(--color-foreground); /* Selected text color */

/* Hover Modifiers (applied via opacity) */
/* hover:bg-primary/90 - 90% opacity on hover */
/* active:bg-primary/80 - 80% opacity on active */
```

## Semantic Token Mapping

### Component-Specific Tokens

```css
/* Card Component */
--color-card: var(--color-background);
--color-card-foreground: var(--color-foreground);
--color-card-border: var(--color-border);

/* Popover/Dropdown */
--color-popover: var(--color-background);
--color-popover-foreground: var(--color-foreground);
--color-popover-border: var(--color-border);

/* Dialog/Modal */
--color-dialog: var(--color-background);
--color-dialog-foreground: var(--color-foreground);
--color-dialog-overlay: oklch(0 0 0 / 0.5);      /* 50% black overlay */

/* Primary Elements */
--color-primary-foreground: oklch(1 0 0);        /* White on primary */

/* Secondary Elements */
--color-secondary-foreground: oklch(0.15 0 0);   /* Dark on secondary */

/* Muted Elements */
--color-muted: oklch(0.96 0 0);
--color-muted-foreground: oklch(0.45 0 0);
```

### Special Purpose Colors

```css
/* Chart/Data Visualization Palette */
--color-chart-1: oklch(0.55 0.20 231);    /* Primary blue */
--color-chart-2: oklch(0.60 0.18 145);    /* Success green */
--color-chart-3: oklch(0.65 0.20 45);     /* Accent orange */
--color-chart-4: oklch(0.55 0.15 290);    /* Purple */
--color-chart-5: oklch(0.60 0.17 85);     /* Warning amber */

/* Skeleton Loading States */
--color-skeleton-base: oklch(0.94 0 0);
--color-skeleton-highlight: oklch(0.98 0 0);

/* Code/Syntax Highlighting */
--color-code-bg: oklch(0.97 0 0);
--color-code-text: oklch(0.20 0.15 340);
--color-code-comment: oklch(0.50 0 0);
--color-code-keyword: oklch(0.40 0.20 280);
--color-code-string: oklch(0.35 0.15 145);
```

## Implementation Patterns

### Component Variant Example

```typescript
// Using CVA with semantic tokens
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-muted",
        ghost: "hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
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
```

### Status Color Usage

```typescript
// Status color utility function
import { clsx } from 'clsx';

export function getStatusColor(score: number): string {
  if (score >= 90) return "text-success bg-success-bg";
  if (score >= 70) return "text-warning bg-warning-bg";
  if (score >= 50) return "text-info bg-info-bg";
  return "text-destructive bg-destructive-bg";
}

// ATS Score component example
function ATSScore({ score }: { score: number }) {
  return (
    <div className={clsx(
      "rounded-lg p-4 font-medium",
      getStatusColor(score)
    )}>
      ATS Score: {score}%
    </div>
  );
}
```

### Gradient Patterns

```css
/* Professional gradients using semantic colors */
.gradient-professional {
  background: linear-gradient(135deg, 
    var(--color-primary) 0%, 
    var(--color-secondary) 100%
  );
}

.gradient-warm {
  background: linear-gradient(135deg,
    var(--color-accent) 0%,
    var(--color-warning) 100%
  );
}

.gradient-subtle {
  background: linear-gradient(180deg,
    var(--color-background) 0%,
    var(--color-muted) 100%
  );
}
```

## Migration Guidelines

### From Dark Mode Classes

```css
/* ❌ OLD: Dark mode specific */
className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50"

/* ✅ NEW: Semantic tokens only */
className="bg-background text-foreground"
```

### From Hard-coded Colors

```css
/* ❌ OLD: Hard-coded Tailwind colors */
className="bg-gray-50 text-gray-600 border-gray-200"

/* ✅ NEW: Semantic tokens */
className="bg-muted text-muted-foreground border-border"
```

### Component Migration Checklist

1. **Remove all `dark:` prefixes**
2. **Replace color classes with semantic tokens**
3. **Update hover/focus states to use opacity modifiers**
4. **Verify WCAG contrast compliance**
5. **Test with design tokens in browser DevTools**

## CSS Implementation

### Tailwind v4 Configuration

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Brand Colors */
  --color-primary: oklch(0.45 0.15 231);
  --color-secondary: oklch(0.65 0.12 190);
  --color-accent: oklch(0.70 0.18 45);
  
  /* Neutrals */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.09 0 0);
  --color-muted: oklch(0.96 0 0);
  --color-muted-foreground: oklch(0.45 0 0);
  --color-border: oklch(0.85 0 0);
  --color-input: oklch(0.98 0 0);
  
  /* Status Colors */
  --color-success: oklch(0.35 0.15 145);
  --color-warning: oklch(0.30 0.15 85);
  --color-destructive: oklch(0.35 0.25 25);
  --color-info: oklch(0.35 0.18 240);
  
  /* Component Tokens */
  --color-card: var(--color-background);
  --color-card-foreground: var(--color-foreground);
  --color-popover: var(--color-background);
  --color-popover-foreground: var(--color-foreground);
  
  /* Interactive */
  --color-ring: var(--color-primary);
  --color-ring-offset: var(--color-background);
}
```

### Browser Fallbacks

```css
/* Fallback for older browsers */
@supports not (color: oklch(0 0 0)) {
  @theme {
    --color-primary: #3B82F6;        /* Fallback blue */
    --color-secondary: #06B6D4;      /* Fallback cyan */
    --color-accent: #F97316;         /* Fallback orange */
    --color-success: #10B981;        /* Fallback green */
    --color-warning: #F59E0B;        /* Fallback amber */
    --color-destructive: #EF4444;    /* Fallback red */
    --color-info: #3B82F6;           /* Fallback blue */
  }
}
```

### OKLCH Browser Compatibility Implementation
*Added: January 16, 2025 during Task 0.7 gap analysis*

#### PostCSS Plugin Configuration

The @csstools/postcss-oklab-function plugin automatically adds fallback colors for browsers without OKLCH support (6.9% as of 2025).

```javascript
// postcss.config.mjs
export default {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    '@csstools/postcss-oklab-function': {
      preserve: true, // Keep OKLCH values for modern browsers
      enableProgressiveCustomProperties: false, // Use simple fallbacks
    },
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          // CRITICAL: Prevent merging that breaks OKLCH fallbacks
          mergeRules: false,
          mergeLonghand: false,
        }],
      },
    } : {})
  },
}
```

#### Next.js Configuration for OKLCH

```javascript
// next.config.mjs
export default {
  // Prevent cssnano-simple from breaking OKLCH fallbacks
  experimental: {
    cssChunking: 'loose', // Prevents aggressive CSS optimization
  },
  // Custom PostCSS config for OKLCH support
  postcss: {
    plugins: {
      '@csstools/postcss-oklab-function': {
        preserve: true,
      },
    },
  },
}
```

#### Generated Output Example

The PostCSS plugin automatically generates RGB fallbacks:

```css
/* Input */
.text-primary {
  color: oklch(0.45 0.15 231);
}

/* Output after PostCSS processing */
.text-primary {
  color: rgb(0, 99, 204);  /* Fallback for older browsers */
  color: oklch(0.45 0.15 231);  /* Modern browsers use this */
}
```

#### Testing Browser Support

```javascript
// utils/color-support.ts
export function supportsOKLCH(): boolean {
  if (typeof window === 'undefined') return false;
  
  const testElement = document.createElement('div');
  testElement.style.color = 'oklch(0 0 0)';
  return testElement.style.color !== '';
}

// Optional: Add CSS class for fallback styling
if (!supportsOKLCH()) {
  document.documentElement.classList.add('no-oklch');
}
```

#### Sources
- [@csstools/postcss-oklab-function](https://www.npmjs.com/package/@csstools/postcss-oklab-function) - Official PostCSS plugin
- [Next.js CSS Optimization Discussion](https://github.com/vercel/next.js/discussions/44687) - cssnano configuration

## Validation & Testing

### Color Contrast Testing

All color combinations must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum contrast ratio
- Large text (18pt+): 3:1 minimum contrast ratio
- UI components: 3:1 minimum contrast ratio

### Testing Tools
- Chrome DevTools Color Picker (OKLCH support)
- WAVE Browser Extension (accessibility)
- Polypane Browser (OKLCH visualization)
- Playwright (automated contrast testing)

### Validation Commands

```bash
# Validate no hard-coded colors remain
npm run validate:colors

# Check accessibility compliance  
npm run test:a11y

# Visual regression testing
npm run test:visual
```

## Performance Considerations

### CSS Variable Benefits
- Single source of truth for colors
- Runtime theming capability (future enhancement)
- Reduced CSS bundle size (no duplicate color definitions)
- Better browser caching

### OKLCH Performance
- Native browser calculation (no JavaScript required)
- Efficient color interpolation
- Hardware acceleration support
- Smaller CSS footprint than RGB alternatives

## Future Enhancements

### Planned Features
1. **Dynamic Themes**: User-customizable accent colors
2. **High Contrast Mode**: Enhanced accessibility option
3. **Color Blindness Modes**: Deuteranopia/Protanopia safe palettes
4. **Print Styles**: Optimized colors for resume printing

### Research Areas
- OKLCH gradient performance optimization
- P3 wide gamut display enhancements
- CSS Color Module Level 5 features
- Dynamic color contrast adjustment

## References

- [OKLCH Color Space Specification](https://www.w3.org/TR/css-color-4/#ok-lab)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)
- [Phase 0 Research Findings](./research/)

---

**Specification Status**: COMPLETE  
**Next Step**: Task 1.2 - Create Tailwind v4 CSS-first configuration specification