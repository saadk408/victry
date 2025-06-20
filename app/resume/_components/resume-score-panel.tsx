// File: /app/resume/_components/resume-score-panel.tsx
"use client";

import { useState } from "react";
// import { Resume } from "@/models/resume"; // Removed unused import
import { ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreStatus, getStatusBadgeClasses } from "@/lib/utils/status-colors";

interface ResumeScorePanelProps {
  score: number;
  // resume: Resume; // Removed unused prop
}

export function ResumeScorePanel({
  score /*, resume*/,
}: ResumeScorePanelProps) {
  // Removed unused prop
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter((s) => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  // Score categories with feedback
  const scoreCategories = [
    {
      id: "section-completion",
      name: "Section Completion",
      score: 100,
      issues: [],
      recommendations: [],
    },
    {
      id: "content-quality",
      name: "Content Quality",
      score: 19,
      issues: [
        "Professional summary is generic",
        "Work experience bullet points lack quantifiable achievements",
        "Skills section needs more industry-specific keywords",
      ],
      recommendations: [
        "Add metrics and numbers to your work achievements",
        "Include more technical skills relevant to your field",
        "Make your professional summary more specific to your target role",
      ],
    },
    {
      id: "content-length",
      name: "Content Length",
      score: 20,
      issues: [
        "Professional summary is too short",
        "Work experience descriptions need more detail",
      ],
      recommendations: [
        "Expand your professional summary to 3-5 sentences",
        "Add 4-6 bullet points for each work experience",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative mx-auto h-32 w-32">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              className="text-muted/20"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              className={cn(
                score >= 80 ? "text-success" : 
                score >= 60 ? "text-warning" : 
                "text-destructive"
              )}
              strokeWidth="10"
              strokeDasharray={`${score * 2.83} 283`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{score}</span>
            <span className="text-sm text-muted-foreground">resume score</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {scoreCategories.map((category) => (
          <div key={category.id} className="overflow-hidden rounded-md border">
            <button
              className="flex w-full items-center justify-between bg-surface p-4 transition-colors hover:bg-muted/50"
              onClick={() => toggleSection(category.id)}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "mr-3 flex h-8 w-8 items-center justify-center rounded-full",
                    getStatusBadgeClasses(getScoreStatus(category.score), 'default', 'soft')
                  )}
                >
                  {category.score}
                </div>
                <span className="font-medium">{category.name}</span>
              </div>
              {expandedSections.includes(category.id) ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedSections.includes(category.id) && (
              <div className="border-t bg-muted/50 p-4">
                {category.issues.length > 0 ? (
                  <>
                    <h4 className="mb-2 font-medium">Issues to address:</h4>
                    <ul className="mb-4 space-y-1">
                      {category.issues.map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                          <span className="text-sm">{issue}</span>
                        </li>
                      ))}
                    </ul>

                    <h4 className="mb-2 font-medium">Recommendations:</h4>
                    <ul className="space-y-1">
                      {category.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="flex items-center text-success">
                    <Check className="mr-2 h-5 w-5" />
                    <span>Great job! This section is complete.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
