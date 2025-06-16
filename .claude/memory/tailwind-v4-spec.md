# Tailwind v4 CSS-First Configuration Specification

Generated: January 16, 2025
Purpose: Define comprehensive Tailwind v4 migration leveraging CSS-first architecture
Status: Complete ✓

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [@theme Configuration Structure](#theme-configuration-structure)
3. [CSS Custom Property Architecture](#css-custom-property-architecture)
4. [Utility Class Conventions](#utility-class-conventions)
5. [PostCSS Pipeline Configuration](#postcss-pipeline-configuration)
6. [Build Optimization Settings](#build-optimization-settings)
7. [Migration Checklist](#migration-checklist)
8. [Performance Optimization](#performance-optimization)
9. [Animation System](#animation-system)
10. [Implementation Examples](#implementation-examples)

## Architecture Overview

### CSS-First Philosophy
Tailwind v4 represents a fundamental shift from JavaScript configuration to CSS-native design tokens. This aligns perfectly with modern CSS capabilities and our OKLCH color system.

### Key Benefits for Victry
1. **5x Faster Builds**: 400ms → ~100ms full builds
2. **100x Faster HMR**: Microsecond incremental updates
3. **Zero Config**: No tailwind.config.js needed
4. **Native OKLCH**: First-class support for our color system
5. **Smaller Bundles**: Automatic optimization built-in

### Research Integration
This specification synthesizes:
- `research/tailwind-v4.md`: Core v4 features and migration patterns
- `research/nextjs-build-optimization.md`: Performance configurations
- `color-system-spec.md`: OKLCH token integration
- Gap analysis resolution for animation patterns

## @theme Configuration Structure

### Complete Theme Definition

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* ===== Color System (from color-system-spec.md) ===== */
  
  /* Primitive Color Tokens */
  --color-blue-50:  oklch(0.97 0.01 237);
  --color-blue-100: oklch(0.94 0.03 237);
  --color-blue-200: oklch(0.89 0.06 237);
  --color-blue-300: oklch(0.82 0.10 237);
  --color-blue-400: oklch(0.72 0.14 237);
  --color-blue-500: oklch(0.62 0.17 237);
  --color-blue-600: oklch(0.53 0.19 237);
  --color-blue-700: oklch(0.46 0.19 237);
  --color-blue-800: oklch(0.39 0.17 237);
  --color-blue-900: oklch(0.33 0.14 237);
  --color-blue-950: oklch(0.25 0.11 237);
  
  /* Neutral Scale */
  --color-gray-50:  oklch(0.985 0 0);
  --color-gray-100: oklch(0.965 0 0);
  --color-gray-200: oklch(0.925 0 0);
  --color-gray-300: oklch(0.865 0 0);
  --color-gray-400: oklch(0.705 0 0);
  --color-gray-500: oklch(0.555 0 0);
  --color-gray-600: oklch(0.445 0 0);
  --color-gray-700: oklch(0.365 0 0);
  --color-gray-800: oklch(0.265 0 0);
  --color-gray-900: oklch(0.205 0 0);
  --color-gray-950: oklch(0.135 0 0);
  
  /* Status Colors */
  --color-success-light: oklch(0.93 0.09 142);
  --color-success:       oklch(0.52 0.17 142);
  --color-success-dark:  oklch(0.35 0.15 142);
  
  --color-warning-light: oklch(0.93 0.12 85);
  --color-warning:       oklch(0.67 0.18 85);
  --color-warning-dark:  oklch(0.42 0.16 85);
  
  --color-error-light: oklch(0.93 0.09 25);
  --color-error:       oklch(0.53 0.24 25);
  --color-error-dark:  oklch(0.40 0.22 25);
  
  --color-info-light: oklch(0.94 0.06 237);
  --color-info:        oklch(0.58 0.17 237);
  --color-info-dark:   oklch(0.42 0.18 237);
  
  /* Special Colors */
  --color-white: oklch(1 0 0);
  --color-black: oklch(0 0 0);
  --color-transparent: transparent;
  
  /* ===== Semantic Color Aliases ===== */
  
  /* Backgrounds */
  --color-background:       var(--color-gray-50);
  --color-surface:          var(--color-white);
  --color-surface-subtle:   var(--color-gray-50);
  --color-surface-muted:    var(--color-gray-100);
  
  /* Foregrounds */
  --color-foreground:          var(--color-gray-900);
  --color-foreground-muted:    var(--color-gray-600);
  --color-foreground-subtle:   var(--color-gray-500);
  --color-foreground-disabled: var(--color-gray-400);
  
  /* Borders */
  --color-border:        var(--color-gray-200);
  --color-border-strong: var(--color-gray-300);
  --color-border-subtle: var(--color-gray-100);
  
  /* Interactive */
  --color-primary:            var(--color-blue-500);
  --color-primary-hover:      var(--color-blue-600);
  --color-primary-active:     var(--color-blue-700);
  --color-primary-foreground: var(--color-white);
  
  /* Focus */
  --color-ring:        var(--color-blue-500);
  --color-ring-offset: var(--color-white);
  
  /* ===== Typography System ===== */
  
  /* Font Families */
  --font-sans: "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif;
  --font-mono: "JetBrains Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace;
  
  /* Font Sizes with Line Heights */
  --font-size-xs:   0.75rem;   /* 12px */
  --font-size-sm:   0.875rem;  /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg:   1.125rem;  /* 18px */
  --font-size-xl:   1.25rem;   /* 20px */
  --font-size-2xl:  1.5rem;    /* 24px */
  --font-size-3xl:  1.875rem;  /* 30px */
  --font-size-4xl:  2.25rem;   /* 36px */
  --font-size-5xl:  3rem;      /* 48px */
  
  /* Line Heights */
  --line-height-xs:   1rem;     /* 16px */
  --line-height-sm:   1.25rem;  /* 20px */
  --line-height-base: 1.5rem;   /* 24px */
  --line-height-lg:   1.75rem;  /* 28px */
  --line-height-xl:   1.75rem;  /* 28px */
  --line-height-2xl:  2rem;     /* 32px */
  --line-height-3xl:  2.25rem;  /* 36px */
  --line-height-4xl:  2.5rem;   /* 40px */
  --line-height-5xl:  1;        /* 48px */
  
  /* ===== Spacing System ===== */
  
  /* Using 4px base unit for consistency */
  --spacing-0:   0px;
  --spacing-1:   0.25rem;  /* 4px */
  --spacing-2:   0.5rem;   /* 8px */
  --spacing-3:   0.75rem;  /* 12px */
  --spacing-4:   1rem;     /* 16px */
  --spacing-5:   1.25rem;  /* 20px */
  --spacing-6:   1.5rem;   /* 24px */
  --spacing-8:   2rem;     /* 32px */
  --spacing-10:  2.5rem;   /* 40px */
  --spacing-12:  3rem;     /* 48px */
  --spacing-16:  4rem;     /* 64px */
  --spacing-20:  5rem;     /* 80px */
  --spacing-24:  6rem;     /* 96px */
  
  /* ===== Border Radius ===== */
  
  --radius-none: 0px;
  --radius-sm:   0.125rem;  /* 2px */
  --radius-base: 0.25rem;   /* 4px */
  --radius-md:   0.375rem;  /* 6px */
  --radius-lg:   0.5rem;    /* 8px */
  --radius-xl:   0.75rem;   /* 12px */
  --radius-2xl:  1rem;      /* 16px */
  --radius-3xl:  1.5rem;    /* 24px */
  --radius-full: 9999px;
  
  /* ===== Shadows (OKLCH-based) ===== */
  
  --shadow-xs: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1);
  --shadow-base: 0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1);
  --shadow-md: 0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1);
  --shadow-xl: 0 25px 50px -12px oklch(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 oklch(0 0 0 / 0.05);
  --shadow-none: 0 0 #0000;
  
  /* ===== Animation Tokens ===== */
  
  /* Durations */
  --animate-duration-75:   75ms;
  --animate-duration-100:  100ms;
  --animate-duration-150:  150ms;
  --animate-duration-200:  200ms;
  --animate-duration-300:  300ms;
  --animate-duration-500:  500ms;
  --animate-duration-700:  700ms;
  --animate-duration-1000: 1000ms;
  
  /* Timing Functions */
  --animate-timing-linear: linear;
  --animate-timing-in:     cubic-bezier(0.4, 0, 1, 1);
  --animate-timing-out:    cubic-bezier(0, 0, 0.2, 1);
  --animate-timing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --animate-timing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* ===== Breakpoints ===== */
  
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
  
  /* ===== Z-Index Scale ===== */
  
  --z-0:    0;
  --z-10:   10;
  --z-20:   20;
  --z-30:   30;
  --z-40:   40;
  --z-50:   50;
  --z-modal: 100;
  --z-popover: 200;
  --z-tooltip: 300;
  --z-notification: 400;
  --z-max: 999;
}
```

## CSS Custom Property Architecture

### Layer Structure

```css
/* Define cascade layers for predictable specificity */
@layer reset, base, tokens, components, utilities;

/* Reset layer - Normalize browser defaults */
@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: var(--color-border);
  }
  
  html {
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    -moz-tab-size: 4;
    tab-size: 4;
    font-family: var(--font-sans);
  }
  
  body {
    margin: 0;
    line-height: inherit;
  }
}

/* Base layer - Element defaults */
@layer base {
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-size: inherit;
    font-weight: inherit;
  }
  
  a {
    color: inherit;
    text-decoration: inherit;
  }
  
  button, input, optgroup, select, textarea {
    font-family: inherit;
    font-size: 100%;
    font-weight: inherit;
    line-height: inherit;
    color: inherit;
    margin: 0;
    padding: 0;
  }
}

/* Component layer - Reusable patterns */
@layer components {
  /* Button Component */
  .btn {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium;
    @apply transition-colors focus-visible:outline-none focus-visible:ring-2;
    @apply focus-visible:ring-ring focus-visible:ring-offset-2;
    @apply disabled:pointer-events-none disabled:opacity-50;
  }
  
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary-hover;
  }
  
  .btn-secondary {
    @apply bg-surface border border-border hover:bg-surface-muted;
  }
  
  /* Card Component */
  .card {
    @apply rounded-lg border bg-surface text-foreground;
  }
  
  .card-header {
    @apply flex flex-col space-y-1.5 p-6;
  }
  
  .card-content {
    @apply p-6 pt-0;
  }
}
```

### Dynamic Property Usage

```css
/* Container queries for responsive components */
@container (min-width: 640px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* CSS-only dark mode support (if needed later) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-gray-950);
    --color-foreground: var(--color-gray-50);
    /* Override other tokens as needed */
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-border: var(--color-gray-900);
    --color-primary: var(--color-blue-700);
  }
}
```

## Utility Class Conventions

### Naming Patterns

```css
/* Color utilities follow semantic naming */
.bg-background     /* Not .bg-gray-50 */
.text-foreground   /* Not .text-gray-900 */
.border-border     /* Not .border-gray-200 */

/* Status utilities use semantic names */
.bg-success        /* Not .bg-green-500 */
.text-error        /* Not .text-red-600 */
.border-warning    /* Not .border-yellow-500 */

/* Spacing utilities use consistent scale */
.p-4               /* 16px padding */
.m-2               /* 8px margin */
.gap-6             /* 24px gap */

/* Typography utilities */
.text-sm           /* 14px with appropriate line-height */
.font-medium       /* font-weight: 500 */
.leading-relaxed   /* line-height: 1.625 */
```

### Custom Utilities

```css
@layer utilities {
  /* Focus visible utilities */
  .focus-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
  }
  
  /* Animation utilities */
  .animate-in {
    animation-duration: var(--animate-duration-200);
    animation-fill-mode: both;
    animation-timing-function: var(--animate-timing-out);
  }
  
  /* Gradient utilities */
  .gradient-primary {
    background-image: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  }
  
  /* Container utilities */
  .container-xs { max-width: 480px; }
  .container-sm { max-width: 640px; }
  .container-md { max-width: 768px; }
  .container-lg { max-width: 1024px; }
  .container-xl { max-width: 1280px; }
}
```

## PostCSS Pipeline Configuration

### Development Configuration

```javascript
// postcss.config.mjs
export default {
  plugins: {
    // Tailwind v4 with automatic content detection
    'tailwindcss': {},
    
    // OKLCH to RGB fallback for 6.9% of browsers
    'postcss-oklab-function': {
      preserve: true,
      subFeatures: {
        displayP3: false // Only sRGB fallbacks
      }
    },
    
    // Modern CSS features
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-properties': false, // Let Tailwind handle
        'gap-properties': false // Already well supported
      }
    }
  }
}
```

### Production Configuration

```javascript
// postcss.config.mjs
export default {
  plugins: {
    'tailwindcss': {},
    
    'postcss-oklab-function': {
      preserve: true,
      subFeatures: {
        displayP3: false
      }
    },
    
    ...(process.env.NODE_ENV === 'production' ? {
      // Optimize for production
      'cssnano': {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          colormin: false, // Preserve OKLCH values
          reduceTransforms: false, // Preserve animations
          // Respect cascade layers
          cssDeclarationSorter: false
        }]
      }
    } : {})
  }
}
```

## Build Optimization Settings

### Vite Plugin Configuration (Recommended)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  css: {
    // Lightning CSS for faster builds
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        chrome: 111,
        firefox: 128,
        safari: 16.4
      }
    }
  },
  build: {
    // Optimize CSS splitting
    cssCodeSplit: true,
    // Inline assets < 4kb
    assetsInlineLimit: 4096,
    // Modern output
    target: 'esnext'
  }
});
```

### Next.js Integration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use Turbopack for faster builds
  turbopack: {
    rules: {
      '*.module.css': {
        loaders: ['postcss-loader'],
        as: '*.css',
      },
    },
  },
  
  // Optimize CSS handling
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Module import optimizations
  modularizeImports: {
    '@/components/ui': {
      transform: '@/components/ui/{{member}}',
    },
  },
  
  experimental: {
    optimizePackageImports: ['@/components/ui'],
    // CSS optimization
    optimizeCss: true,
  }
};

export default nextConfig;
```

### Performance Monitoring

```javascript
// scripts/analyze-css.js
import fs from 'fs';
import path from 'path';
import gzipSize from 'gzip-size';

const cssPath = path.join(process.cwd(), '.next/static/css');
const files = fs.readdirSync(cssPath);

let totalSize = 0;
let totalGzipped = 0;

files.forEach(file => {
  if (file.endsWith('.css')) {
    const content = fs.readFileSync(path.join(cssPath, file));
    const size = content.length;
    const gzipped = gzipSize.sync(content);
    
    totalSize += size;
    totalGzipped += gzipped;
    
    console.log(`${file}: ${(size / 1024).toFixed(2)}KB (${(gzipped / 1024).toFixed(2)}KB gzipped)`);
  }
});

console.log(`\nTotal CSS: ${(totalSize / 1024).toFixed(2)}KB (${(totalGzipped / 1024).toFixed(2)}KB gzipped)`);
console.log(`Target: <25KB gzipped ${totalGzipped < 25 * 1024 ? '✅' : '❌'}`);
```

## Migration Checklist

### Pre-Migration Setup
- [ ] Backup current project state
- [ ] Ensure Node.js 20+ is installed
- [ ] Review browser support requirements
- [ ] Document current bundle size baseline

### Step 1: Dependency Updates
```bash
# Remove old dependencies
npm uninstall tailwindcss postcss autoprefixer @tailwindcss/typography @tailwindcss/forms

# Install Tailwind v4
npm install tailwindcss@next @tailwindcss/postcss@next

# Install optimization tools
npm install --save-dev cssnano postcss-oklab-function postcss-preset-env
```

### Step 2: Configuration Migration
- [ ] Delete `tailwind.config.js`
- [ ] Delete `tailwind.config.ts`
- [ ] Update `postcss.config.mjs` with new configuration
- [ ] Create new `app/globals.css` with @theme directive

### Step 3: Import Updates
```css
/* Before (app/globals.css) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* After (app/globals.css) */
@import "tailwindcss";
@theme { /* ... */ }
```

### Step 4: Class Name Updates
- [ ] Replace `bg-opacity-*` → `bg-black/50` syntax
- [ ] Update `shadow-sm` → `shadow-xs`
- [ ] Convert `ring-3` → `ring-1` (default change)
- [ ] Remove all `dark:` prefixes

### Step 5: Color System Migration
- [ ] Apply semantic color tokens from color-system-spec.md
- [ ] Replace hard-coded colors with tokens
- [ ] Update component variants
- [ ] Test WCAG compliance

### Step 6: Build Process Updates
- [ ] Configure Vite plugin or PostCSS
- [ ] Enable Turbopack for development
- [ ] Set up CSS analysis scripts
- [ ] Verify bundle size targets

### Step 7: Testing & Validation
- [ ] Run visual regression tests
- [ ] Check all interactive states
- [ ] Verify animations work correctly
- [ ] Test in supported browsers
- [ ] Validate performance metrics

## Performance Optimization

### Bundle Size Targets

```javascript
// performance-budgets.json
{
  "css": {
    "total": {
      "maxSize": "50KB",
      "warning": "40KB"
    },
    "critical": {
      "maxSize": "14KB",
      "warning": "12KB"
    },
    "perRoute": {
      "maxSize": "10KB",
      "warning": "8KB"
    }
  }
}
```

### Critical CSS Extraction

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Inline critical tokens only */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @layer reset, base, tokens, components, utilities;
            :root {
              --color-background: oklch(0.985 0 0);
              --color-foreground: oklch(0.205 0 0);
              --color-primary: oklch(0.62 0.17 237);
              --font-sans: var(--font-inter), system-ui, sans-serif;
            }
          `
        }} />
      </head>
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

### Tree Shaking Unused Styles

```javascript
// tailwind.config.js alternative for content detection
// In v4, this is automatic, but you can optimize with:
export default {
  content: {
    relative: true,
    files: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
  },
};
```

## Animation System

### CSS-First Animations

```css
/* Define reusable keyframes */
@keyframes slide-in {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Animation utilities */
@layer utilities {
  .animate-slide-in {
    animation: slide-in var(--animate-duration-200) var(--animate-timing-out);
  }
  
  .animate-fade-in {
    animation: fade-in var(--animate-duration-150) var(--animate-timing-out);
  }
  
  .animate-scale-in {
    animation: scale-in var(--animate-duration-200) var(--animate-timing-bounce);
  }
}
```

### Transition Utilities

```css
/* Smooth transitions for interactive elements */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: var(--animate-timing-in-out);
  transition-duration: var(--animate-duration-150);
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: var(--animate-timing-in-out);
  transition-duration: var(--animate-duration-200);
}

.transition-all {
  transition-property: all;
  transition-timing-function: var(--animate-timing-in-out);
  transition-duration: var(--animate-duration-200);
}
```

### Component Animation Patterns

```tsx
// Switch component animation (tabs.tsx, switch.tsx)
const switchVariants = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      checked: {
        true: "bg-primary",
        false: "bg-input"
      }
    }
  }
);

// Tab animation with data attributes
.tab {
  @apply transition-all duration-200;
  
  &[data-state="active"] {
    @apply bg-surface text-foreground shadow-sm;
  }
  
  &[data-state="inactive"] {
    @apply text-foreground-muted hover:text-foreground;
  }
}
```

## Implementation Examples

### Example 1: Complete Button Component

```tsx
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles using semantic tokens
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        secondary: "bg-surface border border-border hover:bg-surface-muted text-foreground",
        destructive: "bg-error text-white hover:bg-error-dark",
        outline: "border border-border bg-transparent hover:bg-surface-subtle",
        ghost: "hover:bg-surface-subtle hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### Example 2: Form Input with Focus States

```tsx
// components/ui/input.tsx
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        // Base styles
        "flex h-10 w-full rounded-md border px-3 py-2 text-sm",
        // Color tokens
        "bg-surface text-foreground placeholder:text-foreground-subtle",
        // Border states
        error 
          ? "border-error focus:border-error" 
          : "border-border focus:border-primary",
        // Focus styles
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // File input specific
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
}
```

### Example 3: Animated Tabs

```tsx
// components/ui/tabs.tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-surface-muted p-1 text-foreground-muted",
      className
    )}
    {...props}
  />
));

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background",
      "transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      "data-[state=inactive]:hover:bg-surface-subtle",
      className
    )}
    {...props}
  />
));

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "animate-fade-in",
      className
    )}
    {...props}
  />
));
```

### Example 4: Card with Hover Effects

```tsx
// components/ui/card.tsx
import { cn } from "@/lib/utils";

export function Card({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-surface text-foreground",
        interactive && [
          "transition-all duration-200",
          "hover:border-border-strong hover:shadow-md",
          "hover:translate-y-[-2px]"
        ],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-foreground-muted", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
```

### Example 5: Loading States with Animations

```tsx
// components/ui/skeleton.tsx
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-surface-muted",
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

// Add to globals.css
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

## Success Criteria

### Migration Success
- [ ] All Tailwind v3 syntax updated to v4
- [ ] Zero JavaScript configuration files
- [ ] All colors use OKLCH with fallbacks
- [ ] Dark mode classes completely removed
- [ ] Build time < 100ms (from 2s baseline)

### Performance Success
- [ ] Total CSS < 50KB uncompressed
- [ ] Critical CSS < 14KB inline
- [ ] CSS per route < 10KB
- [ ] 100x faster HMR in development
- [ ] No runtime style calculations

### Quality Success
- [ ] All animations use CSS-first approach
- [ ] Semantic tokens used consistently
- [ ] Zero specificity conflicts
- [ ] Browser support verified
- [ ] Visual regression tests pass

### Developer Success
- [ ] Clear migration path documented
- [ ] Common patterns established
- [ ] Performance monitoring automated
- [ ] Team onboarded to CSS-first approach
- [ ] Debugging tools configured

## Research Attribution

This specification synthesizes insights from:
- `research/tailwind-v4.md`: Core v4 features, migration patterns, performance gains
- `research/nextjs-build-optimization.md`: Turbopack configuration, build optimization
- `color-system-spec.md`: OKLCH token integration and semantic naming
- Gap analysis: Animation system patterns for tabs.tsx and switch.tsx
- Modern CSS best practices for 2025 production applications

The CSS-first architecture with OKLCH color system positions Victry for optimal performance and maintainability.