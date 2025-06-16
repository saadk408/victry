/**
 * Tailwind v4 Foundation Implementation Tests
 * Based on specifications from color-system-spec.md and tailwind-v4-spec.md
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Tailwind v4 Configuration', () => {
  test('OKLCH colors are properly defined in globals.css', () => {
    const globalsPath = path.join(process.cwd(), 'app/globals.css');
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    // Test for OKLCH color tokens from color-system-spec.md
    expect(content).toMatch(/--color-blue-500:\s*oklch\(0\.62\s+0\.17\s+237\)/);
    expect(content).toMatch(/--color-gray-50:\s*oklch\(0\.985\s+0\s+0\)/);
    expect(content).toMatch(/--color-gray-900:\s*oklch\(0\.205\s+0\s+0\)/);
    
    // Test for status colors with WCAG compliance
    expect(content).toMatch(/--color-success:\s*oklch\(0\.52\s+0\.17\s+142\)/);
    expect(content).toMatch(/--color-error:\s*oklch\(0\.53\s+0\.24\s+25\)/);
  });

  test('Semantic tokens map correctly to OKLCH values', () => {
    const globalsPath = path.join(process.cwd(), 'app/globals.css');
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    // Test semantic token architecture from specifications
    expect(content).toMatch(/--color-background:\s*var\(--color-gray-50\)/);
    expect(content).toMatch(/--color-foreground:\s*var\(--color-gray-900\)/);
    expect(content).toMatch(/--color-primary:\s*var\(--color-blue-500\)/);
  });

  test('@theme directive is properly structured', () => {
    const globalsPath = path.join(process.cwd(), 'app/globals.css');
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    // Test for @theme directive structure
    expect(content).toMatch(/@theme\s*\{/);
    expect(content).toMatch(/\}/); // Closing brace
    
    // No legacy dark mode variables should exist
    expect(content).not.toMatch(/\.dark\s*\{/);
    expect(content).not.toMatch(/--.*-dark/);
  });

  test('PostCSS configuration includes OKLCH fallback plugin', () => {
    const postCSSPath = path.join(process.cwd(), 'postcss.config.mjs');
    
    expect(fs.existsSync(postCSSPath)).toBe(true);
    const content = fs.readFileSync(postCSSPath, 'utf8');
    expect(content).toMatch(/@csstools\/postcss-oklab-function/);
    expect(content).toMatch(/preserve:\s*true/);
  });

  test('No hard-coded color values remain in globals.css', () => {
    const globalsPath = path.join(process.cwd(), 'app/globals.css');
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    // Should not contain legacy HSL values
    const codeLines = content.split('\n').filter(line => 
      !line.trim().startsWith('/*') && 
      !line.trim().startsWith('*') &&
      !line.trim().startsWith('//')
    );
    const codeContent = codeLines.join('\n');
    
    // Should not have hard-coded hex colors (except for black/white)
    const hexColorMatches = codeContent.match(/#[0-9a-fA-F]{3,6}/g);
    if (hexColorMatches) {
      // Only allow #000 and #fff for true black and white
      const allowedColors = ['#000', '#fff'];
      hexColorMatches.forEach(color => {
        expect(allowedColors).toContain(color);
      });
    }
    
    // Should not contain HSL color functions
    expect(codeContent).not.toMatch(/hsl\(/);
  });

  test('All color definitions use OKLCH format', () => {
    const globalsPath = path.join(process.cwd(), 'app/globals.css');
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    // Count OKLCH color definitions
    const oklchMatches = content.match(/--color-[a-zA-Z0-9-]+:\s*oklch\(/g);
    expect(oklchMatches).toBeTruthy();
    expect(oklchMatches!.length).toBeGreaterThan(10); // Should have multiple color definitions
  });

  test('Semantic token hierarchy is properly implemented', () => {
    const globalsPath = path.join(process.cwd(), 'app/globals.css');
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    // Test for proper semantic token references using var()
    expect(content).toMatch(/--color-card:\s*var\(--color-surface\)/);
    expect(content).toMatch(/--color-destructive:\s*var\(--color-error\)/);
    expect(content).toMatch(/--color-primary-foreground:\s*var\(--color-white\)/);
  });
});

describe('CSS Bundle Performance', () => {
  test('PostCSS configuration is optimized for production', () => {
    const postCSSPath = path.join(process.cwd(), 'postcss.config.mjs');
    const content = fs.readFileSync(postCSSPath, 'utf8');
    
    // Should include production optimizations
    expect(content).toMatch(/process\.env\.NODE_ENV === 'production'/);
    expect(content).toMatch(/stage:\s*3/); // PostCSS preset env stage 3
  });

  test('Build configuration exists and is valid', () => {
    // Check that we can import the PostCSS config
    const postCSSPath = path.join(process.cwd(), 'postcss.config.mjs');
    expect(fs.existsSync(postCSSPath)).toBe(true);
    
    // Basic syntax validation - file should be readable
    const content = fs.readFileSync(postCSSPath, 'utf8');
    expect(content).toMatch(/export default/);
    expect(content).toMatch(/plugins:/);
  });
});

describe('Browser Compatibility', () => {
  test('OKLCH fallback configuration is correct', () => {
    const postCSSPath = path.join(process.cwd(), 'postcss.config.mjs');
    const content = fs.readFileSync(postCSSPath, 'utf8');
    
    // Should preserve OKLCH values for modern browsers
    expect(content).toMatch(/preserve:\s*true/);
    // Should use sRGB fallbacks for compatibility
    expect(content).toMatch(/displayP3:\s*false/);
  });

  test('CSS structure supports progressive enhancement', () => {
    const globalsPath = path.join(process.cwd(), 'app/globals.css');
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    // Should use semantic variables that can be fallback-enhanced
    expect(content).toMatch(/--color-background:/);
    expect(content).toMatch(/--color-foreground:/);
    
    // Body should use semantic tokens (which will get fallbacks)
    expect(content).toMatch(/background-color:\s*var\(--color-background\)/);
    expect(content).toMatch(/color:\s*var\(--color-foreground\)/);
  });
});

describe('Accessibility Compliance', () => {
  test('Focus ring system is implemented', () => {
    const globalsPath = path.join(process.cwd(), 'app/globals.css');
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    // Should have accessible focus ring utilities
    expect(content).toMatch(/\.focus\\:ring-2:focus/);
    expect(content).toMatch(/--color-ring/);
  });

  test('Screen reader utilities are available', () => {
    const globalsPath = path.join(process.cwd(), 'app/globals.css');
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    // Should have sr-only utility for accessibility
    expect(content).toMatch(/\.sr-only/);
    expect(content).toMatch(/position:\s*absolute/);
  });
});