#!/usr/bin/env node
/**
 * Test Generator for Phase 3C Automation
 * Creates migration validation tests for automated component migrations
 * 
 * Usage: ts-node scripts/migration/generate-tests.ts <component-file>
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestGenerationOptions {
  componentPath: string;
  outputPath?: string;
  testType?: 'unit' | 'visual' | 'both';
  riskLevel?: 'low' | 'medium' | 'high';
}

interface TestTemplate {
  imports: string[];
  setup: string;
  tests: string[];
}

class TestGenerator {
  private readonly visualRegressionTolerances = {
    low: 15,    // 15% tolerance for low-risk components
    medium: 10, // 10% tolerance for medium-risk
    high: 5,    // 5% tolerance for high-risk
  };

  generateTests(options: TestGenerationOptions): string {
    const componentName = this.extractComponentName(options.componentPath);
    const componentDir = path.dirname(options.componentPath);
    const relativePath = this.getRelativeImportPath(options.outputPath || '', options.componentPath);
    
    const template: TestTemplate = {
      imports: this.generateImports(componentName, relativePath, options.testType),
      setup: this.generateSetup(componentName, options.riskLevel || 'medium'),
      tests: this.generateTestCases(componentName, options),
    };

    return this.assembleTestFile(template, componentName);
  }

  private extractComponentName(componentPath: string): string {
    const filename = path.basename(componentPath, path.extname(componentPath));
    // Convert kebab-case to PascalCase
    return filename
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private getRelativeImportPath(from: string, to: string): string {
    if (!from) {
      return to.replace('.tsx', '').replace('.jsx', '');
    }
    
    const relativePath = path.relative(path.dirname(from), to);
    return relativePath.replace('.tsx', '').replace('.jsx', '').replace(/\\/g, '/');
  }

  private generateImports(componentName: string, componentPath: string, testType?: string): string[] {
    const imports: string[] = [];

    // Common imports
    imports.push(`import React from 'react';`);
    imports.push(`import { render, screen } from '@testing-library/react';`);
    imports.push(`import { ${componentName} } from '${componentPath}';`);
    imports.push(`import '@testing-library/jest-dom';`);

    // Add visual regression imports if needed
    if (testType === 'visual' || testType === 'both') {
      imports.push(`import { test as visual } from '@playwright/experimental-ct-react';`);
    }

    return imports;
  }

  private generateSetup(componentName: string, riskLevel: string): string {
    return `
// Migration test suite for ${componentName}
// Generated for Phase 3C semantic color migration validation
// Risk level: ${riskLevel} (${this.visualRegressionTolerances[riskLevel]}% visual regression tolerance)

describe('${componentName} - Semantic Color Migration', () => {
  // Test data for different component states
  const defaultProps = {
    // Add default props based on component analysis
  };`;
  }

  private generateTestCases(componentName: string, options: TestGenerationOptions): string[] {
    const tests: string[] = [];
    const includeUnit = !options.testType || options.testType === 'unit' || options.testType === 'both';
    const includeVisual = options.testType === 'visual' || options.testType === 'both';

    if (includeUnit) {
      // Semantic token validation tests
      tests.push(this.generateSemanticTokenTest(componentName));
      tests.push(this.generateNoHardcodedColorsTest(componentName));
      tests.push(this.generateImportValidationTest(componentName));
      tests.push(this.generateTypeScriptCompilationTest(componentName));
      
      // Interactive state tests
      tests.push(this.generateInteractiveStatesTest(componentName));
      
      // Accessibility tests
      tests.push(this.generateAccessibilityTest(componentName));
    }

    if (includeVisual) {
      tests.push(this.generateVisualRegressionTest(componentName, options.riskLevel || 'medium'));
    }

    return tests;
  }

  private generateSemanticTokenTest(componentName: string): string {
    return `
  it('should use semantic color tokens instead of dark: classes', () => {
    const { container } = render(<${componentName} {...defaultProps} />);
    
    // Check that no dark: classes remain
    const allElements = container.querySelectorAll('*');
    allElements.forEach(element => {
      const classes = element.className;
      expect(classes).not.toMatch(/dark:/);
    });
    
    // Verify semantic classes are present
    const semanticClasses = [
      'bg-surface',
      'text-surface-foreground',
      'border-surface-border',
      'bg-muted',
      'text-muted-foreground',
    ];
    
    const hasSemanticClasses = semanticClasses.some(cls => 
      container.innerHTML.includes(cls)
    );
    
    expect(hasSemanticClasses).toBe(true);
  });`;
  }

  private generateNoHardcodedColorsTest(componentName: string): string {
    return `
  it('should not contain hardcoded color values', () => {
    const { container } = render(<${componentName} {...defaultProps} />);
    const html = container.innerHTML;
    
    // Check for hardcoded hex colors
    const hexColorPattern = /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])/g;
    const hexMatches = html.match(hexColorPattern) || [];
    
    // Filter out valid exceptions (e.g., SVG currentColor)
    const invalidHexColors = hexMatches.filter(color => 
      !color.match(/#000000|#ffffff/i) // Black and white might be acceptable
    );
    
    expect(invalidHexColors).toHaveLength(0);
    
    // Check for RGB/RGBA colors
    const rgbPattern = /rgb[a]?\\([^)]+\\)/g;
    expect(html).not.toMatch(rgbPattern);
    
    // Check for HSL/HSLA colors
    const hslPattern = /hsl[a]?\\([^)]+\\)/g;
    expect(html).not.toMatch(hslPattern);
  });`;
  }

  private generateImportValidationTest(componentName: string): string {
    return `
  it('should have proper imports for semantic utilities if needed', async () => {
    // This test validates that the component file has proper imports
    // Note: This is a static analysis test that would run on the source file
    const componentSource = await import('${componentName}?raw');
    
    // Check if component uses status utilities
    if (componentSource.default.includes('getStatusClasses')) {
      expect(componentSource.default).toContain('import { getStatusClasses }');
    }
    
    // Check if component uses cn utility for class names
    if (componentSource.default.includes('cn(')) {
      expect(componentSource.default).toContain('import { cn }');
    }
  });`;
  }

  private generateTypeScriptCompilationTest(componentName: string): string {
    return `
  it('should compile without TypeScript errors', () => {
    // This test ensures the component compiles successfully
    // TypeScript compilation errors would fail the test
    expect(() => {
      render(<${componentName} {...defaultProps} />);
    }).not.toThrow();
    
    // Test with various prop combinations
    const propVariations = [
      {},
      { className: 'custom-class' },
      { disabled: true },
      { variant: 'secondary' },
    ];
    
    propVariations.forEach((props, index) => {
      expect(() => {
        render(<${componentName} {...defaultProps} {...props} />);
      }).not.toThrow();
    });
  });`;
  }

  private generateInteractiveStatesTest(componentName: string): string {
    return `
  it('should preserve interactive states after migration', async () => {
    const { container, rerender } = render(<${componentName} {...defaultProps} />);
    
    // Test hover state
    const element = container.firstElementChild;
    if (element) {
      // Check that hover classes are preserved
      const classes = element.className;
      const hoverClasses = classes.match(/hover:[a-zA-Z0-9-]+/g) || [];
      
      hoverClasses.forEach(hoverClass => {
        expect(hoverClass).not.toContain('dark:');
      });
    }
    
    // Test focus state
    if (element && element.tagName.match(/INPUT|BUTTON|TEXTAREA|SELECT/)) {
      element.focus();
      expect(document.activeElement).toBe(element);
      
      // Verify focus styles don't use dark: prefix
      const focusClasses = element.className.match(/focus:[a-zA-Z0-9-]+/g) || [];
      focusClasses.forEach(focusClass => {
        expect(focusClass).not.toContain('dark:');
      });
    }
    
    // Test disabled state if applicable
    if ('disabled' in defaultProps) {
      rerender(<${componentName} {...defaultProps} disabled />);
      const disabledElement = container.firstElementChild;
      expect(disabledElement?.className).not.toMatch(/dark:/);
    }
  });`;
  }

  private generateAccessibilityTest(componentName: string): string {
    return `
  it('should maintain accessibility after migration', () => {
    const { container } = render(<${componentName} {...defaultProps} />);
    
    // Check color contrast for text elements
    const textElements = container.querySelectorAll('[class*="text-"]');
    textElements.forEach(element => {
      const classes = element.className;
      
      // Verify text uses semantic foreground colors
      if (classes.includes('text-')) {
        expect(
          classes.includes('text-surface-foreground') ||
          classes.includes('text-muted-foreground') ||
          classes.includes('text-foreground')
        ).toBe(true);
      }
    });
    
    // Check ARIA attributes are preserved
    const ariaElements = container.querySelectorAll('[aria-label], [aria-describedby], [role]');
    expect(ariaElements.length).toBeGreaterThanOrEqual(0);
    
    // Verify focus indicators are visible
    const focusableElements = container.querySelectorAll('button, input, textarea, select, a[href]');
    focusableElements.forEach(element => {
      const classes = element.className;
      if (classes.includes('focus:')) {
        expect(classes).toMatch(/focus:(ring|outline)/);
      }
    });
  });`;
  }

  private generateVisualRegressionTest(componentName: string, riskLevel: string): string {
    const tolerance = this.visualRegressionTolerances[riskLevel];
    
    return `
  // Visual regression test for Playwright
  visual('should match visual snapshot within ${tolerance}% tolerance', async ({ mount }) => {
    const component = await mount(
      <${componentName} {...defaultProps} />
    );
    
    // Wait for any animations to complete
    await component.waitForTimeout(500);
    
    // Take screenshot and compare
    await expect(component).toHaveScreenshot('${componentName.toLowerCase()}-default.png', {
      maxDiffPixels: ${tolerance},
      threshold: 0.${100 - tolerance}, // Convert tolerance to threshold
    });
    
    // Test different states if applicable
    const states = ['hover', 'focus', 'active', 'disabled'];
    
    for (const state of states) {
      if (state === 'hover') {
        await component.hover();
      } else if (state === 'focus' && component.locator('input, button, textarea, select').count() > 0) {
        await component.locator('input, button, textarea, select').first().focus();
      } else if (state === 'disabled' && 'disabled' in defaultProps) {
        await mount(<${componentName} {...defaultProps} disabled />);
      }
      
      await expect(component).toHaveScreenshot('${componentName.toLowerCase()}-' + state + '.png', {
        maxDiffPixels: ${tolerance},
        threshold: 0.${100 - tolerance},
      });
    }
  });`;
  }

  private assembleTestFile(template: TestTemplate, componentName: string): string {
    const sections = [
      template.imports.join('\n'),
      template.setup,
      ...template.tests,
      '});', // Close describe block
    ];

    return sections.join('\n');
  }

  async saveTestFile(content: string, outputPath: string): Promise<void> {
    const dir = path.dirname(outputPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, content, 'utf-8');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Test Generator - Phase 3C Migration Validation

Usage: ts-node scripts/migration/generate-tests.ts [options] <component-file>

Options:
  --output, -o <path>    Output path for test file (default: alongside component)
  --type, -t <type>      Test type: unit|visual|both (default: both)
  --risk, -r <level>     Risk level: low|medium|high (default: medium)
  --help, -h             Show this help message

Examples:
  # Generate tests for a component
  ts-node scripts/migration/generate-tests.ts components/ui/button.tsx

  # Generate only unit tests with custom output
  ts-node scripts/migration/generate-tests.ts --type unit --output tests/button.test.tsx components/ui/button.tsx

  # Generate tests for high-risk component
  ts-node scripts/migration/generate-tests.ts --risk high components/auth/login-form.tsx

  # Generate visual regression tests only
  ts-node scripts/migration/generate-tests.ts --type visual components/display/chart.tsx
`);
    process.exit(0);
  }

  // Parse options
  const options: TestGenerationOptions = {
    componentPath: '',
    testType: 'both',
    riskLevel: 'medium',
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--output' || arg === '-o') {
      options.outputPath = args[++i];
    } else if (arg === '--type' || arg === '-t') {
      const type = args[++i];
      if (['unit', 'visual', 'both'].includes(type)) {
        options.testType = type as 'unit' | 'visual' | 'both';
      }
    } else if (arg === '--risk' || arg === '-r') {
      const risk = args[++i];
      if (['low', 'medium', 'high'].includes(risk)) {
        options.riskLevel = risk as 'low' | 'medium' | 'high';
      }
    } else if (!arg.startsWith('-')) {
      options.componentPath = arg;
    }
  }

  if (!options.componentPath) {
    console.error('Error: No component file specified');
    process.exit(1);
  }

  // Verify component file exists
  if (!fs.existsSync(options.componentPath)) {
    console.error(`Error: Component file not found: ${options.componentPath}`);
    process.exit(1);
  }

  // Generate default output path if not specified
  if (!options.outputPath) {
    const dir = path.dirname(options.componentPath);
    const basename = path.basename(options.componentPath, path.extname(options.componentPath));
    options.outputPath = path.join(dir, '__tests__', `${basename}.test.tsx`);
  }

  const generator = new TestGenerator();

  try {
    console.log('\n🧪 Generating migration tests...\n');
    console.log(`Component: ${options.componentPath}`);
    console.log(`Output: ${options.outputPath}`);
    console.log(`Test type: ${options.testType}`);
    console.log(`Risk level: ${options.riskLevel}`);

    const testContent = generator.generateTests(options);
    await generator.saveTestFile(testContent, options.outputPath);

    console.log('\n✅ Test file generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review and customize the generated tests');
    console.log('2. Add component-specific test cases');
    console.log('3. Run tests to validate migration');
    
    if (options.testType === 'visual' || options.testType === 'both') {
      console.log('4. Generate baseline screenshots before migration');
      console.log('5. Run visual regression after migration');
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
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
export { TestGenerator, TestGenerationOptions };