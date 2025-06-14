# Authentication Page Color Fix Plan

## Issue Summary
The authentication pages (login and register) are displaying incorrect colors:
- Input fields have dark backgrounds instead of white
- Text in fields appears light instead of black
- "Or continue with" text has a dark background
- OAuth buttons don't show proper brand colors

## Root Cause Analysis
1. **Theme Default**: The app is set to `defaultTheme="system"` which automatically uses the OS dark mode setting
2. **Legacy Color Classes**: Auth pages use non-semantic Tailwind classes (e.g., `text-gray-700`, `bg-gray-50`)
3. **Inconsistent Token Usage**: Mix of semantic tokens and direct color classes

## Implementation Plan

### Phase 1: Set Default Theme to Light
**File**: `app/layout.tsx` (line 91)
```tsx
// Change from:
defaultTheme="system"
// To:
defaultTheme="light"
```

### Phase 2: Replace Legacy Color Classes

#### Auth Pages
**Files**: 
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`

**Changes**:
| Current Class | Replace With | Location |
|--------------|--------------|----------|
| `bg-gray-50` | `bg-muted/5` | Root div background |
| `bg-white` | `bg-background` | Card background |
| `text-gray-600` | `text-muted-foreground` | Subtitle text |
| `text-gray-500` | `text-muted-foreground` | Footer text |
| `text-blue-600` | `text-primary` | Links |
| `text-blue-900` | `text-primary-foreground` | Logo |

#### Auth Forms
**Files**:
- `components/auth/login-form.tsx`
- `components/auth/register-form.tsx`

**Changes**:
| Current Class | Replace With | Lines |
|--------------|--------------|-------|
| `text-gray-700` | `text-foreground` | Label text (multiple locations) |
| `text-destructive` | Keep as is | Error text |

### Phase 3: Component Updates

#### Input Component
**File**: `components/ui/input.tsx`

**Current state is mostly correct**, only minor adjustment needed:
```tsx
// Change disabled state from:
"disabled:bg-muted"
// To:
"disabled:bg-muted/20"
```

#### OAuth Buttons
**Files**:
- `components/auth/oauth-buttons/google-oauth-button.tsx`
- `components/auth/oauth-buttons/linkedin-oauth-button.tsx`

**No changes needed** - buttons already use semantic tokens correctly:
- Google: `bg-background hover:bg-muted` ✓
- LinkedIn: `bg-background hover:bg-muted` (non-priority) ✓
- LinkedIn: `bg-[#0077B5]` (priority mode - brand color) ✓

### Phase 4: Verification Checklist

- [ ] Default theme changed to "light" in layout.tsx
- [ ] All `bg-gray-*` classes replaced with semantic tokens
- [ ] All `text-gray-*` classes replaced with semantic tokens
- [ ] All `text-blue-*` classes replaced with semantic tokens
- [ ] Input component disabled state updated
- [ ] "Or continue with" text has proper background (no change needed)
- [ ] OAuth buttons display correctly

## Testing Plan

1. **Light Mode Testing**:
   - [ ] Input fields show white background
   - [ ] Input text is black
   - [ ] Labels are clearly visible
   - [ ] OAuth buttons show proper colors
   - [ ] "Or continue with" divider is visible

2. **Dark Mode Testing** (manual switch):
   - [ ] All elements remain accessible
   - [ ] Proper contrast maintained
   - [ ] Semantic tokens adapt correctly

3. **Cross-Browser Testing**:
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge

## Rollback Plan
If issues arise:
1. Revert `defaultTheme` to "system"
2. Revert semantic token changes
3. Document any unexpected behavior for further investigation

## Notes
- This plan follows Victry's Tailwind v4 patterns using semantic tokens
- No direct color classes (e.g., `bg-gray-900`) are used
- Changes are minimal and leverage existing theming infrastructure
- OAuth brand colors are preserved for authenticity

## Future Considerations
- Consider adding a theme toggle in the UI
- Evaluate if auth pages should always force light mode
- Review other pages for legacy color class usage