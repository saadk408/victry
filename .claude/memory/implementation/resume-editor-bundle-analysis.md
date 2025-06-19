# Resume Editor Bundle Analysis - Implementation Guide

## Discovery Process

### Resources Consulted
- `.claude/memory/implementation/nextjs-performance.md` - Bundle analysis results and optimization patterns
- `.claude/memory/performance-budgets-quality-gates.md` - Performance targets and measurement methods
- `.claude/memory/research/performance-baseline.md` - Current metrics showing 404KB issue
- `.claude/memory/research/nextjs-build-optimization.md` - Optimization techniques and Turbopack config

### Key Findings from Phase 2
From `nextjs-performance.md` lines 114-138:
- Resume editor route: 191KB component + 213KB shared = 404KB total
- Critical chunk identified: 372KB chunk suggests poor code splitting
- TipTap/rich text editor likely cause of bundle bloat
- CSS already optimized at 19.76KB (60% under target)

## Bundle Analysis Commands

### 1. Analyze Bundle Composition
```bash
# Run bundle analyzer (already configured in package.json)
npm run build:analyze

# This will:
# 1. Build with ANALYZE=true environment variable
# 2. Generate report in .next/analyze/
# 3. Open visual bundle report in browser
```

### 2. Route-Specific Analysis
```bash
# Analyze specific component bundle
npm run analyze -- --component=resume-editor

# Check route sizes after build
cat .next/build-manifest.json | jq '.pages["/resume/[id]/edit"]'
```

### 3. Identify Large Dependencies
```bash
# Find large node_modules in bundle
find .next/static/chunks -name "*.js" -size +50k -exec ls -lh {} \; | sort -k5 -hr

# Check for duplicate packages
npm ls --depth=0 | grep -E "(tiptap|editor|rich-text)"
```

## Performance Measurement Tools

### 1. Build Time Analysis
```bash
# Profile build performance (configured in package.json)
npm run build:profile

# Measure with and without Turbopack
time npm run build:standard  # Without Turbopack
time npm run build           # With Turbopack
```

### 2. Bundle Size Validation
```javascript
// From performance-budgets-quality-gates.md lines 731-766
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
  
  return results;
}
```

### 3. Component-Level Analysis
```typescript
// Analyze individual component sizes
import { analyzeMetafile } from 'esbuild';

async function analyzeComponents() {
  const metafile = await import('.next/build-meta.json');
  const analysis = await analyzeMetafile(metafile, {
    verbose: true,
    filter: /components\/resume/
  });
  console.log(analysis);
}
```

## Dynamic Import Patterns

### 1. TipTap Editor Optimization
```typescript
// components/resume/editor/ResumeEditor.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Split TipTap into separate chunk
const TipTapEditor = dynamic(
  () => import('./TipTapEditor').then(mod => mod.TipTapEditor),
  {
    loading: () => <EditorSkeleton />,
    ssr: false // Disable SSR for editor
  }
);

// Loading skeleton to prevent layout shift
const EditorSkeleton = () => (
  <div className="w-full h-[600px] animate-pulse bg-surface rounded-lg" />
);
```

### 2. Extension-Based Code Splitting
```typescript
// Split TipTap extensions into groups
const loadCoreExtensions = () => import('@tiptap/starter-kit');
const loadAdvancedExtensions = () => import('./editor-extensions/advanced');
const loadAIExtensions = () => import('./editor-extensions/ai');

// Progressive enhancement pattern
export function useProgressiveEditor() {
  const [extensions, setExtensions] = useState([]);
  
  useEffect(() => {
    // Load core immediately
    loadCoreExtensions().then(({ StarterKit }) => {
      setExtensions(prev => [...prev, StarterKit]);
    });
    
    // Load advanced after interaction
    const loadAdvanced = () => {
      loadAdvancedExtensions().then(({ extensions }) => {
        setExtensions(prev => [...prev, ...extensions]);
      });
    };
    
    // Defer advanced features
    const timer = setTimeout(loadAdvanced, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  return extensions;
}
```

### 3. Route-Based Code Splitting
```typescript
// app/resume/[id]/edit/page.tsx
import { lazy, Suspense } from 'react';

// Split page components
const ResumeHeader = lazy(() => import('./components/ResumeHeader'));
const ResumeSidebar = lazy(() => import('./components/ResumeSidebar'));
const ResumeEditor = lazy(() => import('./components/ResumeEditor'));
const ResumePreview = lazy(() => import('./components/ResumePreview'));

export default function ResumeEditPage() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <Suspense fallback={<HeaderSkeleton />}>
        <ResumeHeader />
      </Suspense>
      
      <Suspense fallback={<SidebarSkeleton />}>
        <ResumeSidebar />
      </Suspense>
      
      <Suspense fallback={<EditorSkeleton />}>
        <ResumeEditor />
      </Suspense>
      
      <Suspense fallback={<PreviewSkeleton />}>
        <ResumePreview />
      </Suspense>
    </div>
  );
}
```

## Optimization Techniques from Phase 2

### 1. Modular Imports (from nextjs-performance.md lines 65-72)
```typescript
// Configure in next.config.ts
modularizeImports: {
  '@/components/ui': {
    transform: '@/components/ui/{{member}}',
  },
  'lucide-react': {
    transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
  },
  '@tiptap/react': {
    transform: '@tiptap/react/dist/{{member}}',
  }
}
```

### 2. Package Optimization (from nextjs-performance.md lines 76-84)
```typescript
experimental: {
  optimizePackageImports: [
    '@/components/ui',
    '@/lib/utils',
    'lucide-react',
    '@tiptap/react',
    '@tiptap/starter-kit',
    '@tiptap/extension-placeholder'
  ]
}
```

### 3. Webpack Bundle Optimization
```typescript
// Custom webpack config for fine-tuning
webpack: (config, { isServer }) => {
  if (!isServer) {
    // Split TipTap into separate chunks
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        tiptap: {
          test: /[\\/]node_modules[\\/]@tiptap[\\/]/,
          name: 'tiptap',
          priority: 10,
        },
        editor: {
          test: /[\\/]components[\\/]resume[\\/]editor[\\/]/,
          name: 'resume-editor',
          priority: 20,
        },
      },
    };
  }
  return config;
}
```

## Performance Monitoring Implementation

### 1. Bundle Size Tracking
```typescript
// lib/monitoring/bundle-tracker.ts
export function trackBundleSize() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Get all script tags
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    
    // Calculate total size
    const totalSize = scripts.reduce((sum, script) => {
      const src = script.getAttribute('src');
      if (src?.includes('/resume/') && src?.includes('edit')) {
        // Track resume editor specific bundles
        performance.mark(`bundle-loaded-${src}`);
      }
      return sum + (parseInt(script.getAttribute('data-size') || '0'));
    }, 0);
    
    // Report if over budget
    if (totalSize > 180 * 1024) { // 180KB limit
      console.error(`Resume editor bundle exceeds budget: ${totalSize / 1024}KB`);
      // Send to monitoring service
    }
  }
}
```

### 2. Loading Performance Metrics
```typescript
// Track progressive loading stages
export function trackEditorLoading() {
  // Core editor timing
  performance.mark('editor-core-start');
  
  // When core loads
  performance.mark('editor-core-end');
  performance.measure('editor-core-time', 'editor-core-start', 'editor-core-end');
  
  // Extensions timing
  performance.mark('editor-extensions-start');
  
  // When all extensions load
  performance.mark('editor-extensions-end');
  performance.measure('editor-extensions-time', 'editor-extensions-start', 'editor-extensions-end');
  
  // Log results
  const entries = performance.getEntriesByType('measure');
  entries.forEach(entry => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
}
```

## Validation Scripts

### 1. CI/CD Bundle Check
```yaml
# .github/workflows/bundle-check.yml
- name: Check Resume Editor Bundle Size
  run: |
    npm run build
    node scripts/check-bundle-size.js --route="/resume/[id]/edit" --max=180
```

### 2. Local Development Guards
```json
// package.json addition
{
  "scripts": {
    "prebuild": "npm run check:resume-bundle",
    "check:resume-bundle": "node scripts/validate-resume-bundle.js"
  }
}
```

## Expected Optimization Results

Based on Phase 2 analysis and patterns:

### Current State (from nextjs-performance.md line 117)
- Route-specific: 191KB
- First Load: 404KB
- Large chunk: 372KB

### After Optimization
- Route-specific: <80KB (58% reduction via code splitting)
- First Load: <180KB (55% reduction)
- Chunks: Multiple 50-100KB chunks (better caching)

### Performance Gains
- Initial paint: 2x faster
- Time to interactive: 50% improvement
- Memory usage: 30% reduction

## Implementation Priority

1. **Immediate**: Run bundle analyzer, identify exact dependencies
2. **Day 1**: Implement TipTap dynamic imports
3. **Day 2**: Split AI and template features
4. **Day 3**: Optimize imports and validate results
5. **Ongoing**: Monitor bundle size in CI/CD

## Success Validation

From performance-budgets-quality-gates.md lines 52-66:
```javascript
const jsBudgets = {
  routes: {
    '/resume/[id]/edit': { max: 180, warn: 160 }, // KB compressed
  }
};
```

Route must meet these targets before Phase 3 component migration can proceed.