/**
 * Semantic Status Color Utilities
 * 
 * Purpose: Provide a centralized, semantic approach to status colors
 * replacing hardcoded color values throughout the application.
 * 
 * Based on Phase 3 migration requirements:
 * - Zero hardcoded colors
 * - Semantic meaning preserved
 * - WCAG AA compliant
 * - Consistent with OKLCH color system
 */

/**
 * Status types supported in the application
 */
export type StatusType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'neutral'
  | 'pending'
  | 'active';

/**
 * Importance levels for status indicators
 */
export type ImportanceLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Style variant for status display
 */
export type StatusVariant = 'solid' | 'soft' | 'outline' | 'ghost';

/**
 * Status color configuration
 */
interface StatusColorConfig {
  background: string;
  foreground: string;
  border: string;
}

/**
 * Get semantic color classes for a status type and variant
 * 
 * @param status - The status type
 * @param variant - The style variant (default: 'soft')
 * @returns Object with background, text, and border classes
 * 
 * @example
 * getStatusColors('success', 'solid')
 * // Returns: { bg: 'bg-success', text: 'text-success-foreground', border: 'border-success' }
 */
export function getStatusColors(
  status: StatusType,
  variant: StatusVariant = 'soft'
): StatusColorConfig {
  const colorMap: Record<StatusType, Record<StatusVariant, StatusColorConfig>> = {
    success: {
      solid: {
        background: 'bg-success',
        foreground: 'text-white',
        border: 'border-success',
      },
      soft: {
        background: 'bg-success/10',
        foreground: 'text-success-foreground',
        border: 'border-success/20',
      },
      outline: {
        background: 'bg-transparent',
        foreground: 'text-success',
        border: 'border-success',
      },
      ghost: {
        background: 'bg-transparent hover:bg-success/10',
        foreground: 'text-success',
        border: 'border-transparent',
      },
    },
    error: {
      solid: {
        background: 'bg-destructive',
        foreground: 'text-destructive-foreground',
        border: 'border-destructive',
      },
      soft: {
        background: 'bg-destructive/10',
        foreground: 'text-destructive',
        border: 'border-destructive/20',
      },
      outline: {
        background: 'bg-transparent',
        foreground: 'text-destructive',
        border: 'border-destructive',
      },
      ghost: {
        background: 'bg-transparent hover:bg-destructive/10',
        foreground: 'text-destructive',
        border: 'border-transparent',
      },
    },
    warning: {
      solid: {
        background: 'bg-warning',
        foreground: 'text-warning-foreground',
        border: 'border-warning',
      },
      soft: {
        background: 'bg-warning/10',
        foreground: 'text-warning-foreground',
        border: 'border-warning/20',
      },
      outline: {
        background: 'bg-transparent',
        foreground: 'text-warning-foreground',
        border: 'border-warning',
      },
      ghost: {
        background: 'bg-transparent hover:bg-warning/10',
        foreground: 'text-warning-foreground',
        border: 'border-transparent',
      },
    },
    info: {
      solid: {
        background: 'bg-info',
        foreground: 'text-white',
        border: 'border-info',
      },
      soft: {
        background: 'bg-info/10',
        foreground: 'text-info',
        border: 'border-info/20',
      },
      outline: {
        background: 'bg-transparent',
        foreground: 'text-info',
        border: 'border-info',
      },
      ghost: {
        background: 'bg-transparent hover:bg-info/10',
        foreground: 'text-info',
        border: 'border-transparent',
      },
    },
    neutral: {
      solid: {
        background: 'bg-muted',
        foreground: 'text-muted-foreground',
        border: 'border-border',
      },
      soft: {
        background: 'bg-muted',
        foreground: 'text-muted-foreground',
        border: 'border-border',
      },
      outline: {
        background: 'bg-transparent',
        foreground: 'text-muted-foreground',
        border: 'border-border',
      },
      ghost: {
        background: 'bg-transparent hover:bg-muted',
        foreground: 'text-muted-foreground',
        border: 'border-transparent',
      },
    },
    pending: {
      solid: {
        background: 'bg-primary',
        foreground: 'text-primary-foreground',
        border: 'border-primary',
      },
      soft: {
        background: 'bg-primary/10',
        foreground: 'text-primary',
        border: 'border-primary/20',
      },
      outline: {
        background: 'bg-transparent',
        foreground: 'text-primary',
        border: 'border-primary',
      },
      ghost: {
        background: 'bg-transparent hover:bg-primary/10',
        foreground: 'text-primary',
        border: 'border-transparent',
      },
    },
    active: {
      solid: {
        background: 'bg-accent',
        foreground: 'text-accent-foreground',
        border: 'border-accent',
      },
      soft: {
        background: 'bg-accent/10',
        foreground: 'text-accent-foreground',
        border: 'border-accent/20',
      },
      outline: {
        background: 'bg-transparent',
        foreground: 'text-accent-foreground',
        border: 'border-accent',
      },
      ghost: {
        background: 'bg-transparent hover:bg-accent/10',
        foreground: 'text-accent-foreground',
        border: 'border-transparent',
      },
    },
  };

  return colorMap[status][variant];
}

/**
 * Get status classes as a concatenated string for direct use in className
 * 
 * @param status - The status type
 * @param variant - The style variant (default: 'soft')
 * @param includeHover - Whether to include hover states (default: true)
 * @returns Concatenated className string
 * 
 * @example
 * <div className={getStatusClasses('success', 'soft')}>
 *   Success message
 * </div>
 */
export function getStatusClasses(
  status: StatusType,
  variant: StatusVariant = 'soft',
  includeHover: boolean = true
): string {
  const colors = getStatusColors(status, variant);
  const baseClasses = `${colors.background} ${colors.foreground} ${colors.border}`;
  
  if (!includeHover || variant === 'solid') {
    return baseClasses;
  }
  
  // Add hover states for interactive variants
  const hoverMap: Record<StatusType, string> = {
    success: 'hover:bg-success/20',
    error: 'hover:bg-destructive/20',
    warning: 'hover:bg-warning/20',
    info: 'hover:bg-info/20',
    neutral: 'hover:bg-muted',
    pending: 'hover:bg-primary/20',
    active: 'hover:bg-accent/20',
  };
  
  return `${baseClasses} ${variant !== 'ghost' ? hoverMap[status] : ''}`;
}

/**
 * Map importance levels to status types
 * Useful for components that use importance rather than explicit status
 * 
 * @param importance - The importance level
 * @returns The corresponding status type
 */
export function importanceToStatus(importance: ImportanceLevel): StatusType {
  const importanceMap: Record<ImportanceLevel, StatusType> = {
    low: 'neutral',
    medium: 'info',
    high: 'warning',
    critical: 'error',
  };
  
  return importanceMap[importance];
}

/**
 * Get status icon suggestions
 * Returns icon component names (Lucide React) appropriate for each status
 * 
 * @param status - The status type
 * @returns Suggested icon name
 */
export function getStatusIcon(status: StatusType): string {
  const iconMap: Record<StatusType, string> = {
    success: 'CheckCircle',
    error: 'XCircle',
    warning: 'AlertCircle',
    info: 'Info',
    neutral: 'Circle',
    pending: 'Clock',
    active: 'Activity',
  };
  
  return iconMap[status];
}

/**
 * Application-specific status mappings
 * Maps domain-specific statuses to semantic status types
 */
export const applicationStatusMap: Record<string, StatusType> = {
  // Job application statuses
  saved: 'neutral',
  applied: 'pending',
  interviewing: 'active',
  offer: 'active',
  accepted: 'success',
  rejected: 'error',
  withdrawn: 'neutral',
  
  // General statuses
  complete: 'success',
  completed: 'success',
  failed: 'error',
  inProgress: 'pending',
  'in-progress': 'pending',
  pending: 'pending',
  active: 'active',
  inactive: 'neutral',
  disabled: 'neutral',
  
  // Import/Export statuses
  importing: 'pending',
  exporting: 'pending',
  imported: 'success',
  exported: 'success',
  importFailed: 'error',
  exportFailed: 'error',
};

/**
 * Get semantic status from application-specific status
 * 
 * @param appStatus - Application-specific status string
 * @returns Semantic status type
 */
export function getSemanticStatus(appStatus: string): StatusType {
  return applicationStatusMap[appStatus] || 'neutral';
}

/**
 * Compose status classes with additional classes
 * Useful for adding custom styles while maintaining semantic colors
 * 
 * @param status - The status type
 * @param variant - The style variant
 * @param additionalClasses - Additional CSS classes to apply
 * @returns Combined className string
 */
export function composeStatusClasses(
  status: StatusType,
  variant: StatusVariant = 'soft',
  additionalClasses: string = ''
): string {
  const statusClasses = getStatusClasses(status, variant);
  return additionalClasses ? `${statusClasses} ${additionalClasses}` : statusClasses;
}

/**
 * Status badge presets for common UI patterns
 */
export const statusBadgeClasses = {
  default: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  small: 'inline-flex items-center rounded-full px-2 py-0.5 text-xs',
  large: 'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
  pill: 'inline-flex items-center rounded-full px-3 py-1.5 text-sm',
  square: 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
};

/**
 * Get complete badge classes with status colors
 * 
 * @param status - The status type
 * @param size - Badge size preset
 * @param variant - The style variant
 * @returns Complete className string for badge
 */
export function getStatusBadgeClasses(
  status: StatusType,
  size: keyof typeof statusBadgeClasses = 'default',
  variant: StatusVariant = 'soft'
): string {
  return `${statusBadgeClasses[size]} ${getStatusClasses(status, variant, false)}`;
}

/**
 * Map score values to semantic status types
 * Uses Pattern 15: Score-Based Status Mapping with consistent thresholds
 * 
 * @param score - Numeric score (0-100)
 * @returns Semantic status type based on score thresholds
 * 
 * @example
 * getScoreStatus(85) // Returns 'success'
 * getScoreStatus(65) // Returns 'warning' 
 * getScoreStatus(45) // Returns 'error'
 */
export function getScoreStatus(score: number): StatusType {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}

/**
 * Skill level type definition
 */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Map skill levels to semantic status types
 * Uses Pattern 8: Skill Level Status Mapping with logical progression
 * 
 * @param level - Skill proficiency level
 * @returns Semantic status type representing skill progression
 * 
 * @example
 * skillLevelToStatus('expert') // Returns 'success'
 * skillLevelToStatus('intermediate') // Returns 'pending'
 * skillLevelToStatus('beginner') // Returns 'info'
 */
export function skillLevelToStatus(level: SkillLevel): StatusType {
  const levelMap: Record<SkillLevel, StatusType> = {
    beginner: 'info',        // Blue - learning/informational
    intermediate: 'pending', // Purple - developing/in progress
    advanced: 'active',      // Accent - skilled/active
    expert: 'success',       // Green - mastered/successful
  };
  
  return levelMap[level];
}