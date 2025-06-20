// File: /components/resume/ats-score.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Check, AlertCircle, Info } from "lucide-react";
import { getStatusClasses, getStatusColors } from "@/lib/utils/status-colors";

interface ATSScoreFeedbackItem {
  category: string;
  message: string;
  severity: "low" | "medium" | "high";
}

interface ATSScoreProps {
  score: number;
  feedback: ATSScoreFeedbackItem[];
}

export function ATSScore({ score, feedback }: ATSScoreProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  // Group feedback by category
  const feedbackByCategory = feedback.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ATSScoreFeedbackItem[]>,
  );

  // Calculate category scores
  const categoryScores = Object.entries(feedbackByCategory).map(
    ([category, items]) => {
      // Calculate score based on severity (high issues reduce score more)
      const baseScore = 100;
      const penalties = items.reduce((total, item) => {
        switch (item.severity) {
          case "high":
            return total + 25;
          case "medium":
            return total + 15;
          case "low":
            return total + 5;
          default:
            return total;
        }
      }, 0);

      return {
        category,
        score: Math.max(0, Math.min(100, baseScore - penalties)),
        items,
      };
    },
  );

  // Get score status type based on score value
  const getScoreStatus = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  // Get severity icon with semantic colors
  const getSeverityIcon = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />;
      case "medium":
        return <Info className="h-4 w-4 flex-shrink-0 text-warning-foreground" />;
      case "low":
        return <Info className="h-4 w-4 flex-shrink-0 text-info" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Score Circle */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg className="h-40 w-40" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-muted/20"
            />
            {/* Score arc */}
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
              className={
                score >= 80
                  ? "text-success"
                  : score >= 60
                  ? "text-warning"
                  : "text-destructive"
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{score}</span>
            <span className="text-sm text-muted-foreground">ATS Score</span>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="rounded-lg border p-4 text-center">
        <p className="font-medium">
          {score >= 80
            ? "Excellent! Your resume is highly ATS-compatible."
            : score >= 60
              ? "Good, but your resume could use some improvements for better ATS compatibility."
              : "Your resume needs significant improvements to pass ATS systems effectively."}
        </p>
      </div>

      {/* Category Scores */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Category Analysis</h3>

        {categoryScores.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">
            No specific feedback available
          </p>
        ) : (
          <div className="space-y-3">
            {categoryScores.map(({ category, score, items }) => (
              <div key={category} className="overflow-hidden rounded-md border">
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center">
                    <div
                      className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${getStatusClasses(
                        getScoreStatus(score),
                        "soft"
                      )}`}
                    >
                      {score}
                    </div>
                    <span className="font-medium">{category}</span>
                  </div>
                  {expandedCategories.includes(category) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {expandedCategories.includes(category) && (
                  <div className="border-t bg-muted/50 p-4">
                    <h4 className="mb-3 font-medium">
                      Feedback for {category}
                    </h4>

                    <ul className="space-y-3">
                      {items.map((item, index) => (
                        <li key={index} className="flex">
                          <div className="mr-3 mt-0.5">
                            {getSeverityIcon(item.severity)}
                          </div>
                          <div>
                            <p className="text-foreground">{item.message}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Priority:{" "}
                              {item.severity === "high"
                                ? "High"
                                : item.severity === "medium"
                                  ? "Medium"
                                  : "Low"}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Recommendations based on severity */}
                    {items.some(
                      (item) =>
                        item.severity === "high" || item.severity === "medium",
                    ) && (
                      <div className="mt-4 rounded-md bg-info/10 p-3">
                        <h5 className="mb-2 text-sm font-medium text-info">
                          Recommendations
                        </h5>
                        <ul className="space-y-2">
                          {items.some((item) => item.severity === "high") && (
                            <li className="flex text-sm">
                              <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-info" />
                              <span>
                                Address high-priority issues first to
                                significantly improve your ATS score
                              </span>
                            </li>
                          )}
                          {items.some((item) => item.severity === "medium") && (
                            <li className="flex text-sm">
                              <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-info" />
                              <span>
                                Review medium-priority items to refine your
                                resume further
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ATS Explanation */}
      <div className="rounded-md border bg-muted/50 p-4 text-sm">
        <h3 className="mb-2 font-medium">What is ATS?</h3>
        <p className="mb-2 text-muted-foreground">
          Applicant Tracking Systems (ATS) are software that employers use to
          manage job applications. They scan resumes for keywords and formatting
          to determine which candidates move forward.
        </p>
        <p className="text-muted-foreground">
          This score reflects how well your resume is optimized for ATS systems.
          A higher score means your resume is more likely to pass through and be
          seen by recruiters.
        </p>
      </div>
    </div>
  );
}
