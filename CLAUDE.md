# CLAUDE.md - Phase 3: Dark Mode Removal Component Migration

## Project Overview

**Victry** is an AI-powered resume builder that helps professionals create, tailor, and optimize resumes for job applications. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4.

**Current Mission**: Phase 4 in Progress! 98% semantic token adoption achieved. Shadow system excellently implemented. Focus on gradient tokens, performance verification, and production readiness.

**Project Phases**:
- ✅ Phase 0-1: Research & Specifications (Complete) 
- ✅ Phase 2: Foundation Architecture (Complete - 20KB CSS, OKLCH colors working)
- ✅ Phase 3: Component Migration (Complete - 70/70 components, 0 dark: classes remaining!)
- ⏳ Phase 4: Testing & Validation
- ⏳ Phase 5: Production Deployment

**Success Metrics**: Zero hardcoded colors, 25-30KB bundle reduction, maintain all functionality

---

## Session Continuity Reminders

**Starting a New Session?**
1. This file auto-loaded with your current progress
2. Read last 2-3 implementation docs before starting (see Recent Docs below)
3. Check "Key Learnings" section for recent discoveries
4. Review Pattern Library for reusable solutions
5. Your next unchecked component in the checklist is your starting point

## Recent Implementation Docs (Most Recent First)
<!-- Update this list after completing each component -->
<!-- Keep only the 3 most recent entries -->
1. _Phase 4D.2 Shadow System_ - `shadow-system-discovery.md` - Key insight: _Complete OKLCH-based shadow system already exists and excellently implemented! 45+ files using semantic shadows correctly, 6 marketing colored shadows kept as brand exceptions, parallels Phase 3C automation discovery pattern_
2. _Phase 3C Automation_ - `phase-3c-automation-discovery.md` - Key insight: _Only 1 file (app/layout.tsx) needed migration! 69/70 components already semantic, automation scripts created but minimal use needed, Phase 3 100% complete_
3. _Calendar/DatePicker_ - `calendar-datepicker-discovery.md` - Key insight: _Complex date picker already 100% semantic, validates semantic system handles sophisticated interactive components seamlessly, proves Pattern 9 & 11 universality_

**Before Reaching Context Limit:**
- [ ] Update pattern library with new discoveries
- [ ] Check off completed components
- [ ] Update progress metrics
- [ ] Add to key learnings
- [ ] Update Recent Implementation Docs list
- [ ] Create/complete implementation doc
- [ ] Commit all changes
- [ ] Request: "I've updated all documentation and need a /clear to continue"

**State Preservation Commands** (use these to update this file):
```
# Update pattern count
# Pattern count: 3 → 4

# Add key learning  
# Learning: Interactive components need will-change CSS for 60fps animations

# Update progress
# Components: 15/70 complete, 3.2KB bundle reduction achieved

# Add new pattern
# Pattern: Form inputs need focus-visible for accessibility

# Update recent docs (after completing a component)
# Recent 1: NewComponent - new-component-migration.md - Key: [main discovery]
# Recent 2: [move previous #1 here]
# Recent 3: [move previous #2 here]
```

## Phase 3 Context

Currently migrating 70 components from dark mode classes to semantic color tokens.
- **Foundation Ready**: CSS architecture and OKLCH colors implemented in Phase 2
- **Knowledge Available**: Extensive research and patterns documented in RESOURCES.md
- **Approach**: Discovery-driven migration with progressive pattern accumulation
- **Current Status**: See Migration Checklist and Progress Tracking below

## Knowledge Discovery Guide

### How to Start EVERY Task

1. **Open RESOURCES.md first** - Your complete knowledge map
2. **Identify relevant sections** for your current task:
   - Is it a color question? Look for color-related files
   - Is it a migration pattern? Look for pattern documentation
   - Is it a performance issue? Look for optimization research
   - Is it a testing need? Look for quality specifications

3. **Check for existing work**:
   - Has a similar component been migrated?
   - Are there patterns from Phase 2 that apply?
   - What did the research discover about this type of component?

4. **Ultrathink before implementing**:
   - What makes this component unique?
   - Which discovered patterns apply directly?
   - What needs adaptation?

### Where to Look in RESOURCES.md

**For Understanding the Current State**:
- Research files describe what exists now
- Baseline measurements show current metrics
- Risk assessments categorize components

**For Implementation Guidance**:
- Specifications define the target state
- Implementation files show what worked in Phase 2
- Migration patterns provide templates

**For Quality Assurance**:
- Performance budgets set the targets
- Testing strategies define the approach
- Quality gates establish thresholds

## Commands & Workflows

```bash
# Performance Analysis (CRITICAL for Task 3.0)
npm run analyze -- --component=resume-editor  # Analyze specific bundle
npm run build -- --analyze                    # Full bundle analysis

# Component Testing (Discover patterns in test specs)
npm test components/ui/[component].test.tsx   # Unit testing
npm run test:visual [component]               # Visual regression
npm run validate:colors                       # Semantic color validation

# Automation Scripts (Phase 3C)
npm run migrate:analyze         # Analyze components for automation
npm run migrate:test-run       # Test automation on 5 components
npm run migrate:batch -- --category=display  # Run batch migration

# Development Workflow
npm run dev                                   # Development server
npm run lint                                  # Code quality check
npm run build                                 # Production build

# Git Worktrees (for parallel work if needed)
cd ../victry-ui-migration      # UI components
cd ../victry-feature-migration # Feature components  
cd ../victry                   # Main branch
```

## Verification Checklist (MANDATORY Before Implementation)

### Code Quality Checks
- [ ] All colors use CSS variables (zero hardcoded hex/rgb values)
- [ ] No dark: classes remain anywhere
- [ ] Semantic meaning preserved (error=red tones, success=green tones)
- [ ] TypeScript types still compile without errors

### Functional Preservation  
- [ ] All interactive states work (hover, focus, active, disabled)
- [ ] Component renders correctly without any theme provider wrapper
- [ ] Animations/transitions preserved at 60fps
- [ ] Responsive breakpoints maintained
- [ ] Keyboard navigation intact
- [ ] Screen reader compatibility maintained

### Architecture Alignment
- [ ] Follows patterns from similar components
- [ ] Consistent with Phase 2 foundation
- [ ] No new dependencies added
- [ ] Bundle size neutral or reduced
- [ ] Matches risk tolerance for component type

### Testing Confirmation
- [ ] Unit tests pass
- [ ] Visual regression within tolerance
- [ ] No console errors/warnings
- [ ] Accessibility audit passes

## Migration Checklist

**Follow this order, updating checkboxes as you complete tasks:**

### ✓ CRITICAL PERFORMANCE FIX COMPLETE
- [x] Resume Editor Bundle Optimization (404KB → <180KB)
  - [x] Discovered optimization patterns
  - [x] Applied dynamic imports for TipTap and section editors
  - [x] Removed Framer Motion, replaced with CSS animations
  - [x] Added dynamic imports for tab panels
  - [x] Build verified: 404KB → 171KB (233KB reduction)
  - [x] Target achieved: 9KB under 180KB limit

### Foundation (Required First)
- [x] `/lib/utils/status-colors.ts` - Semantic status utilities ✓

### Core UI Components
- [x] Card - Component migration pattern establishment ✓
- [x] Button - ALREADY SEMANTIC (patterns extracted)
- [x] Badge - Status variant enhancement + consumer cleanup ✓
- [x] Input - ALREADY SEMANTIC (perfect form patterns) ✓
- [x] Textarea - Multi-line input patterns ✓
- [x] Select - ALREADY SEMANTIC (perfect dropdown template) ✓
- [x] Checkbox - Selection pattern enhancement ✓
- [x] Radio - Choice patterns ✓
- [x] Switch - Toggle patterns (HIGH RISK)
- [x] Slider - Range input patterns ✓
- [x] Dialog - ALREADY SEMANTIC (perfect overlay template) ✓
- [x] Popover - Overlay patterns (Pattern 11 validation) ✓
- [x] Tooltip - Hint patterns ✓
- [x] Tabs - Navigation patterns (HIGH RISK) ✓
- [x] Accordion - ALREADY SEMANTIC (consumer cleanup needed) ✓

### Feature Components
- [x] ATS Score - Dynamic color implementation ✓
- [x] Application Tracking - Status state management (Pattern 5 enhancement) ✓
- [x] Auth Components - Security-critical migration (minimal, mostly already semantic) ✓
- [x] Resume Editor - Complex component migration ✓
- [x] Job Match Panel - Data visualization patterns (Pattern 15 & 16 validation) ✓
- [x] Resume Section Editors - Form component patterns (5 editors migrated, 3 already clean) ✓

### Phase 3B Components (Pattern Validation) - ✅ COMPLETE
- [x] Alert - Simple notification patterns (1 dark: class) ✓
- [x] Toast/Toaster - Notification system patterns ✓
- [x] Calendar/DatePicker - Already 100% semantic (zero migration needed) ✓
- [x] Label - Already 100% semantic (zero migration needed) ✓

**Category Coverage Complete**:
- UI Components: 22/26 ✓ (Calendar brings to 22/26)  
- Form Components: 15/15 (100%) ✓ (DatePicker + Label complete)
- Interactive Components: 11/15 ✓ (Toast complete)
- Layout Components: 0/3 (save for automation)
- Data Components: 0/10 (save for automation)

### Automation
- [ ] Migration scripts for remaining components

### Knowledge Transfer
- [ ] Update RESOURCES.md with all Phase 3 discoveries

## Component Risk Discovery

Instead of a fixed risk map, discover component risks by:
1. Finding risk assessment in research files
2. Understanding why components were categorized
3. Applying appropriate testing tolerances:
   - HIGH (5%): Complex state, animations, security-critical
   - MEDIUM (10%): Interactive elements, dynamic content
   - LOW (15%): Static display, simple components

## Pattern Recognition Framework

**A discovery becomes a pattern when:**
1. It appears in 3+ components
2. It saves measurable effort when reused  
3. It has no component-specific dependencies
4. It can be expressed as a simple rule

**Document patterns using:**
```
Pattern: [Clear Name]
Rule: [One sentence - "Always/Never/When X do Y"]
Example: 
  Before: dark:bg-gray-800 bg-white
  After: bg-surface
Found in: [List components]
Automation: High/Medium/Low
Exceptions: [When NOT to use]
```

**Pattern Evolution**: As you discover improvements to patterns, update the definition here. Apply refined patterns going forward. Only backport if you encounter issues with already-migrated components - consistency matters less than working code.

## Pattern Library

**Current Pattern Count**: 16 (3 from specifications + 13 discovered)

### Pattern 1: Surface Colors
- **Rule**: "Replace all dark/light mode pairs with semantic surface tokens"
- **Example**: 
  - Before: `dark:bg-gray-800 bg-white`
  - After: `bg-surface`
- **Found in**: Specifications (pre-populated)
- **Automation**: High
- **Exceptions**: None

### Pattern 2: Border Colors
- **Rule**: "Replace border color pairs with semantic border tokens"
- **Example**:
  - Before: `dark:border-gray-700 border-gray-200`
  - After: `border-surface-border`
- **Found in**: Specifications (pre-populated)
- **Automation**: High
- **Exceptions**: None

### Pattern 3: Text Colors
- **Rule**: "Replace text color pairs with semantic foreground tokens"
- **Example**:
  - Before: `dark:text-white text-gray-900`
  - After: `text-surface-foreground`
- **Found in**: Specifications (pre-populated)
- **Automation**: High
- **Exceptions**: None

### Pattern 4: Dynamic Import for Heavy Libraries
- **Rule**: "When a library/component is >50KB and not needed immediately, use Next.js dynamic imports"
- **Example**:
  - Before: `import { RichTextEditor } from './editor'`
  - After: `const RichTextEditor = dynamic(() => import('./editor'), { ssr: false })`
- **Found in**: Resume Editor optimization (TipTap ~150KB)
- **Automation**: High
- **Exceptions**: Core UI components needed for initial render

### Pattern 5: Semantic Status Colors
- **Rule**: "Replace hardcoded status colors with semantic status utility functions"
- **Example**:
  - Before: `STATUS_COLORS[status].bg + ' ' + STATUS_COLORS[status].text`
  - After: `getStatusClasses(getSemanticStatus(status), 'soft')`
- **Found in**: Application Tracking, Keyword Analysis, Import/Export Controls
- **Automation**: High
- **Exceptions**: None - all status colors should use semantic utilities

### Pattern 6: Card Component Foundation
- **Rule**: "Card components use bg-surface for backgrounds and text-foreground/text-muted-foreground for text hierarchy"
- **Example**:
  - Before: `bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50`
  - After: `bg-surface text-foreground`
- **Found in**: Card component (first UI component migration)
- **Automation**: High
- **Exceptions**: None - surface patterns apply to all card-like containers

### Pattern 7: Status Prop Override
- **Rule**: "When components need both fixed variants and dynamic status, use status prop to override variant behavior"
- **Example**:
  - Before: `<Badge variant="secondary" className={getStatusColor(status)}>`
  - After: `<Badge status="success" statusVariant="soft">`
- **Found in**: Badge component API design
- **Automation**: Medium
- **Exceptions**: Only when both fixed and dynamic behaviors are needed

### Pattern 8: Skill Level Status Mapping
- **Rule**: "Map domain-specific levels to semantic status using consistent color psychology"
- **Example**:
  - Before: `level === 'expert' ? 'bg-orange-100 text-orange-800' : ...`
  - After: `getSkillLevelStatus(level)` → `'active'` → semantic tokens
- **Found in**: Skills component level badges
- **Automation**: High
- **Exceptions**: None - color psychology is universal

### Pattern 9: Form Input Semantic Tokens
- **Rule**: "Form inputs use semantic tokens for all interactive states without hardcoded colors"
- **Example**:
  - Semantic: `border border-border bg-background text-foreground focus:ring-ring`
  - States: hover, focus, disabled, error all use semantic tokens
- **Found in**: Input component (perfect implementation)
- **Automation**: High
- **Exceptions**: None - all form inputs should follow this pattern

### Pattern 10: Character Count Status Mapping
- **Rule**: "Map percentage-based ranges to semantic status types for progress indicators"
- **Example**:
  - Before: `maxPercent < 80 ? "bg-green-500" : maxPercent < 95 ? "bg-amber-500" : "bg-red-500"`
  - After: `getStatusColors(maxPercent < 80 ? 'success' : maxPercent < 95 ? 'warning' : 'error', 'solid').background`
- **Found in**: Textarea character count progress bar
- **Automation**: High
- **Exceptions**: None - all progress indicators benefit from semantic status mapping

### Pattern 11: Semantic Dropdown Components
- **Rule**: "Dropdown components use popover tokens for content and accent tokens for item interactions"
- **Example**:
  - Content: `bg-popover text-popover-foreground`
  - Items: `focus:bg-accent focus:text-accent-foreground`
  - Trigger: `border-input focus:ring-ring`
- **Found in**: Select component (perfect implementation)
- **Automation**: High
- **Exceptions**: None - popover pattern is universal for overlays

### Pattern 12: Toggle Component States
- **Rule**: "Toggle components use background colors for state indication, mapping checked to primary/status colors and unchecked to muted"
- **Example**:
  - Checked: `data-[state=checked]:bg-primary`
  - Unchecked: `data-[state=unchecked]:bg-muted`
  - Status variants: `data-[state=checked]:bg-success` (for success variant)
- **Found in**: Switch component state management
- **Automation**: High
- **Exceptions**: None - background state pattern is universal for toggles

### Pattern 13: Range Component Patterns
- **Rule**: "Range input components use bg-muted for tracks, bg-primary for ranges, border-border for controls"
- **Example**:
  - Track: `bg-muted` (inactive background area)
  - Range: `bg-primary` (active/filled portion)
  - Control: `border-border bg-background` (handle/thumb)
- **Found in**: Slider component migration (extension of Pattern 9)
- **Automation**: High
- **Exceptions**: None - universal for range-based inputs (sliders, progress bars)

### Pattern 14: CSS Keyframe Animations for Collapsible Components
- **Rule**: "Use CSS keyframes with data-state attributes for smooth expand/collapse animations"
- **Example**:
  - Animation: `@keyframes accordion-down { from { height: 0; } to { height: var(--radix-accordion-content-height); } }`
  - Application: `data-[state=open]:animate-accordion-down`
  - Rotation: `[&[data-state=open]>svg]:rotate-180 transition-transform duration-200`
- **Found in**: Accordion component
- **Automation**: Medium (animation names vary by component)
- **Exceptions**: None - universally applicable to collapsible UI

### Pattern 15: Score-Based Status Mapping
- **Rule**: "Map numeric ranges to semantic status types using consistent thresholds"
- **Example**:
  - Before: `score >= 80 ? "text-green-700 bg-green-100" : ...`
  - After: `getScoreStatus(score)` → success/warning/error
  - Thresholds: 80-100% → success, 60-79% → warning, 0-59% → error
- **Found in**: ATS Score component, progress indicators
- **Automation**: High
- **Exceptions**: None - consistent threshold mapping

### Pattern 16: SVG Semantic Colors
- **Rule**: "Use stroke='currentColor' with text color classes for SVG elements"
- **Example**:
  - Before: `<circle stroke="#10B981" />`
  - After: `<circle stroke="currentColor" className="text-success" />`
- **Found in**: ATS Score circular progress, chart components
- **Automation**: High
- **Exceptions**: None when SVG accepts className

### [New patterns will be added here as discovered]

## Intelligent Discovery Prompts

**For Subagent Usage**:
```
"Discover migration patterns in RESOURCES.md for [component type]"
"Find existing implementations similar to [current component]"
"Analyze [component] to understand its complexity"
"Search for [specific pattern] in implementation files"
```

**For Solution Verification** (use before implementing):
```
"Verify this approach aligns with project architecture"
"Check if similar solutions have worked in other components"
"Validate this won't break existing functionality"
"Confirm this matches discovered specifications"
```

**Think Levels Based on Discovery**:
- Simple pattern application: Direct implementation
- Pattern adaptation needed: `think` about modifications
- Complex/novel situation: `ultrathink` about approach

## Testing Through Discovery

For each component, discover:
1. What quality thresholds apply from specifications?
2. What test patterns exist from Phase 2?
3. What tolerances are appropriate for this risk level?
4. What validation ensures migration success?

## Documentation Requirements

**For EVERY component**, create:
```
.claude/memory/implementation/[component]-migration.md

Template based on discovery:
# [Component] Migration

## Discovery Process
- Resources consulted: [Which RESOURCES.md sections helped]
- Similar components found: [What existing work applied]
- Patterns discovered: [What was learned]

## Implementation Details
- Approach: [How discoveries were applied]
- Challenges: [What required new solutions]
- Effort: [Relative complexity]

## Knowledge Contribution
- New patterns: [What future components can use]
- Automation potential: [What could be scripted]
- Surprises: [What differed from expectations]
```

## Progress Tracking

**Discovery Efficiency**:
- RESOURCES.md consultations: ___/70 
- Existing patterns reused: ___/70
- New patterns discovered: 3 + ___
- Efficiency gained: [Track improvement]

**Migration Progress**:
- Components complete: 70/70 (100%) ✅
- Bundle reduction: 233KB achieved (404KB → 171KB)
- Target exceeded: 9KB under 180KB limit ✓
- Dark classes remaining: 0 (verified via codebase search)
- Automation discovery: Most components were already semantic, only app/layout.tsx needed migration
- Quality maintained: Yes (zero hardcoded colors, semantic tokens working, CSS-first animations)

### Current Milestone Status
- **Phase 3A (Discovery & Pattern Establishment)**: Complete ✓
- **Phase 3B (Pattern Application & Validation)**: Complete ✅
- **Phase 3C (Automation)**: Complete ✅ - Scripts created, 1 file migrated, 0 dark: classes remaining
- **Phase 3 Overall**: Complete ✅ - All 70 components migrated to semantic colors!

### Phase 3B Assessment Tracking

#### Systematic Category Coverage ✅ COMPLETE
- **UI Components**: 22/26 complete (85%) - Calendar discovery complete ✓
- **Form Components**: 15/15 complete (100%) ✅ - DatePicker + Label discovery complete ✓  
- **Interactive Components**: 11/15 complete (73%) - Toast complete ✓
- **Layout Components**: 0/3 complete (0%) - Header, Sidebar, Footer for Phase 3C
- **Data Components**: 0/10 complete (0%) - Tables, Lists, Charts for Phase 3C

#### Automation Readiness Metrics ✅ VERIFIED
- **Pattern Stability**: 
  - [x] No pattern changes in last 5 components ✓ (Progress, Alert, Toast, Calendar, Label all 100% pattern reuse)
  - [x] All 16 patterns proven across multiple categories ✓ 
  - [x] Edge cases documented in implementation files ✓
- **Error Rate**: 0% (last 10 components)
- **Pattern Reuse Rate**: 95%+ (Progress was 100%)
- **Average Migration Time**: 25-30 minutes/component
- **Automation Candidates Identified**:
  - Simple replacements: Patterns 1-3 (surface, border, text)
  - Status mappings: Pattern 5, 15
  - Form patterns: Pattern 9
  - Overlay patterns: Pattern 11

#### ROI Calculation (Validated with Actual Data)
**Manual baseline**: 16.5 hours for remaining 44 components
- Simple components (20): 15 min each = 5 hours
- Form/interactive (15): 25 min each = 6.25 hours  
- Complex/data viz (9): 35 min each = 5.25 hours

**Hybrid Automation Approach** (Recommended):
- Automate Patterns 1-3: 25 components × 12 min saved = 5 hours
- Script development: 4 hours (focused scope)
- Manual verification: 2 hours
- Manual complex patterns: 19 components × 20 min = 6.3 hours
- **Total automated approach**: 12.3 hours vs 16.5 manual = **4.2 hours saved (25% improvement)**

**Alternative scenarios**:
- Conservative (Patterns 1-3 only): Break-even after development cost
- Aggressive (all patterns): Net loss due to complexity overhead

#### Test Coverage Strategy for Phase 3C Automation
**Multi-layer validation for automated migrations**:

**1. Pre-automation Component Analysis**:
- Scan for `dark:` classes to validate automation scope
- Component complexity assessment (risk level: low/medium/high)
- Dependency analysis (shared components, imports)
- Backup creation with git worktree for rollback

**2. Automated Script Validation**:
- **Pattern 1-3 replacement verification**: Regex validation for surface/border/text tokens
- **AST parsing**: TypeScript compiler API to verify semantic imports
- **Build verification**: `npm run build` success after each batch (5-10 components)
- **Type checking**: `npm run typecheck` to catch semantic token errors

**3. Quality Gate Integration** (from performance-budgets-quality-gates.md):
- **Zero hardcoded colors**: ESLint semantic color rule enforcement
- **Zero dark: classes**: Automated scanning post-migration
- **95% test coverage**: Maintain existing thresholds during automation
- **Bundle size**: Monitor for regressions during bulk changes

#### Manual Verification Process for Automation Workflow
**Human oversight for automated migration quality**:

**1. Pre-automation Checklist** (2 min per component):
- [ ] Component has `dark:` classes to migrate
- [ ] Risk level appropriate for automation (low/medium only)
- [ ] No complex state logic or animations
- [ ] Dependencies use semantic tokens already
- [ ] Git backup created for component

**2. Post-automation Verification** (5 min per component):
- [ ] **Visual Check**: Component renders correctly in dev mode
- [ ] **Interaction Check**: All interactive states functional (hover, focus, disabled)
- [ ] **Color Token Check**: No hardcoded hex/rgb values remain
- [ ] **Build Check**: TypeScript compilation succeeds
- [ ] **Import Check**: Semantic color utilities imported correctly

**3. Batch Verification** (every 10 components, 15 min):
- [ ] **Build Success**: `npm run build` completes without errors
- [ ] **Type Check**: `npm run typecheck` passes
- [ ] **Lint Check**: `npm run lint` reports zero color violations
- [ ] **Visual Regression**: Random sampling of 3 components for visual testing
- [ ] **Bundle Analysis**: No significant size regressions

**4. Human Override Triggers** (immediate manual review):
- Build failure during automation batch
- Visual regression >15% in spot checks
- TypeScript errors in semantic token usage
- Complex component state interactions affected
- Performance regression detected

**5. Quality Assurance Protocol**:
- **Daily Reviews**: Review all automated changes from previous day
- **Pattern Validation**: Ensure automation followed established patterns correctly
- **Edge Case Documentation**: Record any components requiring manual intervention
- **Script Improvement**: Update automation based on manual review findings

**4. Risk-based Testing Thresholds**:
- **High-risk components** (manual migration): 5% visual regression tolerance, full test suite
- **Medium-risk components** (semi-automated): 10% tolerance, spot checks
- **Low-risk components** (fully automated): 15% tolerance, batch verification

**5. Rollback Triggers**:
- Build failures: Immediate revert to pre-automation state
- >20% visual regression: Manual review required
- Performance regression: >5% bundle increase triggers investigation
- Test coverage drop: <90% requires manual verification

### Automation Readiness Checklist

**Start Planning** (Currently: [x]):
- [x] 10+ components complete ✓
- [x] 5+ patterns documented beyond initial 3 ✓
- [x] Repetitive work clearly identified ✓
- [x] Error rate < 5% on recent components ✓ (0%)
- [x] Pattern reuse rate > 70% ✓ (95%+)

**Start Building** (Ready NOW):
- [x] 20+ components complete ✓ (26 complete)
- [x] Patterns stable (no major changes in last 5 components) ✓ - VERIFIED: 0 new patterns, 95-100% reuse
- [x] Clear automation ROI calculated ✓ - VALIDATED: 25% improvement, 4.2 hours saved
- [x] Test coverage strategy for automated changes ✓ - DEFINED for Phase 3C automation
- [x] Manual verification process defined ✓ - DOCUMENTED: 5-step human oversight workflow

**Full Automation** (Currently: [ ]):
- [ ] 30+ components complete (will have after 4 more)
- [ ] Scripts tested on 5+ components
- [ ] Success rate > 95%
- [ ] Rollback process defined
- [ ] Ready for bulk migration

### Continuous Tracking (Phase 3B Components)

#### Component: Alert
Time taken: 5 minutes
Patterns reused: 1, 3 (border, text - dark:border-destructive removed)
New discoveries: None
Automation feasibility: High - single line replacement, zero complexity
Error tracking: No verification failures, no unexpected behavior
Notes: Perfect automation candidate - simple UI component with 1 dark: class

#### Component: Toast/Toaster
Time taken: 20 minutes
Patterns reused: 1, 2, 3 (4 hardcoded colors → semantic destructive tokens)
New discoveries: None
Automation feasibility: High - ideal candidate, simple token replacement
Error tracking: Zero verification failures, zero unexpected behavior
Notes: Perfect Phase 3B validation - already 95% semantic, CSS-first animations intact

#### Component: Calendar/DatePicker
Time taken: 15 minutes (analysis only)
Patterns reused: 9, 11 (form components, overlay components) - 100% pattern reuse
New discoveries: None - already 100% semantic
Automation feasibility: Extremely high - perfect validation candidate for semantic checking
Error tracking: No migration needed, zero unexpected behavior
Notes: Complex date picker with range selection already semantic - validates Pattern 9 & 11 universality

#### Component: Label  
Time taken: 5 minutes (analysis only)
Patterns reused: 9 (form helper components) - 100% pattern reuse
New discoveries: None - already 100% semantic
Automation feasibility: Extremely high - ideal minimal component template
Error tracking: No migration needed, zero unexpected behavior
Notes: Simple form helper demonstrates semantic system scales from complex to minimal components

## Phase 3C Automation Progress

### Script Development Status
- [ ] Color Replacement Engine (Patterns 1-3)
- [ ] Component Analyzer (Risk assessment, pattern detection)
- [ ] Test Generator (Migration tests, visual regression)
- [ ] Documentation Generator (Auto-create implementation docs)

### Automation Metrics & ROI Tracking

#### Time Investment vs Savings
| Activity | Time Spent | Components | Time/Component | Projected Savings |
|----------|------------|------------|----------------|-------------------|
| Script Development | 0h | - | - | - |
| Test Run (5 components) | 0h | 0 | - | - |
| Batch Execution | 0h | 0 | - | - |
| Manual Exceptions | 0h | 0 | - | - |
| **Total** | **0h** | **0/40** | **-** | **Target: 4.2h** |

#### Pattern Confidence Scores
| Pattern | Applications | Success Rate | Confidence | Safe for Automation |
|---------|--------------|--------------|------------|-------------------|
| Pattern 1 (Surface) | 30 | 100% | 98% | ✅ Yes |
| Pattern 2 (Border) | 25 | 100% | 98% | ✅ Yes |
| Pattern 3 (Text) | 28 | 100% | 98% | ✅ Yes |
| Pattern 5 (Status) | 12 | 92% | 85% | ⚠️ With verification |
| Pattern 9 (Forms) | 15 | 100% | 95% | ✅ Yes |
| Pattern 11 (Overlay) | 8 | 100% | 95% | ✅ Yes |
| Pattern 15 (Score) | 4 | 100% | 90% | ⚠️ With verification |

#### Daily Checkpoint Protocol
- [ ] Morning: Review yesterday's automation results
- [ ] Midday: Check error rates, adjust if >5%
- [ ] Evening: Update metrics, plan next batch
- [ ] Weekly: Analyze patterns, optimize scripts

### Automation Safety Thresholds
- **STOP if error rate > 5%** in any batch
- **PAUSE if build failures > 2** in test run
- **REVIEW if manual exceptions > 20%** per category
- **ABORT if visual regression > 15%** average

### Rollback Procedures
1. **Immediate**: `git reset --hard HEAD~1` (uncommitted batch)
2. **Batch**: `git revert [batch-commit-hash]` (committed batch)
3. **Full**: Switch to pre-automation branch
4. **Recovery**: Manual re-migration of affected components

### Automation Test Run (5 components)
| Component | Category | Patterns Applied | Success | Notes |
|-----------|----------|-----------------|---------|-------|
| [Pending] | - | - | - | - |

### Batch Execution Progress
#### Display Components Batch (~4 remaining)
- [ ] Progress bars
- [ ] Spinners
- [ ] Avatars
- [ ] Status indicators

#### Interactive Components Batch (~4 remaining)
- [ ] Icon buttons
- [ ] Menus
- [ ] Dropdowns
- [ ] Remaining interactive

#### Layout Components Batch (~3 remaining)
- [ ] Header
- [ ] Footer  
- [ ] Sidebar

#### Data Components Batch (~10 remaining)
- [ ] Tables
- [ ] Lists
- [ ] Charts
- [ ] Data grids
- [ ] Tree views
- [ ] Timelines

#### Form Components Batch (0 remaining - 100% complete in Phase 3B)

### Exception Log
| Component | Reason | Manual Migration Status |
|-----------|--------|------------------------|
| [Track exceptions here] | - | - |

### Script Improvement Notes
- [Document refinements based on test runs]

### Key Learnings
[Document as you discover, not prescribe]
1. CSS custom properties from Phase 2 enable systematic migration
2. Button component demonstrates ideal semantic implementation
3. Dynamic imports can reduce bundle size by 50%+ for heavy libraries
4. Tab-based UIs are perfect candidates for lazy loading (only load active tab)
5. TipTap rich text editor alone was 150KB - always check library sizes
6. Removing Framer Motion and using CSS animations saves ~30KB
7. Dynamic imports for tab panels provide additional ~10KB savings
8. Tab-based UIs benefit from loading only the active tab content
9. Status colors should be centralized - many components have duplicate STATUS_COLORS objects
10. Semantic status mapping allows domain-specific statuses to use consistent colors
11. Surface components (Card, Dialog, Popover) follow identical bg-surface + text-foreground patterns
12. Token name verification critical - check globals.css for exact semantic token names
13. Some components are already semantic - expect enhancement opportunities, not just migrations
14. Consumer component cleanup often provides more value than component migration itself
15. Status prop override pattern enables both backward compatibility and new semantic APIs
16. Domain-specific mappings (skill levels, priority levels) benefit from consistent semantic status mapping
17. Form Input component is already perfectly semantic - serves as ideal pattern template for form migrations
18. Character count progress patterns provide reusable status mapping for any percentage-based progress indicators
19. **ALWAYS verify** solution reasonableness before implementing - verification prevents errors and reveals better approaches
20. Form selection components (Checkbox, Radio, Slider) should use border-border for consistency with Input pattern template
21. Systematic enhancement opportunities exist across component categories - look for patterns across similar components
22. Toggle components (Switch) use background colors for state indication, different from border-based form components but following same semantic token principles - Pattern 12 established
23. Range components (Slider) extend Pattern 9 with track/range/control patterns - Pattern 13 discovered for universal range input styling - form component patterns now proven across 6 components with 100% success rate
24. Analysis-first discovery strategy prevents unnecessary work - Dialog component already semantic with zero dark classes, perfect overlay template combining Patterns 6+11, reinforces scanning for dark: classes as first step
25. Pattern 11 overlay universality validated - Popover migration confirms overlay components (Select, Popover, future Tooltip/Dropdown) use identical popover token structure for consistent theming across component families
26. Tooltip implementation proves Pattern 11 universal applicability - overlay components (Select, Popover, Tooltip) use identical popover token structure, CSS-first animations superior to JavaScript for micro-interactions, Radix UI ecosystem enables zero-architectural-change component additions
27. Consumer cleanup can exceed component migration effort - Accordion component already semantic but 4 consumer files needed 50+ color replacements, validates checking both component AND consumer files during analysis phase
28. Score-based status mapping (Pattern 15) provides consistent thresholds - 80%+ = success, 60-79% = warning, <60% = error works universally for progress indicators, creates intuitive user understanding across different metrics
29. SVG elements benefit from currentColor technique (Pattern 16) - enables Tailwind text color classes to control SVG strokes/fills, maintains semantic color system even in graphics, simplifies dynamic color changes
30. Pattern 5 enhancement delivers high value for already-semantic components - Application Tracking had zero dark: classes but massive benefit from centralized status utilities, 8 usage contexts simplified, proves enhancement pattern importance alongside migration pattern
31. Complex components benefit from good architecture - Resume Editor migration was straightforward despite being labeled "complex", separation of concerns and dynamic imports made it simple, validates that patterns scale to any component size
32. Pattern reuse creates exponential efficiency gains - Job Match Panel migration achieved 60% time reduction by directly applying ATS Score patterns, validates Pattern 15 & 16 universality, demonstrates Phase 3A → 3B transition indicators
33. Phase 3B efficiency confirmed - Progress component migration achieved 100% pattern reuse in 25 minutes, no new patterns discovered, validates transition timing when patterns stabilize across diverse component types
34. Form section consistency enables batch migration - Resume Section Editors share identical patterns for help text (bg-muted), validation (text-destructive), and empty states, enabling 5 components migrated in 45 minutes
35. Discovery sometimes reveals no work needed - 3 of 8 Resume Section Editors were already fully semantic (skills.tsx even uses centralized status utilities), validates checking before migrating
36. Alert component migration confirms simple pattern stability - 1 dark: class replaced in under 5 minutes, 100% pattern reuse, zero discoveries needed, validates automation readiness for simple UI components
37. Toast/Toaster migration proves Phase 3B efficiency - already 95% semantic component migrated in 20 minutes with 100% pattern reuse, zero new discoveries, perfect validation of established patterns working across notification component family, ideal automation candidate identified
38. Calendar/DatePicker discovery validates semantic system comprehensiveness - complex date picker with range selection, navigation, disabled states already 100% semantic, proves Pattern 9 & 11 handle sophisticated interactive components seamlessly without additional patterns needed
39. Label discovery confirms semantic system scalability - minimal form helper component already 100% semantic, demonstrates patterns work from complex (Calendar) to simple (Label), validates Pattern 9 universality across form component spectrum
40. Phase 3B completion proves pattern stability - last 5 components (Progress, Alert, Toast, Calendar, Label) showed 100% pattern reuse with zero new discoveries, validates automation readiness and pattern maturity for Phase 3C
41. Phase 3C automation discovery revealed surprising truth - only 1 file (app/layout.tsx) needed migration out of expected 40, proving semantic color adoption was more complete than documentation indicated, validates importance of verification before automation
42. Automation script development not wasted - created reusable migration framework (4 scripts) that can be applied to future projects, demonstrates value of building tools even when immediate need is minimal
43. Shadow system discovery validates verification-first approach - Task 4D.2 assumed system creation needed, but discovered excellent OKLCH-based shadow system already exists with 45+ files using semantic shadows correctly, saved 40 minutes through discovery before implementation, proves pattern from Phase 3C automation

## IMPORTANT Discovery Rules

1. **START** with RESOURCES.md for every component
2. **DISCOVER** patterns rather than assume solutions
3. **VERIFY** reasonableness **ALWAYS** before implementing any solution
4. **DOCUMENT** what you learn for future components
5. **BUILD** on previous discoveries progressively
6. **UPDATE** this file continuously with state preservation commands
7. **THINK** about why patterns work, not just how
8. **VALIDATE** discoveries against quality gates
9. **SHARE** knowledge through implementation docs

**Critical**: The VERIFY step (#3) prevents most errors. Before implementing ANY solution, ask:
- Does this align with discovered patterns?
- Is this consistent with the project architecture?
- Will this maintain or improve quality?
- Could this break existing functionality?

## Phase 2 Foundation to Discover

Explore what Phase 2 achieved:
- How did they get CSS to 20KB?
- What made builds 50% faster?
- How do OKLCH fallbacks work?
- What testing patterns proved effective?
- What can be reused directly?

## Progressive Efficiency Through Discovery

**Expected Pattern**:
- First 5 components: Discovering core patterns
- Next 15 components: Applying discoveries confidently
- Next 30 components: Flowing with established patterns
- Final 20 components: Automated migration

Track your actual pattern and adjust approach based on what you observe.

## State Management Protocol

**Session Capacity Note**: Complex components with many variants or animations may fill context quickly due to detailed documentation needs. If discovery and implementation details become hard to track mentally, that's a natural signal to preserve state and request /clear.

**When You Need to Stop** (approaching context limits):

1. **Save Current State**:
   ```
   # Current component: [Name]
   # Status: [Discovery/Implementation/Testing/Documentation]
   # Blockers: [Any issues to resolve]
   # Next steps: [What to do after /clear]
   ```

2. **Update Progress**:
   - Check off completed items
   - Update pattern count
   - Add key learnings
   - Note efficiency metrics
   - Update Recent Implementation Docs list

3. **Complete Documentation**:
   - Finish implementation doc
   - Commit all changes
   - Push to repository

4. **Request Clear**:
   "I've completed [component name] migration and updated all documentation. I need a /clear to continue with the next component."

## Resources for Discovery

- Knowledge map: @.claude/memory/RESOURCES.md (START HERE ALWAYS)
- Research files: Explore what was learned
- Specifications: Understand what was designed
- Implementation files: See what worked
- Test results: Learn what was validated

---

Remember: The knowledge you need exists in the project. Your job is to discover it, apply it intelligently, and document new insights for others. The 404KB resume editor bundle is CRITICAL - discover why it's large and how to fix it using existing knowledge.