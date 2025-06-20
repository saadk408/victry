// File: /app/resume/_components/job-match-panel.tsx
"use client";

import { useState } from "react";
// import { Resume } from "@/models/resume"; // Removed unused import
import { JobDescription } from "@/models/job-description";
import { ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react";
import { getStatusClasses, type StatusType } from "@/lib/utils/status-colors";

// Score-based status mapping (Pattern 15)
const getScoreStatus = (score: number): StatusType => {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "error";
};

interface JobMatchPanelProps {
  score: number;
  // resume: Resume; // Removed unused prop
  jobDescription: JobDescription;
}

export function JobMatchPanel({
  score,
  // resume, // Removed unused prop
  jobDescription,
}: JobMatchPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter((s) => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  // Job match categories with feedback
  const matchCategories = [
    {
      id: "keyword-match",
      name: "Keyword Match",
      score: 34,
      issues: [
        "Missing key technical skills: Docker, Kubernetes",
        "Missing soft skills: Problem-solving, Agile methodology",
      ],
      recommendations: [
        "Add Docker and Kubernetes to your skills section",
        'Incorporate "problem-solving" in your work experience',
        "Mention experience with Agile methodologies",
      ],
    },
    {
      id: "job-title-match",
      name: "Job Title Match",
      score: 100,
      issues: [],
      recommendations: [],
    },
    {
      id: "qualifications-match",
      name: "Qualifications Match",
      score: 80,
      issues: ["Job requires 5+ years of experience, your resume shows 4"],
      recommendations: [
        "Highlight your accelerated career growth",
        "Emphasize quality of experience over quantity",
      ],
    },
    {
      id: "responsibilities-match",
      name: "Responsibilities Match",
      score: 100,
      issues: [],
      recommendations: [],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-xl font-bold">{jobDescription.title}</h3>
        <p className="text-sm text-muted-foreground">{jobDescription.company}</p>
      </div>

      <div className="text-center">
        <div className="relative mx-auto h-32 w-32">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={`${score * 2.83} 283`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
              className={`text-${getScoreStatus(score)}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{score}</span>
            <span className="text-sm text-muted-foreground">match score</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {matchCategories.map((category) => (
          <div key={category.id} className="overflow-hidden rounded-md border">
            <button
              className="flex w-full items-center justify-between bg-surface p-4 transition-colors hover:bg-accent"
              onClick={() => toggleSection(category.id)}
            >
              <div className="flex items-center">
                <div
                  className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${getStatusClasses(
                    getScoreStatus(category.score),
                    "soft"
                  )}`}
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
              <div className="border-t bg-muted p-4">
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
                    <span>Great job! This category is a perfect match.</span>
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
