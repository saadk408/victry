# Dark Mode Removal - Resource Knowledge Map

Generated: January 16, 2025
Last Updated: January 16, 2025 (Task 0.7 completed)
Purpose: Central knowledge map for efficient task execution
Total Files Cataloged: 16 (13 original + 3 gap research files)

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

## Gap Analysis Report
*Generated: January 16, 2025 during Task 0.7*

### Analysis Summary
- Files Analyzed: 13
- Total Gaps Identified: 8
- Critical Gaps: 2
- Important Gaps: 3
- Nice-to-Have Gaps: 3

### CRITICAL Gaps (Must Research)

1. **Tailwind v4 Animation System Migration**
   - Why Critical: Risk assessment shows tabs.tsx and switch.tsx use transitions/animations extensively, but migration-patterns.md lacks animation migration guidance
   - Current State: No animation/transition patterns in tailwind-v4-spec.md or migration-patterns.md
   - Blocks: Tasks 3.2-3.7 (all component migrations that use animations)
   - Research Needed:
     * Tailwind v4 transition utilities in CSS-first approach
     * @keyframes implementation with @theme directive
     * Performance comparison: CSS animations vs JavaScript
     * Dynamic animation values using CSS custom properties

2. **Next.js 15 Build Optimization Configuration**
   - Why Critical: Performance targets require <1.5s build time (currently 2s), but no concrete configuration provided
   - Current State: Performance targets defined in performance-budgets-quality-gates.md but implementation missing
   - Blocks: Task 2.2 (Next.js Performance Configuration)
   - Research Needed:
     * Specific next.config.js settings for Tailwind v4 optimization
     * @next/bundle-analyzer integration and configuration
     * Turbopack setup for development performance
     * Critical CSS extraction with Next.js 15 App Router

### IMPORTANT Gaps (Should Research)

1. **Color Validation Script Implementation**
   - Why Important: Referenced in tailwind-v4-spec.md (line 312) but no implementation details
   - Current State: Concept mentioned but no code or integration pattern
   - Affects: Quality gates, CI/CD pipeline, developer workflow
   - Research Needed:
     * AST-based color detection using TypeScript compiler API
     * ESLint plugin development for semantic color enforcement
     * Performance optimization for large codebases

2. **Playwright Visual Regression Configuration**
   - Why Important: Essential for validating no visual breaks during migration
   - Current State: Playwright mentioned in migration-patterns.md but no specific setup
   - Affects: Tasks 3.2-3.7 (component migration confidence)
   - Research Needed:
     * Playwright visual comparison setup with tolerance levels
     * Baseline screenshot management strategy
     * CI integration with automatic visual diff reports

3. **OKLCH Browser Fallback Implementation**
   - Why Important: 6.9% of users need fallbacks (93.1% support mentioned)
   - Current State: Fallback strategy mentioned in oklch-color-system.md but not implemented
   - Affects: Production deployment and user experience
   - Research Needed:
     * PostCSS plugin configuration for automatic OKLCH→RGB conversion
     * CSS @supports detection patterns
     * Testing fallback rendering across browsers

### NICE-TO-HAVE Gaps (Acknowledged Only)

1. **Storybook 9 with Tailwind v4 Setup**
   - Useful for component documentation but not blocking implementation

2. **Real-time Performance Monitoring Dashboard**
   - Would help track improvements but can use existing tools

3. **Advanced OKLCH Color Manipulation**
   - Color mixing and dynamic themes are interesting but not required

## Gap Resolution Summary
*Updated: January 16, 2025 after research completion*

### Gaps Researched and Resolved ✅

#### CRITICAL Gaps Resolved

1. **Tailwind v4 Animation System Migration** ✅
   - Status: RESOLVED
   - Solution Location: migration-patterns.md (lines 630-741)
   - Key Insight: CSS-first animations using --animate-* theme variables with @keyframes
   - Implementation Ready: Yes
   - Confidence Level: High

2. **Next.js 15 Build Optimization Configuration** ✅
   - Status: RESOLVED
   - Solution Location: research/nextjs-build-optimization.md (complete file)
   - Key Insight: Turbopack alpha builds offer 45.8% faster compilation
   - Implementation Ready: Yes
   - Confidence Level: High

#### IMPORTANT Gaps Resolved

1. **Color Validation Script Implementation** ✅
   - Status: RESOLVED
   - Solution Location: tailwind-v4-spec.md (lines 323-489)
   - Key Insight: ESLint plugin + standalone validation script with AST parsing
   - Implementation Ready: Yes
   - Confidence Level: High

2. **Playwright Visual Regression Configuration** ✅
   - Status: RESOLVED
   - Solution Location: research/playwright-visual-regression.md (complete file)
   - Key Insight: Built-in visual comparison with configurable tolerance and CI integration
   - Implementation Ready: Yes
   - Confidence Level: High

3. **OKLCH Browser Fallback Implementation** ✅
   - Status: RESOLVED
   - Solution Location: color-system-spec.md (lines 333-423)
   - Key Insight: PostCSS plugin automatically generates RGB fallbacks for 6.9% unsupported browsers
   - Implementation Ready: Yes
   - Confidence Level: High

### Gaps Not Researched (NICE-TO-HAVE)

1. **Storybook 9 with Tailwind v4 Setup**
   - Status: NICE-TO-HAVE - Not Researched
   - Reason: Component documentation tool setup not critical for migration
   - Future Consideration: After successful migration completion

2. **Real-time Performance Monitoring Dashboard**
   - Status: NICE-TO-HAVE - Not Researched
   - Reason: Existing monitoring tools sufficient for migration validation
   - Future Consideration: Post-deployment enhancement

3. **Advanced OKLCH Color Manipulation**
   - Status: NICE-TO-HAVE - Not Researched
   - Reason: Basic OKLCH implementation sufficient for current needs
   - Future Consideration: Future theme system enhancement

### Implementation Impact

All CRITICAL and IMPORTANT knowledge gaps have been researched and resolved. Implementation can proceed with confidence through all phases. The research has provided:

- Complete animation migration patterns for tabs.tsx and switch.tsx
- Concrete Next.js configuration for achieving <1.5s build times
- Working validation scripts for enforcing semantic colors
- Full Playwright setup for visual regression testing
- OKLCH fallback strategy ensuring 100% browser compatibility

NICE-TO-HAVE gaps are documented for future consideration but do not impact implementation success.

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