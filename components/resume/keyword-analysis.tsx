// File: /components/resume/keyword-analysis.tsx
"use client";

import { useState } from "react";
import { Check, X, Search, ChevronDown, ChevronUp } from "lucide-react";

interface KeywordMatch {
  keyword: string;
  found: boolean;
  importance: "low" | "medium" | "high";
}

// Define types for filter and sort state
type KeywordFilter = "all" | "matched" | "missing";
type KeywordSort = "importance" | "alphabetical";

interface KeywordAnalysisProps {
  matches: KeywordMatch[];
  jobTitle: string;
}

export function KeywordAnalysis({ matches, jobTitle }: KeywordAnalysisProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<KeywordFilter>("all");
  const [sortBy, setSortBy] = useState<KeywordSort>("importance");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort matches
  const filteredAndSortedMatches = matches
    .filter((match) => {
      // Apply text search
      if (
        searchTerm &&
        !match.keyword.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Apply found/missing filter
      if (filter === "matched" && !match.found) return false;
      if (filter === "missing" && match.found) return false;

      return true;
    })
    .sort((a, b) => {
      // Sort by importance
      if (sortBy === "importance") {
        // Sort by importance first (high > medium > low)
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        const importanceDiff =
          importanceOrder[b.importance] - importanceOrder[a.importance];

        // If same importance, secondarily sort by found status (found first)
        if (importanceDiff === 0) {
          return Number(b.found) - Number(a.found);
        }

        return importanceDiff;
      }

      // Sort alphabetically
      return a.keyword.localeCompare(b.keyword);
    });

  // Calculate match statistics
  const totalKeywords = matches.length;
  const matchedKeywords = matches.filter((m) => m.found).length;
  const matchPercentage =
    totalKeywords > 0 ? Math.round((matchedKeywords / totalKeywords) * 100) : 0;

  // Get importance color class
  const getImportanceColorClass = (
    importance: "low" | "medium" | "high",
    found: boolean,
  ) => {
    if (!found) return "bg-gray-100 text-gray-800";

    switch (importance) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Keyword Match Summary</h3>

        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{matchPercentage}%</span>
              <span className="ml-2 text-gray-500">match rate</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {matchedKeywords} of {totalKeywords} keywords found
            </p>
          </div>

          <div className="flex items-center">
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${
                  matchPercentage >= 80
                    ? "bg-green-500"
                    : matchPercentage >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${matchPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm">
          <p className="text-gray-700">
            {matchPercentage >= 80
              ? "Excellent keyword match! Your resume is well-aligned with the job requirements."
              : matchPercentage >= 60
                ? "Good keyword match. Consider adding more keywords to improve your chances."
                : "Your resume could use more job-specific keywords to improve matching."}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            {showFilters ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" />
                Hide Filters
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" />
                Show Filters
              </>
            )}
          </button>

          <div className="text-sm text-gray-600">
            {filteredAndSortedMatches.length}{" "}
            {filteredAndSortedMatches.length === 1 ? "keyword" : "keywords"}{" "}
            found
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 rounded-md bg-gray-50 p-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Filter Keywords
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as KeywordFilter)}
                className="w-full rounded-md border p-2"
              >
                <option value="all">All Keywords</option>
                <option value="matched">Matched Keywords</option>
                <option value="missing">Missing Keywords</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as KeywordSort)}
                className="w-full rounded-md border p-2"
              >
                <option value="importance">Importance</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Keyword List */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">
          {jobTitle
            ? `Keywords for "${jobTitle}" position`
            : "Keywords from Job Description"}
        </h3>

        {filteredAndSortedMatches.length === 0 ? (
          <div className="rounded-md bg-gray-50 p-6 text-center">
            <p className="text-gray-500">
              No keywords found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {filteredAndSortedMatches.map((match, index) => (
              <div
                key={index}
                className="flex items-center rounded-md border bg-white p-3"
              >
                <div className="mr-3">
                  {match.found ? (
                    <div className="rounded-full bg-green-100 p-1 text-green-800">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-red-100 p-1 text-red-800">
                      <X className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="font-medium text-gray-900">
                    {match.keyword}
                  </div>
                  <div className="text-xs text-gray-500">
                    {match.found ? "Found in resume" : "Missing in resume"}
                  </div>
                </div>

                <div
                  className={`ml-2 rounded-full px-2 py-1 text-xs ${getImportanceColorClass(match.importance, match.found)}`}
                >
                  {match.importance === "high"
                    ? "High"
                    : match.importance === "medium"
                      ? "Med"
                      : "Low"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="rounded-md border bg-gray-50 p-4 text-sm">
        <h4 className="mb-2 font-medium">About Keyword Matching</h4>
        <p className="mb-2 text-gray-700">
          ATS systems scan resumes for keywords that match the job description.
          Keywords are rated by importance based on their frequency and context
          in the job posting.
        </p>
        <ul className="list-inside list-disc space-y-1 text-gray-700">
          <li>
            <span className="font-medium text-green-700">High importance</span>:
            Essential skills or qualifications explicitly required in the job
          </li>
          <li>
            <span className="font-medium text-blue-700">Medium importance</span>
            : Relevant skills mentioned multiple times or in key sections
          </li>
          <li>
            <span className="font-medium text-gray-700">Low importance</span>:
            Supporting skills or attributes mentioned in passing
          </li>
        </ul>
      </div>
    </div>
  );
}
