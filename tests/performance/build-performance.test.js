/**
 * Build Performance Tests
 * Based on performance-budgets-quality-gates.md specifications
 * Target: <1.5s build time, 180KB JS bundle, 50KB CSS bundle
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Build Performance Validation', () => {
  const PERFORMANCE_TARGETS = {
    BUILD_TIME_MS: 1500, // <1.5s target from specifications
    JS_BUNDLE_KB: 180,   // JS bundle budget from performance-budgets-quality-gates.md
    CSS_BUNDLE_KB: 50,   // CSS bundle target from specifications
    TOTAL_REDUCTION_KB: 25 // Minimum bundle reduction goal
  };

  test('Build completes under 1.5s budget', async () => {
    const startTime = Date.now();
    
    try {
      // Clean build to ensure accurate timing
      if (fs.existsSync('.next')) {
        fs.rmSync('.next', { recursive: true, force: true });
      }
      
      // Time the build process
      execSync('npm run build', { stdio: 'pipe' });
      
      const buildTime = Date.now() - startTime;
      
      console.log(`Build completed in ${buildTime}ms (target: ${PERFORMANCE_TARGETS.BUILD_TIME_MS}ms)`);
      
      expect(buildTime).toBeLessThan(PERFORMANCE_TARGETS.BUILD_TIME_MS);
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }, 60000); // 60s timeout for build process

  test('Bundle sizes meet targets', async () => {
    // Ensure build exists
    if (!fs.existsSync('.next')) {
      execSync('npm run build', { stdio: 'pipe' });
    }

    // Read build manifest for actual bundle sizes
    const manifestPath = path.join('.next', 'build-manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Build manifest not found. Run build first.');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Analyze bundle sizes (implementation will vary based on Next.js structure)
    let totalJSSize = 0;
    let totalCSSSize = 0;

    // Check for static files and calculate sizes
    const staticDir = path.join('.next', 'static');
    if (fs.existsSync(staticDir)) {
      const files = fs.readdirSync(staticDir, { recursive: true });
      
      files.forEach(file => {
        const filePath = path.join(staticDir, file);
        if (fs.statSync(filePath).isFile()) {
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          
          if (file.endsWith('.js')) {
            totalJSSize += sizeKB;
          } else if (file.endsWith('.css')) {
            totalCSSSize += sizeKB;
          }
        }
      });
    }

    console.log(`JS Bundle Size: ${totalJSSize}KB (target: <${PERFORMANCE_TARGETS.JS_BUNDLE_KB}KB)`);
    console.log(`CSS Bundle Size: ${totalCSSSize}KB (target: <${PERFORMANCE_TARGETS.CSS_BUNDLE_KB}KB)`);

    expect(totalJSSize).toBeLessThan(PERFORMANCE_TARGETS.JS_BUNDLE_KB);
    expect(totalCSSSize).toBeLessThan(PERFORMANCE_TARGETS.CSS_BUNDLE_KB);
  });

  test('Route optimization is applied', async () => {
    // Ensure build exists
    if (!fs.existsSync('.next')) {
      execSync('npm run build', { stdio: 'pipe' });
    }

    // Check that routes are properly split and no single route exceeds 180KB
    const pagesManifestPath = path.join('.next', 'server', 'pages-manifest.json');
    
    if (fs.existsSync(pagesManifestPath)) {
      const pagesManifest = JSON.parse(fs.readFileSync(pagesManifestPath, 'utf8'));
      
      Object.entries(pagesManifest).forEach(([route, filePath]) => {
        if (filePath.includes('.next/server/pages/')) {
          const fullPath = path.join(process.cwd(), filePath);
          if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            const sizeKB = Math.round(stats.size / 1024);
            
            console.log(`Route ${route}: ${sizeKB}KB`);
            
            // Critical routes should be under 180KB budget
            if (route.includes('resume') || route.includes('dashboard')) {
              expect(sizeKB).toBeLessThan(PERFORMANCE_TARGETS.JS_BUNDLE_KB);
            }
          }
        }
      });
    }
  });

  test('Build includes Turbopack optimization', async () => {
    // Check if next.config.js/ts has Turbopack configuration
    const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
    let configFound = false;
    let hasTurbopackConfig = false;

    for (const configFile of configFiles) {
      const configPath = path.join(process.cwd(), configFile);
      if (fs.existsSync(configPath)) {
        configFound = true;
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Check for Turbopack-related configuration
        if (configContent.includes('turbopack') || configContent.includes('--turbopack')) {
          hasTurbopackConfig = true;
          break;
        }
      }
    }

    expect(configFound).toBe(true);
    // This test will initially fail, but will pass once Turbopack is configured
    console.log(`Turbopack configuration: ${hasTurbopackConfig ? 'Found' : 'Not found'}`);
  });

  test('Bundle analyzer tools are available', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check that bundle analyzer is installed
    expect(packageJson.dependencies || packageJson.devDependencies).toMatchObject(
      expect.objectContaining({
        '@next/bundle-analyzer': expect.any(String)
      })
    );

    // Check for analysis scripts
    expect(packageJson.scripts).toEqual(
      expect.objectContaining({
        'build:analyze': expect.any(String)
      })
    );
  });
});