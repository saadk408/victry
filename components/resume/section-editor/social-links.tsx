// File: /components/resume/section-editor/social-links.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortableList } from "@/components/resume/editor-controls/sortable-list";
import { SocialLink } from "@/types/resume";
import {
  Plus,
  Link as LinkIcon,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  Dribbble,
  AlertCircle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { isValidUrl } from "@/lib/utils/validation";
// import { analytics } from "@/services/analytics-service"; // Already removed
/* // Commented out missing Select component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
*/
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Props for the SocialLinksEditor component
 */
interface SocialLinksEditorProps {
  /** Social links array to edit */
  socialLinks: SocialLink[];
  /** Callback function called when social links change */
  onChange: (socialLinks: SocialLink[]) => void;
  /** Whether the editor is in a disabled state */
  disabled?: boolean;
}

/**
 * Component for editing social links section of a resume
 * Allows adding, editing, removing, and reordering social profiles
 */
export function SocialLinksEditor({
  socialLinks,
  onChange,
  disabled = false,
}: SocialLinksEditorProps) {
  // Track URL validation status
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  // Track previous count for analytics
  const [previousCount, setPreviousCount] = useState(socialLinks.length);

  // Remove analytics tracking from useEffect
  useEffect(() => {
    if (socialLinks.length !== previousCount) {
      // Removed analytics call
      setPreviousCount(socialLinks.length);
    }
  }, [socialLinks, previousCount]);

  // Define common social platforms with icons and URL patterns
  const platforms = [
    {
      value: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      prefix: "https://linkedin.com/in/",
    },
    {
      value: "github",
      label: "GitHub",
      icon: Github,
      prefix: "https://github.com/",
    },
    {
      value: "twitter",
      label: "Twitter",
      icon: Twitter,
      prefix: "https://twitter.com/",
    },
    { value: "website", label: "Website", icon: Globe, prefix: "https://" },
    {
      value: "dribbble",
      label: "Dribbble",
      icon: Dribbble,
      prefix: "https://dribbble.com/",
    },
    {
      value: "behance",
      label: "Behance",
      icon: LinkIcon,
      prefix: "https://behance.net/",
    },
    {
      value: "instagram",
      label: "Instagram",
      icon: Instagram,
      prefix: "https://instagram.com/",
    },
    {
      value: "youtube",
      label: "YouTube",
      icon: Youtube,
      prefix: "https://youtube.com/",
    },
    {
      value: "facebook",
      label: "Facebook",
      icon: Facebook,
      prefix: "https://facebook.com/",
    },
    { value: "other", label: "Other", icon: LinkIcon, prefix: "https://" },
  ];

  // Create a new empty social link
  const createNewSocialLink = (): SocialLink => ({
    id: crypto.randomUUID(),
    platform: "",
    url: "",
    username: "",
  });

  // Add a new social link
  const handleAddSocialLink = () => {
    const newSocialLink = createNewSocialLink();
    const updatedLinks = [...socialLinks, newSocialLink];
    onChange(updatedLinks);
  };

  // Update a specific social link
  const handleUpdateSocialLink = (
    updatedEntry: Partial<SocialLink>,
    index: number,
  ) => {
    const updatedSocialLinks = [...socialLinks];
    updatedSocialLinks[index] = {
      ...updatedSocialLinks[index],
      ...updatedEntry,
    };

    // Validate URL when it changes
    if ("url" in updatedEntry) {
      validateUrl(updatedEntry.url || "", index);
    }

    onChange(updatedSocialLinks);
  };

  // Delete a social link
  const handleDeleteSocialLink = (index: number) => {
    const updatedSocialLinks = socialLinks.filter((_, i) => i !== index);
    onChange(updatedSocialLinks);

    // Clear any validation errors for this link
    const newErrors = { ...validationErrors };
    delete newErrors[index.toString()];
    setValidationErrors(newErrors);
  };

  // Handle reordering of social links
  const handleReorderSocialLinks = (reorderedSocialLinks: SocialLink[]) => {
    onChange(reorderedSocialLinks);
  };

  // Handle username change with auto URL update
  const handleUsernameChange = (username: string, index: number) => {
    const updates: Partial<SocialLink> = { username };
    handleUpdateSocialLink(updates, index);

    // Auto-update URL if we have a platform prefix
    const link = socialLinks[index];
    const platform = platforms.find((p) => p.value === link.platform);

    if (platform?.prefix && username) {
      const urlUpdates: Partial<SocialLink> = {
        url: `${platform.prefix}${username}`,
      };
      handleUpdateSocialLink(urlUpdates, index);
    }
  };

  // Validate URL format
  const validateUrl = (url: string, index: number) => {
    const newErrors = { ...validationErrors };

    if (!url) {
      // Empty URL is valid, but we remove any existing error
      delete newErrors[index.toString()];
    } else if (!isValidUrl(url)) {
      newErrors[index.toString()] = "Please enter a valid URL";
    } else {
      delete newErrors[index.toString()];
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get platform icon component
  const getPlatformIcon = (platform: string) => {
    const platformInfo = platforms.find((p) => p.value === platform);
    const IconComponent = platformInfo?.icon || LinkIcon;
    return <IconComponent className="h-4 w-4" />;
  };

  // Check if URL is valid
  const isUrlValid = (url: string, index: number): boolean => {
    return !validationErrors[index.toString()] && !!url;
  };

  // Render validation icon
  const renderValidationIcon = (url: string, index: number) => {
    if (!url) return null;

    if (isUrlValid(url, index)) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Check className="h-4 w-4 text-success" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Valid URL format</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (validationErrors[index.toString()]) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{validationErrors[index.toString()]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Social Links</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add links to your professional profiles
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSocialLink}
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Social Link
        </Button>
      </div>

      {socialLinks.length === 0 ? (
        <div className="rounded-md border-2 border-dashed py-8 text-center">
          <LinkIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <h4 className="mb-1 text-base font-medium text-foreground">
            No social links added yet
          </h4>
          <p className="mx-auto mb-3 max-w-sm text-sm text-muted-foreground">
            Add links to your professional social media profiles or portfolio
            websites to showcase your work and online presence.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSocialLink}
            disabled={disabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Social Link
          </Button>
        </div>
      ) : (
        <SortableList
          items={socialLinks}
          onReorder={handleReorderSocialLinks}
          disabled={disabled}
          getItemKey={(item) => item.id}
          onRemove={handleDeleteSocialLink}
          addButtonText="Add Social Link"
          onAdd={handleAddSocialLink}
          emptyPlaceholder={
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No social links added yet</p>
            </div>
          }
          renderItem={(socialLink, index) => (
            <div className="flex w-full flex-col gap-3 p-3 sm:flex-row">
              {/* Platform Selector - Commented out due to missing Select component */}
              {/*
              <div className="w-full sm:w-1/4">
                <Select
                  value={socialLink.platform}
                  onValueChange={(value: string) =>
                    handlePlatformChange(value, index)
                  }
                  disabled={disabled}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      !socialLink.platform && "text-muted-foreground",
                    )}
                  >
                    <SelectValue placeholder="Select platform">
                      {socialLink.platform ? (
                        <div className="flex items-center">
                          {getPlatformIcon(socialLink.platform)}
                          <span className="ml-2">
                            {platforms.find(
                              (p) => p.value === socialLink.platform,
                            )?.label || socialLink.platform}
                          </span>
                        </div>
                      ) : (
                        "Select platform"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div className="flex items-center">
                          <platform.icon className="mr-2 h-4 w-4" />
                          {platform.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              */}
              {/* Fallback display when Select is missing */}
              <div className="w-full rounded border px-3 py-2 text-sm sm:w-1/4">
                {socialLink.platform ? (
                  <div className="flex items-center">
                    {getPlatformIcon(socialLink.platform)}
                    <span className="ml-2">
                      {platforms.find((p) => p.value === socialLink.platform)
                        ?.label || socialLink.platform}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No platform selected</span>
                )}
              </div>

              {/* URL Input */}
              <div className="relative flex-grow">
                <div className="flex items-center">
                  <Input
                    value={socialLink.url}
                    onChange={(e) =>
                      handleUpdateSocialLink({ url: e.target.value }, index)
                    }
                    onBlur={(e) => validateUrl(e.target.value, index)}
                    placeholder="https://..."
                    className={cn(
                      "w-full pr-8",
                      validationErrors[index.toString()] &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    disabled={disabled}
                    aria-invalid={!!validationErrors[index.toString()]}
                    aria-errormessage={
                      validationErrors[index.toString()]
                        ? `url-error-${index}`
                        : undefined
                    }
                  />
                  {socialLink.url && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 transform">
                      {renderValidationIcon(socialLink.url, index)}
                    </div>
                  )}
                </div>
                {validationErrors[index.toString()] && (
                  <p
                    id={`url-error-${index}`}
                    className="mt-1 text-xs text-destructive"
                  >
                    {validationErrors[index.toString()]}
                  </p>
                )}
              </div>

              {/* Username (optional) */}
              <div className="w-full sm:w-1/4">
                <Input
                  value={socialLink.username || ""}
                  onChange={(e) => handleUsernameChange(e.target.value, index)}
                  placeholder="Username (optional)"
                  className="w-full"
                  disabled={disabled || !socialLink.platform}
                />
              </div>
            </div>
          )}
        />
      )}

      {/* Help Text */}
      <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
        <h4 className="mb-1 font-medium text-foreground">
          Tips for Social Links
        </h4>
        <ul className="list-inside list-disc space-y-1">
          <li>Only include professional profiles relevant to your career</li>
          <li>Ensure all profiles are up-to-date and showcase your work</li>
          <li>Use full URLs to ensure links work properly on resumes</li>
          <li>For GitHub, include repositories that demonstrate your skills</li>
          <li>
            For portfolio sites, ensure they contain your best and most relevant
            work
          </li>
        </ul>
      </div>
    </div>
  );
}
