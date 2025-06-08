// File: /app/resume/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Upload, Check, Loader2 } from "lucide-react";
import { Resume } from "@/models/resume";
import { isValidEmail, isValidPhoneNumber } from "@/lib/utils/validation";

// Resume templates
const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary design with a professional feel",
    thumbnail: "/templates/modern.png",
    isPremium: false,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional layout ideal for corporate positions",
    thumbnail: "/templates/professional.png",
    isPremium: false,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stand out with a unique design for creative fields",
    thumbnail: "/templates/creative.png",
    isPremium: true,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant design focusing on content",
    thumbnail: "/templates/minimal.png",
    isPremium: false,
  },
];

export default function CreateResumePage() {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<"manual" | "upload">(
    "manual",
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  // Resume data
  const [resumeData, setResumeData] = useState<Partial<Resume>>({
    title: "My Professional Resume",
    targetJobTitle: "",
    templateId: "",
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      website: "",
    },
    professionalSummary: {
      content: "",
    },
    workExperiences: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    socialLinks: [],
    customSections: [],
  });

  // Check if user is premium on component mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("users")
            .select("subscription_tier")
            .eq("id", user.id)
            .single();

          setIsPremiumUser(data?.subscription_tier === "premium");
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();
  }, [supabase]);

  // Form steps
  const steps = [
    {
      title: "Choose Template",
      description: "Select a professional template for your resume",
    },
    {
      title: "Basic Information",
      description: "Enter your personal and contact details",
    },
    {
      title: "Professional Summary",
      description: "Write a compelling summary of your experience",
    },
    {
      title: "Create Resume",
      description: "Review and create your new resume",
    },
  ];

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    // Check if template is premium and user is not
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template?.isPremium && !isPremiumUser) {
      setError("This template is only available for premium users");
      return;
    }

    setResumeData({
      ...resumeData,
      templateId,
    });

    // Move to next step after selection
    setCurrentStep(1);
  };

  // Handle input changes
  const handleInputChange = (
    section: keyof Resume | "root",
    field: string,
    value: string,
  ) => {
    if (section === "root") {
      setResumeData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setResumeData((prev) => {
        const sectionData = prev[section];
        // Ensure sectionData is an object before spreading
        const updatedSectionData =
          typeof sectionData === "object" && sectionData !== null
            ? { ...sectionData, [field]: value }
            : { [field]: value }; // Or handle error/unexpected case

        return {
          ...prev,
          [section]: updatedSectionData,
        };
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF or Word document");
      return;
    }

    setUploadedFile(file);
    setIsParsingFile(true);

    try {
      // In a real implementation, this would call an API to parse the file
      // For now, we'll just simulate a file upload with a timeout
      setTimeout(() => {
        // Simulated data that would come from the parser
        const parsedData = {
          personalInfo: {
            fullName: "John Doe",
            email: "john@example.com",
            phone: "(555) 123-4567",
            location: "New York, NY",
          },
          professionalSummary: {
            content:
              "Experienced software developer with 5+ years of experience in frontend development.",
          },
        };

        // Merge parsed data with existing data
        setResumeData({
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            ...parsedData.personalInfo,
          },
          professionalSummary: parsedData.professionalSummary,
        });

        setIsParsingFile(false);
        setImportMethod("manual"); // Switch back to manual editing after import
      }, 2000);
    } catch (error) {
      console.error("Error parsing file:", error);
      setError("Failed to parse the uploaded file");
      setIsParsingFile(false);
    }
  };

  // Validate current step
  const validateStep = (): boolean => {
    setError(null);

    switch (currentStep) {
      case 0: // Template
        if (!resumeData.templateId) {
          setError("Please select a template");
          return false;
        }
        break;

      case 1: // Basic Info
        if (!resumeData.personalInfo?.fullName) {
          setError("Full name is required");
          return false;
        }

        if (!resumeData.personalInfo?.email) {
          setError("Email is required");
          return false;
        }

        if (!isValidEmail(resumeData.personalInfo?.email)) {
          setError("Please enter a valid email address");
          return false;
        }

        if (
          resumeData.personalInfo?.phone &&
          !isValidPhoneNumber(resumeData.personalInfo.phone)
        ) {
          setError("Please enter a valid phone number");
          return false;
        }

        if (!resumeData.targetJobTitle) {
          setError("Target job title is required");
          return false;
        }
        break;

      case 2: // Professional Summary
        if (!resumeData.professionalSummary?.content) {
          setError("Professional summary is required");
          return false;
        }

        if (resumeData.professionalSummary.content.length < 50) {
          setError(
            "Please write a more detailed professional summary (at least 50 characters)",
          );
          return false;
        }
        break;
    }

    return true;
  };

  // Navigate to next step
  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Create resume
  const handleCreateResume = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Create a complete resume object
      const newResume: Partial<Resume> = {
        ...resumeData,
        workExperiences: resumeData.workExperiences || [],
        education: resumeData.education || [],
        skills: resumeData.skills || [],
        projects: resumeData.projects || [],
        certifications: resumeData.certifications || [],
        socialLinks: resumeData.socialLinks || [],
        customSections: resumeData.customSections || [],
      };

      // Call the resume creation API
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newResume),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create resume");
      }

      const createdResume = await response.json();

      // Navigate to the newly created resume
      router.push(`/resume/${createdResume.id}/edit`);
    } catch (error) {
      console.error("Error creating resume:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create resume",
      );
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Template Selection
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Choose a Template</h2>
            <p className="text-gray-600">
              Select a professional template that best represents your style and
              industry.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
              {TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="overflow-hidden rounded-lg border"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={template.thumbnail}
                      alt={template.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />

                    {template.isPremium && (
                      <div className="absolute right-2 top-2 rounded bg-orange-500 px-2 py-1 text-xs text-white">
                        Premium
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {template.description}
                    </p>

                    <Button
                      className={`mt-3 w-full ${
                        resumeData.templateId === template.id
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                      disabled={template.isPremium && !isPremiumUser}
                    >
                      {resumeData.templateId === template.id ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Selected
                        </>
                      ) : template.isPremium && !isPremiumUser ? (
                        "Premium Template"
                      ) : (
                        "Use This Template"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 1: // Basic Information
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Basic Information</h2>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className={`text-sm font-medium ${
                    importMethod === "manual"
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setImportMethod("manual")}
                >
                  Manual Entry
                </button>

                <button
                  type="button"
                  className={`text-sm font-medium ${
                    importMethod === "upload"
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setImportMethod("upload")}
                >
                  Upload Resume
                </button>
              </div>
            </div>

            {importMethod === "upload" ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <Upload className="mx-auto mb-4 h-10 w-10 text-gray-400" />
                <h3 className="mb-2 font-medium">
                  Upload your existing resume
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  We&apos;ll extract your information automatically. Supported
                  formats: PDF, Word (.docx)
                </p>

                {isParsingFile ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-6 w-6 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">
                      Analyzing your resume...
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFileUpload(e)
                      }
                    />
                    <label htmlFor="resume-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="mx-auto"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                    </label>

                    {uploadedFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {uploadedFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="resume-title"
                    className="block text-sm font-medium"
                  >
                    Resume Title
                  </label>
                  <Input
                    id="resume-title"
                    placeholder="e.g., Software Engineer Resume"
                    value={resumeData.title || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("root", "title", e.target.value)
                    }
                  />
                  <p className="text-xs text-gray-500">
                    This title is for your reference only and won&apos;t appear
                    on the resume
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="target-job"
                    className="block text-sm font-medium"
                  >
                    Target Job Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="target-job"
                    placeholder="e.g., Senior Software Engineer"
                    value={resumeData.targetJobTitle || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        "root",
                        "targetJobTitle",
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="full-name"
                      className="block text-sm font-medium"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="full-name"
                      placeholder="John Doe"
                      value={resumeData.personalInfo?.fullName || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "personalInfo",
                          "fullName",
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={resumeData.personalInfo?.email || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "personalInfo",
                          "email",
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium"
                    >
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      placeholder="(555) 123-4567"
                      value={resumeData.personalInfo?.phone || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "personalInfo",
                          "phone",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium"
                    >
                      Location
                    </label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={resumeData.personalInfo?.location || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "personalInfo",
                          "location",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="linkedin"
                      className="block text-sm font-medium"
                    >
                      LinkedIn Profile
                    </label>
                    <Input
                      id="linkedin"
                      placeholder="linkedin.com/in/johndoe"
                      value={resumeData.personalInfo?.linkedIn || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "personalInfo",
                          "linkedIn",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium"
                    >
                      Personal Website
                    </label>
                    <Input
                      id="website"
                      placeholder="johndoe.com"
                      value={resumeData.personalInfo?.website || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "personalInfo",
                          "website",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Professional Summary
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Professional Summary</h2>
            <p className="text-gray-600">
              Write a brief, compelling summary of your professional background
              and key strengths. This will appear at the top of your resume.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="professional-summary"
                className="block text-sm font-medium"
              >
                Professional Summary <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="professional-summary"
                placeholder="Experienced software engineer with 5+ years of expertise in web development. Specialized in JavaScript frameworks like React and Vue.js. Passionate about creating clean, efficient code and delivering exceptional user experiences."
                value={resumeData.professionalSummary?.content || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange(
                    "professionalSummary",
                    "content",
                    e.target.value,
                  )
                }
                className="h-32 resize-y"
                required
              />
              <p className="text-xs text-gray-500">
                Keep your summary concise (3-5 sentences) and focused on your
                most relevant qualifications for the target role.
              </p>
            </div>

            <div className="rounded border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              <h3 className="mb-2 font-medium">Pro Tip</h3>
              <p>
                A great professional summary highlights your years of
                experience, key skills, and notable achievements. Customize it
                to reflect the specific requirements of your target job.
              </p>
            </div>
          </div>
        );

      case 3: // Review and Create
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Create Your Resume</h2>
            <p className="text-gray-600">
              Review your information before creating your resume. You&apos;ll
              be able to add more details like work experience and education in
              the next step.
            </p>

            <div className="space-y-4 rounded-lg bg-gray-50 p-6">
              <div>
                <h3 className="text-lg font-medium">{resumeData.title}</h3>
                <p className="text-gray-600">{resumeData.targetJobTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Template
                  </h4>
                  <p>
                    {TEMPLATES.find((t) => t.id === resumeData.templateId)
                      ?.name || ""}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Name</h4>
                  <p>{resumeData.personalInfo?.fullName}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p>{resumeData.personalInfo?.email}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <p>{resumeData.personalInfo?.phone || "Not provided"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Location
                  </h4>
                  <p>{resumeData.personalInfo?.location || "Not provided"}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500">
                  Professional Summary
                </h4>
                <p className="text-sm">
                  {resumeData.professionalSummary?.content}
                </p>
              </div>
            </div>

            <div className="rounded border border-green-100 bg-green-50 p-4 text-sm text-green-800">
              <h3 className="mb-2 font-medium">What&apos;s Next?</h3>
              <p>
                After creating your resume, you&apos;ll be able to add work
                experience, education, skills, and more. You can also tailor
                your resume to specific job descriptions using our AI-powered
                tools.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <Link
          href="/resume"
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resumes
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Create New Resume</h1>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative flex flex-col items-center ${
                index === steps.length - 1 ? "" : "flex-1"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  currentStep >= index
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > index ? (
                  <Check className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="mt-2 hidden text-center text-sm sm:block">
                <div
                  className={
                    currentStep >= index
                      ? "font-medium text-blue-600"
                      : "text-gray-500"
                  }
                >
                  {step.title}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`absolute left-1/2 top-5 h-0.5 w-full ${
                    currentStep > index ? "bg-blue-600" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-xs">
        {error && (
          <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNextStep}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCreateResume} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Resume"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
