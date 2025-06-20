# ATS Score Component Migration

## Discovery Process
- **Resources consulted**: RESOURCES.md (status-colors-utility, globals.css for CSS variables)
- **Similar components found**: Badge component (dynamic status coloring), Slider (progress visualization)
- **Patterns discovered**: Score-based status mapping, SVG currentColor technique

## Implementation Details

### Approach
The ATS Score component uses dynamic coloring based on numeric scores and severity levels. Key migration patterns:

1. **Score-to-Status Mapping**:
   ```typescript
   // Before
   if (score >= 80) return "text-green-700 bg-green-100";
   if (score >= 60) return "text-yellow-700 bg-yellow-100";
   return "text-destructive bg-destructive/10";
   
   // After
   const getScoreStatus = (score: number) => {
     if (score >= 80) return "success";
     if (score >= 60) return "warning";
     return "error";
   };
   ```

2. **Severity-to-Status Mapping**:
   ```typescript
   // Severity levels map directly to semantic status types
   high → error (critical issues)
   medium → warning (moderate issues)
   low → info (minor issues)
   ```

3. **SVG Color Variables**:
   - Used `stroke="currentColor"` with Tailwind text color classes
   - Replaced hex colors (#10B981, #FBBF24, #EF4444) with semantic tokens
   - Background circle uses `text-muted/20` for subtle contrast

4. **Consistent Semantic Replacements**:
   - `text-gray-*` → `text-muted-foreground` or `text-foreground`
   - `bg-gray-50` → `bg-muted/50`
   - `bg-blue-50` → `bg-info/10`
   - `text-blue-*` → `text-info`

### Challenges
- SVG stroke colors needed the `currentColor` technique since they can't use CSS classes directly
- Multiple color variations for the same conceptual state (score visualization)

### Effort: Medium
- Component had extensive color usage (20+ replacements)
- Required understanding of score-based color logic
- SVG color handling added complexity

## Knowledge Contribution

### New Patterns

#### Pattern 15: Score-Based Status Mapping
- **Rule**: "Map numeric ranges to semantic status types using consistent thresholds"
- **Example**:
  - 80-100% → success
  - 60-79% → warning
  - 0-59% → error
- **Found in**: ATS Score, Progress indicators
- **Automation**: High
- **Exceptions**: None

#### Pattern 16: SVG Semantic Colors
- **Rule**: "Use stroke='currentColor' with text color classes for SVG elements"
- **Example**:
  ```jsx
  // Before
  <circle stroke="#10B981" />
  
  // After
  <circle stroke="currentColor" className="text-success" />
  ```
- **Found in**: ATS Score circular progress, chart components
- **Automation**: High
- **Exceptions**: None when SVG accepts className

### Automation Potential
- High - Score threshold mapping is predictable
- SVG color replacement can be automated with the currentColor pattern
- Severity mapping follows consistent patterns

### Surprises
- The component already used `text-destructive` in one place, showing partial semantic adoption
- SVG elements can effectively use Tailwind classes via currentColor
- Info variant colors work well for low-priority feedback UI