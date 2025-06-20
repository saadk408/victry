#!/usr/bin/env node
/**
 * Color Replacement Engine for Phase 3C Automation
 * Handles Patterns 1-3: Surface, Border, and Text colors
 * 
 * Usage: ts-node scripts/migration/migrate-colors.ts [options] <file-or-directory>
 */

import * as fs from 'fs';
import * as path from 'path';
const glob = require('glob');

// Pattern definitions based on 30 component migration experience
const PATTERNS = {
  // Pattern 1: Surface Colors (98% confidence, 30 applications)
  surface: [
    // Most common patterns from our migrations
    { from: /dark:bg-gray-800\s+bg-white/g, to: 'bg-surface' },
    { from: /dark:bg-gray-900\s+bg-white/g, to: 'bg-surface' },
    { from: /dark:bg-gray-950\s+bg-white/g, to: 'bg-surface' },
    { from: /dark:bg-slate-800\s+bg-white/g, to: 'bg-surface' },
    { from: /dark:bg-slate-900\s+bg-white/g, to: 'bg-surface' },
    { from: /dark:bg-zinc-800\s+bg-white/g, to: 'bg-surface' },
    { from: /dark:bg-zinc-900\s+bg-white/g, to: 'bg-surface' },
    // Reverse order patterns
    { from: /bg-white\s+dark:bg-gray-800/g, to: 'bg-surface' },
    { from: /bg-white\s+dark:bg-gray-900/g, to: 'bg-surface' },
    { from: /bg-white\s+dark:bg-gray-950/g, to: 'bg-surface' },
    // Popover/dialog patterns
    { from: /dark:bg-gray-800\s+bg-gray-50/g, to: 'bg-popover' },
    { from: /dark:bg-gray-900\s+bg-gray-50/g, to: 'bg-popover' },
    // Muted backgrounds
    { from: /dark:bg-gray-700\s+bg-gray-100/g, to: 'bg-muted' },
    { from: /dark:bg-gray-800\s+bg-gray-100/g, to: 'bg-muted' },
  ],

  // Pattern 2: Border Colors (98% confidence, 25 applications)
  border: [
    // Common border patterns
    { from: /dark:border-gray-700\s+border-gray-200/g, to: 'border-surface-border' },
    { from: /dark:border-gray-600\s+border-gray-200/g, to: 'border-surface-border' },
    { from: /dark:border-gray-700\s+border-gray-300/g, to: 'border-surface-border' },
    { from: /dark:border-slate-700\s+border-slate-200/g, to: 'border-surface-border' },
    { from: /dark:border-zinc-700\s+border-zinc-200/g, to: 'border-surface-border' },
    // Reverse order
    { from: /border-gray-200\s+dark:border-gray-700/g, to: 'border-surface-border' },
    { from: /border-gray-300\s+dark:border-gray-700/g, to: 'border-surface-border' },
    // Input/form patterns
    { from: /dark:border-gray-600\s+border-gray-300/g, to: 'border-input' },
    { from: /dark:border-gray-700\s+border-gray-400/g, to: 'border-input' },
  ],

  // Pattern 3: Text Colors (98% confidence, 28 applications)
  text: [
    // Primary text patterns
    { from: /dark:text-white\s+text-gray-900/g, to: 'text-surface-foreground' },
    { from: /dark:text-gray-50\s+text-gray-900/g, to: 'text-surface-foreground' },
    { from: /dark:text-gray-100\s+text-gray-900/g, to: 'text-surface-foreground' },
    { from: /dark:text-slate-50\s+text-slate-900/g, to: 'text-surface-foreground' },
    { from: /dark:text-zinc-50\s+text-zinc-900/g, to: 'text-surface-foreground' },
    // Reverse order
    { from: /text-gray-900\s+dark:text-white/g, to: 'text-surface-foreground' },
    { from: /text-gray-900\s+dark:text-gray-50/g, to: 'text-surface-foreground' },
    // Muted text patterns
    { from: /dark:text-gray-400\s+text-gray-600/g, to: 'text-muted-foreground' },
    { from: /dark:text-gray-300\s+text-gray-600/g, to: 'text-muted-foreground' },
    { from: /dark:text-gray-400\s+text-gray-500/g, to: 'text-muted-foreground' },
    { from: /text-gray-600\s+dark:text-gray-400/g, to: 'text-muted-foreground' },
    { from: /text-gray-500\s+dark:text-gray-400/g, to: 'text-muted-foreground' },
  ],
};

interface MigrationResult {
  file: string;
  success: boolean;
  replacements: number;
  error?: string;
  patterns: string[];
}

interface MigrationOptions {
  dryRun?: boolean;
  verbose?: boolean;
  pattern?: 'all' | 'surface' | 'border' | 'text';
}

class ColorMigrator {
  private results: MigrationResult[] = [];
  private totalReplacements = 0;

  constructor(private options: MigrationOptions = {}) {}

  async migrateFile(filePath: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      file: filePath,
      success: false,
      replacements: 0,
      patterns: [],
    };

    try {
      // Read file content
      let content = fs.readFileSync(filePath, 'utf-8');
      const originalContent = content;

      // Track which patterns to apply
      const patternsToApply = this.options.pattern === 'all' || !this.options.pattern
        ? ['surface', 'border', 'text']
        : [this.options.pattern];

      // Apply patterns
      for (const patternType of patternsToApply) {
        const patterns = PATTERNS[patternType as keyof typeof PATTERNS];
        
        for (const pattern of patterns) {
          const matches = content.match(pattern.from);
          if (matches) {
            content = content.replace(pattern.from, pattern.to);
            result.replacements += matches.length;
            result.patterns.push(patternType);
            
            if (this.options.verbose) {
              console.log(`  [${patternType}] ${matches.length} replacement(s): ${pattern.from} → ${pattern.to}`);
            }
          }
        }
      }

      // Check if any replacements were made
      if (result.replacements > 0) {
        // Check if semantic color imports are needed
        const needsImport = this.checkIfNeedsImport(content);
        
        if (needsImport && !content.includes('lib/utils/status-colors')) {
          // Add import at the top of the file after existing imports
          const importStatement = `import { cn } from "@/lib/utils";\n`;
          const lastImportMatch = content.match(/^import[^;]+;$/gm);
          
          if (lastImportMatch) {
            const lastImport = lastImportMatch[lastImportMatch.length - 1];
            const insertPosition = content.indexOf(lastImport) + lastImport.length;
            content = content.slice(0, insertPosition) + '\n' + importStatement + content.slice(insertPosition);
          }
        }

        // Write file if not dry run
        if (!this.options.dryRun) {
          fs.writeFileSync(filePath, content, 'utf-8');
        }

        result.success = true;
        this.totalReplacements += result.replacements;

        if (this.options.verbose || this.options.dryRun) {
          console.log(`✅ ${filePath}: ${result.replacements} replacement(s)`);
          if (this.options.dryRun) {
            console.log('  (dry run - no changes written)');
          }
        }
      } else {
        result.success = true;
        if (this.options.verbose) {
          console.log(`⏭️  ${filePath}: No dark mode patterns found`);
        }
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${filePath}: ${result.error}`);
    }

    this.results.push(result);
    return result;
  }

  async migrateDirectory(dirPath: string): Promise<void> {
    const pattern = path.join(dirPath, '**/*.{ts,tsx,js,jsx}');
    const files = glob.sync(pattern, {
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/scripts/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
    });

    console.log(`Found ${files.length} files to process in ${dirPath}`);
    
    for (const file of files) {
      await this.migrateFile(file);
    }
  }

  private checkIfNeedsImport(content: string): boolean {
    // Check if the file uses any semantic tokens that would need imports
    const semanticTokens = [
      'bg-surface',
      'bg-popover',
      'bg-muted',
      'border-surface-border',
      'border-input',
      'text-surface-foreground',
      'text-muted-foreground',
    ];

    return semanticTokens.some(token => content.includes(token));
  }

  printSummary(): void {
    console.log('\n=== Migration Summary ===');
    console.log(`Total files processed: ${this.results.length}`);
    console.log(`Successful migrations: ${this.results.filter(r => r.success && r.replacements > 0).length}`);
    console.log(`Files unchanged: ${this.results.filter(r => r.success && r.replacements === 0).length}`);
    console.log(`Errors: ${this.results.filter(r => !r.success).length}`);
    console.log(`Total replacements: ${this.totalReplacements}`);

    // Pattern usage breakdown
    const patternUsage: Record<string, number> = {};
    this.results.forEach(r => {
      r.patterns.forEach(p => {
        patternUsage[p] = (patternUsage[p] || 0) + 1;
      });
    });

    if (Object.keys(patternUsage).length > 0) {
      console.log('\nPattern usage:');
      Object.entries(patternUsage).forEach(([pattern, count]) => {
        console.log(`  ${pattern}: ${count} files`);
      });
    }

    // Show errors if any
    const errors = this.results.filter(r => !r.success);
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(e => {
        console.log(`  ${e.file}: ${e.error}`);
      });
    }
  }

  getResults(): MigrationResult[] {
    return this.results;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Color Migration Tool - Phase 3C Automation

Usage: ts-node scripts/migration/migrate-colors.ts [options] <file-or-directory>

Options:
  --dry-run, -d     Show what would be changed without modifying files
  --verbose, -v     Show detailed output for each file
  --pattern, -p     Apply specific pattern only (surface|border|text)
  --help, -h        Show this help message

Examples:
  # Migrate a single file
  ts-node scripts/migration/migrate-colors.ts components/ui/avatar.tsx

  # Dry run on a directory
  ts-node scripts/migration/migrate-colors.ts --dry-run components/ui/

  # Apply only surface patterns
  ts-node scripts/migration/migrate-colors.ts --pattern surface components/

  # Verbose output for debugging
  ts-node scripts/migration/migrate-colors.ts --verbose components/display/
`);
    process.exit(0);
  }

  // Parse options
  const options: MigrationOptions = {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  // Parse pattern option
  const patternIndex = args.findIndex(arg => arg === '--pattern' || arg === '-p');
  if (patternIndex !== -1 && args[patternIndex + 1]) {
    const pattern = args[patternIndex + 1];
    if (['surface', 'border', 'text'].includes(pattern)) {
      options.pattern = pattern as 'surface' | 'border' | 'text';
    }
  }

  // Get target path (last non-option argument)
  const targetPath = args.filter(arg => !arg.startsWith('-')).pop();
  
  if (!targetPath) {
    console.error('Error: No file or directory specified');
    process.exit(1);
  }

  const migrator = new ColorMigrator(options);

  try {
    const stats = fs.statSync(targetPath);
    
    if (stats.isFile()) {
      await migrator.migrateFile(targetPath);
    } else if (stats.isDirectory()) {
      await migrator.migrateDirectory(targetPath);
    }

    migrator.printSummary();

    // Exit with error code if any migrations failed
    const results = migrator.getResults();
    const hasErrors = results.some(r => !r.success);
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export for testing and programmatic use
export { ColorMigrator, MigrationOptions, MigrationResult };