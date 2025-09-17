"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type QuillType from "quill";
import "quill/dist/quill.snow.css";
import MediaManagerModal from "@/media-management/MediaManagerModal";
import type { TMedia } from "@/actions/media/validations";

export type QuillEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
};

// Lightweight, SSR-safe Quill wrapper with Media Manager image insert
export default function QuillEditor({
  value = "",
  onChange,
  placeholder = "Write content...",
  className = "",
  readOnly = false,
}: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillType | null>(null);
  const lastHtmlRef = useRef<string>("");

  // Prevent re-entrant async init during dev double-mount / fast transitions
  const initializingRef = useRef(false);

  const [openMedia, setOpenMedia] = useState(false);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  // Initialize Quill on client only
  useEffect(() => {
    let canceled = false;

    async function init() {
      // Guard against duplicate init
      if (!containerRef.current || quillRef.current || initializingRef.current) return;
      initializingRef.current = true;

      try {
        const Quill = (await import("quill")).default as typeof QuillType;

        // Clear any leftover children (from a previous init or dev double-mount)
        try {
          containerRef.current.innerHTML = "";
        } catch {}

        // Create editor element inside container
        const editorEl = document.createElement("div");
        editorRef.current = editorEl;
        containerRef.current.appendChild(editorEl);

        const q = new Quill(editorEl, {
          theme: "snow",
          modules,
          placeholder,
          readOnly,
        });

        if (canceled) return;
        quillRef.current = q;

        // Override the image handler to open Media Manager modal
        try {
          const toolbar = (q as any).getModule?.("toolbar");
          if (toolbar?.addHandler) {
            toolbar.addHandler("image", () => {
              if (!readOnly) setOpenMedia(true);
            });
          }
        } catch {}

        // Set initial value
        if (value) {
          q.clipboard.dangerouslyPasteHTML(value);
          lastHtmlRef.current = q.root.innerHTML;
        }

        // Listen for changes
        q.on("text-change", () => {
          const html = q.root.innerHTML;
          lastHtmlRef.current = html;
          onChange?.(html);
        });
      } finally {
        initializingRef.current = false;
      }
    }

    init();
    return () => {
      canceled = true;
      // Cleanup editor DOM node to avoid duplicates on hot reload / remount
      if (containerRef.current) {
        try {
          containerRef.current.innerHTML = "";
        } catch {}
      }
      quillRef.current = null;
      editorRef.current = null;
      initializingRef.current = false;
    };
  }, [modules, onChange, placeholder, readOnly]);

  // Sync external value -> editor when it changes programmatically
  useEffect(() => {
    const q = quillRef.current;
    if (!q) return;
    const current = q.root.innerHTML;
    if (typeof value === "string" && value !== current && value !== lastHtmlRef.current) {
      q.clipboard.dangerouslyPasteHTML(value);
      lastHtmlRef.current = q.root.innerHTML;
    }
  }, [value]);

  // Insert selected media URLs at the current cursor position
  const handleInsertFromMedia = (items: TMedia[]) => {
    const q = quillRef.current as any;
    if (!q || !items?.length) return;

    // Ensure editor is focused and get current selection
    let sel = q.getSelection?.(true);
    if (!sel) {
      const len = q.getLength?.() ?? 0;
      sel = { index: len, length: 0 };
      q.setSelection?.(sel.index, sel.length, "user");
    }

    let index = sel.index;
    items.forEach((m: TMedia, idx: number) => {
      // Insert image embed
      q.insertEmbed?.(index, "image", m.url, "user");
      index += 1;
      // Insert a newline after each image for spacing
      q.insertText?.(index, "\n", "user");
      index += 1;
    });

    q.setSelection?.(index, 0, "user");
  };

  return (
    <div
      className={`rounded-md overflow-hidden border border-input bg-background text-foreground shadow-sm ${className}`}
    >
      <div ref={containerRef} className="min-h-[200px] !divide-y !divide-border" />

      {/* Media Manager Modal for inserting images */}
      <MediaManagerModal
        open={openMedia}
        onOpenChange={setOpenMedia}
        onInsert={(medias) => {
          handleInsertFromMedia(medias);
          setOpenMedia(false);
        }}
      />
    </div>
  );
}
