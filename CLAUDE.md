# Victry Dark Mode Removal - Claude Code Guide

## 🎯 Project Status & Mission

**Project**: Dark Mode Removal & Semantic Token Migration
**Status**: Phase 4D Complete (98% semantic adoption achieved)
**Remaining**: Phase 4E (Testing) & Phase 5 (Deployment)

### Completed Achievements
- ✅ 70/70 components migrated to semantic tokens
- ✅ Zero `dark:` classes remain in codebase
- ✅ Bundle optimization: 404KB → 171KB (resume editor)
- ✅ 16 reusable patterns discovered and documented
- ✅ Automation scripts created for migration

### Critical Success Metrics
- **Semantic Token Adoption**: 98% achieved (target: 98%)
- **CSS Bundle**: 20KB achieved (target: < 50KB)
- **JS Bundle**: 171KB achieved (target: < 180KB)
- **Build Time**: 3000ms current (target: < 1500ms with Turbopack)
- **Test Coverage**: Setup ready (target: 95%)

## 🚀 Quick Command Reference

```bash
# Testing & Validation (Phase 4E)
npm test                          # Run all tests (auto-resets DB)
npm run test:visual              # Playwright visual regression
npm run test:e2e                 # E2E critical user flows
npm run test:a11y                # Accessibility compliance
npm run test:performance         # Bundle & performance metrics

# Semantic Token Validation
npm run validate:colors          # Check semantic token adoption (must show 0)
npm run audit:styles            # Find remaining hardcoded colors
grep -r "bg-gray\|text-gray" --include="*.tsx" app/ components/  # Manual audit

# Bundle Analysis
npm run build && npm run build:analyze    # Analyze bundle sizes
npm run build && npx tsc                  # Build with type checking

# Migration Utilities
npm run migrate:analyze          # Analyze components for issues
npm run migrate:test-run         # Dry run color migrations
```

## 📚 Discovery-First Development Protocol

**ALWAYS start with the resource map**: `.claude/memory/RESOURCES.md`

### Critical Resources for Remaining Tasks
1. **Phase 4E Testing Requirements**:
   - Risk assessment → `.claude/memory/research/risk-assessment.md`
   - Testing patterns → `.claude/memory/migration-patterns.md` (lines 267-426)
   - Quality gates → `.claude/memory/performance-budgets-quality-gates.md`
   - Visual regression → `.claude/memory/research/playwright-visual-regression.md`

2. **Phase 5 Deployment Requirements**:
   - Performance baselines → `.claude/memory/research/performance-baseline.md`
   - Build optimization → `.claude/memory/research/nextjs-build-optimization.md`
   - CI/CD setup → `.claude/memory/performance-budgets-quality-gates.md` (lines 292-406)

3. **Implementation Examples**:
   - All patterns → `.claude/memory/implementation/` (36 files)
   - Automation scripts → `scripts/migration/`

## 🎨 Semantic Color Patterns (Quick Reference)

### Foundation Patterns (1-5)
```typescript
// Pattern 1-3: Basic replacements
bg-white → bg-surface
text-gray-600 → text-muted-foreground
border-gray-200 → border-border

// Pattern 5: Status colors (ALWAYS use centralized)
import { getStatusBadgeClasses } from '@/lib/utils/status-colors';
className={getStatusBadgeClasses('success', 'soft')}
```

### Component Patterns (6-16)
```typescript
// Pattern 6: Surface components (Card, Dialog)
bg-card, text-card-foreground

// Pattern 9: Form components
focus:ring-ring, data-[state=checked]:bg-primary

// Pattern 11: Overlays (Popover, Tooltip)
bg-popover, text-popover-foreground

// Pattern 15-16: Score-based status
score >= 80 ? "text-success" : 
score >= 60 ? "text-warning" : "text-destructive"
```

**Full pattern details**: See `.claude/memory/implementation/` files

## 📋 Phase 4E: Testing & Validation Tasks

### Task 4E.1: E2E Critical Flows
```bash
# Discovery phase (REQUIRED)
1. Check .claude/memory/research/risk-assessment.md for critical flows
2. Review .claude/memory/migration-patterns.md for test patterns
3. Find E2E examples in implementation docs

# Critical flows to test (from risk assessment)
- Authentication flow (login, register, OAuth)
- Resume creation and editing
- AI analysis features (job matching, tailoring)
- PDF export functionality

# Implementation
- Use Playwright templates from testing-infrastructure.md
- Apply risk-based tolerances (5-15%)
- Store results in .claude/memory/test-results/
```

### Task 4E.2: Performance Validation
```bash
# Metrics to validate (from performance-budgets-quality-gates.md)
- JS Bundle: < 180KB (current: 171KB ✓)
- CSS Bundle: < 50KB (current: 20KB ✓)
- Build Time: < 1500ms (current: 3000ms - needs Turbopack)
- First Load JS: < 100KB
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

# Commands
npm run build:analyze
npm run test:performance
```

### Task 4E.3: Accessibility Audit
```bash
# Requirements (from research)
- WCAG 2.1 AA compliance
- Color contrast ratios (check color-system-spec.md)
- Keyboard navigation
- Screen reader compatibility

# Testing approach
npm run test:a11y
# Manual testing with screen readers
# Document in .claude/memory/test-results/accessibility/
```

### Task 4E.4: GitHub Actions Setup
```yaml
# Create .github/workflows/color-migration-ci.yml
# Requirements from performance-budgets-quality-gates.md:
- Visual regression with Chromatic/Playwright
- Bundle size checks
- Semantic token validation
- Automated rollback triggers
- Quality gate enforcement
```

## 🚀 Phase 5: Production Deployment

### Task 5.1: Critical CSS Implementation
```bash
# Extract critical path CSS for faster initial paint
# References: 
- nextjs-build-optimization.md for techniques
- Target: 14KB critical CSS inline
```

### Task 5.2: Production Monitoring
```bash
# Setup monitoring for:
- Bundle size trends
- Semantic token adoption
- Performance metrics
- Error rates
```

### Task 5.3-5.5: Deployment Checklist
- [ ] All Phase 4E tests passing
- [ ] Visual regression approved
- [ ] Performance targets met
- [ ] Documentation updated
- [ ] Rollback plan ready
- [ ] Monitoring configured

## ⚠️ Critical Validation Points

### Hardcoded Colors Audit
```bash
# These should return 0 or only approved exceptions:
grep -r "#[0-9a-fA-F]\{6\}" --include="*.tsx" app/ components/
grep -r "bg-gray\|text-gray" --include="*.tsx" app/ components/
grep -r "dark:" --include="*.tsx" app/ components/  # Must be 0
```

### Approved Exceptions (Document any new ones)
1. **OAuth buttons**: Brand colors required by providers
2. **Marketing glassmorphism**: Landing page effects
3. **Resume templates**: User-selectable theme data
4. **Framer Motion**: RGB equivalents for animations

## 🔧 Troubleshooting

### If tests fail:
1. Check `.claude/memory/implementation/` for similar component patterns
2. Verify pattern application matches discovered examples
3. Use `git diff` to review changes
4. Consult rollback procedures in migration-patterns.md

### If performance degrades:
1. Run bundle analysis: `npm run build:analyze`
2. Check for dynamic import opportunities
3. Reference resume-editor-optimization.md for techniques

### If visual regression detected:
1. Review tolerance settings (5-15% based on risk)
2. Update baselines if changes are intentional
3. Check responsive breakpoints

## 📖 Key Documentation

- **Master Plan**: `@docs/dark-mode-removal-comprehensive-implementation-plan.md`
- **Resource Map**: `.claude/memory/RESOURCES.md` (ALWAYS check first)
- **Pattern Library**: `.claude/memory/implementation/` (36 examples)
- **Test Templates**: `.claude/memory/implementation/testing-infrastructure.md`

## 🎯 Final Success Criteria

Before marking project complete:
- [ ] 98% semantic token adoption maintained
- [ ] All tests passing (unit, integration, e2e, visual)
- [ ] Performance targets met or exceeded
- [ ] Zero `dark:` classes in codebase
- [ ] Documentation complete
- [ ] Production deployment successful
- [ ] Post-deployment monitoring confirms stability

---

**Remember**: Always use discovery-first approach. Check RESOURCES.md → Find relevant docs → Apply patterns → Validate results.