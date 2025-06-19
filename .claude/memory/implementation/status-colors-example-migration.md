# Example: Migrating Application Tracking Component

This demonstrates how to migrate from hardcoded status colors to the new semantic status color utility.

## Before (Current Implementation)

```typescript
// application-tracking.tsx (lines 49-89)
const STATUS_COLORS: Record<
  ApplicationStatus,
  { bg: string; text: string; border: string }
> = {
  saved: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  },
  applied: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
  interviewing: {
    bg: "bg-warning/10",
    text: "text-warning-foreground",
    border: "border-warning/20",
  },
  // ... more statuses
};

// Usage (line 846-850)
<span
  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
    STATUS_COLORS[app.status].bg
  } ${STATUS_COLORS[app.status].text}`}
>
  {STATUS_LABELS[app.status]}
</span>
```

## After (With Semantic Status Colors)

```typescript
// application-tracking.tsx
import { 
  getSemanticStatus, 
  getStatusBadgeClasses,
  getStatusColors,
  getStatusClasses 
} from '@/lib/utils/status-colors';

// Remove the STATUS_COLORS object entirely

// Simple usage - for badges
<span className={getStatusBadgeClasses(getSemanticStatus(app.status))}>
  {STATUS_LABELS[app.status]}
</span>

// Or if you need more control
const semanticStatus = getSemanticStatus(app.status);
const statusColors = getStatusColors(semanticStatus, 'soft');

<span
  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColors.background} ${statusColors.foreground}`}
>
  {STATUS_LABELS[app.status]}
</span>

// For the status history dots (line 976-979)
// Before:
<div
  className={`mt-1.5 h-2 w-2 rounded-full ${
    STATUS_COLORS[history.status].bg
  } ${STATUS_COLORS[history.status].border}`}
></div>

// After:
<div
  className={`mt-1.5 h-2 w-2 rounded-full ${
    getStatusClasses(getSemanticStatus(history.status), 'soft')
  }`}
></div>

// For interactive status buttons in Kanban view (lines 1111-1114)
// Before:
className="rounded p-1 text-warning-foreground hover:bg-warning/10"

// After:
className={`rounded p-1 ${getStatusClasses('active', 'ghost')}`}
```

## Key Benefits

1. **Consistency**: All status colors now follow the same semantic system
2. **Maintainability**: Changes to color scheme only need updates in one place
3. **Type Safety**: Full TypeScript support prevents invalid status/variant combinations
4. **Flexibility**: Multiple variants (solid, soft, outline, ghost) for different UI needs
5. **Zero Hardcoded Colors**: All colors come from CSS variables defined in globals.css

## Migration Steps

1. Import the necessary functions from `@/lib/utils/status-colors`
2. Remove any local STATUS_COLORS or similar objects
3. Replace color class concatenation with utility function calls
4. Use `getSemanticStatus()` to convert app-specific statuses to semantic ones
5. Choose appropriate variant based on UI context:
   - `soft` - Default for badges and indicators
   - `solid` - High emphasis, filled backgrounds
   - `outline` - Medium emphasis, bordered
   - `ghost` - Low emphasis, hover states

## Testing Checklist

- [ ] Visual appearance matches original design
- [ ] Hover states work correctly
- [ ] All status types display with appropriate colors
- [ ] No TypeScript errors
- [ ] No hardcoded color values remain
- [ ] Component tests pass