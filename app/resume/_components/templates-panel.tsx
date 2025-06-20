// File: /app/resume/_components/templates-panel.tsx
"use client";

// import { useState } from "react"; // Removed unused import
import Image from "next/image";

interface Template {
  id: string;
  name: string;
  style: string;
  thumbnail: string;
  colors: string[];
}

interface TemplatesPanelProps {
  currentTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
}

export function TemplatesPanel({
  currentTemplateId,
  onTemplateSelect,
}: TemplatesPanelProps) {
  // Sample templates (would come from API or database in real implementation)
  const templates: Template[] = [
    {
      id: "classic",
      name: "Classic",
      style: "simple • classic",
      thumbnail: "/templates/classic.png",
      colors: ["#FFFFFF", "#333333"],
    },
    {
      id: "cedar",
      name: "Cedar",
      style: "modern • simple",
      thumbnail: "/templates/cedar.png",
      colors: ["#6366F1", "#333333", "#F97316", "#10B981", "#14B8A6"],
    },
    {
      id: "hemlock",
      name: "Hemlock",
      style: "simple • classic",
      thumbnail: "/templates/hemlock.png",
      colors: ["#FFFFFF", "#333333"],
    },
    {
      id: "maple",
      name: "Maple",
      style: "elegant • professional",
      thumbnail: "/templates/maple.png",
      colors: ["#FFFFFF", "#333333", "#4B5563", "#6B7280"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="space-y-2">
            <div
              className={`cursor-pointer overflow-hidden rounded-md border transition-all ${currentTemplateId === template.id ? "border-primary shadow-md" : "border-border hover:border-muted-foreground"}`}
              onClick={() => onTemplateSelect(template.id)}
            >
              <div className="relative h-40 w-full">
                <Image
                  src={template.thumbnail}
                  alt={template.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.style}</p>
              <div className="mt-1 flex justify-center space-x-1">
                {template.colors.map((color, index) => (
                  <div
                    key={index}
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
