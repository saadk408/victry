# CLAUDE.md - Phase 3: Dark Mode Removal Component Migration

## Project Overview

**Victry** is an AI-powered resume builder that helps professionals create, tailor, and optimize resumes for job applications. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4.

**Current Mission**: Remove dark mode throughout the application, replacing all dark/light color pairs with a semantic color system using OKLCH color space. This improves maintainability, reduces bundle size, and creates a consistent visual experience.

**Project Phases**:
- ✅ Phase 0-1: Research & Specifications (Complete) 
- ✅ Phase 2: Foundation Architecture (Complete - 20KB CSS, OKLCH colors working)
- 🔄 Phase 3: Component Migration (Current - 70 components to migrate)
- ⏳ Phase 4: Testing & Validation
- ⏳ Phase 5: Production Deployment

**Success Metrics**: Zero hardcoded colors, 25-30KB bundle reduction, maintain all functionality

---

**IMPORTANT**: This is a TEMPORARY CLAUDE.md for Phase 3 only. Restore original after completion.  
**CRITICAL**: Resume editor bundle is 404KB (125% over 180KB target) - MUST FIX FIRST

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
1. _Popover Component_ - `popover-migration.md` - Key insight: _Pattern 11 overlay tokens universally applicable - popover, select, future tooltip/dropdown all use identical token structure for consistent overlay theming_
2. _Dialog Component_ - `dialog-discovery.md` - Key insight: _Dialog already semantic (zero dark classes), perfect overlay template combining Pattern 6 + 11, reinforces strategy to analyze before migrating_
3. _Slider Component_ - `slider-migration.md` - Key insight: _Range components follow Pattern 9 + new Pattern 13 for track/range/control styling, form component patterns mature and highly predictable across 6 components_

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
- [ ] Tooltip - Hint patterns
- [ ] Tabs - Navigation patterns (HIGH RISK)
- [ ] Accordion - Collapsible patterns

### Feature Components
- [ ] ATS Score - Dynamic color implementation
- [ ] Application Tracking - Status state management
- [ ] Auth Components - Security-critical migration
- [ ] Resume Editor - Complex component migration
- [ ] Job Match Panel - Data visualization patterns
- [ ] [Add more as discovered...]

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

**Current Pattern Count**: 13 (3 from specifications + 10 discovered)

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
- Components complete: 12/70 (Status colors utility + Card component + Badge enhancement + Input discovery + Textarea migration + Select discovery + Checkbox enhancement + Radio enhancement + Switch enhancement + Slider enhancement + Dialog discovery + Popover migration ✓)
- Bundle reduction: 233KB achieved (404KB → 171KB)
- Target exceeded: 9KB under 180KB limit ✓
- Complexity pattern: Surface components follow established patterns, status enhancements highly effective
- Quality maintained: Yes (zero hardcoded colors, semantic tokens working)

### Current Milestone Status
- **Phase 3A (Discovery & Pattern Establishment)**: In Progress
- **Trigger for 3B**: When 3+ patterns used 5+ times each
- **Trigger for 3C**: When patterns stable for 5+ components with clear ROI
- **Components per phase**: ~15 in 3A, ~15 in 3B, ~40 in 3C (flexible based on discovery)

### Automation Readiness Checklist

**Start Planning** (Currently: [ ]):
- [ ] 10+ components complete
- [ ] 5+ patterns documented beyond initial 3
- [ ] Repetitive work clearly identified
- [ ] Error rate < 5% on recent components
- [ ] Pattern reuse rate > 70%

**Start Building** (Currently: [ ]):
- [ ] 20+ components complete
- [ ] Patterns stable (no major changes in last 5 components)
- [ ] Clear automation ROI calculated
- [ ] Test coverage strategy for automated changes
- [ ] Manual verification process defined

**Full Automation** (Currently: [ ]):
- [ ] 30+ components complete
- [ ] Scripts tested on 5+ components
- [ ] Success rate > 95%
- [ ] Rollback process defined
- [ ] Ready for bulk migration

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