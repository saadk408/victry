Excellent question! Let me provide clear decision criteria and specific patterns for Phase 2 parallel session orchestration:The key insight is that parallel sessions should be **trigger-based**, not time-based. Here are the specific triggers for Phase 2:

## Primary Trigger Points

### For Task 2.1 → 2.2 Parallel Preparation

**Start parallel when you see**:
- Main Claude: "I've created an implementation plan for Tailwind v4. Now I'll begin implementing the @theme directive..."
- Main Claude: "This implementation will involve several steps..."
- Status file: Task 2.1 changes from "not_started" to "in_progress"

**The moment**: ~10-15 minutes into Task 2.1

### For Task 2.2 → 2.3 Research

**Start parallel when you see**:
- Main Claude: "I've applied the basic Next.js optimizations. Now running build performance tests..."
- Main Claude: "Measuring bundle sizes and build times..."
- Multiple verification subagents being spawned

**The moment**: ~20-30 minutes into Task 2.2

## Quick Reference

**Question**: "Should I start a parallel session now?"

**Answer**: Check these 3 things:
1. Look at what Main Claude just said - does it indicate 15+ minutes of work ahead?
2. Check `.claude/phase2-status.json` - what's the current task status?
3. Think about the next task - can its preparation truly happen independently?

**Rule of thumb**: If Main Claude is doing implementation and you see it's going to be heads-down for a while, that's your cue to start preparing the next task in parallel.