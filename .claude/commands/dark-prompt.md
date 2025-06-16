# Main Execution Prompt - Dark Mode Removal Project

Execute implementation tasks from @dark-mode-removal-comprehensive-implementation-plan.md using RESOURCES.md as your knowledge map.

## Execution Instructions

1. **Open the Implementation Plan**
   - Open @dark-mode-removal-comprehensive-implementation-plan.md
   - This is the Implementation Plan - this your single source of truth for all task instructions
   - Never rely on memory or assumptions - always read the current task instructions

2. **For Each Task**
   - Find the next uncompleted task marked with [ ]
   - Read the COMPLETE task instructions in the Implementation Plan
   - Use RESOURCES.md to quickly find relevant files
   - CROSS-REFERENCE multiple research files for comprehensive understanding
   - Follow the Discovery → Implementation → Documentation pattern

## Task Execution Pattern

### 1. DISCOVERY PHASE (Start Every Task Here)

- ALWAYS FIRST CONSULT `.claude/memory/RESOURCES.md` as the central knowledge map:
```
Need information about:
- Color system → Check color-system-spec.md
- Migration patterns → Check migration-patterns.md
- Prior work → Check /implementation/ section
```

- CHECK EXISTING RESEARCH FIRST:
     * List all potentially relevant research files in .claude/memory/research/
     * Read each relevant research file completely
     * Cross-reference related research files for additional insights
     * Identify what information is missing (research gaps)
     * ONLY research new topics if gaps exist in current knowledge
   
   - If research gaps exist:
     * Search for current library documentation (Tailwind v4, Next.js 15+, React 19)
     * Find recent migration guides and tutorials
     * Look up latest performance optimization techniques
     * Check for security best practices updates
     * Store NEW findings in .claude/memory/research/[topic].md
     * Update existing research files with new insights
     * Update `.claude/memory/RESOURCES.md` with any new updates or findings

### 2. IMPLEMENTATION PHASE

Follow the specific instructions in the Implementation Plan for the current task.
Key patterns to remember:
  - Apply accumulated research to implementation:
     * Read all relevant project files
     * ALWAYS ultrathink about the best approach based on ALL research (existing + new)
     * Reference specific research findings in your implementation decisions
  - Execute implementation:
     * ALWAYS verify the reasonableness of your solution before you implement each piece of the solution 
     * Write tests first (TDD approach)
     * ALWAYS verify the reasonableness of your solution before you implement each piece of the solution
     * Implement changes following researched best practices
     * Apply patterns from prior implementations
     * Use specifications as designed
     * Reference research findings in decisions
     * Run tests to verify changes work correctly
     * Commit with descriptive message following conventional commits
   
  - Update documentation:
     * Mark task as [x] completed in @dark-mode-removal-comprehensive-implementation-plan.md
     * Document implementation decisions in .claude/memory/implementation/[task-name].md
     * Add any new insights back to relevant research files

If uncertain about any implementation detail:
1. First check if the answer exists in .claude/memory/research/
2. Cross-reference related research files
3. Only then search for new documentation
4. Verify the approach is still recommended in 2025
5. Document why you chose this approach
6. Add new findings back to research files

### 3. DOCUMENTATION PHASE

After completing each task:
1. Create/update .claude/memory/implementation/[task-name].md
2. Mark task as [x] in the Implementation Plan
3. Update RESOURCES.md if new patterns discovered
4. Commit with conventional commit message

## Common Task Patterns

**Component Migration Tasks** (Phase 3):
- Always check /implementation/ for prior migrations
- Apply consistent patterns across components
- Reference status color utilities if available

**Architecture Tasks** (Phase 2):
- ALWAYS use "ultrathink" for architectural decisions and complex refactoring
- Check if work already started in /implementation/
- Apply specifications exactly as designed
- Document all configuration decisions

**Testing Tasks** (Phase 4):
- Reference quality gates from specifications
- Compare against baselines in research
- Store results in /test-results/

## Critical Reminders

1. **Implementation Plan is the Authority**: All task details are there
2. **RESOURCES.md is Your Map**: Use it to navigate knowledge efficiently
3. **Build on Prior Work**: Check /implementation/ before starting
4. **Document Everything**: Future tasks depend on your documentation

## Progress Tracking

After each task, report:
```
Task [X.X] - [Task Name] ✓

Resources Used:
- [List key files that guided implementation]

Key Decisions:
- [Major implementation choices made]

Documentation:
- Created/Updated: implementation/[task-name].md
- Patterns for reuse: [Any reusable patterns discovered]

Status: Task marked complete in Implementation Plan
Ready for next task: [X.X]
```

## Parallel Execution

Use parallel execution where tasks are independent.

When the Implementation Plan indicates parallel tasks:
- Execute them in separate branches if using git
- Ensure no conflicting file changes
- Document dependencies between parallel tasks

## Success Validation

Before marking any task complete, verify:
- [ ] All tests pass (if applicable)
- [ ] Documentation created in /implementation/
- [ ] Task marked [x] in Implementation Plan
- [ ] Commit created with proper message
- [ ] No regressions in existing functionality

Remember: Implementation Plan in @dark-mode-removal-comprehensive-implementation-plan.md contains all the details. This prompt simply guides you on HOW to execute what's written there.