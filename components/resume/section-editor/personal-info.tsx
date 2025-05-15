// File: /components/resume/section-editor/personal-info.tsx
"use client";

import { useState, useEffect } from "react";
// import { Button } from "@/app/_components/ui/button"; // Removed unused import
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonalInfo } from "@/types/resume";
import {
  isValidEmail,
  isValidPhoneNumber,
  isValidUrl,
} from "@/lib/utils/validation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Github,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";

/**
 * Props for the PersonalInfoEditor component
 */
interface PersonalInfoEditorProps {
  /** Personal info data to edit */
  personalInfo: PersonalInfo;
  /** Callback function called when personal info changes */
  onChange: (personalInfo: PersonalInfo) => void;
  /** Whether the editor is in a disabled state */
  disabled?: boolean;
}

/**
 * Component for editing personal information section of a resume
 * Handles contact details like name, email, phone, location, and social profiles
 */
export function PersonalInfoEditor({
  personalInfo,
  onChange,
  disabled = false,
}: PersonalInfoEditorProps) {
  // Create a local copy of the personal info for form handling
  const [info, setInfo] = useState<PersonalInfo>(personalInfo);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Sync local state when props change (e.g., when parent resets form)
  useEffect(() => {
    setInfo(personalInfo);
  }, [personalInfo]);

  // Validate the entire form
  const validateForm = (data: PersonalInfo): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!data.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!data.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Optional fields with format validation
    if (data.phone?.trim() && !isValidPhoneNumber(data.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // LinkedIn URL format
    if (data.linkedIn?.trim() && !isValidUrl(addHttpsIfNeeded(data.linkedIn))) {
      newErrors.linkedIn = "Please enter a valid LinkedIn URL";
    }

    // Website URL format
    if (data.website?.trim() && !isValidUrl(addHttpsIfNeeded(data.website))) {
      newErrors.website = "Please enter a valid website URL";
    }

    // GitHub URL format
    if (data.github?.trim() && !isValidUrl(addHttpsIfNeeded(data.github))) {
      newErrors.github = "Please enter a valid GitHub URL";
    }

    return newErrors;
  };

  // Add https:// prefix if URL doesn't have a protocol
  const addHttpsIfNeeded = (url: string = ""): string => {
    if (!url || url.match(/^https?:\/\//)) {
      return url;
    }
    return `https://${url}`;
  };

  // Handle field blur for validation
  const handleBlur = (field: keyof PersonalInfo) => {
    setTouched({ ...touched, [field]: true });

    // Validate the field
    const newErrors = validateForm(info);
    setErrors(newErrors);
  };

  // Handle input change for string fields only
  const handleChange = (
    // Type field more specifically to exclude non-string fields like additionalInfo
    field: Exclude<keyof PersonalInfo, "additionalInfo">,
    value: string,
  ) => {
    const updatedInfo = { ...info, [field]: value };
    setInfo(updatedInfo);

    // If field has been touched, validate it immediately for instant feedback
    if (touched[field]) {
      const newErrors = validateForm(updatedInfo);
      setErrors(newErrors);
    }

    // Only propagate changes if there are no validation errors
    // or if we're just updating a field that doesn't have errors
    const newErrors = validateForm(updatedInfo);
    const hasCurrentFieldError = !!newErrors[field];
    const hasOtherErrors = Object.keys(newErrors).some(
      (key) => key !== field && !!newErrors[key],
    );

    if (!hasCurrentFieldError && !hasOtherErrors) {
      onChange(updatedInfo);
    } else if (!hasCurrentFieldError && hasOtherErrors) {
      // If this field is valid but others have errors, still update this field
      const fieldUpdate = { [field]: value };
      onChange({ ...personalInfo, ...fieldUpdate });
    }
  };

  // Render a form field with icon, label, input, and error message
  const renderField = (
    field: keyof PersonalInfo,
    label: string,
    icon: React.ReactNode,
    type: string = "text",
    placeholder: string = "",
    required: boolean = false,
  ) => {
    const hasError = !!errors[field] && touched[field];

    return (
      <div className="space-y-2">
        <Label htmlFor={`personal-info-${field}`} className="flex items-center">
          {icon}
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        <div className="relative">
          <Input
            id={`personal-info-${field}`}
            type={type}
            value={info[field] || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${field}-error` : undefined}
            className={cn(hasError && "border-red-500 focus:ring-red-500")}
          />
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 transform text-red-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
        </div>
        {hasError && (
          <p
            id={`${field}-error`}
            className="flex items-center gap-1 text-sm text-red-500"
          >
            {errors[field]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Personal Information</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Full Name */}
        {renderField(
          "fullName",
          "Full Name",
          <User className="mr-2 h-4 w-4 text-gray-500" />,
          "text",
          "John Doe",
          true,
        )}

        {/* Email */}
        {renderField(
          "email",
          "Email",
          <Mail className="mr-2 h-4 w-4 text-gray-500" />,
          "email",
          "johndoe@example.com",
          true,
        )}

        {/* Phone */}
        {renderField(
          "phone",
          "Phone Number",
          <Phone className="mr-2 h-4 w-4 text-gray-500" />,
          "tel",
          "(123) 456-7890",
        )}

        {/* Location */}
        {renderField(
          "location",
          "Location",
          <MapPin className="mr-2 h-4 w-4 text-gray-500" />,
          "text",
          "City, State",
        )}
      </div>

      <h4 className="text-md mt-6 font-medium">Professional Profiles</h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* LinkedIn */}
        {renderField(
          "linkedIn",
          "LinkedIn",
          <Linkedin className="mr-2 h-4 w-4 text-gray-500" />,
          "text",
          "linkedin.com/in/johndoe",
        )}

        {/* Website */}
        {renderField(
          "website",
          "Website",
          <Globe className="mr-2 h-4 w-4 text-gray-500" />,
          "text",
          "johndoe.com",
        )}

        {/* GitHub */}
        {renderField(
          "github",
          "GitHub",
          <Github className="mr-2 h-4 w-4 text-gray-500" />,
          "text",
          "github.com/johndoe",
        )}
      </div>

      {/* Help Text */}
      <div className="mt-4 rounded-md bg-gray-50 p-4 text-sm text-gray-500">
        <h4 className="mb-1 font-medium text-gray-700">
          Tips for Contact Information
        </h4>
        <ul className="list-inside list-disc space-y-1">
          <li>
            Use a professional email address (avoid nicknames or unprofessional
            addresses)
          </li>
          <li>
            Include your LinkedIn profile URL to help recruiters find and verify
            your experience
          </li>
          <li>
            For location, city and state/country are usually sufficient (no need
            for full address)
          </li>
          <li>
            Only include social profiles that are up-to-date and showcase your
            professional work
          </li>
          <li>
            Make sure all contact information is current and regularly checked
          </li>
        </ul>
      </div>
    </div>
  );
}
