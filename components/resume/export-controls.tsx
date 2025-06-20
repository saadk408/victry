// File: /components/resume/export-controls.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import {
  Download,
  Settings,
  FileText,
  File,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusBadgeClasses } from '@/lib/utils/status-colors';
import { Resume } from "@/models/resume";

/**
 * Props for ExportControls component
 */
interface ExportControlsProps {
  /** Resume ID to export */
  resumeId: string;
  /** Optional resume data if already loaded */
  resume?: Resume;
  /** Resume title for confirmation dialogs */
  resumeTitle?: string;
  /** Whether to use a compact layout */
  compact?: boolean;
  /** Optional className for styling */
  className?: string;
  /** Called when export starts */
  onExportStart?: () => void;
  /** Called when export completes successfully */
  onExportSuccess?: (format: string) => void;
  /** Called when export fails */
  onExportError?: (error: Error) => void;
}

/**
 * Available export formats
 */
type ExportFormat = "pdf" | "docx" | "txt";

/**
 * PDF paper size options
 */
type PaperSize = "a4" | "letter" | "legal";

/**
 * Export options for various formats
 */
interface ExportOptions {
  format: ExportFormat;
  paperSize: PaperSize;
  margin: "normal" | "narrow" | "wide";
  includeLinks: boolean;
  optimizeForATS: boolean;
  colorMode: "color" | "grayscale";
}

/**
 * Component for controlling resume export options and triggering exports
 * Provides various format options and customization settings for resume exports
 */
export function ExportControls({
  resumeId,
  resumeTitle = "Resume",
  compact = false,
  className,
  onExportStart,
  onExportSuccess,
  onExportError,
}: ExportControlsProps) {
  // State for export options
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "pdf",
    paperSize: "letter",
    margin: "normal",
    includeLinks: true,
    optimizeForATS: true,
    colorMode: "color",
  });

  // UI state
  const [isExporting, setIsExporting] = useState(false);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toast notifications
  const { toast } = useToast();

  /**
   * Handle changing export format
   */
  const handleFormatChange = (format: ExportFormat) => {
    setExportOptions((prev) => ({ ...prev, format }));
  };

  /**
   * Handle changing paper size
   */
  const handlePaperSizeChange = (paperSize: PaperSize) => {
    setExportOptions((prev) => ({ ...prev, paperSize }));
  };

  /**
   * Handle changing margin option
   */
  const handleMarginChange = (margin: "normal" | "narrow" | "wide") => {
    setExportOptions((prev) => ({ ...prev, margin }));
  };

  /**
   * Handle toggling include links option
   */
  const handleIncludeLinksChange = (includeLinks: boolean) => {
    setExportOptions((prev) => ({ ...prev, includeLinks }));
  };

  /**
   * Handle toggling ATS optimization
   */
  const handleOptimizeForATSChange = (optimizeForATS: boolean) => {
    setExportOptions((prev) => ({ ...prev, optimizeForATS }));
  };

  /**
   * Handle changing color mode
   */
  const handleColorModeChange = (colorMode: "color" | "grayscale") => {
    setExportOptions((prev) => ({ ...prev, colorMode }));
  };

  /**
   * Export the resume with current options
   */
  const handleExport = async () => {
    // Reset states
    setIsExporting(true);
    setError(null);

    // Close options dialog if open
    setShowOptionsDialog(false);

    // Notify parent about export start
    if (onExportStart) {
      onExportStart();
    }

    try {
      // Make API request to export endpoint
      const response = await fetch(`/api/export/${exportOptions.format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId,
          options: exportOptions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Export failed with status ${response.status}`,
        );
      }

      // For formats like PDF, get the blob and create a URL for download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create filename based on resume title and format
      const safeTitle = (resumeTitle || "Resume")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "_");

      const filename = `${safeTitle}.${exportOptions.format}`;

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up URL object
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      // Show success toast
      toast({
        title: "Export successful",
        description: `Your resume has been exported as ${exportOptions.format.toUpperCase()}.`,
        variant: "default",
      });

      // Notify parent about successful export
      if (onExportSuccess) {
        onExportSuccess(exportOptions.format);
      }
    } catch (err) {
      console.error("Error exporting resume:", err);

      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";

      // Set error state
      setError(errorMessage);

      // Show error toast
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Notify parent about export error
      if (onExportError) {
        onExportError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Quick export with default options
   */
  const handleQuickExport = () => {
    // Trigger export with current options
    handleExport();
  };

  // Render compact version (single button with popover)
  if (compact) {
    return (
      <div className={className}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isExporting}
              className="flex items-center"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end">
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                disabled={isExporting}
                onClick={() => {
                  handleFormatChange("pdf");
                  handleQuickExport();
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                disabled={isExporting}
                onClick={() => {
                  handleFormatChange("docx");
                  handleQuickExport();
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as Word
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                disabled={isExporting}
                onClick={() => {
                  handleFormatChange("txt");
                  handleQuickExport();
                }}
              >
                <File className="mr-2 h-4 w-4" />
                Export as Text
              </Button>

              <hr className="my-1 border-border" />

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                disabled={isExporting}
                onClick={() => setShowOptionsDialog(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Export Options
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Export Options Dialog */}
        <Dialog open={showOptionsDialog} onOpenChange={setShowOptionsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Export Options</DialogTitle>
              <DialogDescription>
                Customize how your resume will be exported.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">{renderExportOptions()}</div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowOptionsDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Render full version (multiple export buttons)
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        {/* Export as PDF */}
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          onClick={() => {
            handleFormatChange("pdf");
            handleQuickExport();
          }}
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </Button>

        {/* Export as Word */}
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          onClick={() => {
            handleFormatChange("docx");
            handleQuickExport();
          }}
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          Export as Word
        </Button>

        {/* Export as Text */}
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          onClick={() => {
            handleFormatChange("txt");
            handleQuickExport();
          }}
          className="flex items-center"
        >
          <File className="mr-2 h-4 w-4" />
          Export as Text
        </Button>

        {/* Advanced Options */}
        <Button
          variant="ghost"
          size="sm"
          disabled={isExporting}
          onClick={() => setShowOptionsDialog(true)}
          className="flex items-center"
        >
          <Settings className="mr-2 h-4 w-4" />
          Advanced Options
        </Button>
      </div>

      {/* Loading indicator */}
      {isExporting && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Exporting your resume...</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className={cn(
          "flex items-start space-x-2 rounded p-2 text-sm",
          getStatusBadgeClasses('error', 'default', 'soft')
        )}>
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {/* Export Options Dialog */}
      <Dialog open={showOptionsDialog} onOpenChange={setShowOptionsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Options</DialogTitle>
            <DialogDescription>
              Customize how your resume will be exported.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">{renderExportOptions()}</div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOptionsDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  /**
   * Helper function to render export options form
   */
  function renderExportOptions() {
    return (
      <>
        {/* Format selection */}
        <div className="space-y-2">
          <Label htmlFor="export-format">Export Format</Label>
          <Select
            value={exportOptions.format}
            onValueChange={(value) => handleFormatChange(value as ExportFormat)}
          >
            <SelectTrigger id="export-format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>PDF Document (.pdf)</span>
                </div>
              </SelectItem>
              <SelectItem value="docx">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Word Document (.docx)</span>
                </div>
              </SelectItem>
              <SelectItem value="txt">
                <div className="flex items-center">
                  <File className="mr-2 h-4 w-4" />
                  <span>Plain Text (.txt)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            PDF is recommended for job applications as it preserves formatting
            across all devices.
          </p>
        </div>

        {/* Paper size (PDF & DOCX only) */}
        {(exportOptions.format === "pdf" ||
          exportOptions.format === "docx") && (
          <div className="space-y-2">
            <Label htmlFor="paper-size">Paper Size</Label>
            <Select
              value={exportOptions.paperSize}
              onValueChange={(value) =>
                handlePaperSizeChange(value as PaperSize)
              }
            >
              <SelectTrigger id="paper-size">
                <SelectValue placeholder="Select paper size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">
                  US Letter (8.5&quot; &times; 11&quot;)
                </SelectItem>
                <SelectItem value="a4">A4 (210 &times; 297 mm)</SelectItem>
                <SelectItem value="legal">
                  Legal (8.5&quot; &times; 14&quot;)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Margins (PDF & DOCX only) */}
        {(exportOptions.format === "pdf" ||
          exportOptions.format === "docx") && (
          <div className="space-y-2">
            <Label>Margins</Label>
            <RadioGroup
              value={exportOptions.margin}
              onValueChange={(value: string) =>
                handleMarginChange(value as "normal" | "narrow" | "wide")
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="narrow" id="margin-narrow" />
                <Label
                  htmlFor="margin-narrow"
                  className="cursor-pointer font-normal"
                >
                  Narrow
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="margin-normal" />
                <Label
                  htmlFor="margin-normal"
                  className="cursor-pointer font-normal"
                >
                  Normal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wide" id="margin-wide" />
                <Label
                  htmlFor="margin-wide"
                  className="cursor-pointer font-normal"
                >
                  Wide
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Color mode (PDF only) */}
        {exportOptions.format === "pdf" && (
          <div className="space-y-2">
            <Label>Color Mode</Label>
            <RadioGroup
              value={exportOptions.colorMode}
              onValueChange={(value: string) =>
                handleColorModeChange(value as "color" | "grayscale")
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="color" id="color-mode-color" />
                <Label
                  htmlFor="color-mode-color"
                  className="cursor-pointer font-normal"
                >
                  Color
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="grayscale" id="color-mode-grayscale" />
                <Label
                  htmlFor="color-mode-grayscale"
                  className="cursor-pointer font-normal"
                >
                  Grayscale
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Grayscale is recommended if your resume will be printed in black
              and white.
            </p>
          </div>
        )}

        {/* Include links (PDF & DOCX only) */}
        {(exportOptions.format === "pdf" ||
          exportOptions.format === "docx") && (
          <div className="flex items-center justify-between">
            <Label htmlFor="include-links" className="cursor-pointer">
              Include hyperlinks
              <div className="text-xs text-muted-foreground">
                Include clickable links for email, website, etc.
              </div>
            </Label>
            <Switch
              id="include-links"
              checked={exportOptions.includeLinks}
              onCheckedChange={handleIncludeLinksChange}
            />
          </div>
        )}

        {/* Optimize for ATS */}
        <div className="flex items-center justify-between">
          <Label htmlFor="optimize-ats" className="cursor-pointer">
            Optimize for ATS
            <div className="text-xs text-muted-foreground">
              Ensures compatibility with applicant tracking systems
            </div>
          </Label>
          <Switch
            id="optimize-ats"
            checked={exportOptions.optimizeForATS}
            onCheckedChange={handleOptimizeForATSChange}
          />
        </div>
      </>
    );
  }
}
