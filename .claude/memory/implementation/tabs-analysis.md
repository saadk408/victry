# Tabs Component Analysis

## Component Location
- **Main file**: `/components/ui/tabs.tsx`
- **Type**: Core UI component
- **Dependencies**: @radix-ui/react-tabs
- **Risk Level**: HIGH (as noted in risk assessment)

## Dark Mode Classes Found (6 instances)
1. Line 60: `dark:bg-gray-800 dark:text-gray-400` (TabsList)
2. Line 129: `dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300` (TabsTrigger base)
3. Line 134: `dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50` (TabsTrigger default)
4. Line 136: `dark:data-[state=active]:border-gray-50 dark:data-[state=active]:text-gray-50` (TabsTrigger underlined)
5. Line 137: `dark:hover:bg-gray-800 dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900` (TabsTrigger pill)
6. Line 216: `dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300` (TabsContent)

## Hardcoded Colors Found
### Gray Scale Colors
- `bg-gray-100` (line 60) - TabsList background
- `text-gray-500` (line 60) - TabsList text
- `bg-gray-800` (line 60) - TabsList dark background
- `text-gray-400` (line 60) - TabsList dark text
- `focus-visible:ring-gray-950` (line 129) - Focus ring
- `ring-offset-gray-950` (line 129) - Ring offset
- `focus-visible:ring-gray-300` (line 129) - Dark focus ring
- `bg-white` (line 134) - Active tab background
- `text-gray-950` (line 134) - Active tab text
- `bg-gray-950` (line 134) - Dark active tab background
- `text-gray-50` (line 134) - Dark active tab text
- `border-gray-950` (line 136) - Underlined active border
- `text-gray-950` (line 136) - Underlined active text
- `border-gray-50` (line 136) - Dark underlined active border
- `text-gray-50` (line 136) - Dark underlined active text
- `bg-gray-100` (line 137) - Pill hover background
- `bg-gray-900` (line 137) - Pill active background
- `bg-gray-800` (line 137) - Dark pill hover background
- `bg-gray-100` (line 137) - Dark pill active background
- `text-gray-900` (line 137) - Dark pill active text
- `ring-gray-950` (line 216) - TabsContent focus ring
- `ring-gray-300` (line 216) - TabsContent dark focus ring
- `ring-offset-white` (line 216) - TabsContent ring offset

### Other Colors
- `text-white` (line 137) - Pill active text
- `shadow-xs` (line 134) - Shadow on active default tab

## Animation/Transition Usage
1. **CSS Transitions**: 
   - Line 129: `transition-all` in TabsTrigger base styles
   
2. **CSS Animation Classes**:
   - Line 210: `animate-fade-in` class conditionally applied when `animate` prop is true
   - The animation class is referenced but not defined in the component file
   - Animation is opt-in via the `animate` prop (default: false)

3. **No JavaScript animations** - Pure CSS approach

## Component Structure
- **Tabs**: Root component (wrapper around Radix UI)
- **TabsList**: Container for tab triggers with variants:
  - Default: Horizontal inline-flex
  - Vertical: Column layout with max-width
  - Full width: Grid layout
- **TabsTrigger**: Individual tab buttons with variants:
  - Default: Rounded with shadow when active
  - Underlined: Bottom border when active
  - Pill: Rounded full with different hover/active states
- **TabsContent**: Content panels with optional fade-in animation

## Consumer Usage Patterns
1. **Resume Editor** (`/app/resume/[id]/edit/page.tsx`):
   - Uses dynamic imports for tab panels
   - Three tabs: Templates, Score, Job Match
   - Uses `animate={true}` on TabsContent
   - Custom className on TabsList: `w-full`
   - Custom className on TabsTrigger: `flex-1`

2. **Application Tracking** (`/components/analytics/application-tracking.tsx`):
   - Uses tabs for filtering applications by status

3. **Multiple Other Consumers**:
   - Cover Letter Editor
   - Profile Editor
   - Import Controls
   - Resume Tailor Page
   - Performance Test Page

## Complexity Factors
1. **Multiple Style Variants**: Three distinct visual styles (default, underlined, pill)
2. **State-Based Styling**: Heavy use of `data-[state=active]` selectors
3. **Focus Management**: Complex focus-visible styles
4. **Animation Support**: Optional CSS animations
5. **Orientation Support**: Both horizontal and vertical layouts
6. **Debug Logging**: Contains console.log statements for debugging
7. **Icon and Badge Support**: Additional elements within triggers
8. **Loading States**: Support for loading content

## Migration Challenges
1. **Variant Complexity**: Three different visual styles need semantic tokens
2. **State Selectors**: Multiple `data-[state=active]` styles to migrate
3. **Focus Styles**: Need to maintain accessibility with semantic colors
4. **Animation**: Need to ensure animate-fade-in works with new system
5. **Consumer Impact**: 8+ consumer components may need updates
6. **Shadow Utility**: `shadow-xs` needs semantic replacement

## Pattern Opportunities
- Could follow Pattern 11 (overlay components) for focus rings
- Pattern 12 (toggle state indication) might apply to active states
- Need new pattern for multi-variant components
- Animation pattern from Pattern 14 could be relevant

## Recommended Migration Approach
1. Start with analysis of all three variants
2. Create semantic tokens for tab-specific states
3. Test each variant thoroughly
4. Update animation classes if needed
5. Verify all consumer components still work
6. Pay special attention to the pill variant (most complex)