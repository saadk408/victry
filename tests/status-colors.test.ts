import { describe, expect, test } from '@jest/globals';
import {
  getStatusColors,
  getStatusClasses,
  importanceToStatus,
  getStatusIcon,
  getSemanticStatus,
  composeStatusClasses,
  getStatusBadgeClasses,
  type StatusType,
  type StatusVariant,
  type ImportanceLevel,
} from '../lib/utils/status-colors';

describe('Status Color Utilities', () => {
  describe('getStatusColors', () => {
    test('returns correct colors for success status', () => {
      const colors = getStatusColors('success', 'soft');
      expect(colors).toEqual({
        background: 'bg-success/10',
        foreground: 'text-success-foreground',
        border: 'border-success/20',
      });
    });

    test('returns correct colors for error status with solid variant', () => {
      const colors = getStatusColors('error', 'solid');
      expect(colors).toEqual({
        background: 'bg-destructive',
        foreground: 'text-destructive-foreground',
        border: 'border-destructive',
      });
    });

    test('defaults to soft variant when not specified', () => {
      const colors = getStatusColors('warning');
      expect(colors).toEqual({
        background: 'bg-warning/10',
        foreground: 'text-warning-foreground',
        border: 'border-warning/20',
      });
    });

    test('handles all status types', () => {
      const statusTypes: StatusType[] = ['success', 'error', 'warning', 'info', 'neutral', 'pending', 'active'];
      statusTypes.forEach(status => {
        const colors = getStatusColors(status);
        expect(colors).toBeDefined();
        expect(colors.background).toBeTruthy();
        expect(colors.foreground).toBeTruthy();
        expect(colors.border).toBeTruthy();
      });
    });

    test('handles all variants', () => {
      const variants: StatusVariant[] = ['solid', 'soft', 'outline', 'ghost'];
      variants.forEach(variant => {
        const colors = getStatusColors('success', variant);
        expect(colors).toBeDefined();
        expect(colors.background).toBeTruthy();
        expect(colors.foreground).toBeTruthy();
        expect(colors.border).toBeTruthy();
      });
    });
  });

  describe('getStatusClasses', () => {
    test('returns concatenated classes for status', () => {
      const classes = getStatusClasses('success', 'soft');
      expect(classes).toContain('bg-success/10');
      expect(classes).toContain('text-success-foreground');
      expect(classes).toContain('border-success/20');
      expect(classes).toContain('hover:bg-success/20');
    });

    test('excludes hover states for solid variant', () => {
      const classes = getStatusClasses('error', 'solid');
      expect(classes).not.toContain('hover:bg-destructive/20');
    });

    test('excludes hover states when includeHover is false', () => {
      const classes = getStatusClasses('info', 'soft', false);
      expect(classes).not.toContain('hover:');
    });
  });

  describe('importanceToStatus', () => {
    test('maps importance levels correctly', () => {
      expect(importanceToStatus('low')).toBe('neutral');
      expect(importanceToStatus('medium')).toBe('info');
      expect(importanceToStatus('high')).toBe('warning');
      expect(importanceToStatus('critical')).toBe('error');
    });
  });

  describe('getStatusIcon', () => {
    test('returns correct icon names', () => {
      expect(getStatusIcon('success')).toBe('CheckCircle');
      expect(getStatusIcon('error')).toBe('XCircle');
      expect(getStatusIcon('warning')).toBe('AlertCircle');
      expect(getStatusIcon('info')).toBe('Info');
      expect(getStatusIcon('neutral')).toBe('Circle');
      expect(getStatusIcon('pending')).toBe('Clock');
      expect(getStatusIcon('active')).toBe('Activity');
    });
  });

  describe('getSemanticStatus', () => {
    test('maps application statuses correctly', () => {
      // Job application statuses
      expect(getSemanticStatus('saved')).toBe('neutral');
      expect(getSemanticStatus('applied')).toBe('pending');
      expect(getSemanticStatus('interviewing')).toBe('active');
      expect(getSemanticStatus('offer')).toBe('active');
      expect(getSemanticStatus('accepted')).toBe('success');
      expect(getSemanticStatus('rejected')).toBe('error');
      expect(getSemanticStatus('withdrawn')).toBe('neutral');
      
      // General statuses
      expect(getSemanticStatus('complete')).toBe('success');
      expect(getSemanticStatus('failed')).toBe('error');
      expect(getSemanticStatus('in-progress')).toBe('pending');
    });

    test('returns neutral for unknown statuses', () => {
      expect(getSemanticStatus('unknown-status')).toBe('neutral');
      expect(getSemanticStatus('random')).toBe('neutral');
    });
  });

  describe('composeStatusClasses', () => {
    test('combines status classes with additional classes', () => {
      const classes = composeStatusClasses('success', 'soft', 'rounded-lg px-4');
      expect(classes).toContain('bg-success/10');
      expect(classes).toContain('text-success-foreground');
      expect(classes).toContain('rounded-lg px-4');
    });

    test('returns only status classes when no additional classes provided', () => {
      const classes = composeStatusClasses('error', 'outline');
      expect(classes).not.toContain('undefined');
      expect(classes).toContain('bg-transparent');
      expect(classes).toContain('text-destructive');
    });
  });

  describe('getStatusBadgeClasses', () => {
    test('returns correct badge classes with default size', () => {
      const classes = getStatusBadgeClasses('success');
      expect(classes).toContain('inline-flex items-center rounded-full');
      expect(classes).toContain('px-2.5 py-0.5 text-xs font-medium');
      expect(classes).toContain('bg-success/10');
    });

    test('returns correct badge classes with different sizes', () => {
      const smallClasses = getStatusBadgeClasses('info', 'small');
      expect(smallClasses).toContain('px-2 py-0.5 text-xs');

      const largeClasses = getStatusBadgeClasses('warning', 'large');
      expect(largeClasses).toContain('px-3 py-1 text-sm font-medium');

      const pillClasses = getStatusBadgeClasses('error', 'pill');
      expect(pillClasses).toContain('px-3 py-1.5 text-sm');

      const squareClasses = getStatusBadgeClasses('neutral', 'square');
      expect(squareClasses).toContain('rounded-md px-2 py-1 text-xs');
    });

    test('respects variant parameter', () => {
      const solidBadge = getStatusBadgeClasses('success', 'default', 'solid');
      expect(solidBadge).toContain('bg-success');
      expect(solidBadge).not.toContain('bg-success/10');
    });
  });

  describe('Semantic Color Validation', () => {
    test('no hardcoded colors in returned values', () => {
      const statusTypes: StatusType[] = ['success', 'error', 'warning', 'info', 'neutral', 'pending', 'active'];
      const variants: StatusVariant[] = ['solid', 'soft', 'outline', 'ghost'];
      
      statusTypes.forEach(status => {
        variants.forEach(variant => {
          const colors = getStatusColors(status, variant);
          const classes = getStatusClasses(status, variant);
          
          // Check that no hex colors are present
          expect(colors.background).not.toMatch(/#[0-9a-fA-F]{3,6}/);
          expect(colors.foreground).not.toMatch(/#[0-9a-fA-F]{3,6}/);
          expect(colors.border).not.toMatch(/#[0-9a-fA-F]{3,6}/);
          expect(classes).not.toMatch(/#[0-9a-fA-F]{3,6}/);
          
          // Check that no rgb/rgba colors are present
          expect(colors.background).not.toMatch(/rgb(a)?\(/);
          expect(colors.foreground).not.toMatch(/rgb(a)?\(/);
          expect(colors.border).not.toMatch(/rgb(a)?\(/);
          expect(classes).not.toMatch(/rgb(a)?\(/);
        });
      });
    });

    test('all colors use semantic tokens', () => {
      const colors = getStatusColors('success', 'soft');
      
      // Verify semantic tokens are used
      expect(colors.background).toMatch(/^bg-(success|destructive|warning|info|primary|accent|muted)/);
      expect(colors.foreground).toMatch(/^text-(success|destructive|warning|info|primary|accent|muted|white)/);
      expect(colors.border).toMatch(/^border-(success|destructive|warning|info|primary|accent|muted|transparent)/);
    });
  });
});