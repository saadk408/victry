// File: /components/resume/editor-controls/rich-text-editor-content.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import type { RichTextEditorProps } from "./rich-text-editor";

/**
 * Internal rich text editor implementation with all TipTap dependencies
 * This component is dynamically imported to reduce initial bundle size
 */
export function RichTextEditorContent({
  initialContent = "",
  placeholder = "Start typing...",
  onChange,
  readOnly = false,
  className = "",
  minHeight = 150,
  maxHeight = 400,
  toolbarButtons = [
    "bold",
    "italic",
    "underline",
    "bulletList",
    "orderedList",
    "link",
    "align",
    "undo",
    "redo",
  ],
  analyticsCategory = "rich_text_editor",
}: RichTextEditorProps) {
  // Track if content has been modified from initial state
  const [isModified, setIsModified] = useState(false);

  // Create a reference for tracking word count
  const contentRef = useRef<string>(initialContent);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-blue-600 hover:underline",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc ml-4 my-2",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal ml-4 my-2",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "my-1",
        },
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      contentRef.current = html;

      if (onChange) {
        onChange(html);
      }

      setIsModified(true);

      // Track content changes for analytics
      if (isModified) {
        /* // Commented out due to unknown AnalyticsEventType
        analytics
          .trackEvent("rich_text_editor_edited", { 
            wordCount: words.length,
            characterCount: text.length,
          })
          .catch(console.error);
        */
      }
    },
  });

  // Update editor content when initialContent prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
      setIsModified(false);
    }
  }, [editor, initialContent]);

  // Add spell check listener to detect browser's spell check
  useEffect(() => {
    const handleSpellCheck = () => {
      /* // Commented out due to unknown AnalyticsEventType
      analytics
        .trackEvent("rich_text_editor_spell_check_used", {})
        .catch(console.error);
      */
    };

    if (editor && editor.view.dom) {
      editor.view.dom.addEventListener("contextmenu", handleSpellCheck);

      return () => {
        editor.view.dom.removeEventListener("contextmenu", handleSpellCheck);
      };
    }
  }, [editor, analyticsCategory]);

  // Handle link creation/editing
  const handleLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");

    // Cancelled
    if (url === null) {
      return;
    }

    // Empty
    if (url === "" || url === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Set link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();

    /* // Commented out due to unknown AnalyticsEventType
    analytics
      .trackEvent("rich_text_editor_link_added", {})
      .catch(console.error);
    */
  };

  // Toolbar button component
  const ToolbarButton = ({
    icon,
    action,
    isActive = false,
    tooltip,
    disabled = false,
  }: {
    icon: React.ReactNode;
    action: () => void;
    isActive?: boolean;
    tooltip: string;
    disabled?: boolean;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-info/10 text-blue-900",
        disabled && "cursor-not-allowed opacity-50",
      )}
      onClick={action}
      disabled={disabled}
    >
      {icon}
      <span className="sr-only">{tooltip}</span>
    </Button>
  );

  // Render toolbar and editor
  return (
    <div className={cn("rounded-md border", className)}>
      {/* Editor Toolbar */}
      {!readOnly && toolbarButtons.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 p-1.5">
          {/* Format buttons */}
          <div className="flex space-x-1">
            {toolbarButtons.includes("bold") && (
              <ToolbarButton
                icon={<Bold className="h-4 w-4" />}
                action={() => editor?.chain().focus().toggleBold().run()}
                isActive={editor?.isActive("bold") || false}
                tooltip="Bold (Ctrl+B)"
                disabled={!editor?.isEditable}
              />
            )}

            {toolbarButtons.includes("italic") && (
              <ToolbarButton
                icon={<Italic className="h-4 w-4" />}
                action={() => editor?.chain().focus().toggleItalic().run()}
                isActive={editor?.isActive("italic") || false}
                tooltip="Italic (Ctrl+I)"
                disabled={!editor?.isEditable}
              />
            )}

            {toolbarButtons.includes("underline") && (
              <ToolbarButton
                icon={<UnderlineIcon className="h-4 w-4" />}
                action={() => editor?.chain().focus().toggleUnderline().run()}
                isActive={editor?.isActive("underline") || false}
                tooltip="Underline (Ctrl+U)"
                disabled={!editor?.isEditable}
              />
            )}
          </div>

          {/* List buttons */}
          {(toolbarButtons.includes("bulletList") ||
            toolbarButtons.includes("orderedList")) && (
            <>
              <div className="mx-1 h-5 w-px bg-gray-300" />
              <div className="flex space-x-1">
                {toolbarButtons.includes("bulletList") && (
                  <ToolbarButton
                    icon={<List className="h-4 w-4" />}
                    action={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                    isActive={editor?.isActive("bulletList") || false}
                    tooltip="Bullet List"
                    disabled={!editor?.isEditable}
                  />
                )}

                {toolbarButtons.includes("orderedList") && (
                  <ToolbarButton
                    icon={<ListOrdered className="h-4 w-4" />}
                    action={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                    isActive={editor?.isActive("orderedList") || false}
                    tooltip="Numbered List"
                    disabled={!editor?.isEditable}
                  />
                )}
              </div>
            </>
          )}

          {/* Link button */}
          {toolbarButtons.includes("link") && (
            <ToolbarButton
              icon={<LinkIcon className="h-4 w-4" />}
              action={handleLink}
              isActive={editor?.isActive("link") || false}
              tooltip="Add Link (Ctrl+K)"
              disabled={!editor?.isEditable}
            />
          )}

          {/* Undo/Redo buttons */}
          {(toolbarButtons.includes("undo") ||
            toolbarButtons.includes("redo")) && (
            <>
              <div className="mx-1 h-5 w-px bg-gray-300" />
              <div className="flex space-x-1">
                {toolbarButtons.includes("undo") && (
                  <ToolbarButton
                    icon={<Undo2 className="h-4 w-4" />}
                    action={() => editor?.chain().focus().undo().run()}
                    isActive={editor?.isActive("undo") || false}
                    tooltip="Undo"
                    disabled={!editor?.isEditable}
                  />
                )}

                {toolbarButtons.includes("redo") && (
                  <ToolbarButton
                    icon={<Redo2 className="h-4 w-4" />}
                    action={() => editor?.chain().focus().redo().run()}
                    isActive={editor?.isActive("redo") || false}
                    tooltip="Redo"
                    disabled={!editor?.isEditable}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className={cn("p-4", className)}
        style={{ minHeight, maxHeight }}
      />
    </div>
  );
}