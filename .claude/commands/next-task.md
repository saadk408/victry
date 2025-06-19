# Enhanced Phase 3 Execution Prompt - Discovery-Driven Component Migration

Execute Phase 3 by discovering and applying knowledge from the comprehensive work already completed in Phases 0-2.

## Your Mission

Systematically migrate 70 components from dark mode to semantic colors through intelligent discovery and application of existing knowledge. Transform each discovery into reusable patterns that accelerate future work.

**The Phase 3 Implementation Plan is located at**: `docs/phase-3-implementation-plan.md`

Start by reading this plan to understand the complete methodology, milestones, and specific tasks.

## Determining Your Current Position

**When starting any session, follow this sequence**:

1. **Check CLAUDE.md First**:
   - Look at "Migration Checklist" - find the first unchecked [ ] item
   - Review "Current Milestone Status" - are you in Phase 3A, 3B, or 3C?
   - Check "Progress Tracking" - how many components completed?
   - Read "Recent Implementation Docs" - understand recent work

2. **Navigate to Your Position in Implementation Plan**:
   - If Task 3.0 (Resume Editor) unchecked → Start there (CRITICAL)
   - If in Phase 3A (1-15 components) → Focus on discovery tasks
   - If in Phase 3B (16-30 components) → Apply patterns confidently  
   - If in Phase 3C (31-70 components) → Check if scripts exist, use automation

3. **Understand Your Current Context**:
   - Components < 15: You're establishing patterns (Phase 3A)
   - Components 15-30: You're validating patterns (Phase 3B)
   - Components > 30: You should be automating (Phase 3C)
   - If Pattern Library has 3+ patterns used 5+ times → Consider moving to next phase

4. **Find Your Specific Task**:
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

**USE SUBAGENTS TO SEARCH AND READ FILES IN PARALLEL**

#### Step 1: Explore Available Knowledge
```
Don't search for specific files. Instead:

1. Open RESOURCES.md
2. Check component imports - are any already migrated? Use their patterns
3. Ask yourself:
   - "What kind of component is this?"
   - "What knowledge would help migrate it?"
   - "Has similar work been done?"
   
4. Browse the inventory:
   - Research files: What was learned?
   - Specifications: What was designed?
   - Implementation: What has worked?
   - Test results: What was validated?

**INTELLIGENTLY USE SUBAGENTS TO SEARCH AND READ FILES IN PARALLEL**
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

## Critical First Task: Resume Editor Crisis

### Approach This as a Discovery Challenge
```
The Problem: 404KB bundle (125% over target)

Your Discovery Mission:
1. How is bundle size measured? (Find in Phase 2 work)
2. What optimization patterns already exist? (Check implementations)
3. Why is this bundle so large? (Analyze with discovered tools)
4. What techniques have worked before? (Review all optimizations)
5. How to validate the fix works? (Find testing patterns)

**Critical**: Before implementing any optimization, **ALWAYS** verify:
- Will this preserve all editor functionality?
- Does this align with Next.js best practices discovered?
- Is this the simplest solution that achieves the goal?
- Have similar optimizations worked elsewhere?

Document your discovery process as much as the solution!
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