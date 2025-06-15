# Victry Dark Mode Removal: Claude Code Optimized Implementation Plan (v3)

**File Name:** `dark-mode-removal-comprehensive-implementation-plan.md`

## Current Status

**Completed Phases:**
- ✅ Phase 0: Research & Discovery - Research documented in `.claude/memory/research/`
- ✅ Phase 1: Specification - Specifications created in `.claude/memory/`

**Ready to Execute:**
- Discovery & Inventory Task (Quick exploration)
- Gap Analysis & Research Task (Fill critical knowledge gaps)
- Phase 2: Architecture - Foundation Setup
- Phase 3: Refinement - Component Migration
- Phase 4: Testing & Validation
- Phase 5: Completion - Production Deployment

## Project Configuration

**Project:** Victry Dark Mode Removal  
**Implementation Plan:** `dark-mode-removal-comprehensive-implementation-plan.md` (this file)  
**Methodology:** SPARC (Specification, Pseudocode, Architecture, Refinement, Completion)  
**Timeline:** 5 weeks (25 days)  
**Test Coverage Target:** 95%  
**Performance Target:** 25-30KB bundle reduction

## Discovery-First Development Approach

This plan emphasizes exploring and understanding existing research before any implementation. Claude Code should discover what resources are available and use them intelligently rather than looking for specific files that may not exist.

### Research Discovery Pattern

For EVERY task, start with exploration:
1. **Explore Directory Structure**: Use `ls` or directory listing to see what files actually exist
2. **Identify Relevant Content**: Based on the task, determine which files likely contain needed information
3. **Read and Synthesize**: Read multiple files to gather comprehensive understanding
4. **Apply Knowledge**: Use the discovered information to guide implementation
5. **Document Sources**: Note which files provided useful information for future reference

### Known Research Structure
```
.claude/memory/
├── Root Level Specifications:
│   ├── color-system-spec.md      # OKLCH color system design
│   ├── tailwind-v4-spec.md       # Tailwind v4 migration guide
│   ├── migration-patterns.md     # Component migration patterns
│   ├── migration-strategy.md     # Overall migration strategy
│   └── performance-budgets-quality-gates.md  # Performance targets
├── research/                     # Phase 0 research findings
│   ├── color-analysis.md         # Existing color system analysis
│   ├── nextjs-15.md             # Next.js optimization research
│   ├── oklch-color-system.md    # OKLCH color space research
│   ├── performance-baseline.md   # Current performance metrics
│   ├── react-19.md              # React 19 patterns
│   ├── risk-assessment.md       # Component risk analysis
│   └── tailwind-v4.md           # Tailwind v4 features
├── implementation/              # Implementation documentation
│   └── tailwind-v4-config.md    # Already started!
└── test-results/               # Empty, ready for test results
```


## SPARC Phase 0: Research & Discovery [x]

### Research Prompt
```
Research the current dark mode implementation and latest best practices comprehensively (think hard):

IMPORTANT: Before researching any topic, check .claude/memory/research/ for existing findings:
- If research exists, read it first and build upon it
- Cross-reference related research files for additional context
- Only conduct new research for gaps in existing knowledge

### Task 0.1: Research latest documentation and standards [x]
   - Check .claude/memory/research/latest-standards.md first
   - Search for Tailwind CSS v4 official documentation and migration guides
   - Find Next.js 15+ performance optimization best practices
   - Research React 19 patterns and recommendations
   - Look up current WCAG 2.1 AA color contrast requirements
   - Find latest CSS-in-JS vs CSS-first architecture debates
   - Document all findings in .claude/memory/research/latest-standards.md

### Task 0.2: Analyze the existing color system [x]
   - Check .claude/memory/research/color-analysis.md if it exists
   - Find all files using dark mode classes (dark:*)
   - Identify color variable definitions
   - Map component color dependencies
   - Compare with latest color system best practices
   - Document in .claude/memory/color-analysis.md

### Task 0.3: Investigate technical architecture [x]
   - Review any existing .claude/memory/research/tech-stack.md
   - Current Tailwind configuration vs latest v4 recommendations
   - PostCSS setup compared to current best practices
   - Build process optimization opportunities
   - Latest bundle optimization techniques
   - Document in .claude/memory/tech-stack.md

### Task 0.4: Identify critical components [x]
   - Check .claude/memory/research/risk-assessment.md for prior analysis
   - Components with highest dark mode usage
   - AI feature components requiring special attention
   - Authentication and resume builder components
   - Research component migration best practices
   - Create/update risk matrix in .claude/memory/risk-assessment.md

### Task 0.5: Performance baseline and latest metrics [x]
   - Review .claude/memory/research/performance-baseline.md if exists
   - Current bundle sizes vs industry standards 2025
   - Build times compared to optimal targets
   - Core Web Vitals against latest thresholds
   - Research latest performance monitoring tools
   - Document in .claude/memory/performance-baseline.md

Cross-reference all research files before proceeding to ensure comprehensive understanding.

Commit findings: "research: complete dark mode analysis with latest best practices"
```

### Task 0.6: Explore and Document Resources [x]
```
Create a comprehensive knowledge map of ALL available resources to enable efficient implementation throughout the project.

**Objective**: Document every resource in .claude/memory/ to create RESOURCES.md as the central reference for all subsequent tasks.

**Execution Steps**:

1. Directory Exploration:
   ```bash
   # List complete directory structure with files
   find .claude/memory/ -type f -name "*.md" | sort
   
   # Alternative if find is not available:
   ls -la .claude/memory/
   ls -la .claude/memory/research/
   ls -la .claude/memory/implementation/
   ls -la .claude/memory/test-results/
   ```
   - Document the actual structure found (not assumed)
   - Note any unexpected directories or files
   - Identify work already completed in /implementation/

2. File Analysis:
   For each .md file discovered:
   - Read the first 50-100 lines to understand purpose and scope
   - Identify the main topics covered
   - Note key insights, decisions, or patterns documented
   - Check for cross-references to other files
   - Look for implementation guidance or code examples
   
   Create a preliminary index while reading:
   ```
   File: color-system-spec.md
   Topics: OKLCH colors, semantic tokens, WCAG compliance
   Key Insights: Professional color palette, status colors defined
   Related Files: References color-analysis.md, performance-budgets-quality-gates.md
   ```

3. Create RESOURCES.md:
   Create `.claude/memory/RESOURCES.md` with this exact structure:
   
   ```markdown
   # Dark Mode Removal - Resource Knowledge Map
   
   Generated: [Current Date]
   Last Updated: [Current Date]
   Purpose: Central knowledge map for efficient task execution
   Total Files Cataloged: [Number]
   
   ## Quick Reference Guide
   
   ### Need to find information about...
   - **Color system design** → color-system-spec.md (lines 15-89)
   - **OKLCH implementation** → research/oklch-color-system.md
   - **Tailwind v4 migration** → tailwind-v4-spec.md, research/tailwind-v4.md
   - **Component patterns** → migration-patterns.md (component section: lines 134-245)
   - **Testing strategies** → migration-patterns.md (testing section: lines 246-389)
   - **Performance targets** → performance-budgets-quality-gates.md
   - **Risk assessment** → research/risk-assessment.md
   - **Current issues** → research/color-analysis.md (dark mode audit)
   - **Accessibility standards** → research/latest-standards.md (WCAG section)
   - **React 19 patterns** → research/react-19.md
   - **Next.js 15 optimizations** → research/nextjs-15.md
   
   ## Complete File Inventory
   
   ### Root Specifications (.claude/memory/)
   | File | Purpose | Key Sections | Status |
   |------|---------|--------------|--------|
   | color-system-spec.md | OKLCH color system design | 1. Color tokens<br>2. Semantic mapping<br>3. WCAG validation | Complete |
   | tailwind-v4-spec.md | Migration specification | 1. @theme directive<br>2. CSS-first config<br>3. Migration steps | Complete |
   | migration-patterns.md | Component migration guide | 1. Migration template<br>2. Testing approach<br>3. Rollback procedures | Complete |
   | migration-strategy.md | Overall migration approach | 1. Phased approach<br>2. Risk mitigation<br>3. Timeline | Complete |
   | performance-budgets-quality-gates.md | Performance targets | 1. Bundle size limits<br>2. Build time targets<br>3. Quality metrics | Complete |
   
   ### Research Files (.claude/memory/research/)
   | File | Topic | Research Status | Key Findings | Implementation Ready |
   |------|-------|-----------------|--------------|---------------------|
   | color-analysis.md | Current color audit | Complete | - 150+ dark mode instances<br>- 12 color variables<br>- Inconsistent usage | Yes |
   | nextjs-15.md | Next.js optimizations | Complete | - Partial prerendering<br>- Bundle optimization<br>- Turbopack config | Yes |
   | oklch-color-system.md | OKLCH color space | Complete | - Browser support 95%<br>- Fallback strategies<br>- Color calculations | Yes |
   | performance-baseline.md | Current metrics | Complete | - Bundle: 285KB<br>- Build: 45s<br>- LCP: 2.1s | Baseline recorded |
   | react-19.md | React 19 patterns | Complete | - Use hooks<br>- Suspense patterns<br>- Concurrent features | Yes |
   | risk-assessment.md | Component risk matrix | Complete | - High risk: Auth, ATS Score<br>- Medium: Resume editor<br>- Low: Static pages | Yes |
   | tailwind-v4.md | Tailwind v4 features | Complete | - CSS-first architecture<br>- @theme directive<br>- OKLCH support | Yes |
   | latest-standards.md | 2025 best practices | Complete | - WCAG 2.1 AA<br>- Core Web Vitals<br>- Modern CSS | Reference |
   
   ### Implementation Documentation (.claude/memory/implementation/)
   | File | Component/Feature | Completion | Key Patterns | Reusable Learnings |
   |------|-------------------|------------|--------------|-------------------|
   | tailwind-v4-config.md | Tailwind setup | Started | @theme implementation | CSS variable setup |
   | [Future files will be added as implementation progresses] |
   
   ### Test Results (.claude/memory/test-results/)
   | Subdirectory | Purpose | Status |
   |--------------|---------|--------|
   | visual-regression/ | Screenshot comparisons | Empty - Ready for use |
   | accessibility/ | WCAG compliance reports | Empty - Ready for use |
   | performance/ | Bundle size & speed metrics | Empty - Ready for use |
   
   ## Cross-Reference Matrix
   
   ### Technology Dependencies
   - **Tailwind v4**: tailwind-v4-spec.md ← tailwind-v4.md ← tech-stack.md
   - **OKLCH Colors**: color-system-spec.md ← oklch-color-system.md ← color-analysis.md
   - **Performance**: performance-budgets-quality-gates.md ← performance-baseline.md
   - **Components**: migration-patterns.md ← risk-assessment.md
   
   ### Implementation Dependencies
   - **Before Tailwind setup**: Read color-system-spec.md + tailwind-v4-spec.md
   - **Before component migration**: Read migration-patterns.md + risk-assessment.md
   - **Before testing**: Read performance-budgets-quality-gates.md
   
   ## Knowledge Gaps Identified
   
   ### Potential Gap Categories to Consider
   Below are EXAMPLES of the types of gaps you might find. Document whatever gaps YOU actually discover:
   - [ ] Technology-specific implementation details (e.g., Tailwind v4 features)
   - [ ] Migration strategies for specific patterns (e.g., animations, complex components)
   - [ ] Testing setup and configuration details
   - [ ] Performance optimization techniques
   - [ ] Browser compatibility strategies
   - [ ] Accessibility testing automation
   - [ ] Build process optimizations
   
   Document your actual findings here based on what's missing from the current documentation.
   
   ## Usage Instructions
   
   1. **For any task**: First check Quick Reference Guide
   2. **For details**: Consult Complete File Inventory
   3. **For dependencies**: Review Cross-Reference Matrix
   4. **For gaps**: See Knowledge Gaps section
   
   ## Maintenance Notes
   
   - Update this file when new research is added
   - Add line numbers for frequently referenced sections
   - Mark implementation files as they're created
   - Track which patterns prove most useful
   ```

4. Validation & Quality Check:
   - Verify all .md files are cataloged
   - Ensure Quick Reference covers common needs
   - Check that cross-references are accurate
   - Confirm gaps section is ready for Task 0.7
   - Test usability by looking up a few concepts

5. Commit the knowledge map:
   ```bash
   git add .claude/memory/RESOURCES.md
   git commit -m "docs: create comprehensive resource knowledge map"
   ```

**Success Criteria**:
- ✓ Every .md file in .claude/memory/ is cataloged
- ✓ Quick Reference section enables fast lookups
- ✓ File inventory includes purpose and key sections
- ✓ Cross-reference matrix shows relationships
- ✓ Knowledge gaps are identified for Task 0.7
- ✓ Document is well-organized and scannable

**Deliverable**: RESOURCES.md serving as the complete knowledge map for the project

Commit: "docs: create comprehensive resource knowledge map"
```

### Task 0.7: Identify and Fill Knowledge Gaps [x]
```
Analyze RESOURCES.md to identify and research knowledge gaps that could impact implementation success.

**Prerequisite**: Task 0.6 must be complete with RESOURCES.md available.

**Objective**: Discover what knowledge is missing from the existing documentation and research both CRITICAL and IMPORTANT gaps to ensure smooth implementation.

**IMPORTANT**: This task requires you to:
1. Find YOUR OWN gaps based on the actual project documentation
2. Classify them using the CRITICAL/IMPORTANT/NICE-TO-HAVE criteria
3. Research both CRITICAL and IMPORTANT gaps
4. The examples throughout this task show FORMAT ONLY - your actual gaps will be different

**Execution Steps**:

1. Gap Analysis Phase:
   
   a) Read all specification files completely:
      - color-system-spec.md
      - tailwind-v4-spec.md  
      - migration-patterns.md
      - migration-strategy.md
      - performance-budgets-quality-gates.md
   
   b) Cross-reference with research files:
      - For each spec requirement, verify research exists
      - Note any implementation details that seem unclear
      - Identify any conflicting information between files
   
   c) Review implementation requirements by phase:
      ```
      Phase 2 (Architecture):
      - Task 2.1: Do we have complete Tailwind v4 setup info?
      - Task 2.2: Are Next.js 15 optimizations clear?
      - Task 2.3: Is testing infrastructure defined?
      
      Phase 3 (Components):
      - Do we understand component migration patterns?
      - Are status color utilities defined?
      - Is the testing approach clear?
      
      Phase 4 (Testing):
      - Are quality gates specified?
      - Do we have performance baselines?
      - Is accessibility testing defined?
      ```
   
   d) Classify each identified gap:
      ```
      CRITICAL (Must Research):
      - Implementation would fail without this
      - No reasonable workaround exists
      - Blocks multiple tasks
      - Core functionality affected
      
      IMPORTANT (Should Research):
      - Implementation would be suboptimal
      - Workaround exists but not ideal
      - Affects quality/performance
      - Worth investing time to get right
      
      NICE-TO-HAVE (Skip):
      - Additional context only
      - Alternative approaches
      - Future optimizations
      - Theoretical understanding
      ```
   
   **Note**: You will research both CRITICAL and IMPORTANT gaps. Only NICE-TO-HAVE gaps are skipped.

2. Document Gap Analysis in RESOURCES.md:
   
   Add new section to RESOURCES.md using this format:
   
   ```markdown
   ## Gap Analysis Report
   *Generated: [Date] during Task 0.7*
   
   ### Analysis Summary
   - Files Analyzed: [number]
   - Total Gaps Identified: [number]
   - Critical Gaps: [number]
   - Important Gaps: [number]
   - Nice-to-Have Gaps: [number]
   ```
   
   Then document YOUR ACTUAL FINDINGS using this structure:
   
   **IMPORTANT**: The examples below show the FORMAT ONLY. Your actual gaps will be different based on what you discover in the project files.
   
   ```markdown
   ### CRITICAL Gaps (Must Research)
   
   [EXAMPLE FORMAT - Replace with your actual findings:]
   
   1. **[Your Gap Name Here]**
      - Why Critical: [Explain why this blocks implementation]
      - Current State: [What exists now in the documentation]
      - Blocks: [Which specific tasks are blocked]
      - Research Needed:
        * [Specific question 1]
        * [Specific question 2]
        * [Specific question 3]
   
   ### IMPORTANT Gaps (Should Research)
   
   [EXAMPLE FORMAT - Replace with your actual findings:]
   
   1. **[Your Gap Name Here]**
      - Why Important: [Explain the impact]
      - Current State: [What's currently documented]
      - Affects: [Which tasks are affected]
      - Research Needed:
        * [Specific question 1]
        * [Specific question 2]
   
   ### NICE-TO-HAVE Gaps (Acknowledged Only)
   
   [EXAMPLE FORMAT - List your actual findings:]
   
   1. **[Your Gap Name]**
      - [Brief reason why it's interesting but not necessary]
   ```
   
   **Example to illustrate the format (DO NOT copy these specific gaps):**
   
   If you discovered that animations weren't documented, you might write:
   ```markdown
   1. **Tailwind v4 Animation System Migration**
      - Why Critical: Risk assessment shows 15+ animated components
      - Current State: No animation migration patterns in tailwind-v4-spec.md
      - Blocks: Tasks 3.2-3.7 (all component migrations)
      - Research Needed:
        * v4 syntax for transitions and animations
        * @keyframes in CSS-first approach
        * JavaScript animation integration
        * Performance implications
   ```
   
   But you should document whatever gaps YOU actually find in the project.

3. Research CRITICAL and IMPORTANT Gaps:
   
   For each gap YOU identified as CRITICAL or IMPORTANT, follow this pattern:
   
   a) Search authoritative sources:
      ```
      Priority order:
      1. Official documentation (2024-2025)
      2. Official migration guides
      3. First-party examples/demos
      4. Community best practices (if recent)
      ```
   
   b) Document findings immediately:
      
      **EXAMPLE FORMAT** (your actual content will be different):
      
      If adding to an existing file:
      ```markdown
      ## [Your Gap Title Here]
      *Added: [Date] during Task 0.7 gap analysis*
      
      ### Key Finding
      [What you discovered about this gap]
      
      ### Migration/Implementation Pattern
      [Step-by-step approach based on your research]
      
      ### Code Example
      ```[language]
      // Your actual code example from research
      ```
      
      ### Implementation Impact
      [How this affects the project]
      
      ### Sources
      - [Actual source you found](URL) - Description
      ```
   
   c) Create new file ONLY if entirely new topic:
      
      Use this template but fill with YOUR findings:
      ```markdown
      # .claude/memory/research/[your-specific-topic].md
      
      # [Your Topic] Gap Research
      
      Generated: [Date]
      Purpose: Fill gap identified in Task 0.7
      Priority: CRITICAL/IMPORTANT
      
      ## Gap Description
      [What was missing and why it matters]
      
      ## Research Findings
      [Your detailed findings with examples]
      
      ## Implementation Guidelines
      [Your step-by-step implementation approach]
      
      ## Code Examples
      ```[language]
      // Your working examples
      ```
      
      ## Sources Verified
      - [Your Source 1](URL) - Description
      - [Your Source 2](URL) - Description
      ```

4. Update RESOURCES.md with Resolution Status:
   
   Add your actual resolution summary to RESOURCES.md. Here's the format to use:
   
   ```markdown
   ## Gap Resolution Summary
   *Updated: [Date] after research completion*
   
   ### Gaps Researched and Resolved ✅
   
   #### CRITICAL Gaps Resolved
   [Document YOUR actual resolved critical gaps using this format:]
   
   1. **[Your Gap Name]** ✅
      - Status: RESOLVED
      - Solution Location: [file and line numbers]
      - Key Insight: [main finding]
      - Implementation Ready: Yes/No
      - Confidence Level: High/Medium/Low
   
   #### IMPORTANT Gaps Resolved
   [Document YOUR actual resolved important gaps using this format:]
   
   1. **[Your Gap Name]** ✅
      - Status: RESOLVED
      - Solution Location: [file and line numbers]
      - Key Insight: [main finding]
      - Implementation Ready: Yes/No
      - Confidence Level: High/Medium/Low
   
   ### Gaps Not Researched (NICE-TO-HAVE)
   
   [Document YOUR actual nice-to-have gaps:]
   
   1. **[Your Gap Name]** 
      - Status: NICE-TO-HAVE - Not Researched
      - Reason: [why it's not necessary for implementation]
      - Future Consideration: [if/when to revisit]
   
   ### Implementation Impact
   
   [Write your assessment of whether implementation can proceed]
   ```
   
   **Example only** (your summary will be different):
   "All CRITICAL and IMPORTANT knowledge gaps have been researched and resolved. Implementation can proceed with confidence through all phases. NICE-TO-HAVE gaps are documented for future consideration but do not impact implementation success."

5. Final Validation & Commit:
   - Verify all CRITICAL and IMPORTANT gaps are resolved
   - Confirm solutions are in appropriate files
   - Check that implementation can proceed
   
   ```bash
   git add .claude/memory/RESOURCES.md
   git add .claude/memory/research/[any-new-files].md
   git add [any-updated-specification-files]
   git commit -m "research: resolve critical and important implementation gaps"
   ```

**Success Criteria**:
- ✓ All specification files analyzed for gaps
- ✓ Gaps classified by priority (CRITICAL/IMPORTANT/NICE-TO-HAVE)
- ✓ Both CRITICAL and IMPORTANT gaps researched
- ✓ Solutions documented in appropriate files
- ✓ RESOURCES.md updated with complete gap analysis
- ✓ Clear documentation of NICE-TO-HAVE gaps for future reference
- ✓ Implementation can proceed without blockers

**Deliverable**: Updated RESOURCES.md with gap analysis + resolved gaps in research files

Commit: "research: resolve critical and important implementation gaps"
```

### Tasks:
- [x] 0.1: Research latest Tailwind v4, Next.js 15+, and React 19 documentation
- [x] 0.2: Analyze existing color system and dark mode usage
- [x] 0.3: Map component dependencies and create risk matrix
- [x] 0.4: Document current performance metrics vs 2025 standards
- [x] 0.5: Create migration strategy based on latest best practices
- [x] 0.6: Explore and Document Resources
- [x] 0.7: Identify and Fill Critical Knowledge Gaps

**Example Research Task Execution:**
```
Task 0.1: Research latest Tailwind v4, Next.js 15+, and React 19 documentation

Checking .claude/memory/research/ for existing findings...
- tailwind-v4.md: Not found
- nextjs-15.md: Not found  
- react-19.md: Not found
- latest-standards.md: Not found

No existing research found. Conducting new research...

Searching for latest Tailwind v4 documentation...
- Found: Official Tailwind CSS v4.0 docs (January 2025)
- Found: "Migrating from v3 to v4" guide
- Found: CSS-first architecture best practices
- Found: Performance optimization techniques
- Stored findings in .claude/memory/research/tailwind-v4.md

Key insights:
1. @theme directive replaces config files
2. CSS custom properties preferred over JS config
3. New OKLCH color space support
4. Built-in performance optimizations

Cross-referencing with other research areas...
- Added CSS optimization notes to latest-standards.md
- Noted performance implications in performance.md

Updating @dark-mode-removal-comprehensive-implementation-plan.md...
✓ Task 0.1 marked as complete
```

**Example Later Task Using Existing Research:**
```
Task 2.1: Tailwind CSS v4 Setup

Checking .claude/memory/research/ for relevant findings...
- tailwind-v4.md: FOUND ✓ (Reading...)
- latest-standards.md: FOUND ✓ (Reading CSS section...)
- tech-stack.md: FOUND ✓ (Reading current setup...)
- tailwind-v4-spec.md: FOUND ✓ (From Phase 1)

Applying existing research to implementation:
- Using @theme syntax from tailwind-v4.md
- Following CSS-first patterns from latest-standards.md
- Migrating from current config in tech-stack.md
- Implementing spec from tailwind-v4-spec.md

No additional research needed - all information available.

Proceeding with implementation...
```

## SPARC Phase 1: Specification - Modern CSS Architecture [x]

### Specification Prompt
```
Based on research findings and latest best practices, create detailed specifications (ultrathink):

PREREQUISITE: Read ALL research files in .claude/memory/research/ before proceeding:
- latest-standards.md
- color-analysis.md  
- tech-stack.md
- risk-assessment.md
- performance-baseline.md

1. Validate research is current:
   - Confirm all documentation referenced is from 2024-2025
   - Verify patterns against multiple authoritative sources
   - Cross-reference with recent implementation examples
   - Document any conflicting recommendations
   - Update research files if newer information is found

2. Design the new color system:
   - Base design on findings from .claude/memory/research/color-analysis.md
   - Apply WCAG guidelines from .claude/memory/research/latest-standards.md
   - Professional OKLCH color palette based on latest color theory
   - Semantic color tokens following current naming conventions
   - WCAG AA compliant combinations per 2025 guidelines
   - Save to .claude/memory/color-system-spec.md

3. Plan Tailwind v4 migration:
   - Use .claude/memory/research/tailwind-v4.md findings
   - Reference .claude/memory/research/tech-stack.md for current setup
   - CSS-first configuration using latest v4 features
   - Custom utilities following current best practices
   - PostCSS optimization pipeline with 2025 techniques
   - Document in .claude/memory/tailwind-v4-spec.md

4. Define migration patterns:
   - Apply risk assessment from .claude/memory/research/risk-assessment.md
   - Component migration templates based on research
   - Testing strategies using latest tools and patterns
   - Rollback procedures following DevOps best practices
   - Create .claude/memory/migration-patterns.md

Reference research findings throughout specifications to ensure alignment with discoveries.

Commit specifications: "spec: define color system and migration architecture based on 2025 best practices"
```

### Tasks:
- [x] 1.1: Design OKLCH professional color system with semantic tokens
- [x] 1.2: Create Tailwind v4 CSS-first configuration specification
- [x] 1.3: Define component migration patterns and testing strategies
- [x] 1.4: Establish performance budgets and quality gates

## SPARC Phase 2: Architecture - Foundation Setup [ ]

### Implementation Tasks with TDD Approach

#### Task 2.1: Tailwind CSS v4 Setup [ ]
```
Implement Tailwind v4 CSS-first architecture:

1. Discovery phase (REQUIRED):
   - Explore .claude/memory/ to understand available resources:
     * Look for any Tailwind-related specifications
     * Find color system specifications
     * Check /implementation/ for any existing work
   - Read relevant files to understand:
     * The planned OKLCH color system
     * CSS-first architecture approach
     * Performance optimization strategies
   - Note: Check if tailwind-v4-config.md already exists in /implementation/

2. Write failing tests for color system:
   - Test semantic color token access
   - Test WCAG compliance validation (using standards found in research)
   - Test CSS bundle size limits (using targets found in specs)
   
3. Implement configuration based on discovered specifications:
   - Update /app/globals.css with @theme directive
   - Apply color tokens from color system specification
   - Use migration approach from Tailwind specification
   
4. Verify all tests pass
5. Document implementation in .claude/memory/implementation/tailwind-v4-setup.md
6. Note which files provided useful guidance
7. Commit: "feat: implement Tailwind v4 CSS-first architecture"
```

**File: `/app/globals.css`**
```css
@import "tailwindcss";

@theme {
  /* OKLCH Professional Color System */
  --color-primary: oklch(0.45 0.15 231);         /* Professional blue */
  --color-secondary: oklch(0.65 0.12 190);       /* Trustworthy cyan */
  --color-background: oklch(1 0 0);              /* Pure white */
  --color-foreground: oklch(0.09 0 0);           /* Deep black */
  
  /* WCAG 2.1 AA Compliant Neutrals */
  --color-muted: oklch(0.96 0 0);                /* Light gray */
  --color-muted-foreground: oklch(0.45 0 0);     /* 4.61:1 contrast */
  --color-border: oklch(0.85 0 0);               /* Subtle borders */
  --color-input: oklch(0.98 0 0);                /* Input backgrounds */
  
  /* Semantic Status Colors (WCAG AA Compliant) */
  --color-success: oklch(0.35 0.15 145);         /* 6.5:1 contrast */
  --color-warning: oklch(0.30 0.15 85);          /* 8.2:1 contrast */
  --color-destructive: oklch(0.35 0.25 25);      /* 6.8:1 contrast */
  --color-info: oklch(0.35 0.18 240);            /* 6.1:1 contrast */
  
  /* Professional Typography Scale */
  --font-display: "Inter", "system-ui", sans-serif;
  --font-body: "Inter", "system-ui", sans-serif;
  --font-mono: "JetBrains Mono", "Consolas", monospace;
}
```

#### Task 2.2: Next.js Performance Configuration [ ]
```
Configure Next.js for optimal performance:

1. Discovery phase (REQUIRED):
   - Explore .claude/memory/research/ for performance-related content:
     * Look for Next.js configuration research
     * Find performance baselines and targets
     * Check for build optimization strategies
   - Read any performance specifications in root .claude/memory/
   - Identify current performance metrics and improvement goals

2. Update next.config.js with discovered optimizations:
   - Apply patterns found in Next.js research
   - Use performance targets from specifications
   - Implement only production-ready features

3. Configure bundle analyzer:
   - Follow setup patterns from research
   - Set up measurement scripts

4. Set up performance monitoring:
   - Apply monitoring patterns discovered
   - Configure build-time metrics

5. Test build process and measure improvements:
   - Compare against baselines found in research
   - Document results in .claude/memory/test-results/performance/

6. Document configuration in .claude/memory/implementation/nextjs-config.md
7. Note which research files provided valuable insights
8. Commit: "perf: optimize Next.js build configuration"
```

#### Task 2.3: Quality Assurance Infrastructure [ ]
```
Set up comprehensive testing infrastructure:

1. Discovery phase (REQUIRED):
   - Explore .claude/memory/ for testing-related guidance:
     * Look for testing strategies in migration patterns
     * Find quality gates and validation criteria
     * Check for recommended testing tools
   - If testing patterns are not comprehensive:
     * Research current Playwright best practices
     * Look up Storybook visual regression techniques
     * Document findings in .claude/memory/research/

2. Configure Playwright for E2E and accessibility testing
3. Set up Storybook with visual regression
4. Configure performance budget enforcement
5. Create initial test suites following discovered patterns
6. Document setup in .claude/memory/implementation/testing-setup.md
7. Commit: "test: establish QA infrastructure"
```

### Parallel Execution Opportunities:
- [ ] 2.1: Tailwind CSS v4 setup
- [ ] 2.2: Next.js performance configuration  
- [ ] 2.3: Testing infrastructure setup

## SPARC Phase 3: Refinement - Component Migration [ ]

### Core UI Components (Parallel Track 1) [ ]

#### Task 3.1: Create Status Color Utilities [ ]
```
Implement status color system with TDD:

1. Discovery phase (REQUIRED):
   - Explore .claude/memory/ for color system guidance:
     * Read color system specification
     * Find WCAG/accessibility standards
     * Look for status color patterns
   - Check migration patterns for utility implementation examples
   - Understand the semantic color approach from specs

2. Write tests for:
   - Status color mapping functions
   - WCAG contrast validation (using standards discovered)
   - Score-based status determination
   - Color-blind safe patterns

3. Create /lib/utils/status-colors.ts:
   - Implement based on color system specification found
   - Apply WCAG guidelines from research
   - Follow utility patterns discovered

4. Verify all tests pass
5. Document in .claude/memory/implementation/status-colors.md
6. Commit: "feat: implement semantic status color utilities"
```

#### Task 3.2: Migrate Card Component [ ]
```
Migrate Card component using established patterns:

1. Discovery phase (REQUIRED):
   - Explore .claude/memory/ for migration guidance:
     * Find component migration patterns
     * Look for Card-specific considerations in risk assessment
     * Read color system and Tailwind specifications
   - Check /implementation/ for any prior component migrations
   - Understand the testing strategy from specifications

2. Analyze current Card implementation:
   - Review existing dark mode usage
   - Identify all color-related classes
   - Note component dependencies

3. Write visual regression tests based on discovered patterns
4. Implement migration:
   - Remove dark mode classes
   - Apply semantic colors from specifications
   - Follow migration patterns found
5. Verify tests and accessibility
6. Update Storybook stories
7. Document in .claude/memory/implementation/card-migration.md
8. Commit: "refactor: migrate Card to semantic colors"
```

#### Task 3.3: Migrate Button Component [ ]
```
Migrate Button component:

1. Discovery phase (REQUIRED):
   - Check previous migrations in /implementation/:
     * Learn from Card migration experience
     * Apply consistent patterns
   - Review specifications for Button-specific guidance
   - Look for any Button considerations in risk assessment

2. Write component tests for all variants
3. Implement semantic color variants
4. Remove all dark: prefixed classes
5. Verify visual regression
6. Update Storybook
7. Document in .claude/memory/implementation/button-migration.md
8. Commit: "refactor: migrate Button to semantic colors"
```

#### Task 3.4: Migrate Badge Component [ ]
```
Migrate Badge component:

1. Research utilization phase (REQUIRED):
   - Reference Button migration (if completed)
   - Use established patterns
   - Reference status color utilities

2. Follow pattern from Button/Card migrations
3. Add status variants using status color utilities
4. Ensure WCAG compliance
5. Document in .claude/memory/implementation/badge-migration.md
6. Commit: "refactor: migrate Badge component"
```

### Feature Components (Parallel Track 2) [ ]

#### Task 3.5: Migrate ATS Score Component [ ]
```
Migrate resume builder components:

1. Research utilization phase (REQUIRED):
   - Reference status color utilities (from Task 3.1)
   - Check risk assessment for AI dependencies
   - Review previous component migrations
   - Find any ATS-specific guidance

2. Analyze AI integration points
3. Write comprehensive tests
4. Implement with semantic status colors
5. Test score visualization
6. Document in .claude/memory/implementation/ats-score-migration.md
7. Commit: "refactor: migrate ATS Score to semantic colors"
```

#### Task 3.6: Migrate Application Tracking [ ]
```
Migrate application tracking:

1. Research utilization phase (REQUIRED):
   - Reference ATS Score migration
   - Use status color utilities
   - Check for table/list patterns

2. Map status states to semantic colors
3. Write E2E tests for user flows
4. Implement migration
5. Verify functionality
6. Document in .claude/memory/implementation/application-tracking-migration.md
7. Commit: "refactor: migrate Application Tracking component"
```

#### Task 3.7: Migrate Authentication Components [ ]
```
Migrate auth components with security focus:

1. Research utilization phase (REQUIRED):
   - Check risk assessment for auth concerns
   - Reference form patterns from research
   - Use established migration patterns

2. Test authentication flows
3. Migrate login/register forms
4. Verify no visual regressions
5. Test error states
6. Document in .claude/memory/implementation/auth-migration.md
7. Commit: "refactor: migrate auth components"
```

### Automation Tools (Sequential) [ ]

#### Task 3.8: Create Migration Scripts [ ]
```
Build automation tools:

1. Research utilization phase (REQUIRED):
   - Review all component migrations completed
   - Identify common patterns
   - Check for automation tool research

2. Create /scripts/migrate-colors.js
3. Create /scripts/validate-colors.js
4. Test on sample files
5. Document usage
6. Store in .claude/memory/implementation/migration-scripts.md
7. Commit: "tools: add color migration automation scripts"
```

## SPARC Phase 4: Testing & Validation [ ]

### Comprehensive Testing [ ]

#### Task 4.1: E2E Critical Flows [ ]
```
Implement E2E tests for critical user journeys:

1. Discovery phase (REQUIRED):
   - Explore .claude/memory/ for testing guidance:
     * Find critical user flows in risk assessment
     * Look for E2E testing patterns
     * Check migration patterns for test examples
   - Review completed component migrations in /implementation/
   - Understand quality gates and success criteria

2. Implement tests for critical flows identified in research:
   - Resume creation flow
   - Authentication flow  
   - AI analysis features
   - Apply patterns discovered

3. Responsive design validation
4. Document test patterns in .claude/memory/implementation/e2e-tests.md
5. Commit: "test: add E2E tests for critical user flows"
```

#### Task 4.2: Performance Validation [ ]
```
Validate performance improvements:

1. Discovery phase (REQUIRED):
   - Find performance baselines and targets:
     * Look for baseline metrics in research
     * Find performance budgets in specifications
     * Check implementation notes for optimization results
   - Understand measurement methodologies

2. Measure bundle sizes against discovered baselines
3. Test Core Web Vitals using found thresholds
4. Verify build times against targets
5. Compare with baseline metrics
6. Store results in .claude/memory/test-results/performance/
7. Commit: "test: add performance validation suite"
```

#### Task 4.3: Accessibility Audit [ ]
```
Comprehensive accessibility testing:

1. Discovery phase (REQUIRED):
   - Gather accessibility requirements:
     * Find WCAG standards in research
     * Look for accessibility patterns in specifications
     * Check component implementations for applied standards
   - Understand testing methodologies from migration patterns

2. WCAG AA compliance validation using discovered standards
3. Screen reader testing following found patterns
4. Keyboard navigation verification
5. Color contrast verification against specifications
6. Document findings in .claude/memory/test-results/accessibility/
7. Commit: "test: complete accessibility audit"
```

### CI/CD Pipeline [ ]

#### Task 4.4: GitHub Actions Setup [ ]
```
Configure automated quality gates:

1. Research phase (REQUIRED):
   - Check for CI/CD patterns in research
   - If missing, research current best practices
   - Document findings

2. Create .github/workflows/color-migration-ci.yml
3. Set up visual regression with Chromatic
4. Configure performance budgets
5. Add rollback triggers
6. Commit: "ci: establish automated quality gates"
```

## SPARC Phase 5: Completion - Production Deployment [ ]

### Final Optimizations [ ]

#### Task 5.1: Critical CSS Implementation [ ]
```
Optimize initial page load:

1. Research utilization phase (REQUIRED):
   - Check all performance research
   - Review CSS optimization patterns
   - Reference performance test results

2. Extract critical CSS
3. Implement inline critical styles
4. Defer non-critical CSS
5. Measure performance impact
6. Document in .claude/memory/implementation/critical-css.md
7. Commit: "perf: implement critical CSS strategy"
```

#### Task 5.2: Production Monitoring [ ]
```
Implement production monitoring:

1. Research utilization phase (REQUIRED):
   - Check monitoring best practices
   - Review performance targets
   - Reference error patterns from testing

2. Implement performance monitoring
3. Configure error tracking
4. Set up alerting thresholds
5. Create rollback procedures
6. Document in .claude/memory/implementation/production-monitoring.md
7. Commit: "feat: add production monitoring"
```

### Deployment Checklist [ ]

#### Task 5.3: Pre-deployment Validation [ ]
```
Final validation before deployment:

[ ] All tests passing (95%+ coverage)
[ ] Visual regression approved
[ ] Performance budgets met
[ ] Accessibility audit passed
[ ] Rollback plan documented
[ ] Team sign-off received
```

#### Task 5.4: Production Deployment [ ]
```
Deploy to production:

1. Create deployment PR
2. Run final validation
3. Deploy to staging
4. Verify in staging
5. Deploy to production
6. Monitor metrics
7. Commit: "deploy: dark mode removal complete"
```

## Memory Bank Structure

```
.claude/memory/
├── RESOURCES.md             # Created in Task 0.6 (Resource Knowledge Map)
├── research/                # Research from Phase 0
│   ├── color-analysis.md
│   ├── nextjs-15.md
│   ├── nextjs-build-optimization.md    # Added in Task 0.7
│   ├── oklch-color-system.md
│   ├── performance-baseline.md
│   ├── playwright-visual-regression.md  # Added in Task 0.7
│   ├── react-19.md
│   ├── risk-assessment.md
│   └── tailwind-v4.md
├── color-system-spec.md     # From Phase 1 (with OKLCH fallback added)
├── tailwind-v4-spec.md      # From Phase 1 (with validation script added)
├── migration-patterns.md    # From Phase 1 (with animation patterns added)
├── migration-strategy.md    # From Phase 1
├── performance-budgets-quality-gates.md  # From Phase 1
├── implementation/          # Created during Phase 2-5
│   └── tailwind-v4-config.md    # Already started
├── test-results/           # Created during Phase 4
│   ├── visual-regression/
│   ├── accessibility/
│   └── performance/
└── rollback-procedures.md  # To be created during Phase 5
```

## Discovery-Based Development Guidelines

### Core Principle: Explore, Understand, Analyze, Apply

Rather than looking for specific files that may not exist, Claude Code should:

1. **EXPLORE** the `.claude/memory/` directory structure at the start of each task
2. **UNDERSTAND** what resources are available and how they relate to the current task
3. **ANALYZE** gaps in knowledge that could impact implementation success
4. **APPLY** both existing and newly researched knowledge to implementation decisions

### The Power of Gap Analysis

After exploring what exists (Task 0.5), identifying and filling knowledge gaps (Task 0.6) is crucial because:
- **Prevents Implementation Delays**: Missing knowledge won't block progress mid-task
- **Improves Quality**: Better understanding leads to better implementation decisions
- **Reduces Rework**: Fewer surprises mean fewer revisions needed
- **Strengthens Knowledge Base**: New research benefits all future tasks

### Discovery Pattern for Every Task

```
Task Start:
1. List contents of .claude/memory/ and subdirectories
2. Identify files that seem relevant to the current task
3. Read those files to gather comprehensive understanding
4. Note which files contain useful information
5. Apply the knowledge to implementation
6. Document which resources were helpful
```

### Common Discovery Scenarios

**When looking for "best practices":**
- Check all technology-specific files in /research/
- Look for patterns in migration specifications
- Read any quality gates or performance targets

**When implementing components:**
- Check /implementation/ for prior work
- Look for component-specific guidance in risk assessment
- Find patterns in migration specifications
- Read color system and Tailwind specs

**When writing tests:**
- Look for testing strategies in migration patterns
- Check for quality gates and coverage requirements
- Find accessibility standards in research

**When optimizing performance:**
- Find baseline metrics in research
- Look for performance budgets in specifications
- Check for optimization strategies in technology files

### Identifying Critical Knowledge Gaps

A gap is **CRITICAL** if missing it would:
- Block implementation of a core feature
- Cause significant rework later
- Risk breaking existing functionality
- Violate stated performance or quality targets
- Create security or accessibility issues

A gap is **IMPORTANT** if missing it would:
- Reduce code quality or maintainability
- Make implementation less efficient
- Miss optimization opportunities
- Require future refactoring

A gap is **NICE-TO-HAVE** if it would:
- Provide interesting context
- Offer alternative approaches
- Enhance documentation
- Support future features

Focus research time on CRITICAL gaps only to maintain project momentum.

### File Discovery Tips

1. **Use descriptive searches**: Instead of looking for "latest-standards.md", search for concepts like "CSS patterns", "best practices", "accessibility standards"

2. **Check multiple locations**: Specifications might be in root `.claude/memory/`, while research is in `/research/`

3. **Read file headers**: Most files have executive summaries or introductions that quickly indicate their content

4. **Cross-reference files**: Specifications often reference research, and research files may reference each other

5. **Document discoveries**: When you find useful information, note it for future tasks

### Success Indicators

You're using the discovery approach correctly when:
- ✅ You start each task by exploring available resources
- ✅ You work with what exists rather than searching for missing files
- ✅ You synthesize information from multiple sources
- ✅ You document which resources were helpful
- ✅ You add new discoveries back to the knowledge base

### Anti-Patterns to Avoid

- ❌ Searching for specific files that don't exist
- ❌ Skipping tasks because a referenced file is missing
- ❌ Not checking /implementation/ for existing work
- ❌ Ignoring valuable content because it's in a different file than expected
- ❌ Not documenting which resources were useful

Remember: The goal is to leverage ALL available knowledge, regardless of where it's stored. The rich research and specifications from Phase 0 and 1 contain everything needed for successful implementation - Claude Code just needs to discover and use them effectively.

## Success Metrics Dashboard

```
## Migration Progress
- [x] Research Phase Complete ✓
- [x] Specifications Complete ✓
- [x] Resources Discovered & Documented ✓
- [x] Knowledge Gaps Identified & Filled ✓
- [ ] Core Components: 0/15 migrated
- [ ] Feature Components: 0/48 migrated
- [ ] Tests Written: 0/200
- [ ] Performance Target: 0KB/25KB reduced

## Quality Gates
- [ ] Color Validation: PENDING
- [ ] Visual Regression: PENDING
- [ ] Accessibility: PENDING
- [ ] Performance: PENDING
- [ ] E2E Tests: PENDING

## Knowledge Utilization
- [x] All research files explored ✓
- [x] Critical gaps identified and researched ✓
- [ ] Specifications applied to implementation
- [ ] Migration patterns followed consistently
- [ ] Performance targets met
- [ ] Quality gates satisfied
```

## Available Research Summary

The `.claude/memory/` directory contains comprehensive research and specifications from Phase 0 and 1:

### Rich Specifications Available:
- **Color System**: Complete OKLCH professional color system with semantic tokens
- **Tailwind v4**: Detailed CSS-first migration guide with code examples
- **Migration Patterns**: Component migration templates and testing strategies
- **Performance Targets**: Specific budgets and quality gates defined
- **Risk Assessment**: Component-by-component analysis with priority order

### Comprehensive Research Available:
- **Technology Research**: Tailwind v4, Next.js 15, React 19 best practices
- **Color Analysis**: Existing system analysis and OKLCH research
- **Performance Baseline**: Current metrics for comparison
- **Risk Assessment**: Detailed component dependencies and migration priorities

Claude Code has everything needed for successful implementation - the key is discovering and utilizing these rich resources effectively rather than looking for specific files that may not exist.

## Rollback Procedures

### Quick Rollback Commands
```bash
# Component-level rollback
git checkout dark-mode-baseline -- [component-path]

# Feature-level rollback  
git checkout dark-mode-baseline -- components/[feature]/

# Complete rollback
git revert --no-edit dark-mode-removal-start..HEAD
```

### Monitoring Thresholds
```javascript
const rollbackTriggers = {
  errorRateIncrease: 5,      // 5% increase
  performanceDecrease: 20,   // 20% slower
  accessibilityFailures: 1,  // Any failure
  bundleSizeIncrease: 50    // 50KB increase
};
```

## Notes for Claude Code Execution

1. **START with discovery** - Always explore .claude/memory/ before beginning any task
2. **IDENTIFY gaps early** - Use Task 0.6 to fill critical knowledge gaps before implementation
3. **BUILD upon existing work** - Check /implementation/ for work already completed
4. **USE what exists** - Work with available resources rather than searching for missing files
5. **DOCUMENT discoveries** - Note which files provided valuable information
6. **APPLY knowledge** - Use discovered patterns and specifications in implementation
7. **COMMIT frequently** with conventional commit messages
8. **UPDATE progress** in the plan after each task completion
9. **VALIDATE continuously** - Run tests after each change
10. **LEVERAGE all resources** - The rich Phase 0 and 1 work contains everything needed

### Key Success Factors:
- The discovery-based approach ensures flexibility when working with existing resources
- Gap analysis prevents implementation blockers
- Comprehensive specifications and research from Phase 0/1 provide strong foundation
- Progressive knowledge building strengthens the implementation over time