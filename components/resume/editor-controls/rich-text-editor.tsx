// File: /components/resume/editor-controls/rich-text-editor.tsx
"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Interface for the component props
export interface RichTextEditorProps {
  /** Initial HTML content */
  initialContent?: string;
  /** Placeholder text when content is empty */
  placeholder?: string;
  /** Function called on content change with HTML string */
  onChange?: (html: string) => void;
  /** Whether the editor is in read-only mode */
  readOnly?: boolean;
  /** Additional CSS classes for the editor */
  className?: string;
  /** Minimum height of the editor in pixels */
  minHeight?: number;
  /** Maximum height of the editor in pixels (scrollable if content exceeds) */
  maxHeight?: number;
  /** Which toolbar buttons to show, defaults to all */
  toolbarButtons?: (
    | "bold"
    | "italic"
    | "underline"
    | "bulletList"
    | "orderedList"
    | "link"
    | "align"
    | "undo"
    | "redo"
  )[];
  /** Tracking category for analytics */
  analyticsCategory?: string;
}

// Dynamically import the editor content to reduce initial bundle size
// This saves ~100-150KB by lazy loading TipTap and its extensions
const RichTextEditorContent = dynamic(
  () => import("./rich-text-editor-content").then((mod) => ({ default: mod.RichTextEditorContent })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Loading editor...</span>
      </div>
    ),
  }
);

/**
 * Rich text editor component with formatting toolbar
 * Used for editing resume sections like professional summary and work experience bullets
 * 
 * This component uses dynamic imports to lazy load TipTap dependencies,
 * significantly reducing the initial bundle size for the resume editor.
 */
export function RichTextEditor(props: RichTextEditorProps) {
  return <RichTextEditorContent {...props} />;
}
