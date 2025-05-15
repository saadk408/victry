'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumOnly } from "@/components/auth/role-based-access";
import Link from "next/link";
import { useState } from "react";

interface PremiumFeatureProps {
  title: string;
  description: string;
  featureName: string;
  children: React.ReactNode;
}

/**
 * A wrapper component for premium features that shows an upgrade
 * prompt for basic users and the actual feature for premium users
 */
export function PremiumFeature({
  title,
  description,
  featureName,
  children,
}: PremiumFeatureProps) {
  return (
    <PremiumOnly
      fallback={
        <PremiumUpgradePrompt
          title={title}
          description={description}
          featureName={featureName}
        />
      }
    >
      {children}
    </PremiumOnly>
  );
}

/**
 * The upgrade prompt shown to basic users
 */
function PremiumUpgradePrompt({
  title,
  description,
  featureName,
}: Omit<PremiumFeatureProps, "children">) {
  // Track current path for redirect after upgrade
  const [isHovered, setIsHovered] = useState(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 shadow-sm">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="text-2xl flex items-center gap-2">
          <span>{title}</span>
          <span className="text-sm px-2 py-1 bg-primary/10 rounded-full text-primary font-normal">
            Premium
          </span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div 
          className="absolute inset-0 backdrop-blur-[2px] bg-background/60 flex items-center justify-center flex-col gap-4 p-6 transition-all duration-300"
          style={{ 
            opacity: isHovered ? 0.9 : 0.7,
            transform: isHovered ? 'scale(1.02)' : 'scale(1)'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <LockIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Unlock {featureName}</h3>
          <p className="text-sm text-center text-muted-foreground max-w-xs">
            Upgrade to our Premium plan to access this and many other exclusive features.
          </p>
          <Button 
            asChild 
            className={`mt-2 ${isHovered ? 'bg-primary' : 'bg-primary/80'} transition-colors duration-300`}
          >
            <Link href={`/upgrade?redirectTo=${encodeURIComponent(currentPath)}`}>
              Upgrade to Premium
            </Link>
          </Button>
        </div>
        
        <div className="opacity-50 pointer-events-none">
          {/* Blurred preview of the premium feature */}
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}