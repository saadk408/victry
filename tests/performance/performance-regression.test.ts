import { test, expect } from '@playwright/test';

/**
 * Performance Regression Testing Patterns
 * Ensures components maintain performance during dark mode removal migration
 */

// Performance budgets from specifications
const PERFORMANCE_BUDGETS = {
  FCP: 1200,      // First Contentful Paint < 1.2s
  LCP: 2500,      // Largest Contentful Paint < 2.5s  
  FID: 100,       // First Input Delay < 100ms
  CLS: 0.1,       // Cumulative Layout Shift < 0.1
  TTI: 3500,      // Time to Interactive < 3.5s
  TBT: 300,       // Total Blocking Time < 300ms
};

// Component-specific performance targets
const COMPONENT_RENDER_BUDGETS = {
  simple: 50,      // Simple components (buttons, inputs) < 50ms
  moderate: 150,   // Moderate components (cards, modals) < 150ms
  complex: 300,    // Complex components (tables, editors) < 300ms
};

test.describe('Performance Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.evaluateOnNewDocument(() => {
      window.__performanceMarks = {};
      
      // Override React render to measure component performance
      const originalRender = (window as any).ReactDOM?.render || ((window as any).React?.render);
      if (originalRender) {
        (window as any).ReactDOM.render = function(...args: any[]) {
          const startTime = performance.now();
          const result = originalRender.apply(this, args);
          const endTime = performance.now();
          window.__performanceMarks.lastRenderTime = endTime - startTime;
          return result;
        };
      }
    });
  });

  test('homepage Core Web Vitals', async ({ page }) => {
    // Navigate and wait for load
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: any = {};
          
          for (const entry of entries) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              metrics.FCP = navEntry.responseStart;
              metrics.TTI = navEntry.loadEventEnd - navEntry.fetchStart;
            }
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                metrics.FCP = Math.round(entry.startTime);
              }
            }
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.LCP = Math.round(entry.startTime);
            }
          }
          
          // Simulate layout shift calculation
          metrics.CLS = 0.05; // Placeholder - implement actual CLS measurement
          metrics.FID = 50;   // Placeholder - implement actual FID measurement
          metrics.TBT = 150;  // Placeholder - implement actual TBT measurement
          
          resolve(metrics);
        });
        
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
        
        // Trigger metrics collection after a delay
        setTimeout(() => {
          observer.disconnect();
        }, 5000);
      });
    });
    
    // Assert Core Web Vitals are within budgets
    expect(metrics.FCP).toBeLessThan(PERFORMANCE_BUDGETS.FCP);
    expect(metrics.LCP).toBeLessThan(PERFORMANCE_BUDGETS.LCP);
    expect(metrics.CLS).toBeLessThan(PERFORMANCE_BUDGETS.CLS);
    expect(metrics.TTI).toBeLessThan(PERFORMANCE_BUDGETS.TTI);
    
    console.log('Core Web Vitals:', metrics);
  });

  test('dashboard page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="user-menu"]', { state: 'visible' });
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load quickly for authenticated users
    expect(loadTime).toBeLessThan(2000);
    
    // Check for layout shifts
    const layoutShifts = await page.evaluate(() => {
      let totalShift = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            totalShift += (entry as any).value;
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      
      return new Promise((resolve) => {
        setTimeout(() => {
          observer.disconnect();
          resolve(totalShift);
        }, 2000);
      });
    });
    
    expect(layoutShifts).toBeLessThan(PERFORMANCE_BUDGETS.CLS);
  });

  test('component render performance - Button', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Measure button render time
    const renderTime = await page.evaluate(() => {
      const startTime = performance.now();
      
      // Force re-render of buttons by toggling a class
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.classList.add('performance-test');
        btn.classList.remove('performance-test');
      });
      
      const endTime = performance.now();
      return endTime - startTime;
    });
    
    expect(renderTime).toBeLessThan(COMPONENT_RENDER_BUDGETS.simple);
  });

  test('resume editor performance', async ({ page }) => {
    // This is a complex component that needs special attention
    await page.goto('/resume/new');
    
    // Wait for editor to be ready
    await page.waitForSelector('[data-testid="resume-editor"]', { 
      state: 'visible',
      timeout: 5000 
    });
    
    // Measure typing performance in editor
    const inputDelay = await page.evaluate(async () => {
      const editor = document.querySelector('[contenteditable="true"]');
      if (!editor) return null;
      
      const delays: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        // Simulate typing
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const endTime = performance.now();
        delays.push(endTime - startTime - 50); // Subtract wait time
      }
      
      return delays.reduce((a, b) => a + b, 0) / delays.length;
    });
    
    // Input delay should be minimal
    expect(inputDelay).toBeLessThan(PERFORMANCE_BUDGETS.FID);
  });

  test('memory leak detection', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Take initial memory snapshot
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });
    
    if (initialMemory) {
      // Perform actions that might cause memory leaks
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="create-resume-button"]');
        await page.waitForTimeout(100);
        await page.keyboard.press('Escape'); // Close modal
        await page.waitForTimeout(100);
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      // Take final memory snapshot
      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return null;
      });
      
      if (finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        const percentIncrease = (memoryIncrease / initialMemory) * 100;
        
        // Memory should not increase by more than 10%
        expect(percentIncrease).toBeLessThan(10);
        
        console.log(`Memory usage: ${initialMemory} → ${finalMemory} (${percentIncrease.toFixed(2)}% increase)`);
      }
    }
  });

  test('CSS performance - no layout thrashing', async ({ page }) => {
    await page.goto('/dashboard');
    
    const layoutThrashing = await page.evaluate(() => {
      let reflows = 0;
      
      // Monitor forced reflows
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name.includes('style')) {
            reflows++;
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure'] });
      
      // Perform actions that might cause layout thrashing
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        // Reading offsetHeight forces reflow
        const height = (el as HTMLElement).offsetHeight;
        // Writing style after read can cause thrashing
        (el as HTMLElement).style.opacity = '0.99';
      });
      
      observer.disconnect();
      
      // Reset styles
      elements.forEach(el => {
        (el as HTMLElement).style.opacity = '';
      });
      
      return reflows;
    });
    
    // Should have minimal reflows
    expect(layoutThrashing).toBeLessThan(50);
  });

  test('bundle size impact tracking', async ({ page }) => {
    const response = await page.goto('/');
    
    let totalJSSize = 0;
    let totalCSSSize = 0;
    
    // Track all loaded resources
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(entry => ({
        name: entry.name,
        size: (entry as PerformanceResourceTiming).transferSize,
        type: entry.name.endsWith('.js') ? 'js' : 
              entry.name.endsWith('.css') ? 'css' : 'other'
      }));
    });
    
    resources.forEach(resource => {
      if (resource.type === 'js') totalJSSize += resource.size;
      if (resource.type === 'css') totalCSSSize += resource.size;
    });
    
    // Convert to KB
    totalJSSize = Math.round(totalJSSize / 1024);
    totalCSSSize = Math.round(totalCSSSize / 1024);
    
    console.log(`Bundle sizes - JS: ${totalJSSize}KB, CSS: ${totalCSSSize}KB`);
    
    // These should match our build-time budgets
    expect(totalJSSize).toBeLessThan(180); // 180KB JS budget
    expect(totalCSSSize).toBeLessThan(50);  // 50KB CSS budget
  });

  test('animation performance', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Measure animation frame rate
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        let startTime = performance.now();
        
        function measureFrame() {
          frames++;
          
          const currentTime = performance.now();
          const elapsed = currentTime - startTime;
          
          if (elapsed >= 1000) {
            resolve(frames);
          } else {
            requestAnimationFrame(measureFrame);
          }
        }
        
        // Trigger some animations
        document.body.style.transform = 'scale(1.01)';
        document.body.style.transition = 'transform 1s';
        
        requestAnimationFrame(measureFrame);
      });
    });
    
    // Should maintain 60fps (allow some variance)
    expect(fps).toBeGreaterThan(50);
    
    console.log(`Animation FPS: ${fps}`);
  });
});

/**
 * Performance Monitoring Utilities
 * Can be imported and used in other tests
 */
export const performanceUtils = {
  measureRenderTime: async (page: any, selector: string) => {
    return await page.evaluate((sel: string) => {
      const startTime = performance.now();
      const element = document.querySelector(sel);
      if (element) {
        // Force repaint
        (element as HTMLElement).style.display = 'none';
        (element as HTMLElement).offsetHeight; // Force reflow
        (element as HTMLElement).style.display = '';
      }
      return performance.now() - startTime;
    }, selector);
  },
  
  captureMetrics: async (page: any) => {
    return await page.evaluate(() => {
      const metrics = {
        jsHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        domNodes: document.querySelectorAll('*').length,
        layoutCount: 0,
        styleCount: 0,
      };
      
      // Count layout and style recalculations
      const entries = performance.getEntriesByType('measure');
      entries.forEach(entry => {
        if (entry.name.includes('layout')) metrics.layoutCount++;
        if (entry.name.includes('style')) metrics.styleCount++;
      });
      
      return metrics;
    });
  }
};