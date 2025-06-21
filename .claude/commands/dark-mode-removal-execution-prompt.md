# Dark Mode Removal Project - Execution Workflow Guide

## Your Mission

Execute the remaining tasks documented in `docs/dark-mode-removal-comprehensive-implementation-plan.md` following the established project patterns and quality standards. Use subagents in parallel to read the entire file.

**IMPORTANT**: This guide explains HOW to execute tasks. The actual task list with checkboxes is in the implementation plan.

## Critical Starting Points

1. **Implementation Plan**: `docs/dark-mode-removal-comprehensive-implementation-plan.md` - This is your task list and source of truth
2. **Quick Reference**: `CLAUDE.md` - Commands and current project state
3. **Knowledge Map**: `.claude/memory/RESOURCES.md` - Navigation to all project resources

## Execution Workflow (MANDATORY)

Take a deep breath and take it one step at a time. 

For EACH task in the implementation plan:

### 1. Task Selection
- Use subagents in parallel to read the entire `docs/dark-mode-removal-comprehensive-implementation-plan.md`
- Find the next unchecked task (look for `[ ]`)
- Read the ENTIRE task description carefully
- Note any referenced line numbers or specific requirements

### 2. Discovery Phase (ALWAYS do first)
- Open `.claude/memory/RESOURCES.md`
- Use Quick Reference to find relevant resources for the task
- Read discovered files COMPLETELY (not just summaries)
- Understand existing patterns before implementing

### 3. Implementation
- ALWAYS verify the reasonableness of your solution before you implement each piece of the solution
- Apply discovered patterns exactly as documented
- Use existing test templates and configurations
- Verify your solution makes sense before implementing
- Follow the specific steps outlined in the task

### 4. Validation
- Run any tests specified in the task
- Verify no regressions were introduced
- Check that success criteria are met
- Document any deviations or issues

### 5. Update Progress (CRITICAL)
- Update the checkbox from `[ ]` to `[x]` for the completed task
- Add any important notes or findings in the task section
- Update any metrics or results mentioned in the task
- Save the implementation plan file

### 6. Commit and Push
```bash
# Stage your changes
git add -A

# Commit with detailed message
git commit -m "feat(phase-4e): complete [task name]

- [Describe what was implemented]
- [List key changes made]
- [Note any important findings]
- [Mention test results if applicable]

Task: [Task number and name from plan]
Status: Complete"

# Push changes
git push
```

### 7. STOP
- Do NOT continue to the next task
- Your work for this session is complete
- Wait for further instructions

## Quality Principles

1. **Discovery First**: Never skip the discovery phase - the answers are in the documentation
2. **Pattern Adherence**: Use the 16 established patterns - they've been proven across 70 components
3. **Test Everything**: The project has maintained exceptional quality - continue this standard
4. **Document Reality**: If something doesn't work as expected, document it
5. **Incremental Progress**: One task at a time ensures quality and allows for review

## Key Context

- **Current State**: 98% semantic token adoption achieved, zero dark: classes remain
- **Phase Status**: Phases 0-3 complete, Phase 4A-4D complete, Phase 4E and 5 remaining
- **Quality Bar**: This project has been executed with exceptional quality - maintain it

## Task Execution Guidelines

### For Testing Tasks (Phase 4E)
- Use test templates from `.claude/memory/implementation/testing-infrastructure.md`
- Apply risk-based tolerances (5-15%) as documented
- Store results in `.claude/memory/test-results/`
- Focus on catching real issues, not perfect pixel matches

### For Deployment Tasks (Phase 5)
- Follow rollback procedures from migration patterns documentation
- Verify ALL Phase 4E tests pass before deployment tasks
- Use deployment checklists exactly as specified
- Document any production-specific configurations

## Common Task Patterns

1. **"Discovery Phase (REQUIRED)"** - Always use RESOURCES.md to find files
2. **"Verify Checklist"** - These are pass/fail criteria, check each item
3. **"Create [file]"** - Follow the exact structure provided in the task
4. **"Update RESOURCES.md"** - Add entries to help future discovery

## Red Flags to Avoid

- 🚫 Don't skip to implementation without discovery
- 🚫 Don't modify established patterns
- 🚫 Don't continue after completing one task
- 🚫 Don't make assumptions - use the documentation
- 🚫 Don't forget to update the implementation plan

## Success Verification

After completing a task, you should have:
- ✅ Checkbox updated in the implementation plan
- ✅ All specified deliverables created/updated
- ✅ Tests passing (if applicable)
- ✅ Changes committed with descriptive message
- ✅ Changes pushed to repository

## Example Execution

```
1. Open implementation plan, find Task 4E.1 is next
2. Read task: "E2E Critical Flows testing"
3. Open RESOURCES.md, find risk assessment and test patterns
4. Read those files completely
5. Implement tests following discovered patterns
6. Run tests, verify they work
7. Update implementation plan: [x] Task 4E.1
8. Commit: "feat(phase-4e): complete E2E critical flows testing"
9. Push changes
10. STOP
```

Remember: The implementation plan contains all task details. This guide only explains HOW to execute those tasks, not WHAT the tasks are.