# Dark Mode Removal - Resource Knowledge Map

Generated: January 16, 2025
Last Updated: January 16, 2025
Purpose: Central knowledge map for efficient task execution
Total Files Cataloged: 13

## Quick Reference Guide

### Need to find information about...
- **Color system design** → color-system-spec.md (OKLCH tokens: lines 27-100)
- **OKLCH implementation** → research/oklch-color-system.md (browser support, tools)
- **Tailwind v4 migration** → tailwind-v4-spec.md (CSS-first: lines 29-186), research/tailwind-v4.md
- **Component patterns** → migration-patterns.md (migration template: lines 23-86, testing: lines 134-245)
- **Testing strategies** → migration-patterns.md (TDD approach: lines 134-389)
- **Performance targets** → performance-budgets-quality-gates.md (bundle limits: lines 44-75)
- **Risk assessment** → research/risk-assessment.md (priority components: lines 77-107)
- **Current issues** → research/color-analysis.md (30 dark mode instances: lines 12-34)
- **Accessibility standards** → color-system-spec.md (WCAG AA: lines 66-88)
- **React 19 patterns** → research/react-19.md (new hooks and features)
- **Next.js 15 optimizations** → research/nextjs-15.md (RSC, performance features)
- **Implementation examples** → implementation/tailwind-v4-config.md (CSS-first setup)

## Complete File Inventory

### Root Specifications (.claude/memory/)
| File | Purpose | Key Sections | Status |
|------|---------|--------------|--------|
| color-system-spec.md | OKLCH color system design | 1. Brand colors (lines 29-46)<br>2. Neutral scale (lines 48-64)<br>3. Status colors (lines 66-88)<br>4. Semantic mapping | Complete |
| tailwind-v4-spec.md | Migration specification | 1. @theme directive (lines 29-186)<br>2. CSS-first config<br>3. Migration checklist (lines 318-342)<br>4. Validation tools | Complete |
| migration-patterns.md | Component migration guide | 1. Migration template (lines 23-86)<br>2. Complex components (lines 89-132)<br>3. Testing strategy (lines 134-389)<br>4. Rollback procedures | Complete |
| migration-strategy.md | Overall migration approach | 1. 4-phase approach<br>2. Risk mitigation<br>3. Timeline (4 weeks)<br>4. Success criteria | Complete |
| performance-budgets-quality-gates.md | Performance targets | 1. Bundle limits (lines 44-75)<br>2. Build targets (lines 92-108)<br>3. Quality gates (lines 132-175)<br>4. Monitoring (lines 180-220) | Complete |

### Research Files (.claude/memory/research/)
| File | Topic | Research Status | Key Findings | Implementation Ready |
|------|-------|-----------------|--------------|---------------------|
| color-analysis.md | Current color audit | Complete | - 30 dark mode instances in 8 files<br>- Hybrid OKLCH/HSL system<br>- Inconsistent color usage<br>- Button component already semantic | Yes |
| nextjs-15.md | Next.js optimizations | Complete | - React Server Components<br>- Partial prerendering<br>- Parallel data fetching<br>- Suspense boundaries | Yes |
| oklch-color-system.md | OKLCH color space | Complete | - 93.1% browser support<br>- Fallback strategies<br>- Perceptual uniformity<br>- P3 wide gamut support | Yes |
| performance-baseline.md | Current metrics | Complete | - Bundle: 403KB (resume edit)<br>- Build: 2s<br>- LCP: 2.5s<br>- All routes dynamic | Baseline recorded |
| react-19.md | React 19 patterns | Complete | - Server/Client Actions<br>- useActionState hook<br>- Document metadata<br>- Form improvements | Yes |
| risk-assessment.md | Component risk matrix | Complete | - High: switch.tsx, tabs.tsx<br>- Medium: Card, Badge<br>- 7 UI + 63 feature components<br>- Zero breaking changes | Yes |
| tailwind-v4.md | Tailwind v4 features | Complete | - CSS-first architecture<br>- 5x faster builds<br>- OKLCH native support<br>- Container queries | Yes |

### Implementation Documentation (.claude/memory/implementation/)
| File | Component/Feature | Completion | Key Patterns | Reusable Learnings |
|------|-------------------|------------|--------------|-------------------|
| tailwind-v4-config.md | Tailwind setup | Started | - @theme implementation<br>- OKLCH-only colors<br>- Performance layers<br>- Validation strategy | CSS variable setup |

### Test Results (.claude/memory/test-results/)
| Subdirectory | Purpose | Status |
|--------------|---------|--------|
| [Empty directory] | Ready for test results | Empty - Ready for use |

## Cross-Reference Matrix

### Technology Dependencies
- **Tailwind v4**: tailwind-v4-spec.md ← tailwind-v4.md ← implementation/tailwind-v4-config.md
- **OKLCH Colors**: color-system-spec.md ← oklch-color-system.md ← color-analysis.md
- **Performance**: performance-budgets-quality-gates.md ← performance-baseline.md
- **Components**: migration-patterns.md ← risk-assessment.md ← color-analysis.md

### Implementation Dependencies
- **Before Tailwind setup**: Read color-system-spec.md + tailwind-v4-spec.md + implementation/tailwind-v4-config.md
- **Before component migration**: Read migration-patterns.md + risk-assessment.md + color-analysis.md
- **Before testing**: Read performance-budgets-quality-gates.md + migration-patterns.md (testing section)
- **Before optimization**: Read performance-baseline.md + nextjs-15.md

## Knowledge Gaps Identified

### Critical Implementation Details
Based on comprehensive file analysis, the following potential gaps have been identified for investigation:

#### Build & Development Tooling
- [ ] PostCSS configuration for Tailwind v4 CSS-first setup
- [ ] Bundle analyzer setup for performance monitoring
- [ ] CSS layer organization for critical CSS extraction
- [ ] Development server hot reload configuration with new CSS architecture

#### Testing Infrastructure
- [ ] Playwright configuration for visual regression testing
- [ ] Storybook setup for component documentation
- [ ] Accessibility testing automation setup
- [ ] Performance testing harness configuration

#### Migration Automation
- [ ] Automated script patterns for removing dark: prefixes
- [ ] Color validation script implementation details
- [ ] Git hooks setup for enforcing semantic colors
- [ ] CI/CD pipeline configuration for quality gates

#### Production Optimizations
- [ ] Critical CSS extraction methodology
- [ ] CSS purging strategy with semantic tokens
- [ ] Font loading optimization patterns
- [ ] Image optimization with Next.js 15

#### Component-Specific Patterns
- [ ] Form component migration patterns (React 19 Actions)
- [ ] Animation/transition handling without dark mode
- [ ] Complex state-based component patterns
- [ ] Third-party component library integration

## Usage Instructions

1. **For any task**: First check Quick Reference Guide
2. **For details**: Consult Complete File Inventory
3. **For dependencies**: Review Cross-Reference Matrix
4. **For gaps**: See Knowledge Gaps section

## Maintenance Notes

- Update this file when new research is added
- Add line numbers for frequently referenced sections
- Mark implementation files as they're created
- Track which patterns prove most useful