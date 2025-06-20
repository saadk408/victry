# Phase 3C Migration Automation Scripts

These scripts automate the migration of components from dark mode classes to semantic color tokens.

## Prerequisites

- Node.js installed
- Working from project root directory
- 30 components already manually migrated (Phase 3A & 3B complete)

## Available Scripts

### 1. Component Analyzer
Analyzes components to determine automation readiness.

```bash
# Analyze all components
npm run migrate:analyze components/

# Analyze specific category
npm run migrate:analyze components/display/

# Export detailed results
npm run migrate:analyze -- --export analysis.json components/
```

### 2. Color Replacement Engine
Performs automated migration of Patterns 1-3.

```bash
# Dry run (see what would change)
npm run migrate:test-run components/

# Migrate a single file
npm run migrate:colors components/ui/avatar.tsx

# Migrate a directory
npm run migrate:colors components/display/

# Apply specific pattern only
npm run migrate:colors -- --pattern surface components/ui/
```

### 3. Test Generator
Creates migration validation tests.

```bash
# Generate tests for a component
npm run migrate:generate-test components/ui/button.tsx

# Generate visual regression tests only
npm run migrate:generate-test -- --type visual components/display/chart.tsx

# Set risk level for tolerances
npm run migrate:generate-test -- --risk high components/auth/login-form.tsx
```

### 4. Documentation Generator
Auto-creates implementation documentation.

```bash
# Generate docs for a migration
npm run migrate:generate-docs components/ui/avatar.tsx

# Document manual migration
npm run migrate:generate-docs -- --method manual --time 30 components/auth/login.tsx

# Generate batch summary
npm run migrate:generate-docs -- --batch migration-results.json
```

## Recommended Workflow

### Step 1: Analyze Components
```bash
npm run migrate:analyze components/ -- --export phase3c-analysis.json
```
Review the analysis to identify:
- Top automation candidates
- Components requiring manual migration
- Expected pattern coverage

### Step 2: Test Run (5 Components)
Select 5 diverse components from the analysis and run a dry-run:
```bash
# Example test run
npm run migrate:test-run components/display/avatar.tsx
npm run migrate:test-run components/form/file-upload.tsx
npm run migrate:test-run components/data/table.tsx
npm run migrate:test-run components/interactive/dropdown.tsx
npm run migrate:test-run components/ui/breadcrumb.tsx
```

### Step 3: Execute Test Migration
If dry-run looks good, execute actual migration:
```bash
npm run migrate:colors components/display/avatar.tsx
npm run migrate:generate-test components/display/avatar.tsx
npm run migrate:generate-docs components/display/avatar.tsx
```

### Step 4: Verify Results
- Check TypeScript compilation: `npm run build`
- Run generated tests: `npm test [component-test-file]`
- Visual inspection in dev mode: `npm run dev`
- Check for console errors

### Step 5: Batch Execution
Once confident, run on component categories:
```bash
# Display components batch
npm run migrate:batch components/display/

# Form components batch  
npm run migrate:batch components/form/

# Continue with other categories...
```

## Safety Features

1. **Dry Run Mode**: Always preview changes before applying
2. **Verbose Logging**: Track exactly what's being changed
3. **Backup Strategy**: Git diff/stash before batch operations
4. **Risk Assessment**: Components analyzed for complexity
5. **Validation Tests**: Automated test generation

## Pattern Coverage

The scripts handle these proven patterns:
- **Pattern 1**: Surface colors (bg-surface)
- **Pattern 2**: Border colors (border-surface-border)
- **Pattern 3**: Text colors (text-surface-foreground)

More complex patterns require manual migration.

## Troubleshooting

### "No dark mode patterns found"
- Component may already be migrated
- Check if component uses different color patterns

### TypeScript errors after migration
- Ensure semantic color utilities are imported
- Check for typos in replacement tokens
- Verify globals.css has all tokens defined

### Visual differences after migration
- Run visual regression tests
- Check if custom colors were replaced incorrectly
- Some components may need manual touch-ups

## Quality Gates

Stop automation if:
- Error rate > 5% in any batch
- Build failures after migration
- Visual regression > 15% average
- TypeScript compilation errors

## Expected Outcomes

- 90%+ automation success rate
- 25% time savings (4.2 hours)
- Zero quality regressions
- Complete Phase 3C with all 70 components migrated