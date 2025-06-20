# Enhanced Phase 3 Execution Prompt - Discovery-Driven Component Migration

Execute Phase 3 by discovering and applying knowledge from the comprehensive work already completed in Phases 0-2.

## Your Mission

Take a deep breath and take it one step at a time.

Systematically migrate 70 components from dark mode to semantic colors through intelligent discovery and application of existing knowledge. Transform each discovery into reusable patterns that accelerate future work.

**The Phase 3 Implementation Plan is located at**: @docs/phase-3-implementation-plan.md

Take a deep breath and take it one step at a time.

Start by reading this plan to understand the complete methodology, milestones, and specific tasks.

**ALWAYS verify the reasonableness of your solution before you implement each piece of the solution.**

## Determining Your Current Position

**When starting any session, follow this sequence**:

1. Take a deep breath and take it one step at a time.

2. **Check CLAUDE.md First**:
   - Look at "Migration Checklist" - find the first unchecked [ ] item
   - Review "Current Milestone Status" - are you in Phase 3A, 3B, or 3C?
   - Check "Progress Tracking" - how many components completed?
   - Read "Recent Implementation Docs" - understand recent work

3. **Navigate to Your Position in Implementation Plan**:
   - If Task 3.0 (Resume Editor) unchecked → Start there (CRITICAL)
   - If in Phase 3A (1-15 components) → Focus on discovery tasks
   - If in Phase 3B (16-30 components) → Apply patterns confidently  
   - If in Phase 3C (31-70 components) → Check if scripts exist, use automation

4. **Understand Your Current Context**:
   - Components < 15: You're establishing patterns (Phase 3A)
   - Components 15-30: You're validating patterns (Phase 3B)
   - Components > 30: You should be automating (Phase 3C)
   - If Pattern Library has 3+ patterns used 5+ times → Consider moving to next phase

5. **Find Your Specific Task**:
   - Locate the matching task number in Implementation Plan
   - If between numbered tasks, work on "Additional Components" for your current phase
   - If all specific tasks done but <70 components, continue with category-appropriate components

**Special Case - Mid-Component Work**:
If CLAUDE.md shows a component partially complete:
- Check "State Management Protocol" section for saved state
- Read the partial implementation doc if it exists
- Continue from the documented stopping point
- Complete the component before moving to the next

**Important**: CLAUDE.md is your source of truth for progress. The Implementation Plan provides methodology, but CLAUDE.md tracks what's actually been done.

## Phase 3C Automation Execution

**You are now in Phase 3C - Automation & Scale**

### Your Primary Task: Task 3.15 - Create and Execute Migration Automation

**Current Status**:
- 30/70 components complete (Phase 3A & 3B done)
- 16 stable patterns proven
- 40 components remaining for automation
- Hybrid approach validated: Automate Patterns 1-3, manual for complex

### Phase 3C Workflow

#### Step 0: Pre-Flight Checklist
Before ANY automation run:
- [ ] All Phase 3B work committed and pushed
- [ ] Working branch created: `phase-3c-automation-[date]`
- [ ] globals.css token list extracted for validation
- [ ] Test environment ready (dev server running)
- [ ] Rollback plan documented
- [ ] Time tracking started

#### Step 1: Script Development (Current Phase)
```
1. Review Pattern Library for automatable patterns (1-3, 5, 9, 11, 15)
2. Create 4 core scripts:
   - Color Replacement Engine
   - Component Analyzer  
   - Test Generator
   - Documentation Generator
3. Focus on Patterns 1-3 first (highest ROI)
4. Include human verification hooks

**Discovering Automation Patterns in RESOURCES.md**:
1. Start with "Phase 3 Implementation Discoveries" section
2. Look for pattern mentions and success indicators  
3. Read referenced implementation files for concrete examples
4. Cross-reference with Pattern Library in CLAUDE.md
5. Note "already semantic" and "HIGH RISK" components
6. Build exclusion lists and edge case handlers from discoveries
```

#### Step 2: Progressive Automation Protocol

**Stage 1 - Single Component Test**:
1. Pick simplest display component (e.g., Avatar)
2. Run script with maximum logging
3. Manual verification: build, visual, interaction
4. Time: 15 minutes
5. GO/NO-GO decision point

**Stage 2 - Small Batch (5 components)**:
1. Select diverse set per plan:
   - 1 display component (simple)
   - 1 form component (medium)
   - 1 data component (complex)
   - 2 edge cases
2. Run sequentially with pauses
3. Verify each before proceeding
4. Document any manual fixes needed
5. Calculate success rate
6. Time: 1 hour
7. GO/NO-GO: >80% success required

**Stage 3 - Category Batch**:
1. Run full category automation
2. Parallel execution where safe
3. Batch verification protocol
4. Time: 2-3 hours per category

#### Step 3: Batch Execution
```
For each category batch:
1. Pre-automation analysis (2 min/component)
2. Run automation script
3. Post-automation verification (5 min/component)
4. Batch verification (every 10 components)
5. Handle exceptions manually
6. Commit batch with detailed message
```

### Automation-Specific Discovery Prompts

**For Script Development**:
```
"Analyze Pattern [1-3] implementations across all 30 completed components"
"Extract exact replacement rules for surface/border/text colors"
"Find edge cases in implementation docs that need special handling"
"Review manual verification checklist for automation hooks"
```

**For Component Analysis**:
```
"Find all components with dark: classes in [category]"
"Analyze component complexity and risk levels"
"Check for animation or state management complexity"
"Identify components already using semantic tokens"
```

**For Script Development Using RESOURCES.md**:
```
"Navigate to RESOURCES.md and discover where Pattern [X] has been successfully applied"
"Find implementation files that show edge cases for automated migration"
"Discover which components are marked as 'already semantic' to exclude from automation"
"Locate HIGH RISK component analyses to understand manual migration needs"
"Find pattern confidence data by exploring implementation results"
```

### Quality Gates for Automation

**Abort Automation If**:
- Build failure after script run
- >15% visual regression in test run
- TypeScript errors in semantic tokens
- Pattern match confidence <90%

**Manual Override Required If**:
- Component has complex animations
- Custom business logic detected
- Accessibility attributes affected
- Performance regression detected

### Emergency Stop Procedures

**IMMEDIATE STOP** (Ctrl+C during script):
- Use when seeing multiple errors
- Check last processed component
- Revert any uncommitted changes
- Document failure point

**BATCH ABORT** (After automation):
1. `git status` - check modified files
2. `git diff` - review changes
3. `git checkout -- .` - revert all
4. Document why abort was needed
5. Refine scripts before retry

**QUICK VALIDATION** Commands:
```bash
# After each component
npm run typecheck -- --files [component]
npm run dev # Visual check

# After each batch  
npm run build
npm run test:colors
npm run lint
```

### Pattern Confidence Verification

Before applying any pattern in bulk:
1. Check success rate in CLAUDE.md metrics
2. Review exceptions from Phase 3A/B
3. Test on one component first
4. Verify no globals.css token mismatches
5. Confirm pattern still applies to target components

Confidence Requirements:
- >95% success rate → Full automation
- 85-95% → Automation with verification hooks
- <85% → Manual migration recommended

### RESOURCES.md Quick Discovery Tips

**Pattern Implementation Examples**: Search for "Pattern [X]" in implementation descriptions
**Automation Candidates**: Look for "perfect", "ideal automation", "100% pattern reuse"  
**Manual Migration Queue**: Search "HIGH RISK", "complex", "multi-variant"
**Skip List**: Find "already semantic", "zero migration needed"
**Edge Cases**: Look for "special handling", "edge case", "exception"

## Critical Mindset: Discovery Over Prescription

**USE SUBAGENTS TO SEARCH AND READ FILES IN PARALLEL**

**This plan doesn't tell you WHAT to use - it guides you HOW to discover what to use.**

Instead of: "Use color-system-spec.md lines 157-215"  
We say: "Discover how colors were systematized in the specifications"

Instead of: "Apply this specific pattern"  
We say: "Discover what patterns exist and ultrathink about how they apply"

**Critical Safety Principle**: **ALWAYS** verify the reasonableness of your solution before you implement each piece of the solution. Ask yourself:
- Does this align with the discovered patterns?
- Is this consistent with the project's architecture?
- Will this maintain or improve quality?
- Could this break existing functionality?

## Common Pitfalls and Solutions

**1. Discovery Paralysis**
- **Symptom**: Reading for extended periods without implementing
- **Solution**: Use the Discovery Protocol with its built-in progression from breadth to depth

**2. Pattern Over-Application or Under-Evolution**  
- **Symptom**: Forcing patterns where they don't quite fit OR refusing to evolve patterns when better approaches emerge
- **Solution**: Patterns should guide, not constrain. Ask "Is this genuinely similar?" and "Could this pattern be improved?"

**3. Verification Skipping**
- **Symptom**: "This is simple, I'll skip verification"
- **Solution**: Verification prevents cascading errors. Use the checklist - it's mandatory.

**4. Documentation Debt**
- **Symptom**: "I'll update CLAUDE.md after a few components"  
- **Solution**: Update before reaching context limits. Lost discoveries hurt future efficiency.

**5. Premature Automation**
- **Symptom**: Building scripts after only a few components
- **Solution**: Follow the Automation Readiness Checklist in CLAUDE.md

**6. Context Overload**
- **Symptom**: Trying to migrate multiple components without clearing
- **Solution**: One component at a time, document thoroughly, request /clear when needed

## Understand Your Knowledge System

**Three Interconnected Documents**:

1. **RESOURCES.md** - Your treasure map
   - Shows where all knowledge is stored
   - Quick Reference points to common needs
   - File inventory describes what each document contains
   - Cross-references show relationships

2. **CLAUDE.md** - Your working memory
   - Tracks what you've done
   - Accumulates patterns you discover
   - Updates with each component
   - Persists across conversations

3. **Implementation Plan** (`docs/phase-3-implementation-plan.md`) - Your methodology guide
   - Shows HOW to approach discovery
   - Provides frameworks, not prescriptions
   - Guides thinking processes
   - Contains all Phase 3 tasks and milestones

## The Discovery-First Workflow

### For EVERY Component Migration

**Take a deep breath and take it one step at a time.**

#### Step 1: Explore Available Knowledge
```
Don't search for specific files. Instead:

1. Open RESOURCES.md
2. Check component imports - are any already migrated? Use their patterns
3. Ask yourself:
   - "What kind of component is this?"
   - "What knowledge would help migrate it?"
   - "Has similar work been done?"
4. Browse the inventory (**INTELLIGENTLY USE SUBAGENTS TO SEARCH AND READ FILES IN PARALLEL**):
   - Research files: What was learned?
   - Specifications: What was designed?
   - Implementation: What has worked?
   - Test results: What was validated?
```

#### Step 2: Read and Understand
```
**INTELLIGENTLY USE SUBAGENTS TO SEARCH AND READ FILES IN PARALLEL**

For discovered relevant files:

1. Read them completely, not just summaries
2. Take notes on:
   - Patterns that could apply
   - Challenges identified
   - Solutions that worked
   - Quality requirements

3. Cross-reference between files:
   - Do specifications align with research?
   - What did Phase 2 implement successfully?
   - Are there conflicting approaches?
```

#### Step 3: Ultrathink About Application
```
Before writing any code:

Take a deep breath and take it one step at a time.

1. Consider the specific component:
   - What makes it unique?
   - What patterns fit directly?
   - What needs adaptation?
   - What's genuinely new?

2. Think about quality:
   - What tests ensure success?
   - What could break?
   - How to validate the migration?

3. Consider future components:
   - What patterns could be reused?
   - What should be documented?
   - What could be automated?
```

#### Step 4: Implement with Confidence
```
Before implementing any solution:

Take a deep breath and take it one step at a time.

**ALWAYS** verify the reasonableness of your solution:
1. Check: Does this align with discovered patterns?
2. Validate: Is this consistent with specifications?
3. Consider: Will this improve or maintain quality?
4. Test mentally: Could this break anything?

Then apply your discoveries:
1. Use patterns you've found
2. Adapt where necessary
3. Innovate only when needed
4. Test thoroughly
```

#### Step 5: Document Your Journey
```
Create .claude/memory/implementation/[component]-migration.md:

Not just what you did, but:
- WHERE you found helpful knowledge
- WHAT patterns you discovered
- HOW you adapted them
- WHAT others can reuse
- WHAT complexity was involved
```

## Current Phase 3C Focus: Automation Script Development

### Building the Automation Framework
```
**Your Mission**: Create scripts that can safely migrate 40 components with 90%+ success rate

**Script Architecture Discovery**:
1. How did Phase 3A/3B components use Patterns 1-3?
2. What exact transformations were repeated?
3. What validation caught issues?
4. How can scripts replicate manual verification?

**Start with Pattern Analysis**:
- Pattern 1: dark:bg-* → bg-surface variations
- Pattern 2: dark:border-* → border-surface-border
- Pattern 3: dark:text-* → text-foreground variations

**Critical Verification Points**:
- Does the script preserve all CSS classes except dark:?
- Are imports for semantic utilities added?
- Do components maintain their variant behavior?
- Is the git backup strategy implemented?

Document your script development process for future maintenance!
```

## Progressive Knowledge Building

### Pattern Evolution Stages

**Discovery Stage (Phase 3A)** (Components 1-15):
- **Focus**: Understanding the problem space
- **Discovery emphasis**: High - exploring multiple resources per component
- **Implementation approach**: Careful application of discoveries
- **Key outcome**: Initial pattern library
- **Success indicator**: Finding reusable patterns in most components
- **Your work**: Tasks 3.1-3.8 plus additional components to reach ~15

**Application Stage (Phase 3B)** (Components 16-30):
- **Focus**: Applying and refining patterns
- **Discovery emphasis**: Moderate - checking for edge cases
- **Implementation approach**: Confident pattern reuse
- **Key outcome**: Stable pattern set
- **Success indicator**: 70%+ pattern reuse rate
- **Your work**: Tasks 3.9-3.10 plus additional components to reach ~30

**Automation Stage (Phase 3C)** (Components 31-70):
- **Focus**: Scripting repeated patterns
- **Discovery emphasis**: Minimal - only for unique components
- **Implementation approach**: Bulk migration with verification
- **Key outcome**: Rapid completion
- **Success indicator**: 90%+ automation coverage
- **Your work**: Task 3.11 (create & execute scripts) for remaining ~40 components

### Milestone Progression Triggers

**Moving from Phase 3A to 3B**: When you notice 3+ patterns being used 5+ times each  
**Moving from Phase 3B to 3C**: When patterns remain stable for 5+ components

These are natural observation points, not rigid gates. Progress when the work tells you it's time.

## Success Indicators Throughout Phase 3

### After Component #1 (First Discovery):
```markdown
✅ [Component] Migration Complete

Resources Applied:
- RESOURCES.md sections explored: 5
- Relevant files discovered: 3
- Patterns identified: 2 new

Results:
- Risk Level: [Discovered from research]
- Complexity: High (establishing patterns)
- Verification caught: [Issues prevented]
- Documentation: Created comprehensive guide

Patterns Discovered:
1. [First pattern with example]
2. [Second pattern with example]

Next Component Benefits:
- [Specific pattern ready for reuse]
- [Test approach validated]
```

### After Component #10 (Pattern Library Established):
```markdown
✅ [Component] Migration Complete

Resources Applied:
- Previous patterns: 6 of 8 applied directly
- New discovery: Only component-specific styling

Results:
- Complexity: Moderate (mostly pattern application)
- Efficiency: Noticeably faster than early components
- Pattern reuse: 75%
- Zero verification issues

Pattern Library Status:
- Total patterns: 15
- Most used: Surface colors (9 times)
- Automation candidates: 3 identified
```

### After Component #30 (Ready for Automation):
```markdown
✅ [Component] Migration Complete

Efficiency Analysis:
- Pattern reuse: 85%
- New discoveries: Rare
- Common replacements: Highly predictable

Automation Readiness:
- ✓ Patterns stable for 10+ components
- ✓ Clear scripting opportunities
- ✓ Test strategy proven
- ✓ Time to build automation scripts
```

## Discovery Prompts for Subagents

**Good Discovery Prompts**:
```
"Explore RESOURCES.md for migration patterns related to [component type]"
"Find how Phase 2 handled similar optimization challenges"
"Discover test patterns for components with [specific characteristic]"
"Search implementation files for [pattern name] usage"
```

**Verification Prompts** (use before implementing):
```
"Verify this solution aligns with the project's architectural principles"
"Check if this approach has been validated in similar components"
"Confirm this won't break existing functionality"
"Validate this matches the discovered specifications"
```

**Avoid Prescriptive Prompts**:
```
❌ "Apply pattern from migration-patterns.md line 45"
✅ "Discover what migration patterns exist for interactive components"

❌ "Use the exact color mapping from the spec"
✅ "Find how semantic colors were mapped in specifications"
```

## Measuring Discovery Success

### Track Your Discovery Efficiency

After each component, ask:
- Did I check RESOURCES.md first? ✓/✗
- Did I find relevant existing knowledge? ✓/✗
- Did I reuse patterns from previous work? ✓/✗
- Did I document new discoveries? ✓/✗
- Did I update CLAUDE.md with patterns? ✓/✗

### Quality Metrics
- Effort invested vs. effort saved through reuse
- Patterns discovered vs. patterns reused
- Original solutions vs. adapted patterns
- Knowledge documented for future use

## Common Discovery Scenarios

### "I've finished all numbered tasks but haven't reached 70 components"
This is expected! The numbered tasks are strategic examples. For additional components:
1. Check CLAUDE.md checklist for unchecked components
2. Look in the codebase for components using `dark:` classes
3. Choose components that match your current phase focus:
   - Phase 3A: Pick diverse components to discover patterns
   - Phase 3B: Pick similar components to validate patterns
   - Phase 3C: Let automation handle the bulk

### "I need to migrate a form component"
1. Check RESOURCES.md for form-related research
2. Look for form components in risk assessment
3. Find form validation patterns in specifications
4. Check if auth forms were already migrated
5. Discover accessibility requirements for forms

### "This component has complex animations"
1. Search for animation research in Phase 0
2. Check how Phase 2 handled CSS performance  
3. Find animation preservation patterns
4. Look for similar animated components
5. Discover performance budgets for animations

### "I'm seeing a pattern repeatedly"
1. Document it in CLAUDE.md immediately
2. Check if it was predicted in research
3. Consider automation potential
4. Update implementation docs
5. Plan for script creation

### "Should I move to the next phase?"
Check these indicators:
- Phase 3A → 3B: Pattern Library has 3+ patterns used 5+ times
- Phase 3B → 3C: Patterns stable for 5+ components, clear ROI for automation
- Not about component count, but pattern maturity!

## State Preservation Protocol

**When Approaching Context Window Limits**:

1. **Complete Current Work**:
   - Finish the component migration
   - Run all verification checks
   - Ensure tests pass

2. **Update CLAUDE.md**:
   ```
   Use state preservation commands:
   # Pattern count: X → Y
   # Components: X/70 complete
   # New learning: [Discovery]
   # Next component: [Name]
   # Recent 1: [Component] - [filename].md - Key: [insight]
   ```

3. **Create/Complete Documentation**:
   - Implementation doc with full details
   - Patterns discovered
   - Complexity assessment

4. **Commit Everything**:
   ```bash
   git add -A
   git commit -m "refactor: migrate [component] to semantic colors"
   ```

5. **Request Clear**:
   "I've completed [component] migration and updated all documentation. I need a /clear to continue with the next component."

## Success Validation Checklist

You're succeeding when:
- ✓ Each component is easier than the last
- ✓ You recognize patterns before reading about them
- ✓ Verification catches issues before they happen
- ✓ Documentation helps your future self
- ✓ Automation ideas emerge naturally
- ✓ Quality remains high despite increasing speed

You need to adjust when:
- ✗ Same mistakes repeat across components
- ✗ Discovery takes longer each time
- ✗ Patterns aren't reusable
- ✗ Verification seems pointless (it never is!)
- ✗ Progress feels random, not progressive

## Phase 3 Completion

### Knowledge Transfer (Task 3.12)
```
Your discoveries are valuable! Ensure they're findable:

1. Review everything in .claude/memory/implementation/
2. Extract the most valuable patterns
3. Update RESOURCES.md comprehensively
4. Include:
   - What patterns emerged beyond predictions
   - Which specifications proved most valuable  
   - What Phase 4 should know
   - Efficiency analysis and automation ROI
```

## Final Wisdom

**Take a deep breath and take it one step at a time.**
**The 20KB CSS bundle from Phase 2 proves the specifications work.**  
**The 50% build improvement shows the patterns are solid.**  
**The testing infrastructure is ready and proven.**

Everything you need for successful component migration already exists in the project knowledge. Your job is not to reinvent but to:

1. **DISCOVER** what exists
2. **UNDERSTAND** why it works
3. **VERIFY** the reasonableness of your solution (**ALWAYS** before implementing)
4. **APPLY** it intelligently
5. **DOCUMENT** new insights
6. **BUILD** on each success

Remember: **ALWAYS** verify the reasonableness of your solution before you implement each piece. This single practice prevents most migration errors and ensures quality.

Start by:
1. Opening CLAUDE.md to check your current progress and position
2. Using the "Determining Your Current Position" sequence above
3. Reading the Phase 3 Implementation Plan at `docs/phase-3-implementation-plan.md`
4. Navigating to your specific task or milestone
5. Beginning work (Task 3.0 if starting fresh - CRITICAL)

Let curiosity guide your exploration. The knowledge is there - go discover it!

Take a deep breath and take it one step at a time.