# Phase 2 Execution Prompt - Architecture Foundation Setup

Execute Phase 2 tasks from `docs/dark-mode-removal-comprehensive-implementation-plan.md` starting at "SPARC Phase 2: Architecture - Foundation Setup".

## Your Mission

Transform the Phase 1 specifications into working foundation architecture by following the Implementation Plan exactly. Each task in Phase 2 contains complete instructions - this prompt simply guides your execution approach.

## Execution Methodology

### 1. START WITH THE PLAN
- Open `docs/dark-mode-removal-comprehensive-implementation-plan.md`
- Navigate to "SPARC Phase 2: Architecture - Foundation Setup"
- Read the complete Phase Overview and Implementation Principles
- Find the next uncompleted task marked with [ ]

### 2. FOLLOW TASK INSTRUCTIONS
Each task in the Implementation Plan contains:
- Discovery phase requirements (Intelligently and effectively use Subagents to perform discovery)
- Implementation approach
- Documentation requirements
- Commit message format

Always intelligently and effectively use Subagents to perform discovery phases:
- When multiple files need to read and analyzed, use multiple subagents to read and analyze them in parallel

Follow these instructions exactly as written.

### 3. USE `.claude/memory/RESOURCES.md` AS YOUR MAP
The Implementation Plan will tell you to consult RESOURCES.md to find:
- Phase 1 specifications (your blueprints)
- Research files (for context)
- Performance targets and quality gates
- Prior implementation work

Always use `.claude/memory/RESOURCES.md` to navigate rather than searching for files.

Always intelligently and effectively use Subagents to perform discovery phases:
- When multiple files need to read and analyzed, use multiple subagents to read and analyze them in parallel

## Key Phase 2 Principles

1. **Specifications Are Blueprints**: Phase 1 specs contain exact implementations
2. **Test-Driven Development**: Write tests before implementation
3. **Measure Everything**: Track baseline → target → actual
4. **Document Reality**: Note any deviations from specifications
5. **Think Forward**: Consider Phase 3 impact in all decisions

## Progress Reporting

After completing each task, report:
```
✅ Task 2.X - [Task Name] Complete

Implementation Summary:
- Followed specifications from: [list specs used]
- Key metrics: [baseline] → [target] → [actual achieved]
- Deviations from spec: [any changes and why]

Documentation Created:
- implementation/[filename].md
- Updated RESOURCES.md: [Yes/No]

Next: Task 2.X
```

## Validation Before Marking Complete

Ensure each task meets the success criteria defined in its instructions:
- [ ] Tests pass (as specified in task)
- [ ] Documentation created (as required by task)
- [ ] Performance validated (against targets in task)
- [ ] Task marked [x] in Implementation Plan
- [ ] Proper commit message used

## Remember

- The Implementation Plan has ALL the details
- `.claude/memory/RESOURCES.md` is your navigation tool
- Phase 1 specifications are your exact blueprints
- Document everything for Phase 3's benefit
- Task 2.4 (updating `.claude/memory/RESOURCES.md`) is critical (**ULTRATHINK THROUGHOUT TASK 2.4**)

Now proceed to `docs/dark-mode-removal-comprehensive-implementation-plan.md` and begin with the first uncompleted Phase 2 task.