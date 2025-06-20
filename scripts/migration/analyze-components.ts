#!/usr/bin/env node
/**
 * Component Analyzer for Phase 3C Automation
 * Assesses component complexity and automation readiness
 * 
 * Usage: ts-node scripts/migration/analyze-components.ts <directory>
 */

import * as fs from 'fs';
import * as path from 'path';
const glob = require('glob');

interface ComponentAnalysis {
  file: string;
  relativePath: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  darkClasses: string[];
  darkClassCount: number;
  hasAnimations: boolean;
  hasVariants: boolean;
  hasBusinessLogic: boolean;
  hasCustomColors: boolean;
  estimatedPatterns: string[];
  automationReady: boolean;
  automationNotes: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface AnalysisSummary {
  totalComponents: number;
  automationReady: number;
  categories: Record<string, number>;
  complexityBreakdown: Record<string, number>;
  riskBreakdown: Record<string, number>;
  patternCoverage: Record<string, number>;
  topCandidates: ComponentAnalysis[];
  needsManual: ComponentAnalysis[];
}

class ComponentAnalyzer {
  private results: ComponentAnalysis[] = [];

  // Pattern detection regexes based on our 30 component experience
  private readonly patterns = {
    darkClasses: /dark:[a-zA-Z0-9-:]+/g,
    animations: /animate-|transition|duration-|ease-|delay-|scale-|rotate-|translate-|@keyframes|framer-motion/gi,
    variants: /variant\s*[=:]\s*["']([^"']+)["']|variants:\s*{/gi,
    businessLogic: /useState|useEffect|useReducer|useCallback|useMemo|onClick|onChange|onSubmit|handleSubmit/gi,
    customColors: /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|hsl\(|hsla\(|oklch\(/gi,
    
    // Specific pattern detection
    surfacePattern: /dark:bg-(gray|slate|zinc|neutral|stone)-(800|900|950)\s+bg-(white|gray-50)/g,
    borderPattern: /dark:border-(gray|slate|zinc|neutral|stone)-(600|700)\s+border-(gray|slate|zinc|neutral|stone)-(200|300)/g,
    textPattern: /dark:text-(white|gray|slate|zinc|neutral|stone)-(50|100)\s+text-(gray|slate|zinc|neutral|stone)-(900|800)/g,
  };

  async analyzeFile(filePath: string, baseDir: string): Promise<ComponentAnalysis> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(baseDir, filePath);
    
    // Extract dark classes
    const darkClasses = content.match(this.patterns.darkClasses) || [];
    const uniqueDarkClasses = [...new Set(darkClasses)];

    // Categorize component based on path
    const category = this.categorizeComponent(relativePath);

    // Detect various features
    const hasAnimations = this.patterns.animations.test(content);
    const hasVariants = this.patterns.variants.test(content);
    const hasBusinessLogic = this.patterns.businessLogic.test(content);
    const hasCustomColors = this.patterns.customColors.test(content);

    // Estimate which patterns would apply
    const estimatedPatterns = this.estimatePatterns(content);

    // Determine complexity
    const complexity = this.calculateComplexity({
      darkClassCount: uniqueDarkClasses.length,
      hasAnimations,
      hasVariants,
      hasBusinessLogic,
      hasCustomColors,
    });

    // Determine risk level
    const riskLevel = this.calculateRiskLevel({
      complexity,
      hasAnimations,
      hasBusinessLogic,
      category,
    });

    // Automation readiness assessment
    const { ready, notes } = this.assessAutomationReadiness({
      complexity,
      hasAnimations,
      hasVariants,
      hasBusinessLogic,
      hasCustomColors,
      darkClassCount: uniqueDarkClasses.length,
      estimatedPatterns,
    });

    const analysis: ComponentAnalysis = {
      file: filePath,
      relativePath,
      category,
      complexity,
      darkClasses: uniqueDarkClasses,
      darkClassCount: uniqueDarkClasses.length,
      hasAnimations,
      hasVariants,
      hasBusinessLogic,
      hasCustomColors,
      estimatedPatterns,
      automationReady: ready,
      automationNotes: notes,
      riskLevel,
    };

    this.results.push(analysis);
    return analysis;
  }

  private categorizeComponent(relativePath: string): string {
    if (relativePath.includes('components/ui/')) return 'ui';
    if (relativePath.includes('components/display/')) return 'display';
    if (relativePath.includes('components/form/')) return 'form';
    if (relativePath.includes('components/interactive/')) return 'interactive';
    if (relativePath.includes('components/layout/')) return 'layout';
    if (relativePath.includes('components/data/')) return 'data';
    if (relativePath.includes('components/auth/')) return 'auth';
    if (relativePath.includes('components/resume/')) return 'resume';
    return 'other';
  }

  private estimatePatterns(content: string): string[] {
    const patterns: string[] = [];

    if (this.patterns.surfacePattern.test(content)) {
      patterns.push('Pattern 1 (Surface)');
    }
    if (this.patterns.borderPattern.test(content)) {
      patterns.push('Pattern 2 (Border)');
    }
    if (this.patterns.textPattern.test(content)) {
      patterns.push('Pattern 3 (Text)');
    }

    // Check for other patterns based on content
    if (content.includes('getStatusClasses') || content.includes('STATUS_COLORS')) {
      patterns.push('Pattern 5 (Status)');
    }
    if (content.match(/border\s+border-border|focus:ring-ring/)) {
      patterns.push('Pattern 9 (Forms)');
    }
    if (content.includes('bg-popover') || content.includes('data-radix-popper')) {
      patterns.push('Pattern 11 (Overlay)');
    }

    return patterns;
  }

  private calculateComplexity(factors: {
    darkClassCount: number;
    hasAnimations: boolean;
    hasVariants: boolean;
    hasBusinessLogic: boolean;
    hasCustomColors: boolean;
  }): 'simple' | 'medium' | 'complex' {
    let score = 0;

    // Base complexity from dark class count
    if (factors.darkClassCount === 0) return 'simple';
    if (factors.darkClassCount <= 3) score += 1;
    else if (factors.darkClassCount <= 10) score += 2;
    else score += 3;

    // Additional complexity factors
    if (factors.hasAnimations) score += 2;
    if (factors.hasVariants) score += 2;
    if (factors.hasBusinessLogic) score += 1;
    if (factors.hasCustomColors) score += 1;

    // Determine complexity level
    if (score <= 2) return 'simple';
    if (score <= 5) return 'medium';
    return 'complex';
  }

  private calculateRiskLevel(factors: {
    complexity: 'simple' | 'medium' | 'complex';
    hasAnimations: boolean;
    hasBusinessLogic: boolean;
    category: string;
  }): 'low' | 'medium' | 'high' {
    // High-risk categories (from our experience)
    const highRiskCategories = ['auth', 'data', 'resume'];
    
    if (highRiskCategories.includes(factors.category)) {
      return 'high';
    }

    if (factors.complexity === 'complex' || 
        (factors.hasAnimations && factors.hasBusinessLogic)) {
      return 'high';
    }

    if (factors.complexity === 'medium' || 
        factors.hasAnimations || 
        factors.hasBusinessLogic) {
      return 'medium';
    }

    return 'low';
  }

  private assessAutomationReadiness(factors: {
    complexity: 'simple' | 'medium' | 'complex';
    hasAnimations: boolean;
    hasVariants: boolean;
    hasBusinessLogic: boolean;
    hasCustomColors: boolean;
    darkClassCount: number;
    estimatedPatterns: string[];
  }): { ready: boolean; notes: string[] } {
    const notes: string[] = [];
    let ready = true;

    // No dark classes = already migrated or no work needed
    if (factors.darkClassCount === 0) {
      notes.push('No dark classes found - may already be migrated');
      return { ready: false, notes };
    }

    // Simple components with only Pattern 1-3 are ideal
    if (factors.complexity === 'simple' && 
        factors.estimatedPatterns.every(p => ['Pattern 1 (Surface)', 'Pattern 2 (Border)', 'Pattern 3 (Text)'].includes(p))) {
      notes.push('Ideal automation candidate - simple patterns only');
      return { ready: true, notes };
    }

    // Check for blocking factors
    if (factors.hasCustomColors) {
      ready = false;
      notes.push('Contains custom colors - needs manual review');
    }

    if (factors.hasAnimations && factors.complexity === 'complex') {
      ready = false;
      notes.push('Complex animations detected - manual migration recommended');
    }

    if (factors.hasVariants && factors.darkClassCount > 10) {
      ready = false;
      notes.push('Multiple variants with many dark classes - manual review needed');
    }

    // Medium complexity can be automated with verification
    if (factors.complexity === 'medium') {
      notes.push('Medium complexity - automate with careful verification');
    }

    // Pattern-specific notes
    if (factors.estimatedPatterns.includes('Pattern 5 (Status)')) {
      notes.push('Uses status patterns - verify semantic mapping');
    }

    if (factors.estimatedPatterns.includes('Pattern 11 (Overlay)')) {
      notes.push('Overlay component - verify popover tokens');
    }

    return { ready, notes };
  }

  async analyzeDirectory(dirPath: string): Promise<AnalysisSummary> {
    const pattern = path.join(dirPath, '**/*.{tsx,jsx}');
    const files = glob.sync(pattern, {
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/scripts/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.stories.*',
      ],
    });

    console.log(`\nAnalyzing ${files.length} components in ${dirPath}...\n`);

    // Analyze each file
    for (const file of files) {
      await this.analyzeFile(file, dirPath);
    }

    // Generate summary
    const summary = this.generateSummary();
    
    return summary;
  }

  private generateSummary(): AnalysisSummary {
    const summary: AnalysisSummary = {
      totalComponents: this.results.length,
      automationReady: this.results.filter(r => r.automationReady).length,
      categories: {},
      complexityBreakdown: {
        simple: 0,
        medium: 0,
        complex: 0,
      },
      riskBreakdown: {
        low: 0,
        medium: 0,
        high: 0,
      },
      patternCoverage: {},
      topCandidates: [],
      needsManual: [],
    };

    // Process results
    this.results.forEach(result => {
      // Category counts
      summary.categories[result.category] = (summary.categories[result.category] || 0) + 1;
      
      // Complexity breakdown
      summary.complexityBreakdown[result.complexity]++;
      
      // Risk breakdown
      summary.riskBreakdown[result.riskLevel]++;
      
      // Pattern coverage
      result.estimatedPatterns.forEach(pattern => {
        summary.patternCoverage[pattern] = (summary.patternCoverage[pattern] || 0) + 1;
      });
    });

    // Find top automation candidates (simple, low-risk, ready)
    summary.topCandidates = this.results
      .filter(r => r.automationReady && r.complexity === 'simple' && r.riskLevel === 'low')
      .sort((a, b) => a.darkClassCount - b.darkClassCount)
      .slice(0, 10);

    // Find components that need manual migration
    summary.needsManual = this.results
      .filter(r => !r.automationReady || r.riskLevel === 'high')
      .sort((a, b) => b.darkClassCount - a.darkClassCount);

    return summary;
  }

  printDetailedReport(): void {
    const summary = this.generateSummary();

    console.log('=== Component Analysis Report ===\n');

    // Overview
    console.log('📊 Overview:');
    console.log(`  Total components: ${summary.totalComponents}`);
    console.log(`  Automation ready: ${summary.automationReady} (${Math.round(summary.automationReady / summary.totalComponents * 100)}%)`);
    console.log(`  Needs manual: ${summary.needsManual.length} (${Math.round(summary.needsManual.length / summary.totalComponents * 100)}%)`);

    // Category breakdown
    console.log('\n📁 Category Distribution:');
    Object.entries(summary.categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} components`);
      });

    // Complexity breakdown
    console.log('\n🎯 Complexity Breakdown:');
    console.log(`  Simple: ${summary.complexityBreakdown.simple} (${Math.round(summary.complexityBreakdown.simple / summary.totalComponents * 100)}%)`);
    console.log(`  Medium: ${summary.complexityBreakdown.medium} (${Math.round(summary.complexityBreakdown.medium / summary.totalComponents * 100)}%)`);
    console.log(`  Complex: ${summary.complexityBreakdown.complex} (${Math.round(summary.complexityBreakdown.complex / summary.totalComponents * 100)}%)`);

    // Risk assessment
    console.log('\n⚠️  Risk Assessment:');
    console.log(`  Low risk: ${summary.riskBreakdown.low}`);
    console.log(`  Medium risk: ${summary.riskBreakdown.medium}`);
    console.log(`  High risk: ${summary.riskBreakdown.high}`);

    // Pattern coverage
    console.log('\n🔍 Estimated Pattern Usage:');
    Object.entries(summary.patternCoverage)
      .sort((a, b) => b[1] - a[1])
      .forEach(([pattern, count]) => {
        console.log(`  ${pattern}: ${count} components`);
      });

    // Top automation candidates
    if (summary.topCandidates.length > 0) {
      console.log('\n✅ Top Automation Candidates:');
      summary.topCandidates.forEach(comp => {
        console.log(`  ${comp.relativePath}`);
        console.log(`    - ${comp.darkClassCount} dark classes`);
        console.log(`    - Patterns: ${comp.estimatedPatterns.join(', ') || 'None detected'}`);
        comp.automationNotes.forEach(note => {
          console.log(`    - ${note}`);
        });
      });
    }

    // Components needing manual migration
    if (summary.needsManual.length > 0) {
      console.log('\n❌ Components Requiring Manual Migration:');
      summary.needsManual.slice(0, 10).forEach(comp => {
        console.log(`  ${comp.relativePath}`);
        console.log(`    - Complexity: ${comp.complexity}, Risk: ${comp.riskLevel}`);
        console.log(`    - ${comp.darkClassCount} dark classes`);
        comp.automationNotes.forEach(note => {
          console.log(`    - ${note}`);
        });
      });
      
      if (summary.needsManual.length > 10) {
        console.log(`  ... and ${summary.needsManual.length - 10} more`);
      }
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log(`  1. Start with ${summary.topCandidates.length} simple components for test run`);
    console.log(`  2. ${summary.complexityBreakdown.medium} medium complexity components can be automated with verification`);
    console.log(`  3. Reserve ${summary.needsManual.length} components for manual migration`);
    console.log(`  4. Expected automation success rate: ${Math.round(summary.automationReady / summary.totalComponents * 100)}%`);
  }

  exportResults(outputPath: string): void {
    const summary = this.generateSummary();
    const output = {
      summary,
      components: this.results,
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n📄 Detailed results exported to: ${outputPath}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Component Analyzer - Phase 3C Automation Assessment

Usage: ts-node scripts/migration/analyze-components.ts [options] <directory>

Options:
  --export, -e <path>  Export detailed results to JSON file
  --help, -h           Show this help message

Examples:
  # Analyze all components
  ts-node scripts/migration/analyze-components.ts components/

  # Analyze specific category and export results
  ts-node scripts/migration/analyze-components.ts --export analysis.json components/display/

  # Analyze UI components only
  ts-node scripts/migration/analyze-components.ts components/ui/
`);
    process.exit(0);
  }

  // Parse options
  let exportPath: string | undefined;
  const exportIndex = args.findIndex(arg => arg === '--export' || arg === '-e');
  if (exportIndex !== -1 && args[exportIndex + 1]) {
    exportPath = args[exportIndex + 1];
  }

  // Get target directory (last non-option argument)
  const targetDir = args.filter(arg => !arg.startsWith('-')).pop();
  
  if (!targetDir) {
    console.error('Error: No directory specified');
    process.exit(1);
  }

  const analyzer = new ComponentAnalyzer();

  try {
    const stats = fs.statSync(targetDir);
    
    if (!stats.isDirectory()) {
      console.error('Error: Target must be a directory');
      process.exit(1);
    }

    await analyzer.analyzeDirectory(targetDir);
    analyzer.printDetailedReport();

    if (exportPath) {
      analyzer.exportResults(exportPath);
    }

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
export { ComponentAnalyzer, ComponentAnalysis, AnalysisSummary };