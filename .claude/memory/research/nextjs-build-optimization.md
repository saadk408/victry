# Next.js 15 Build Optimization Research

Generated: January 16, 2025
Purpose: Fill gap identified in Task 0.7
Priority: CRITICAL

## Gap Description
Performance targets require <1.5s build time (currently 2s), but no concrete Next.js configuration was provided in the specifications for achieving this with Tailwind v4.

## Research Findings

### Turbopack Configuration (Alpha)

Next.js 15.3 includes Turbopack for builds (alpha) with significant performance improvements. Enable it with:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack"
  }
}
```

**Performance Benefits:**
- Up to 45.8% faster initial route compile without caching
- Performance scales with CPU cores
- 5x faster builds, 100x faster incremental builds
- Currently 99.3% integration test compatibility

### Next.js Configuration for Tailwind v4

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Move from experimental.turbo to top-level turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Optimize build performance
  reactStrictMode: true,
  swcMinify: true, // Still use SWC for non-Turbopack builds
  
  // Image optimization
  images: {
    remotePatterns: [
      // Add your image domains
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['@/components/ui'],
    // serverComponentsExternalPackages: ['@prisma/client'], // If using Prisma
  },
};

export default nextConfig;
```

### Bundle Analyzer Setup

While traditional webpack bundle analyzer doesn't work with Turbopack, you can still analyze bundles in non-Turbopack mode:

```bash
npm install --save-dev @next/bundle-analyzer
```

```typescript
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // ... other config
};

export default withBundleAnalyzer(nextConfig);
```

Usage:
```bash
ANALYZE=true npm run build
```

### Critical CSS Extraction with App Router

For Next.js 15 App Router, critical CSS extraction happens automatically, but you can optimize it:

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true, // Reduces CLS
});

// Layer your CSS for better extraction
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS layers */
            @layer reset, base, tokens, recipes, utilities;
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### PostCSS Optimization for Tailwind v4

```javascript
// postcss.config.mjs
export default {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          mergeRules: false, // Prevents OKLCH fallback issues
        }],
      },
    } : {})
  },
}
```

### Development Performance Optimizations

```typescript
// next.config.ts additional optimizations
const nextConfig: NextConfig = {
  // ... previous config
  
  // Reduce memory usage in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  
  // Optimize module resolution
  modularizeImports: {
    '@/components/ui': {
      transform: '@/components/ui/{{member}}',
    },
  },
};
```

## Implementation Guidelines

### Step-by-Step Build Optimization

1. **Enable Turbopack** (if stability allows):
   ```bash
   npm run dev --turbopack
   npm run build --turbopack
   ```

2. **Optimize imports**:
   ```typescript
   // Before
   import { Button, Card, Input } from '@/components/ui';
   
   // After (with modularizeImports)
   import Button from '@/components/ui/button';
   import Card from '@/components/ui/card';
   import Input from '@/components/ui/input';
   ```

3. **Monitor build performance**:
   ```json
   {
     "scripts": {
       "build:analyze": "ANALYZE=true next build",
       "build:profile": "NEXT_PROFILE=true next build"
     }
   }
   ```

4. **Use React Server Components** for static content:
   ```typescript
   // Mark client components explicitly
   'use client';
   
   // Server components are default in app router
   ```

## Code Examples

### Optimized next.config.ts for <1.5s builds

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack for development (alpha for builds)
  turbopack: {
    rules: {
      // Custom loaders if needed
    },
  },
  
  // Core optimizations
  reactStrictMode: true,
  swcMinify: true,
  
  // Reduce bundle size
  modularizeImports: {
    '@/components/ui': {
      transform: '@/components/ui/{{member}}',
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },
  
  // Experimental performance features
  experimental: {
    optimizePackageImports: [
      '@/components/ui',
      '@/lib/utils',
    ],
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
```

## Sources Verified
- [Next.js 15.3 Blog Post](https://nextjs.org/blog/next-15-3) - Turbopack build support
- [Next.js Turbopack Docs](https://nextjs.org/docs/app/api-reference/turbopack) - Configuration reference
- [Next.js Tailwind Guide](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css) - Tailwind v4 integration