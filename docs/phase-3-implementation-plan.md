# Enhanced Phase 3: Component Migration - Milestone-Based Progression

## SPARC Phase 3: Refinement - Component Migration

### Phase Overview
```
Transform the foundation architecture into a fully migrated application through systematic component updates.

**Purpose**: Migrate 70 components from dark mode to semantic colors by discovering and applying the extensive knowledge from Phases 0-2, building cumulative patterns that accelerate the work.

**Critical Approach - Progressive Learning Through Milestones**:
- Start with heavy discovery, building your pattern library
- Progress to confident pattern application as knowledge accumulates
- Culminate in efficient automation for the majority of components
- Maintain quality through verification at every stage
- **ALWAYS verify the reasonableness of your solution before you implement each piece of the solution**
```

### Migration Principles for Phase 3
```
For EVERY component migration:

1. **Navigate via RESOURCES.md**:
   - Open RESOURCES.md first - it maps all available knowledge
   - Use Quick Reference to identify potentially relevant topics
   - Check Implementation Documentation for similar work already done
   - Review Cross-Reference Matrix to understand dependencies

2. **Discover Applicable Knowledge**:
   - Research files: What component analysis exists?
   - Specifications: What patterns were designed for this type of component?
   - Implementation notes: What has already been proven to work?
   - Test results: What quality thresholds apply?

3. **Ultrathink About Application**:
   - How do the discovered patterns apply to this specific component?
   - What makes this component unique or challenging?
   - Which Phase 2 foundation elements will this component use?
   - What new patterns might this component reveal?

4. **Verify Before Implementation**:
   - **ALWAYS verify the reasonableness of your solution before you implement each piece of the solution**
   - Does this align with discovered architectural principles?
   - Will this maintain consistency with other migrated components?
   - Could this introduce regressions or break functionality?
   - Is this the simplest solution that achieves the goal?

5. **Test-Driven Migration**:
   - Discover test patterns from specifications
   - Apply quality gates found in research
   - Validate against discovered performance budgets
   - Ensure compliance with found accessibility standards

6. **Document for Accumulation**:
   - Create implementation docs for each component
   - Note patterns that could benefit future components
   - Track efficiency gains from reused patterns
   - Build toward automation threshold
   
**Pattern Evolution Note**: As you discover improvements to patterns, update the pattern definitions in CLAUDE.md. Apply refined patterns going forward. Only backport if you encounter issues with already-migrated components - consistency matters less than working code.
```

### Discovery Protocol (Use for Every Component)

Follow this systematic approach to maximize efficiency:

1. **Breadth Scan**:
   - Quickly scan RESOURCES.md Quick Reference
   - Note 3-5 potentially relevant files
   - Don't read deeply yet - just identify candidates

2. **Relevance Filter** - Match component type to resources:
   - Check component imports - are any already migrated? Use their patterns
   - Visual/styling → Color specs, CSS implementation, Card migration
   - Interactive → Animation research, tabs/switch examples, state management
   - Dynamic → Status utilities, ATS Score, conditional rendering
   - Forms → Auth components, validation patterns, input handling
   - Tables/Lists → Data display patterns, responsive behaviors
   - Performance-critical → Bundle optimization, code splitting examples

3. **Deep Dive**:
   - Read most relevant 2-3 files completely
   - Look for: Working patterns, warnings about pitfalls, validation approaches
   - Note: Specific code examples, test patterns, edge cases handled

4. **Synthesis**:
   - What patterns apply directly?
   - What needs adaptation for this component?
   - What's genuinely new and needs innovation?
   - What validation approach fits?

### Intelligent Subagent Usage for Discovery

Claude Code can run multiple subagents efficiently. Use parallel discovery when beneficial:

**Component Analysis Pattern** (run in parallel):
```
Subagent 1: "Analyze [component].tsx for all dark: classes and current color implementation"
Subagent 2: "Search RESOURCES.md and implementation/ for patterns related to [component-type]"  
Subagent 3: "Find all usages of [component] throughout the application to understand variants"
```

**Pattern Verification** (run after discovering a potential approach):
```
Subagent 1: "Check if this pattern appears in other migrated components in /implementation"
Subagent 2: "Verify this approach aligns with specifications in color-system-spec.md"
```

Maximum efficiency: Use 3-4 subagents per discovery phase when parallelism helps.

## Critical Performance Fix (Do First!)

### Task 3.0: 🚨 Optimize Resume Editor Bundle
```
CRITICAL: Resume editor is blocking Phase 2 success metrics. Fix before any component migration.
**Current Crisis**: 404KB (125% over 180KB target)

**Discovery Phase (REQUIRED)** - Intelligently and effectively use Subagents:
1. Navigate via RESOURCES.md to find:
   - Current performance metrics and how they were measured
   - Performance optimization patterns from any phase
   - Bundle analysis techniques and tools
   - JavaScript optimization strategies
   
2. Analyze the resume editor specifically:
   - What makes it so large? (404KB)
   - What dependencies does it have?
   - How was bundle analysis performed in Phase 2?
   - What optimization patterns were already discovered?

3. Ultrathink about optimization strategies:
   - Which Phase 2 optimizations could apply here?
   - What code splitting opportunities exist?
   - How can dynamic imports help?
   - What validation ensures functionality isn't broken?

**Critical**: Before implementing any optimization, **ALWAYS** verify:
- Will this preserve all editor functionality?
- Does this align with Next.js best practices discovered?
- Is this the simplest solution that achieves the goal?
- Have similar optimizations worked elsewhere?

**Implementation Approach**:
1. Apply discovered optimization patterns
   - **ALWAYS** verify each optimization won't break editor functionality
2. Measure bundle size reduction
3. Validate functionality preservation
4. Document successful techniques

**Documentation Requirements**:
Create .claude/memory/implementation/resume-editor-optimization.md:
- Discovery sources: [which files provided insights]
- Optimization techniques applied
- Bundle size: before → after
- Patterns reusable for other heavy components
- Validation approach used

**Before Moving Forward**:
- Bundle must be reduced to <180KB
- All editor functionality must work
- Document optimization patterns for other components
- Update CLAUDE.md with bundle size achieved

Commit: "perf: optimize resume editor bundle from 404KB to [new]KB"
```

## Phase 3A: Discovery & Pattern Establishment (Components 1-15)

### Milestone Overview
```
**Focus**: Heavy exploration and pattern discovery
**Expected Effort**: High discovery, moderate implementation
**Key Outcome**: Establish comprehensive pattern library for remaining 55 components

**Success Indicators**:
- Discovering 2-3 new patterns per component
- Building confidence in pattern application
- Documentation rich with discoveries
- Clear understanding of component categories
```

### Foundation Task

#### Task 3.1: Create Status Color Utilities
```
Foundation utilities required before component migrations.

**Discovery Focus**: 
- How were colors systematized in specifications?
- What semantic patterns support dynamic states?
- How do utilities enable component migrations?

**Expected Patterns**: Dynamic color selection, state-based mappings

**Documentation**: Create detailed utility API documentation

Commit: "feat: implement semantic status color utilities"
```

### Core UI Components (Strategic Selection)

#### Task 3.2: Migrate Card Component
```
First component migration - establish patterns for remaining components.

**Discovery Focus**:
- Component categorization and risk assessment
- Visual regression tolerances
- Reusable migration patterns

**Why First**: Card appears in many contexts, patterns highly reusable

**Expected Discoveries**:
- Surface color patterns
- Hover state handling
- Border treatments
- Shadow adaptations

Commit: "refactor: migrate Card to semantic colors"
```

#### Task 3.3: Migrate Button Component (Reference Study)
```
Button is already semantic - extract patterns for others.

**Discovery Focus**:
- What makes Button's implementation ideal?
- Which patterns can other components adopt?
- How are interactive states handled?

**Expected Patterns**: Variant-based colors, state management

**Note**: This is a study task, not a migration

Document findings in CLAUDE.md pattern library
```

#### Task 3.4: Migrate Input Component
```
Establish form component patterns.

**Discovery Focus**:
- Form-specific patterns
- Focus state handling
- Validation state colors
- Placeholder treatments

**Expected Patterns**: Form field states, accessibility requirements

Commit: "refactor: migrate Input to semantic colors"
```

#### Task 3.5: Migrate Select Component
```
Dropdown-specific patterns.

**Discovery Focus**:
- Overlay positioning
- Option state handling
- Dropdown shadow/border patterns

**Category**: Form components with overlay behavior

Commit: "refactor: migrate Select to semantic colors"
```

#### Task 3.6: Migrate Dialog Component
```
Modal and overlay patterns.

**Discovery Focus**:
- Backdrop treatments
- Z-index preservation
- Focus trap styling
- Animation preservation

**Category**: Overlay components

Commit: "refactor: migrate Dialog to semantic colors"
```

#### Task 3.7: Migrate Tooltip Component
```
Lightweight overlay patterns.

**Discovery Focus**:
- Micro-animation preservation
- Positioning variants
- Contrast requirements for readability

**Expected Quick Win**: Simpler than Dialog, reuses patterns

Commit: "refactor: migrate Tooltip to semantic colors"
```

### Feature Components (High Learning Value)

#### Task 3.8: Migrate ATS Score Component
```
Dynamic color implementation patterns.

**Discovery Focus**:
- Score-based color selection
- Gradient handling
- Animation with color transitions
- Status color utility usage

**Category**: Data visualization components

Update Pattern Library in CLAUDE.md if dynamic color patterns emerge

Commit: "refactor: migrate ATS Score with dynamic status colors"
```

### Additional Phase 3A Components
```
Continue with strategic component selection to reach ~15 total:

Display Components:
- Badge (status variants)
- Alert (semantic meaning preservation)

Interactive Components:
- Checkbox (selection states)
- Radio (group behavior)

The specific components will be discovered based on:
- Frequency of use in the application
- Pattern learning potential
- Risk level diversity
- Category representation
```

### Phase 3A Reflection Checkpoint
```
After completing ~15 components, assess:

**Pattern Library Status**:
- How many reusable patterns discovered?
- Which patterns appear in 3+ components?
- What categories are well-understood?
- What surprises emerged?

**Efficiency Trajectory**:
- Is each component getting easier?
- What's the pattern reuse percentage?
- Where is discovery still needed?

**Readiness for Phase 3B**:
- Stable patterns for common scenarios?
- Test approaches proven?
- Documentation enabling reuse?

Document assessment in CLAUDE.md before proceeding
```

## Phase 3B: Pattern Application & Validation (Components 16-30)

### Milestone Overview
```
**Focus**: Confident application of discovered patterns
**Expected Effort**: Low discovery, efficient implementation
**Key Outcome**: Validate patterns at scale, identify automation candidates

**Trigger for Phase 3B**:
- 3+ patterns used 5+ times each
- Component migration time decreasing
- Discovery rarely revealing new patterns
- Confidence in pattern application high
```

### High-Risk Components (Do in Phase 3B with Established Patterns)

#### Task 3.9: Migrate tabs.tsx (Risk: 8.5/10)
```
Most complex component - requires maximum care.

**Why Phase 3B**: Need established patterns before attempting

**Special Considerations**:
- Apply strictest visual regression (5% tolerance)
- Preserve all animations exactly
- Manual testing critical
- Document every decision

**Pattern Application**: Use all accumulated knowledge

Commit: "refactor: carefully migrate high-risk tabs.tsx"
```

#### Task 3.10: Migrate switch.tsx (Risk: 8.5/10)
```
Apply tabs.tsx learnings.

**Efficiency Gain**: Second high-risk component should be faster

**Validation**: Prove pattern stability on complex components

Commit: "refactor: migrate switch.tsx using tabs patterns"
```

#### Task 3.11: Migrate Alert Component
```
Simple notification component with semantic meaning preservation.

**Pattern Validation Focus**:
- Only 1 dark: class to replace
- Validate Pattern 5 for alert types (success, warning, error, info)
- Test notification color psychology
- Quick win to build confidence

**Category**: UI Components (notification family)

Commit: "refactor: migrate Alert to semantic colors"
```

#### Task 3.12: Migrate Toast/Toaster Components
```
Notification system with positioning and animation.

**Pattern Validation Focus**:
- Pattern 11 for overlay positioning
- Animation preservation patterns
- Multiple toast variant support
- Auto-dismiss behavior preservation

**Category**: Interactive Components (notification system)

Commit: "refactor: migrate Toast system to semantic colors"
```

#### Task 3.13: Migrate Calendar/DatePicker Component
```
Complex date selection with multiple states.

**Pattern Validation Focus**:
- Selected date highlighting
- Hover states for date cells
- Disabled date styling
- Today marker semantics
- Month navigation preservation

**Category**: Form Components (date input family)
**Risk**: Medium - multiple interactive states

Commit: "refactor: migrate Calendar/DatePicker to semantic colors"
```

#### Task 3.14: Migrate Label Component
```
Form helper component for accessibility.

**Pattern Validation Focus**:
- Required field indicators
- Error state integration
- Helper text styling
- Form field association

**Category**: Form Components (helper family)

Commit: "refactor: migrate Label to semantic colors"
```

### Systematic Category Coverage

Track coverage across all component categories to ensure patterns work universally:

**Coverage Targets for Phase 3B**:
- UI Components: 80%+ coverage (Alert completes this)
- Form Components: 80%+ coverage (Calendar, Label complete this)
- Interactive Components: 70%+ coverage (Toast helps this)
- Layout Components: Save for automation (simple patterns)
- Data Components: Save for automation (complex but repetitive)

**During Each Component Migration**:
1. Note which category it belongs to
2. Track if patterns from other categories apply
3. Document any category-specific patterns
4. Update coverage percentages in CLAUDE.md

**Assessment Questions**:
- Are patterns truly universal across categories?
- Which categories have unique requirements?
- What category-specific edge cases exist?
- Which categories are best suited for automation?

### Automation Readiness Assessment

**Continuous Tracking Requirements**:

After EACH component in Phase 3B, update CLAUDE.md with:

1. **Pattern Stability Check**:
   - Did any patterns need modification? If yes, document why
   - Were all changes predictable based on component type?
   - Could the changes be rule-based for automation?

2. **Time and Efficiency Metrics**:
   ```
   Component: [Name]
   Time taken: [minutes]
   Patterns reused: [list pattern numbers]
   New discoveries: [any unexpected findings]
   Automation feasibility: High/Medium/Low
   ```

3. **Error Tracking**:
   - Any verification failures?
   - Any unexpected behavior after migration?
   - Any patterns that didn't apply as expected?

4. **Automation Candidate Identification**:
   Track operations that are:
   - Highly repetitive (exact same replacements)
   - Rule-based (if X then Y patterns)
   - Low-risk (simple components)
   - Time-consuming (many instances)

**Phase 3C Go/No-Go Criteria** (document in CLAUDE.md):
- [ ] Pattern stability confirmed (no changes in final 5 components)
- [ ] 80%+ pattern reuse rate sustained
- [ ] Clear automation rules identified
- [ ] ROI calculation shows >10 hours saved
- [ ] Error rate remains <5%
- [ ] Test strategy for automated changes defined

### Phase 3B Reflection Checkpoint
```
After completing ~30 components total:

**Validation Complete**:
- Patterns proven across diverse components
- Edge cases documented
- Automation opportunities clear
- Efficiency gains measured

**Ready for Phase 3C Indicators**:
- Pattern reuse > 80%
- New discoveries rare
- Clear scripting opportunities
- Test confidence high

Make go/no-go decision for automation phase
```

**Remember**: The goal is confident automation, not rushed completion.

## Phase 3C: Automation & Scale (Components 31-70)

### Milestone Overview
```
**Focus**: Scripted migration for remaining components
**Expected Effort**: High initial automation investment, then minimal per component
**Key Outcome**: Rapid completion with consistent quality

**Trigger for Phase 3C**:
- Patterns stable (no changes in last 5 components)
- Clear automation ROI (>10 hours saved)
- Test strategy for automated changes defined
- Manual fallback process ready
```

### Task 3.15: Create and Execute Migration Automation
```
Build and run automation based on discovered patterns.

**Part 1: Script Creation**

Discovery Phase:
1. Review Pattern Library in CLAUDE.md for stable, automatable patterns
2. Analyze all patterns in CLAUDE.md
3. Review all implementation docs
4. Calculate automation ROI
5. Design script architecture

Script Components to Build:
1. Color replacement engine
   - Pattern matching rules
   - Semantic token mapping
   - Edge case handling

2. Component analyzer
   - Detect component type
   - Identify applicable patterns
   - Flag special cases

3. Test generator
   - Create migration tests
   - Visual regression setup
   - Validation suites

4. Documentation generator
   - Auto-create implementation docs
   - Track patterns used
   - Note manual interventions

**Proven Automation Examples from Phase 3A/B**:

1. **Pattern 1 Success**: Card component
   - Original: `dark:bg-gray-800 bg-white`
   - Automated to: `bg-surface`
   - Applied successfully to: Dialog, Popover, Alert (100% success)

2. **Pattern 5 Complexity**: Status colors
   - Original: Local STATUS_COLORS objects
   - Automated to: `getStatusClasses()` imports
   - Required verification for: Custom status mappings

3. **Pattern 9 Template**: Form components
   - Original: Various border/focus patterns
   - Automated to: Consistent `border-border focus:ring-ring`
   - Edge case: Radio groups needed special handling

**Automation vs Manual Decision Tree**:

START → Component has dark: classes?
├─ NO → Skip (already semantic)
└─ YES → Check complexity
    ├─ Simple (only Patterns 1-3) → AUTOMATE
    ├─ Medium (includes Pattern 5,9,11) → AUTOMATE with verification
    └─ Complex → Check specific factors
        ├─ Custom animations? → MANUAL
        ├─ >3 variants? → MANUAL
        ├─ Business logic? → MANUAL
        └─ None of above → AUTOMATE with careful review

**Part 2: Safe Execution Protocol**

Preparation:
1. Create feature branch: `git checkout -b phase-3-automation`
2. Commit all manual work
3. Prepare rollback plan

Test Run (5 components):
1. Select diverse test components
2. Run scripts with verbose logging
3. Manual verification of results
4. Adjust scripts based on findings
5. Document success rate

Category-Based Execution:
1. Display Components Batch (~15 remaining)
   - Run script on category
   - Verify results
   - Handle exceptions manually
   - Commit batch

2. Form Components Batch (~10 remaining)
   - Apply form-specific rules
   - Verify functionality
   - Document variations

3. Interactive Components Batch (~10 remaining)
   - Check state preservation
   - Verify animations
   - Test interactions

4. Layout Components Batch (~5 remaining)
   - Simple patterns
   - Quick verification

5. Data Components Batch (~5 remaining)
   - Complex structures
   - Careful validation

Exception Handling:
- Components failing automation get manual migration
- Document why automation failed
- Update patterns if needed
- Track exception rate

**Common Automation Failures & Solutions**:

1. **"String to replace not found"**
   - Cause: Pattern variations not accounted for
   - Fix: Add regex flexibility, handle whitespace

2. **TypeScript errors after migration**
   - Cause: Missing imports for semantic utilities
   - Fix: Auto-add required imports in script

3. **Visual regression on hover states**
   - Cause: Not preserving hover: modifiers
   - Fix: Extend pattern matching to include pseudo-classes

4. **Build failures from missing tokens**
   - Cause: Using non-existent semantic tokens
   - Fix: Validate against globals.css token list

**Success Metrics**:
- 90%+ automation success rate
- <5% regression rate
- 10x efficiency gain
- Quality maintained

Commit: "tools: migrate [number] components via automation"
```

### Manual Exception Handling
```
For components that automation cannot handle:

1. Understand why automation failed
2. Apply manual migration carefully
3. Document unique aspects
4. Consider pattern updates
5. Maintain quality standards

Expected exceptions:
- Highly custom components
- Complex business logic
- Unique animation requirements
- Special accessibility needs
```

### Component Inventory Framework
```
The ~70 components distributed across categories:

Display Components (~20):
- Cards, Badges, Alerts
- Progress bars, Spinners
- Avatars, Images
- Chips, Pills
- Status indicators

Form Components (~15):
- Text inputs, Textareas
- Selects, Autocompletes
- Checkboxes, Radios, Switches
- Sliders, Date pickers
- File uploads

Interactive Components (~15):
- Buttons, Icon buttons
- Toggles, Switches
- Tabs, Accordions
- Tooltips, Popovers
- Menus, Dropdowns

Layout Components (~10):
- Headers, Footers
- Sidebars, Navigation
- Grids, Containers
- Dividers, Spacers

Data Components (~10):
- Tables, Data grids
- Lists, Tree views
- Charts, Graphs
- Timelines

Note: Exact components discovered during migration, not prescribed
```

## Task 3.12: Update RESOURCES.md with Phase 3 Implementation Inventory
```
Map all Phase 3 discoveries for Phase 4 navigation.

**Discovery Synthesis**:
1. Review all implementation docs created in .claude/memory/implementation/
2. Identify key topics/patterns documented in each file
3. Note which files contain reusable patterns, automation scripts, or lessons learned
4. Map relationships between implementation files

**Update RESOURCES.md Navigation Map**:

1. **Quick Reference Guide** - Add common Phase 3 lookups:
   ```markdown
   #### Phase 3 Implementation Patterns
   - **Card migration patterns** → implementation/card-migration.md (surface colors)
   - **Dynamic color patterns** → implementation/ats-score-migration.md (score-based)
   - **High-risk component approach** → implementation/tabs-migration.md (animation preservation)
   - **Automation scripts** → implementation/migration-scripts.md (bulk patterns)
   - **Bundle optimization** → implementation/resume-editor-optimization.md (code splitting)
   [etc.]
   ```

2. **Implementation Documentation Table** - Add all Phase 3 files:
   ```markdown
   ### Phase 3 Implementation (.claude/memory/implementation/)
   | File | Component/Feature | Key Contents | Patterns Documented | Reusability |
   |------|-------------------|--------------|-------------------|-------------|
   | resume-editor-optimization.md | Bundle optimization | Dynamic imports<br>Code splitting<br>Performance metrics | Lazy loading pattern<br>Bundle analysis | High - for other heavy components |
   | card-migration.md | Card component | Basic migration approach<br>Surface color usage | Pattern 1 application<br>Hover states | High - foundational |
   [Continue for all ~70 files]
   ```

3. **Cross-Reference Updates** - Add Phase 3 relationships:
   ```markdown
   ### Phase 3 Implementation Dependencies
   - **Pattern Foundation**: card-migration.md → used by 60+ components
   - **Dynamic Patterns**: ats-score-migration.md → status-colors-utility.md
   - **Automation Source**: Pattern Library in CLAUDE.md → migration-scripts.md
   - **High-Risk Reference**: tabs-migration.md + switch-migration.md → animation patterns
   ```

4. **Phase 3 Summary Section** - Brief overview only:
   ```markdown
   ## Phase 3 Implementation Summary
   *Added: [Date] after Phase 3 completion*
   
   ### Implementation Scope
   - Total components migrated: 70
   - Implementation docs created: [number]
   - Unique patterns discovered: [number] (documented in individual files)
   - Automation scripts: migration-scripts.md
   
   ### Key Navigation Points
   - For migration patterns: See implementation files by component type
   - For automation details: migration-scripts.md
   - For efficiency metrics: See individual component docs
   - For lessons learned: High-risk component files (tabs, switch)
   ```

**Note**: Do NOT copy patterns, insights, or detailed information into RESOURCES.md. 
Only provide navigation information to help Phase 4 find what they need.

Commit: "docs: update RESOURCES.md with Phase 3 implementation inventory"
```

## Progress Tracking Framework

### Milestone Progress Indicators
```
Phase 3A Progress (Discovery):
□ Components: 0/15
□ New patterns discovered: 0
□ Pattern reuse rate: 0%
□ Avg time per component: [decreasing?]

Phase 3B Progress (Application):
□ Components: 0/15 
□ Pattern reuse rate: [target: >70%]
□ Automation candidates identified: 0
□ Edge cases documented: 0

Phase 3C Progress (Automation):
□ Scripts created: 0/4
□ Components automated: 0/40
□ Success rate: [target: >90%]
□ Exceptions handled: 0
```

### Quality Metrics Throughout
```
Maintain across all milestones:
- Zero hardcoded colors
- Visual regression within tolerance
- All tests passing
- Accessibility preserved
- Performance neutral or improved
- Documentation complete
```

## Critical Reminders for Success

1. **Task 3.0 is MANDATORY FIRST** - Resume editor must be optimized
2. **Discovery scales down, efficiency scales up** - Natural progression
3. **Document patterns early** - Phase 3C depends on Phase 3A discoveries
4. **Verify before implementing** - Quality gate for every component
5. **Milestones are triggers, not deadlines** - Move when ready

## State Preservation Protocol

**Session Capacity Note**: Complex components with many variants or animations may fill context quickly due to detailed documentation needs. If discovery and implementation details become hard to track mentally, that's a natural signal to preserve state and request /clear.

**When Approaching Context Window Limits**:

1. **Update Progress Tracking**: Mark completed components in current milestone
2. **Update CLAUDE.md**: 
   - Add new patterns discovered
   - Update efficiency metrics
   - Note current milestone status
   - List next component to tackle
3. **Complete Documentation**: Ensure implementation doc is created
4. **Commit Changes**: Save all work to git
5. **Request Clear**: "I've completed [component] and updated all documentation. Ready for /clear to continue."

## Success Through Natural Progression

The milestone structure reflects how developers naturally work:
- Start by learning deeply (Phase 3A)
- Apply knowledge confidently (Phase 3B)  
- Automate repetitive work (Phase 3C)

Each component makes the next one easier. Each pattern discovered saves future time. Each milestone builds on the last.

By the end, you'll have migrated 70 components efficiently while maintaining high quality - not through rigid process, but through intelligent pattern recognition and application.