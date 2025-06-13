# Victry Code Patterns

## 🎨 Styling Patterns (CRITICAL - MUST FOLLOW)

### Component Styling Pattern
```typescript
// ✅ CORRECT: Semantic tokens with CVA
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    }
  }
);

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// ❌ WRONG: Hard-coded colors
className="bg-blue-500 text-white hover:bg-blue-600" // NEVER do this
className="border-gray-200 bg-gray-50"               // NEVER do this
```

### Status Color Pattern
```typescript
// ✅ CORRECT: Use status utilities
import { getStatusClasses, getScoreStatus } from '@/lib/utils/status-colors';

// For dynamic status
const score = 85;
const status = getScoreStatus(score); // 'success'
<div className={getStatusClasses(status)}>
  Score: {score}%
</div>

// For static status
<Badge variant="warning">Pending</Badge>
<Alert className={getStatusClasses('error')}>Error occurred</Alert>

// ❌ WRONG: Hard-coded status colors
className="bg-green-100 text-green-700"  // NEVER
className="bg-red-50 border-red-200"     // NEVER
```

### CSS-First Tailwind v4 Pattern
```css
/* ✅ CORRECT: Define utilities in globals.css */
@utility card-professional {
  border-radius: var(--radius-lg);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  
  &:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
}

/* Then use in components */
<Card className="card-professional" />
```

### Performance Patterns
```typescript
// ✅ CORRECT: CSS containment for performance
<Card className="contain-paint">
  {/* Isolated paint operations */}
</Card>

<section className="contain-content">
  {/* Layout-independent content */}
</section>

// ✅ CORRECT: Content visibility for long lists
<div className="resume-section content-visibility-auto">
  {/* Off-screen content optimization */}
</div>
```

### Complete Component Example
```typescript
import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-background border-border",
        elevated: "bg-background border-border shadow-md",
        muted: "bg-muted border-muted-foreground/20",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card, cardVariants };
```

## Resume Data Structure (Complex Nested)

```typescript
interface Resume {
  id: string;
  user_id: string;
  personal_info: PersonalInfo;           // Contact + summary
  work_experiences: WorkExperience[];    // Array with achievements
  education: Education[];                // Schools, degrees, dates  
  skills: Skill[];                      // Categorized by type
  certifications: Certification[];       // With expiration tracking
  custom_sections: CustomSection[];      // User-defined sections
  created_at: string;
  updated_at: string;
}

// Always validate complex nested data
import { resumeSchema } from '/lib/utils/validation';

// Database ↔ Application Layer Transformations
// Supabase returns snake_case, app uses camelCase
// Automatic transformation in resume-service.ts:
// database: work_experiences → app: workExperiences
// database: custom_sections → app: customSections
```

## AI Integration Pattern

```typescript
// ✅ API Route Structure
export async function POST(request: Request) {
  // 1. Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Check premium access for AI features
  if (isPremiumFeature && !user?.subscription) {
    return createApiError('Premium required', ErrorCategory.PERMISSION, 403);
  }
  
  // 3. Call AI service with proper error handling
  try {
    const result = await analyzeJobDescription(body.jobDescription);
    return NextResponse.json({ data: result });
  } catch (error) {
    return createApiError('AI analysis failed', ErrorCategory.AI, 500);
  }
}
```

## Resume Development Process (5 Steps)

```bash
# When adding new resume fields:
1. Update /supabase/migrations/ - Add database columns/tables
2. Update /types/resume.ts - Add TypeScript interfaces  
3. Update /lib/services/resume-service.ts - Add business logic
4. Update /components/resume/section-editor/ - Add UI components
5. Update /components/resume/resume-preview.tsx - Add display logic
```

## Supabase Client Usage Patterns

```typescript
// ✅ Client components ("use client")
import { createClient } from "@/lib/supabase/browser";

// ✅ API routes & server components
import { createClient } from "@/lib/supabase/server";

// ✅ Client-safe analytics
import { clientAnalytics } from "@/lib/utils/client-analytics";
```

## Authentication Patterns

```typescript
// Profile auto-creation trigger active
- New users get profiles automatically via DB trigger
- Check /supabase/migrations/20250609153510_add_profile_creation_trigger.sql
- Use /lib/supabase/browser.ts for client components
- Use /lib/supabase/server.ts for API routes
```

## AI Tools & Structured Extraction

```typescript
// Claude tools with JSON schema validation
import { createTool } from '@/lib/ai/claude-tools';

// Structured data extraction with fallback parsing
- Primary: Claude tools with JSON schema
- Fallback: Manual parsing for unstructured responses
- Temperature tuning: 0.2 (factual) to 0.5 (creative)
```

## Tailwind v4 Development Patterns

### Component Development
- Always use `data-slot` attributes for component variants
- Prefer CSS variables over direct color classes
- Use semantic color names (primary, secondary, muted, destructive, warning, etc.)
- Leverage @utility for custom component styles

### Semantic Color System
```typescript
// ✅ Use semantic color tokens
className="bg-primary text-primary-foreground"
className="bg-destructive/10 text-destructive-foreground"
className="bg-muted text-muted-foreground"

// ❌ Avoid direct color classes
className="bg-blue-500 text-white"  // Legacy pattern
className="bg-gray-100 text-gray-700"  // Legacy pattern
```

### Best Practices
- CSS-first configuration in globals.css
- OKLCH color space for better color accuracy
- Custom variants for theme switching
- Performance-optimized utility generation