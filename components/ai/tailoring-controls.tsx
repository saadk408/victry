// File: /components/ai/tailoring-controls.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Info, Sparkles, RefreshCw } from "lucide-react";
import { TailoringSettings } from "@/types/resume";
import { clientAnalytics } from "@/lib/utils/client-analytics";

interface TailoringControlsProps {
  onSettingsChange: (settings: TailoringSettings) => void;
  initialSettings?: Partial<TailoringSettings>;
  onResetToDefault?: () => void;
  showExamples?: boolean;
  disabled?: boolean;
}

/**
 * Controls for customizing how AI tailors a resume to match job descriptions.
 * Provides user-friendly options for controlling the balance between matching
 * job requirements and preserving the user's original content.
 */
export function TailoringControls({
  onSettingsChange,
  initialSettings,
  onResetToDefault,
  showExamples = false,
  disabled = false,
}: TailoringControlsProps) {
  // Initialize settings with defaults or provided values
  const [intensity, setIntensity] = useState(initialSettings?.intensity ?? 50);
  const [preserveVoice, setPreserveVoice] = useState(
    initialSettings?.preserveVoice ?? true,
  );
  const [focusKeywords, setFocusKeywords] = useState(
    initialSettings?.focusKeywords ?? true,
  );
  const [showIntensityExamples, setShowIntensityExamples] = useState(false);

  // Track setting changes for analytics
  const trackSettingChange = useCallback(
    (settingName: string, value: number | boolean | string) => {
      clientAnalytics.trackTailoringSettingChanged(settingName, value);
    },
    [],
  );

  // Handle intensity changes with analytics tracking
  const handleIntensityChange = useCallback(
    (values: number[]) => {
      const newIntensity = values[0];
      setIntensity(newIntensity);
      trackSettingChange("intensity", newIntensity);
    },
    [trackSettingChange],
  );

  // Handle preserve voice toggle with analytics tracking
  const handlePreserveVoiceChange = useCallback(
    (checked: boolean) => {
      setPreserveVoice(checked);
      trackSettingChange("preserveVoice", checked);
    },
    [trackSettingChange],
  );

  // Handle focus keywords toggle with analytics tracking
  const handleFocusKeywordsChange = useCallback(
    (checked: boolean) => {
      setFocusKeywords(checked);
      trackSettingChange("focusKeywords", checked);
    },
    [trackSettingChange],
  );

  // Reset settings to defaults
  const handleReset = useCallback(() => {
    setIntensity(50);
    setPreserveVoice(true);
    setFocusKeywords(true);
    trackSettingChange("reset_to_defaults", true);

    if (onResetToDefault) {
      onResetToDefault();
    }
  }, [trackSettingChange, onResetToDefault]);

  // Call the onChange handler whenever settings change
  useEffect(() => {
    onSettingsChange({
      intensity,
      preserveVoice,
      focusKeywords,
    });
  }, [intensity, preserveVoice, focusKeywords, onSettingsChange]);

  // Get the label for the current intensity level
  const getIntensityLabel = (value: number): string => {
    if (value < 33) return "Subtle";
    if (value < 66) return "Balanced";
    return "Aggressive";
  };

  // Get color class for intensity badge
  const getIntensityColorClass = (value: number): string => {
    if (value < 33) return "bg-primary/10 text-primary";
    if (value < 66) return "bg-green/10 text-green-foreground";
    return "bg-warning/10 text-warning-foreground";
  };

  // Examples of how different intensity levels affect resume content
  const renderIntensityExamples = () => {
    if (!showIntensityExamples || !showExamples) return null;

    return (
      <div className="mt-4 rounded-md border border-border bg-muted/50 p-3 text-sm">
        <h5 className="mb-2 flex items-center font-medium text-foreground">
          <Sparkles className="mr-1.5 h-4 w-4 text-primary" />
          Example Tailoring Results
        </h5>

        <div className="space-y-3">
          {/* Original text */}
          <div>
            <h6 className="mb-1 text-xs font-medium text-muted-foreground">
              Original bullet point:
            </h6>
            <p className="rounded border border-border bg-background p-2 text-sm text-foreground">
              Managed a team of developers to deliver web applications for
              clients in the retail sector.
            </p>
          </div>

          {/* Examples for each intensity level */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {/* Subtle */}
            <div>
              <h6 className="mb-1 text-xs font-medium text-muted-foreground">
                Subtle:
              </h6>
              <p className="rounded border border-border bg-background p-2 text-sm text-foreground">
                Managed a team of developers to deliver{" "}
                <span className="bg-primary/10">e-commerce</span> applications for
                clients in the retail sector.
              </p>
            </div>

            {/* Balanced */}
            <div>
              <h6 className="mb-1 text-xs font-medium text-muted-foreground">
                Balanced:
              </h6>
              <p className="rounded border border-border bg-background p-2 text-sm text-foreground">
                <span className="bg-green/10">Led</span> a team of developers to
                deliver{" "}
                <span className="bg-green/10">responsive e-commerce</span>{" "}
                applications for <span className="bg-green/10">enterprise</span>{" "}
                clients in the retail sector.
              </p>
            </div>

            {/* Aggressive */}
            <div>
              <h6 className="mb-1 text-xs font-medium text-muted-foreground">
                Aggressive:
              </h6>
              <p className="rounded border border-border bg-background p-2 text-sm text-foreground">
                <span className="bg-warning/10">
                  Led cross-functional development team
                </span>{" "}
                to deliver{" "}
                <span className="bg-warning/10">
                  high-performance, responsive e-commerce
                </span>{" "}
                applications,{" "}
                <span className="bg-warning/10">increasing sales by 32%</span> for{" "}
                <span className="bg-warning/10">enterprise</span> clients in the
                retail sector.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`space-y-6 ${disabled ? "pointer-events-none opacity-70" : ""}`}
    >
      {/* Intensity Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Label htmlFor="intensity-slider" className="mr-2">
              Tailoring Intensity
            </Label>
            <button
              type="button"
              onClick={() => setShowIntensityExamples(!showIntensityExamples)}
              className="text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label={
                showIntensityExamples ? "Hide examples" : "Show examples"
              }
              title="Show examples"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-sm font-medium ${getIntensityColorClass(intensity)}`}
          >
            {getIntensityLabel(intensity)}
          </span>
        </div>

        <Slider
          id="intensity-slider"
          min={0}
          max={100}
          step={10}
          value={[intensity]}
          onValueChange={handleIntensityChange}
          className="py-2"
          aria-label="Adjust tailoring intensity"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={intensity}
          aria-valuetext={`${intensity}% - ${getIntensityLabel(intensity)}`}
          disabled={disabled}
        />

        <div className="flex justify-between px-1 text-xs text-muted-foreground">
          <span>Subtle</span>
          <span>Balanced</span>
          <span>Aggressive</span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {intensity < 33
            ? "Makes minimal changes to match the job requirements while preserving your original content."
            : intensity < 66
              ? "Makes moderate changes to better align with the job description while maintaining your core content."
              : "Makes substantial changes to strongly match job requirements. Best for competitive positions."}
        </p>

        {renderIntensityExamples()}
      </div>

      {/* Preserve Voice Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="preserve-voice">Preserve My Writing Style</Label>
          <p className="text-xs text-muted-foreground">
            Maintains your unique voice and tone in the tailored content
          </p>
        </div>
        <Switch
          id="preserve-voice"
          checked={preserveVoice}
          onCheckedChange={handlePreserveVoiceChange}
          aria-label="Preserve my writing style"
          disabled={disabled}
        />
      </div>

      {/* Focus Keywords Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="focus-keywords">Match Job Keywords</Label>
          <p className="text-xs text-muted-foreground">
            Prioritizes exact keyword matches from the job description
          </p>
        </div>
        <Switch
          id="focus-keywords"
          checked={focusKeywords}
          onCheckedChange={handleFocusKeywordsChange}
          aria-label="Match job keywords"
          disabled={disabled}
        />
      </div>

      {/* Reset button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-muted-foreground hover:text-foreground"
          disabled={
            (intensity === 50 && preserveVoice && focusKeywords) || disabled
          }
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Reset to defaults
        </Button>
      </div>

      {/* Explanation */}
      <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-primary-foreground">
        <h4 className="mb-2 font-medium">What These Settings Do</h4>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>Tailoring Intensity</strong>: Controls how aggressively the
            AI modifies your resume to match the job description
          </li>
          <li>
            <strong>Preserve My Writing Style</strong>: Keeps your unique voice
            and writing style in the tailored content
          </li>
          <li>
            <strong>Match Job Keywords</strong>: Prioritizes incorporating exact
            keywords from the job description
          </li>
        </ul>
      </div>
    </div>
  );
}
