# Framer Motion Bundle Impact Analysis

## Discovery Process
- Resources consulted: Bundle analyzer output, component imports, next.config.ts
- Similar components found: Multiple components using framer-motion for animations
- Patterns discovered: Heavy animation library usage across UI components

## Current Usage

### Components Using Framer Motion
1. **UI Components**:
   - `components/ui/tabs.tsx` - Using motion.div for tab content animations
   - `components/resume/editor-controls/sortable-list.tsx` - Using Reorder, AnimatePresence, motion, useDragControls
   - `components/resume/section-editor/summary.tsx` - Using motion, AnimatePresence
   - `components/resume/section-editor/skills.tsx` - Using motion, AnimatePresence
   - `components/client-home-page.tsx` - Animation usage
   - `app/page.tsx` - Hero section animations with fadeIn and staggerContainer

### Bundle Impact
- Framer Motion is listed in `optimizePackageImports` in next.config.ts
- The library is approximately 40-50KB minified + gzipped
- Used for animations that could be achieved with CSS-first approach

## Optimization Opportunities

### 1. Remove Framer Motion from Tab Components
The tabs component uses framer-motion only for simple fade animations:
```tsx
<motion.div
  initial={{ opacity: 0, y: 5 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -5 }}
  transition={{ duration: 0.2 }}
>
```

This can be replaced with CSS animations using Tailwind's animation utilities.

### 2. Replace AnimatePresence with CSS Transitions
Many components use AnimatePresence for enter/exit animations that could be handled with CSS.

### 3. Sortable List Alternative
The sortable-list.tsx heavily uses framer-motion for drag and drop. Consider:
- Using native HTML5 drag and drop API
- Or keep framer-motion but load it dynamically only when sortable lists are needed

### 4. Dynamic Import Strategy
For components that truly need framer-motion:
```tsx
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }
);
```

## Estimated Bundle Reduction
- Complete removal: ~40-50KB reduction
- Selective dynamic imports: ~30-40KB reduction (keeping for sortable lists only)
- CSS-first animations would add minimal CSS (~2-3KB)

## Implementation Priority
1. **High Priority**: Remove from tabs.tsx and simple animations
2. **Medium Priority**: Replace in skills/summary editors with CSS
3. **Low Priority**: Keep for complex interactions (sortable lists) but load dynamically

## Knowledge Contribution
- Pattern: Simple animations (fade, slide) should use CSS-first approach
- Pattern: Complex interactions (drag & drop) may justify animation libraries but should be lazy loaded
- Automation potential: Script to identify and replace simple motion.div usage with CSS classes