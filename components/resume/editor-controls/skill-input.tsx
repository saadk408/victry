// File: /components/resume/editor-controls/skill-input.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Plus, ChevronDown, Search, Tag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/utils";
import { Skill } from "@/types/resume";
import { Badge } from "@/components/ui/badge";
import { analytics } from "@/lib/services/analytics-service";

// Common skill categories and suggestions based on job markets
const SKILL_CATEGORIES = [
  "Technical",
  "Software",
  "Programming",
  "Languages",
  "Frameworks",
  "DevOps",
  "Soft Skills",
  "Management",
  "Design",
  "Marketing",
  "Communication",
  "Tools",
];

// Common skill levels
const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"];

// Common skills by category to suggest to users
const COMMON_SKILLS: Record<string, string[]> = {
  Technical: [
    "Machine Learning",
    "Data Analysis",
    "Cloud Computing",
    "Networking",
    "Security",
    "AI",
    "Database Design",
  ],
  Software: [
    "Microsoft Office",
    "Adobe Creative Suite",
    "Salesforce",
    "Google Workspace",
    "SAP",
  ],
  Programming: [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "Ruby",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "PHP",
    "C#",
    "TypeScript",
  ],
  Languages: [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Arabic",
    "Russian",
  ],
  Frameworks: [
    "React",
    "Angular",
    "Vue.js",
    "Django",
    "Flask",
    "Spring Boot",
    "Express.js",
    "Next.js",
    ".NET",
  ],
  DevOps: [
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "CI/CD",
    "Jenkins",
    "Terraform",
    "Ansible",
  ],
  "Soft Skills": [
    "Leadership",
    "Teamwork",
    "Problem Solving",
    "Critical Thinking",
    "Adaptability",
    "Time Management",
  ],
  Management: [
    "Project Management",
    "Agile",
    "Scrum",
    "Product Management",
    "Team Leadership",
    "Strategic Planning",
  ],
  Design: [
    "UI/UX",
    "Graphic Design",
    "Figma",
    "Adobe XD",
    "Sketch",
    "Photoshop",
    "Illustrator",
  ],
  Marketing: [
    "SEO",
    "SEM",
    "Content Marketing",
    "Social Media",
    "Email Marketing",
    "Google Analytics",
  ],
  Communication: [
    "Public Speaking",
    "Writing",
    "Presentation",
    "Negotiation",
    "Conflict Resolution",
  ],
  Tools: ["Git", "Jira", "Slack", "Asana", "Notion", "Confluence", "Trello"],
};

// Convert to a flat array for search
const ALL_SKILLS = Object.values(COMMON_SKILLS).flat();

interface SkillInputProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  maxSkills?: number;
  allowCategories?: boolean;
  allowLevels?: boolean;
  suggestedSkills?: string[];
  className?: string;
  disabled?: boolean;
}

/**
 * SkillInput Component
 *
 * A rich input component for adding, editing, and categorizing skills on a resume.
 * Features include autocomplete suggestions, skill categorization, proficiency levels,
 * and drag-and-drop reordering.
 */
export function SkillInput({
  skills,
  onChange,
  maxSkills = 50,
  allowCategories = true,
  allowLevels = true,
  suggestedSkills = [],
  className,
  disabled = false,
}: SkillInputProps) {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState<string | undefined>(undefined);
  const [newLevel, setNewLevel] = useState<Skill["level"] | undefined>(
    undefined,
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    string | null
  >(null);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [isLevelPopoverOpen, setIsLevelPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combined set of skills for suggestions (common + provided suggestions)
  const combinedSuggestions = [...new Set([...ALL_SKILLS, ...suggestedSkills])];

  // Focus input when isAddingSkill is true
  useEffect(() => {
    if (isAddingSkill && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingSkill]);

  // Filter skills based on search term and category
  const filteredSkills = combinedSuggestions.filter((skill) => {
    const matchesSearch =
      !searchTerm || skill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !activeCategoryFilter ||
      Object.entries(COMMON_SKILLS).some(
        ([category, categorySkills]) =>
          category === activeCategoryFilter && categorySkills.includes(skill),
      );
    return matchesSearch && matchesCategory;
  });

  // Get the category of a skill
  const getSkillCategory = (skillName: string): string | undefined => {
    for (const [category, skills] of Object.entries(COMMON_SKILLS)) {
      if (skills.includes(skillName)) {
        return category;
      }
    }
    return undefined;
  };

  // Add a new skill
  const addSkill = (
    skillName: string,
    category?: string,
    level?: Skill["level"],
  ) => {
    if (!skillName.trim()) return;

    // Check if skill already exists (case insensitive)
    const skillExists = skills.some(
      (s) => s.name.toLowerCase() === skillName.toLowerCase(),
    );

    if (skillExists) {
      // Maybe highlight the existing skill instead
      return;
    }

    // Check max skills limit
    if (skills.length >= maxSkills) {
      // Could show a notification here
      return;
    }

    // Create the new skill
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: skillName.trim(),
      level,
      category,
    };

    // Add the skill to the list
    onChange([...skills, newSkill]);

    // Reset form
    setNewSkill("");
    setNewCategory(undefined);
    setNewLevel(undefined);
    setIsAddingSkill(false);
    setSearchTerm("");

    // Track skill added event
    analytics
      .trackEvent("skill_added", {
        skillName: newSkill.name,
        hasCategory: !!newSkill.category,
        hasLevel: !!newSkill.level,
      })
      .catch(console.error);
  };

  // Remove a skill
  const removeSkill = (skillId: string) => {
    const skillToRemove = skills.find((s) => s.id === skillId);
    onChange(skills.filter((s) => s.id !== skillId));

    // Track skill removed event
    if (skillToRemove) {
      analytics
        .trackEvent("skill_removed", {
          skillName: skillToRemove.name,
        })
        .catch(console.error);
    }
  };

  // Update a skill's category
  const updateSkillCategory = (skillId: string, category: string) => {
    onChange(
      skills.map((skill) =>
        skill.id === skillId ? { ...skill, category } : skill,
      ),
    );
  };

  // Update a skill's level
  const updateSkillLevel = (skillId: string, level: Skill["level"]) => {
    onChange(
      skills.map((skill) =>
        skill.id === skillId ? { ...skill, level } : skill,
      ),
    );
  };

  // Handle selecting a skill from autocomplete
  const handleSelectSkill = (skill: string) => {
    // If the skill is already in the list, don't add it
    if (skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())) {
      return;
    }

    const category = getSkillCategory(skill);
    addSkill(skill, category, newLevel);
    setShowSuggestions(false);
  };

  // Handle submitting the skill form
  const handleSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSkill(newSkill, newCategory, newLevel);
  };

  // Get appropriate color based on skill level
  const getSkillLevelColor = (level?: Skill["level"]): string => {
    switch (level) {
      case "beginner":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "intermediate":
        return "bg-green-100 text-green-800 border-green-200";
      case "advanced":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "expert":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      const category = skill.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>,
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Categories filter */}
      {allowCategories && skills.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer hover:bg-gray-100",
              !activeCategoryFilter &&
                "bg-blue-100 text-blue-800 hover:bg-blue-100",
            )}
            onClick={() => setActiveCategoryFilter(null)}
          >
            All
          </Badge>

          {Object.keys(skillsByCategory).map((category) => (
            <Badge
              key={category}
              variant="outline"
              className={cn(
                "cursor-pointer hover:bg-gray-100",
                activeCategoryFilter === category &&
                  "bg-blue-100 text-blue-800 hover:bg-blue-100",
              )}
              onClick={() =>
                setActiveCategoryFilter(
                  activeCategoryFilter === category ? null : category,
                )
              }
            >
              {category}
              <span className="ml-1 text-xs">
                ({skillsByCategory[category].length})
              </span>
            </Badge>
          ))}
        </div>
      )}

      {/* Skills list */}
      <div className="flex flex-wrap gap-2">
        {skills
          .filter(
            (skill) =>
              !activeCategoryFilter || skill.category === activeCategoryFilter,
          )
          .map((skill) => (
            <div
              key={skill.id}
              className={cn(
                "group flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors",
                getSkillLevelColor(skill.level),
              )}
            >
              <span>{skill.name}</span>

              {/* Level indicator */}
              {allowLevels && skill.level && (
                <Popover
                  open={isLevelPopoverOpen}
                  onOpenChange={setIsLevelPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 rounded-full p-0 opacity-70 hover:opacity-100"
                      disabled={disabled}
                    >
                      <span className="sr-only">Change level</span>
                      <span className="text-xs capitalize">
                        {skill.level.charAt(0)}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {SKILL_LEVELS.map((level) => (
                            <CommandItem
                              key={level}
                              value={level}
                              onSelect={() => {
                                updateSkillLevel(
                                  skill.id,
                                  level as Skill["level"],
                                );
                                setIsLevelPopoverOpen(false);
                              }}
                            >
                              <div
                                className={cn(
                                  "mr-2 h-4 w-4 rounded-full",
                                  getSkillLevelColor(level as Skill["level"]),
                                )}
                              />
                              <span className="capitalize">{level}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}

              {/* Category control */}
              {allowCategories && (
                <Popover
                  open={isCategoryPopoverOpen}
                  onOpenChange={setIsCategoryPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 rounded-full p-0 opacity-0 hover:opacity-100 group-hover:opacity-70"
                      disabled={disabled}
                    >
                      <span className="sr-only">Change category</span>
                      <Tag className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandList>
                        <CommandGroup>
                          {SKILL_CATEGORIES.map((category) => (
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={() => {
                                updateSkillCategory(skill.id, category);
                                setIsCategoryPopoverOpen(false);
                              }}
                            >
                              {category}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}

              {/* Remove button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 rounded-full p-0 opacity-0 hover:text-red-600 hover:opacity-100 group-hover:opacity-70"
                onClick={() => removeSkill(skill.id)}
                disabled={disabled}
              >
                <span className="sr-only">Remove</span>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

        {/* Add skill button or input */}
        {!isAddingSkill ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-full px-3 text-sm"
            onClick={() => setIsAddingSkill(true)}
            disabled={disabled || skills.length >= maxSkills}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Skill
          </Button>
        ) : (
          <form
            onSubmit={handleSkillSubmit}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                value={newSkill}
                onChange={(e) => {
                  setNewSkill(e.target.value);
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Enter a skill..."
                className="h-7 w-48 rounded-full px-3 py-1 pr-7 text-sm"
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                disabled={disabled}
                autoComplete="off"
              />

              <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transform text-gray-400" />

              {/* Autocomplete dropdown */}
              {showSuggestions && filteredSkills.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                  <ul className="py-1">
                    {filteredSkills.slice(0, 10).map((skill, index) => (
                      <li
                        key={index}
                        className="cursor-pointer px-3 py-1.5 text-sm hover:bg-gray-100"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSkill(skill);
                        }}
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Level selector */}
            {allowLevels && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full text-xs"
                    disabled={disabled}
                  >
                    {newLevel ? (
                      <span className="capitalize">{newLevel}</span>
                    ) : (
                      <span className="text-gray-500">Level</span>
                    )}
                    <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {SKILL_LEVELS.map((level) => (
                          <CommandItem
                            key={level}
                            value={level}
                            onSelect={() => {
                              setNewLevel(level as Skill["level"]);
                            }}
                          >
                            <div
                              className={cn(
                                "mr-2 h-4 w-4 rounded-full",
                                getSkillLevelColor(level as Skill["level"]),
                              )}
                            />
                            <span className="capitalize">{level}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {/* Category selector */}
            {allowCategories && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full text-xs"
                    disabled={disabled}
                  >
                    {newCategory ? (
                      <span>{newCategory}</span>
                    ) : (
                      <span className="text-gray-500">Category</span>
                    )}
                    <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandGroup>
                        {SKILL_CATEGORIES.map((category) => (
                          <CommandItem
                            key={category}
                            value={category}
                            onSelect={() => {
                              setNewCategory(category);
                            }}
                          >
                            {category}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {/* Add/Cancel buttons */}
            <div className="flex gap-1">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                disabled={!newSkill.trim() || disabled}
              >
                <span className="sr-only">Add</span>
                <Check className="h-3.5 w-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                onClick={() => {
                  setIsAddingSkill(false);
                  setNewSkill("");
                  setNewCategory(undefined);
                  setNewLevel(undefined);
                }}
                disabled={disabled}
              >
                <span className="sr-only">Cancel</span>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Helper text */}
      {skills.length >= maxSkills && (
        <p className="text-xs text-amber-600">
          Maximum of {maxSkills} skills reached.
        </p>
      )}

      {/* Suggested skills section */}
      {suggestedSkills.length > 0 && skills.length < maxSkills && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Suggested skills
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills
              .filter(
                (skill) =>
                  !skills.some(
                    (s) => s.name.toLowerCase() === skill.toLowerCase(),
                  ),
              )
              .slice(0, 10)
              .map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => handleSelectSkill(skill)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {skill}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
