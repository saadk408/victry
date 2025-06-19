# Phase 3 Resume Editor Bundle Optimization Plan

## Critical Issue Summary

**Current State**: Resume editor route at 404KB (125% over 180KB target)
**Target State**: <180KB bundle size
**Priority**: CRITICAL - Must fix before component migrations

## Bundle Analysis Results

### Current Bundle Composition
```
Route: /resume/[id]/edit
- Route-specific JS: 191 KB
- First Load JS: 404 KB total
- Shared chunks: 102 KB
- Large chunk identified: 372 KB (chunk 297)
```

### Root Cause Analysis
1. **TipTap Editor**: Rich text editor with extensive dependencies
2. **Synchronous Loading**: All features loaded upfront
3. **No Code Splitting**: Heavy components bundled together
4. **Icon Libraries**: Potentially importing entire icon sets

## Optimization Strategy

### Phase 1: Discovery & Analysis (Immediate)

#### 1. Run Bundle Analyzer
```bash
# Analyze current bundle composition
npm run build:analyze

# Or manually:
ANALYZE=true npm run build:standard
```

#### 2. Identify Heavy Dependencies
- Check `.next/analyze/` for bundle report
- Focus on `/resume/[id]/edit` route
- Document all packages >20KB

#### 3. Component Audit
- List all components used in resume editor
- Identify which are essential vs. nice-to-have
- Check for duplicate functionality

### Phase 2: Code Splitting Implementation

#### 1. Dynamic Import for TipTap
```typescript
// Before: Synchronous import
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// After: Dynamic import with loading state
const TipTapEditor = dynamic(
  () => import('@/components/resume/editor/TipTapEditor'),
  {
    loading: () => <EditorSkeleton />,
    ssr: false
  }
);
```

#### 2. Lazy Load Non-Critical Features
```typescript
// Split AI suggestions into separate chunk
const AISuggestions = dynamic(
  () => import('@/components/resume/ai/AISuggestions'),
  { 
    loading: () => <div className="animate-pulse h-20 bg-surface rounded" />,
    ssr: false 
  }
);

// Split template gallery
const TemplateGallery = dynamic(
  () => import('@/components/resume/templates/TemplateGallery')
);

// Split export functionality
const ExportOptions = dynamic(
  () => import('@/components/resume/export/ExportOptions')
);
```

#### 3. Optimize Icon Imports
```typescript
// Before: Imports entire library
import { Bold, Italic, Underline } from 'lucide-react';

// After: With modular imports configured
import Bold from 'lucide-react/dist/esm/icons/bold';
import Italic from 'lucide-react/dist/esm/icons/italic';
import Underline from 'lucide-react/dist/esm/icons/underline';
```

### Phase 3: Progressive Enhancement

#### 1. Core Editor First
```typescript
// Load minimal editor immediately
const CoreEditor = ({ resumeId }) => {
  const [enhancementsLoaded, setEnhancementsLoaded] = useState(false);
  
  // Load core functionality
  const editor = useMinimalEditor();
  
  // Progressive enhancement
  useEffect(() => {
    import('@/lib/editor-enhancements').then(({ enhance }) => {
      enhance(editor);
      setEnhancementsLoaded(true);
    });
  }, [editor]);
  
  return <EditorContent editor={editor} />;
};
```

#### 2. Feature Detection & Loading
```typescript
// Load features based on user actions
const useFeatureLoader = () => {
  const loadAIFeatures = useCallback(async () => {
    const { AIAssistant } = await import('@/components/resume/ai');
    return AIAssistant;
  }, []);
  
  const loadTemplates = useCallback(async () => {
    const { TemplateManager } = await import('@/components/resume/templates');
    return TemplateManager;
  }, []);
  
  return { loadAIFeatures, loadTemplates };
};
```

### Phase 4: Bundle Optimization Config

#### 1. Update next.config.ts
```typescript
experimental: {
  optimizePackageImports: [
    '@tiptap/react',
    '@tiptap/starter-kit',
    '@tiptap/extension-placeholder',
    'lucide-react',
    '@/components/resume'
  ]
}
```

#### 2. Create Barrel Exports
```typescript
// components/resume/index.ts
export { default as ResumeEditor } from './ResumeEditor';
export { default as ResumeSidebar } from './ResumeSidebar';
// Don't export heavy components here
```

### Phase 5: Validation & Monitoring

#### 1. Performance Budget Tests
```javascript
// tests/performance/resume-editor.test.js
describe('Resume Editor Bundle Size', () => {
  test('Route bundle is under 180KB', async () => {
    const stats = await getBundleStats();
    const resumeEditRoute = stats.routes['/resume/[id]/edit'];
    expect(resumeEditRoute.size).toBeLessThan(180);
  });
});
```

#### 2. Loading Performance Metrics
```typescript
// Track progressive loading
const trackEditorPerformance = () => {
  performance.mark('editor-core-start');
  // ... after core loads
  performance.mark('editor-core-end');
  
  performance.mark('editor-enhanced-start');
  // ... after enhancements
  performance.mark('editor-enhanced-end');
  
  const coreTime = performance.measure(
    'editor-core-load',
    'editor-core-start',
    'editor-core-end'
  );
  
  console.log('Core editor loaded in:', coreTime.duration);
};
```

## Implementation Checklist

### Immediate Actions
- [ ] Run bundle analyzer to identify exact dependencies
- [ ] Document all packages >20KB in resume editor
- [ ] Create component dependency graph
- [ ] Identify code splitting boundaries

### Code Changes
- [ ] Implement dynamic imports for TipTap
- [ ] Split AI features into separate chunk
- [ ] Lazy load template gallery
- [ ] Optimize icon imports
- [ ] Create loading skeletons

### Configuration
- [ ] Update next.config.ts with optimizePackageImports
- [ ] Configure modular imports for all heavy libraries
- [ ] Add bundle size monitoring to CI/CD
- [ ] Set up performance tracking

### Validation
- [ ] Bundle size <180KB achieved
- [ ] Core editor loads in <1s
- [ ] No functionality regression
- [ ] Smooth progressive enhancement

## Expected Results

### Bundle Size Reduction
- **Current**: 404KB
- **After Phase 2**: ~280KB (30% reduction)
- **After Phase 4**: <180KB (55% reduction)
- **Savings**: 224KB+ removed

### Performance Improvements
- **Initial Load**: 50% faster (only core features)
- **Time to Interactive**: <2s for basic editing
- **Full Features**: Loaded progressively as needed

### User Experience
- Immediate access to basic editing
- Features appear as user needs them
- No blocking on heavy dependencies
- Smooth loading transitions

## Risk Mitigation

### Potential Issues
1. **Flash of Unstyled Content**: Use loading skeletons
2. **Feature Discovery**: Clear UI indicators for loading features
3. **State Management**: Ensure state persists across dynamic loads
4. **SEO Impact**: SSR disabled for editor (acceptable for auth-gated route)

### Rollback Plan
- Keep original synchronous version available
- Feature flag for progressive loading
- Monitor error rates during rollout
- A/B test performance impact

## Success Criteria

1. **Primary**: Resume editor route <180KB
2. **Performance**: Core editor interactive in <2s
3. **Quality**: Zero functionality loss
4. **UX**: Smooth progressive enhancement
5. **Monitoring**: Bundle size alerts configured

## Next Steps

1. Run bundle analyzer immediately
2. Create detailed dependency report
3. Implement Phase 2 code splitting
4. Measure and iterate
5. Document patterns for other routes

---

**Status**: Ready for implementation
**Estimated Time**: 2-3 days for full optimization
**Impact**: Unblocks Phase 3 component migrations