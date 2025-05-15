// File: /components/resume/section-editor/certifications.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SortableList } from "@/components/resume/editor-controls/sortable-list";
import { Certification } from "@/types/resume";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Trash2,
  Plus,
  Award,
  Building,
  Calendar,
  Link,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils/formatting";

/**
 * Props for the CertificationsEditor component
 */
interface CertificationsEditorProps {
  /** Certifications array to edit */
  certifications: Certification[];
  /** Callback function called when certifications change */
  onChange: (certifications: Certification[]) => void;
  /** Whether the editor is in a disabled state */
  disabled?: boolean;
}

/**
 * Component for editing certifications section of a resume
 * Allows adding, editing, removing, and reordering certification entries
 */
export function CertificationsEditor({
  certifications,
  onChange,
  disabled = false,
}: CertificationsEditorProps) {
  // Track which certification is being edited
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create a new empty certification
  const createNewCertification = (): Certification => ({
    id: crypto.randomUUID(),
    name: "",
    issuer: "",
    date: new Date().toISOString(),
    expires: undefined,
    url: undefined,
  });

  // Add a new certification
  const handleAddCertification = () => {
    const newCertification = createNewCertification();
    const updatedCertifications = [...certifications, newCertification];
    onChange(updatedCertifications);
    setExpandedId(newCertification.id);
  };

  // Update a specific certification
  const handleUpdateCertification = (
    updatedEntry: Partial<Certification>,
    index: number,
  ) => {
    const updatedCertifications = [...certifications];
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      ...updatedEntry,
    };
    onChange(updatedCertifications);
  };

  // Delete a certification
  const handleDeleteCertification = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index);
    onChange(updatedCertifications);
  };

  // Handle reordering of certifications
  const handleReorderCertifications = (
    reorderedCertifications: Certification[],
  ) => {
    onChange(reorderedCertifications);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Certifications</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCertification}
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="rounded-md border-2 border-dashed py-8 text-center">
          <Award className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <h4 className="mb-1 text-base font-medium text-gray-700">
            No certifications added yet
          </h4>
          <p className="mx-auto mb-3 max-w-sm text-sm text-gray-500">
            Add professional certifications, licenses, or credentials relevant
            to your career goals.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCertification}
            disabled={disabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Certification
          </Button>
        </div>
      ) : (
        <SortableList
          items={certifications}
          onReorder={handleReorderCertifications}
          disabled={disabled}
          getItemKey={(item) => item.id}
          addButtonText="Add Certification"
          onAdd={handleAddCertification}
          emptyPlaceholder={
            <div className="py-6 text-center">
              <p className="text-gray-500">No certifications added yet</p>
            </div>
          }
          renderItem={(certification, index) => (
            <Accordion
              type="single"
              collapsible
              value={
                expandedId === certification.id ? certification.id : undefined
              }
              onValueChange={(value: string | undefined) =>
                setExpandedId(value || null)
              }
              className="w-full"
            >
              <AccordionItem
                value={certification.id}
                className="overflow-hidden rounded-md border"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 data-[state=open]:bg-gray-50">
                  <div className="flex w-full flex-col items-start text-left">
                    <div className="flex w-full items-center justify-between">
                      <h4 className="truncate font-medium">
                        {certification.name || "Untitled Certification"}
                      </h4>
                      <div className="text-sm text-gray-500">
                        {certification.date
                          ? formatDate(certification.date, "short")
                          : ""}
                      </div>
                    </div>
                    {certification.issuer && (
                      <p className="text-sm text-gray-600">
                        {certification.issuer}
                      </p>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="space-y-4">
                    {/* Certification Name */}
                    <div>
                      <Label
                        htmlFor={`certification-name-${index}`}
                        className="flex items-center"
                      >
                        <Award className="mr-2 h-4 w-4 text-gray-500" />
                        Certification Name
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      <Input
                        id={`certification-name-${index}`}
                        value={certification.name}
                        onChange={(e) =>
                          handleUpdateCertification(
                            { name: e.target.value },
                            index,
                          )
                        }
                        placeholder="AWS Certified Solutions Architect, PMP, etc."
                        className="mt-1"
                        disabled={disabled}
                        required
                      />
                    </div>

                    {/* Issuing Organization */}
                    <div>
                      <Label
                        htmlFor={`certification-issuer-${index}`}
                        className="flex items-center"
                      >
                        <Building className="mr-2 h-4 w-4 text-gray-500" />
                        Issuing Organization
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      <Input
                        id={`certification-issuer-${index}`}
                        value={certification.issuer}
                        onChange={(e) =>
                          handleUpdateCertification(
                            { issuer: e.target.value },
                            index,
                          )
                        }
                        placeholder="Amazon Web Services, PMI, etc."
                        className="mt-1"
                        disabled={disabled}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Issue Date */}
                      <div>
                        <Label
                          htmlFor={`certification-date-${index}`}
                          className="flex items-center"
                        >
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          Issue Date
                          <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <Input
                          id={`certification-date-${index}`}
                          type="date"
                          value={
                            certification.date
                              ? new Date(certification.date)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleUpdateCertification(
                              { date: e.target.value },
                              index,
                            )
                          }
                          className="mt-1"
                          disabled={disabled}
                          required
                        />
                      </div>

                      {/* Expiration Date */}
                      <div>
                        <Label
                          htmlFor={`certification-expiry-${index}`}
                          className="flex items-center"
                        >
                          <Clock className="mr-2 h-4 w-4 text-gray-500" />
                          Expiration Date
                        </Label>
                        <Input
                          id={`certification-expiry-${index}`}
                          type="date"
                          value={
                            certification.expires
                              ? new Date(certification.expires)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleUpdateCertification(
                              { expires: e.target.value },
                              index,
                            )
                          }
                          className="mt-1"
                          disabled={disabled}
                        />
                      </div>
                    </div>

                    {/* Credential URL */}
                    <div>
                      <Label
                        htmlFor={`certification-url-${index}`}
                        className="flex items-center"
                      >
                        <Link className="mr-2 h-4 w-4 text-gray-500" />
                        Credential URL
                      </Label>
                      <Input
                        id={`certification-url-${index}`}
                        value={certification.url || ""}
                        onChange={(e) =>
                          handleUpdateCertification(
                            { url: e.target.value },
                            index,
                          )
                        }
                        placeholder="https://www.credly.com/badges/..."
                        className="mt-1"
                        disabled={disabled}
                      />
                    </div>

                    {/* Delete Certification Button */}
                    <div className="flex justify-end border-t pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCertification(index)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={disabled}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Certification
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        />
      )}

      {/* Help Text */}
      <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">
        <h4 className="mb-1 font-medium text-gray-700">
          Tips for Certifications
        </h4>
        <ul className="list-inside list-disc space-y-1">
          <li>List certifications relevant to your target job or industry</li>
          <li>
            Include the issuing organization&apos;s full name, not abbreviations
          </li>
          <li>Specify both issue and expiration dates when applicable</li>
          <li>Add credential URLs for digital badges or verification</li>
          <li>
            List certifications in reverse chronological order (most recent
            first)
          </li>
        </ul>
      </div>
    </div>
  );
}
