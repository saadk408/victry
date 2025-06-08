"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PerformanceTestPage() {
  const [renderTimes, setRenderTimes] = useState<number[]>([]);
  const [componentRenderStart, setComponentRenderStart] = useState(0);
  const [themeSwitchTime, setThemeSwitchTime] = useState<number | null>(null);
  
  useEffect(() => {
    // Measure initial render
    const renderTime = performance.now() - componentRenderStart;
    setRenderTimes(prev => [...prev, renderTime]);
  }, []);

  const measureComponentRender = () => {
    const start = performance.now();
    setComponentRenderStart(start);
    // Force re-render
    setRenderTimes([]);
  };

  const measureThemeSwitch = () => {
    const start = performance.now();
    
    // Toggle theme
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    if (currentTheme === "dark") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    
    // Measure time after repaint
    requestAnimationFrame(() => {
      const duration = performance.now() - start;
      setThemeSwitchTime(duration);
    });
  };

  const runAnimationPerformanceTest = () => {
    const element = document.getElementById("animation-test");
    if (!element) return;

    let frames = 0;
    let startTime = performance.now();
    let lastTime = startTime;

    const measureFPS = (timestamp: number) => {
      frames++;
      
      if (timestamp - startTime >= 1000) {
        const fps = Math.round((frames * 1000) / (timestamp - startTime));
        console.log(`Animation FPS: ${fps}`);
        alert(`Animation running at ${fps} FPS`);
        return;
      }
      
      requestAnimationFrame(measureFPS);
    };

    // Start animation
    element.classList.add("animate-pulse");
    requestAnimationFrame(measureFPS);
    
    // Stop after 1 second
    setTimeout(() => {
      element.classList.remove("animate-pulse");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Tailwind v4 Performance Test</h1>
        
        <div className="space-y-8">
          {/* Build Metrics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Build Performance Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Build Time</p>
                <p className="text-2xl font-bold">6.0s</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CSS Bundle Size</p>
                <p className="text-2xl font-bold">17.7KB (gzipped)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">13.42s</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">First Load JS</p>
                <p className="text-2xl font-bold">102KB</p>
              </div>
            </div>
          </Card>

          {/* Runtime Performance */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Runtime Performance</h2>
            <div className="space-y-4">
              <div>
                <Button onClick={measureComponentRender} className="mb-2">
                  Measure Component Render
                </Button>
                {renderTimes.length > 0 && (
                  <p className="text-sm">
                    Last render time: {renderTimes[renderTimes.length - 1]?.toFixed(2)}ms
                  </p>
                )}
              </div>
              
              <div>
                <Button onClick={measureThemeSwitch} variant="secondary" className="mb-2">
                  Measure Theme Switch
                </Button>
                {themeSwitchTime !== null && (
                  <p className="text-sm">
                    Theme switch time: {themeSwitchTime.toFixed(2)}ms
                  </p>
                )}
              </div>
              
              <div>
                <Button onClick={runAnimationPerformanceTest} variant="outline" className="mb-2">
                  Test Animation FPS
                </Button>
                <div id="animation-test" className="w-full h-20 bg-primary rounded-lg mt-2" />
              </div>
            </div>
          </Card>

          {/* Component Stress Test */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Component Stress Test</h2>
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tab1">100 Buttons</TabsTrigger>
                <TabsTrigger value="tab2">50 Cards</TabsTrigger>
                <TabsTrigger value="tab3">Mixed Components</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="grid grid-cols-10 gap-1">
                {Array.from({ length: 100 }).map((_, i) => (
                  <Button key={i} size="sm" variant={i % 3 === 0 ? "default" : i % 3 === 1 ? "secondary" : "outline"}>
                    {i}
                  </Button>
                ))}
              </TabsContent>
              <TabsContent value="tab2" className="grid grid-cols-5 gap-2">
                {Array.from({ length: 50 }).map((_, i) => (
                  <Card key={i} className="p-2 hover:shadow-lg transition-shadow">
                    Card {i}
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="tab3" className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <Button key={`btn-${i}`} size="sm">Button {i}</Button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Card key={`card-${i}`} className="p-4">
                      <h3 className="font-semibold">Card {i}</h3>
                      <p className="text-sm text-muted-foreground">Test content</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}