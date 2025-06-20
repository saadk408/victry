# Component Inventory for Dark Mode Removal

Generated: January 23, 2025
Total Components: 74 (67 in components/ + 7 in app/)

## 1. UI Components (26 total)
Core reusable UI elements from components/ui/

- accordion.tsx
- alert.tsx
- badge.tsx ✓ (enhanced)
- button.tsx ✓ (already semantic)
- calendar.tsx
- card.tsx ✓
- checkbox.tsx ✓
- command.tsx
- date-picker.tsx
- dialog.tsx ✓ (already semantic)
- form.tsx
- input.tsx ✓ (already semantic)
- label.tsx
- popover.tsx ✓
- progress.tsx
- radio-group.tsx ✓
- select.tsx ✓ (already semantic)
- slider.tsx ✓
- switch.tsx ✓
- tabs.tsx ✓
- textarea.tsx ✓
- toast.tsx
- toaster.tsx
- tooltip.tsx ✓
- use-toast.ts (hook, not a component)

## 2. Feature Components (38 total)
Application-specific features

### Account (2)
- profile-editor.tsx
- subscription-plans.tsx

### AI Features (2)
- ai-suggestion.tsx
- tailoring-controls.tsx

### Analytics (1)
- application-tracking.tsx ✓

### Auth (9)
- forgot-password-form.tsx ✓
- login-form.tsx ✓
- register-form.tsx ✓
- reset-password-form.tsx ✓
- role-based-access.tsx ✓
- oauth-buttons/google-oauth-button.tsx ✓
- oauth-buttons/linkedin-oauth-button.tsx ✓
- oauth-buttons/oauth-error-alert.tsx ✓
- oauth-buttons/index.ts (export file)

### Cover Letter (1)
- cover-letter-editor.tsx

### Resume Features (16)
- ats-score.tsx ✓
- export-controls.tsx
- import-controls.tsx
- keyword-analysis.tsx
- premium-feature.tsx
- editor-controls/date-range-picker.tsx
- editor-controls/rich-text-editor-content.tsx
- editor-controls/rich-text-editor.tsx
- editor-controls/skill-input.tsx
- editor-controls/sortable-list.tsx
- section-editor/certifications.tsx
- section-editor/education.tsx
- section-editor/personal-info.tsx
- section-editor/projects.tsx
- section-editor/skills.tsx
- section-editor/social-links.tsx
- section-editor/summary.tsx
- section-editor/work-experience.tsx
- templates/template-picker.tsx
- templates/template-preview.tsx

### App-specific Components (7)
From app/_components/
- stats-card.tsx
- job-description-input.tsx
- job-match-panel.tsx ✓
- resume-editor.tsx ✓
- resume-preview.tsx
- resume-score-panel.tsx
- templates-panel.tsx

## 3. Layout Components (3 total)
Page structure components

- footer.tsx
- header.tsx
- sidebar.tsx

## 4. Provider Components (2 total)
Context and utility providers

- client-home-page.tsx
- theme-provider.tsx

## Summary by Category

| Category | Total | Completed | Remaining |
|----------|-------|-----------|-----------|
| UI Components | 26 | 15 | 11 |
| Feature Components | 38 | 12 | 26 |
| Layout Components | 3 | 0 | 3 |
| Provider Components | 2 | 0 | 2 |
| **TOTAL** | **69** | **27** | **42** |

Note: Excludes non-component files (index.ts, use-toast.ts)

## Migration Priority Notes

### High Priority (Complex/Risky)
- calendar.tsx (complex date UI)
- command.tsx (search interface)
- rich-text-editor.tsx (already optimized)
- sortable-list.tsx (drag & drop)

### Medium Priority (Interactive)
- date-picker.tsx
- form.tsx
- progress.tsx
- toast/toaster.tsx
- All section editors

### Low Priority (Simple)
- label.tsx
- alert.tsx
- Layout components
- Template components

## Completed Components (27)
✓ Status colors utility
✓ Card
✓ Button (already semantic)
✓ Badge (enhanced)
✓ Input (already semantic)
✓ Textarea
✓ Select (already semantic)
✓ Checkbox
✓ Radio-group
✓ Switch
✓ Slider
✓ Dialog (already semantic)
✓ Popover
✓ Tooltip
✓ Accordion (already semantic)
✓ Tabs
✓ ATS Score
✓ Application Tracking
✓ Auth Components (8 files)
✓ Resume Editor
✓ Job Match Panel