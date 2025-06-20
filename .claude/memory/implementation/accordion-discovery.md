# Accordion Migration Discovery

## Discovery Process
- Resources consulted: RESOURCES.md (animation patterns, surface patterns, component risk assessment)
- Similar components found: Dialog (already semantic), Switch (data-state pattern), Tooltip (CSS animations)
- Patterns discovered: Accordion already semantic, CSS keyframe animations, consumer cleanup pattern

## Implementation Details
- Approach: Analysis-first strategy revealed Accordion was already semantic (zero dark mode classes)
- Challenges: Consumer components had extensive hardcoded colors requiring systematic migration
- Effort: Low for component (already semantic), Medium for consumer cleanup

## Key Discoveries

### 1. Accordion Component Already Semantic
The Accordion component itself contains **zero dark mode classes** and is already using semantic tokens:
- Uses `border-b` for borders
- Uses `text-muted-foreground` for muted text
- Implements CSS keyframe animations for expand/collapse
- Follows Radix UI best practices with data-state attributes

### 2. CSS Keyframe Animations (Pattern 14 candidate)
Accordion uses sophisticated CSS animations defined in globals.css:
```css
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

Applied via data attributes:
- `data-[state=open]:animate-accordion-down`
- `data-[state=closed]:animate-accordion-up`

This pattern is reusable for any collapsible/expandable components.

### 3. Consumer Cleanup Pattern
While the component was semantic, all 4 consumer components (work-experience, projects, education, certifications) had extensive hardcoded colors:

Common migrations needed:
- `hover:bg-gray-50` → `hover:bg-muted`
- `data-[state=open]:bg-gray-50` → `data-[state=open]:bg-muted`
- `text-gray-500/600/400` → `text-muted-foreground`
- `text-gray-700` → `text-foreground`
- `bg-white` → `bg-background`
- `bg-gray-50` → `bg-muted`
- `text-red-500` (required fields) → `text-destructive`
- `text-red-600` → `text-destructive`
- `hover:bg-red-50 hover:text-red-700` → `hover:bg-destructive/10 hover:text-destructive`
- `text-blue-600 hover:text-blue-700` → `text-primary hover:text-primary`

## Consumer Components Migrated
1. `work-experience.tsx` - 15 color replacements
2. `projects.tsx` - 14 color replacements
3. `education.tsx` - Similar pattern (not migrated in this session)
4. `certifications.tsx` - Similar pattern (not migrated in this session)

## Knowledge Contribution
- New patterns: CSS keyframe animations for collapsible components (Pattern 14 candidate)
- Automation potential: High - consumer color replacements follow identical patterns
- Surprises: Component was already perfect, but consumers needed extensive cleanup

## Pattern 14 Proposal
**Pattern: CSS Keyframe Animations for Collapsible Components**
- **Rule**: "Use CSS keyframes with data-state attributes for smooth expand/collapse animations"
- **Example**:
  - Animation: `@keyframes accordion-down` with CSS custom properties
  - Application: `data-[state=open]:animate-accordion-down`
- **Found in**: Accordion component
- **Automation**: Medium (animation names vary by component)
- **Exceptions**: None - universally applicable to collapsible UI

## Lessons Learned
1. Always check component AND consumer files - semantic components can have non-semantic usage
2. Radix UI components tend to be well-implemented with semantic patterns
3. CSS-first animations with data attributes are superior to JavaScript animations
4. Consumer cleanup can be more work than component migration
5. Analysis-first approach saves time by avoiding unnecessary work