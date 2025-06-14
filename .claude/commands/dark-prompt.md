# Dark Mode Removal Project Prompt

Take a deep breath and take the following one step at a time.

Execute the dark mode removal project following @dark-mode-removal-comprehensive-implementation-plan.md:

1. Open @dark-mode-removal-comprehensive-implementation-plan.md and identify uncompleted tasks marked with [ ]

2. For each task:
   - CHECK EXISTING RESEARCH FIRST:
     * List all potentially relevant files in .claude/memory/research/
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
   
   - Apply accumulated research to implementation:
     * Read all relevant project files
     * Think hard about the best approach based on ALL research (existing + new)
     * Reference specific research findings in your implementation decisions
   
   - Execute implementation:
     * Verify the reasonableness of your solution before you implement each piece of the solution. 
     * Write tests first (TDD approach)
     * Verify the reasonableness of your solution before you implement each piece of the solution
     * Implement changes following researched best practices
     * Run tests to verify changes work correctly
     * Commit with descriptive message following conventional commits
   
   - Update documentation:
     * Mark task as [x] completed in @dark-mode-removal-comprehensive-implementation-plan.md
     * Document implementation decisions in .claude/memory/implementation/[task-name].md
     * Add any new insights back to relevant research files

3. After each task:
   - Report completion status
   - Summarize what research was reused vs newly conducted
   - List any new insights added to the knowledge base
   - Pause and wait for instruction to continue

4. Continue with next uncompleted task when instructed

CRITICAL WORKFLOW:
- ALWAYS check .claude/memory/research/ BEFORE conducting new research
- BUILD upon existing research rather than duplicating efforts
- CROSS-REFERENCE multiple research files for comprehensive understanding
- DOCUMENT new insights to improve the knowledge base for future tasks

Use "ultrathink" for architectural decisions and complex refactoring.
Use parallel execution where tasks are independent.
For this single-instance project, use .claude/memory/ for all storage (coordination/memory_bank/ not needed).

REMEMBER: The goal is to build a comprehensive, growing knowledge base. Each task should strengthen the research foundation for subsequent tasks.

If uncertain about any implementation detail:
1. First check if the answer exists in .claude/memory/research/
2. Cross-reference related research files
3. Only then search for new documentation
4. Verify the approach is still recommended in 2025
5. Document why you chose this approach
6. Add new findings back to research files