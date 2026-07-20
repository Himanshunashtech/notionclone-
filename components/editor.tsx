"use client";

import { useEffect, useRef } from "react";
import { EditorFont } from "@/hooks/useEditorFont";
import { useCoverImage } from "@/hooks/useCoverImage";
import { useWordCount } from "@/hooks/useWordCount";
import { fontFamilies } from "@/lib/editorFont";
import {
  BlockNoteEditor,
  PartialBlock,
  createCodeBlockSpec,
  BlockNoteSchema,
} from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useSupabaseStorage } from "@/hooks/use-supabase-storage";
import { codeBlockOptions } from "@blocknote/code-block";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";
import { Doc } from "@/lib/supabase-db";
import { useMentionModal } from "@/hooks/useMentionModal";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
  editorFont?: string;
  smallText?: boolean;
  onEditorReady?: (editor: BlockNoteEditor) => void;
  documentId?: string;
}

const schema = BlockNoteSchema.create().extend({
  blockSpecs: {
    codeBlock: createCodeBlockSpec({
      ...codeBlockOptions,
      defaultLanguage: "typescript",
      supportedLanguages: {
        typescript: { name: "TypeScript", aliases: ["ts"] },
        javascript: { name: "JavaScript", aliases: ["js"] },
        python: { name: "Python", aliases: ["py"] },
        cpp: { name: "C++", aliases: ["cpp", "c++"] },
        java: { name: "Java" },
        rust: { name: "Rust", aliases: ["rs"] },
        go: { name: "Go" },
        sql: { name: "SQL" },
        html: { name: "HTML" },
        css: { name: "CSS" },
      },
    }),
  },
});

const MEDIA_BLOCK_TYPES = new Set(["image", "video", "audio", "file"]);

const getMediaUrls = (editor: BlockNoteEditor): Set<string> => {
  const urls = new Set<string>();

  editor.forEachBlock((block) => {
    if (MEDIA_BLOCK_TYPES.has(block.type)) {
      const url = (block.props as any)?.url;
      if (url && typeof url === "string" && url.trim() !== "") {
        urls.add(url);
      }
    }
    return true;
  });

  return urls;
};

const ALLOWED_BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "bulletListItem",
  "numberedListItem",
  "checkListItem",
  "table",
  "image",
  "video",
  "audio",
  "file",
  "codeBlock",
]);

const sanitizeBlocks = (blocks: any[]): any[] => {
  return blocks
    .filter((block) => block && typeof block === "object" && ALLOWED_BLOCK_TYPES.has(block.type))
    .map((block) => {
      if (block.children && Array.isArray(block.children)) {
        return {
          ...block,
          children: sanitizeBlocks(block.children),
        };
      }
      return block;
    });
};

const Editor = ({
  onChange,
  initialContent,
  editable = true,
  editorFont,
  smallText = false,
  onEditorReady,
}: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { uploadFile, deleteFile } = useSupabaseStorage();

  const coverImage = useCoverImage();
  const wordCount = useWordCount();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackedUrlsRef = useRef<Set<string>>(new Set());

  const handleUpload = async (file: File) => {
    const res = await uploadFile(file);
    return res.url;
  };

  const getWords = () => {
    let count: number = 0;
    editor.forEachBlock((block) => {
      if (
        block.type === "paragraph" ||
        block.type === "heading" ||
        block.type === "quote" ||
        block.type === "bulletListItem" ||
        block.type === "checkListItem" ||
        block.type === "numberedListItem" ||
        block.type === "toggleListItem"
      ) {
        const words = block.content
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join(" ")
          .trim()
          .split(/\s+/)
          .filter((word) => /[a-zA-Z0-9]/.test(word));

        count += words.length;
      }

      if (block.type === "table") {
        block.content.rows.forEach((row) => {
          row.cells.forEach((cell: any) => {
            const words = cell.content
              .filter((c: any) => c.type === "text")
              .map((c: any) => c.text)
              .join(" ")
              .trim()
              .split(/\s+/)
              .filter((word: string) => /[a-zA-Z0-9]/.test(word));

            count += words.length;
          });
        });
      }

      return true;
    });
    wordCount.setWordCount(count);
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: (() => {
      if (!initialContent) return undefined;
      try {
        const parsed = JSON.parse(initialContent);
        // BlockNote requires a non-empty array of blocks — guard against database JSON objects
        if (!Array.isArray(parsed) || parsed.length === 0) return undefined;
        return sanitizeBlocks(parsed) as PartialBlock[];
      } catch {
        return undefined;
      }
    })(),
    uploadFile: handleUpload,
    schema,
    tables: {
      splitCells: true,
      cellBackgroundColor: true,
      cellTextColor: true,
      headers: true,
    },
  });

  useEffect(() => {
    if (editor) {
      trackedUrlsRef.current = getMediaUrls(editor);
      getWords();
    }
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor]);

  const handleEditorChange = () => {
    const currentUrls = getMediaUrls(editor);
    const previousUrls = trackedUrlsRef.current;

    const removedUrls = [...previousUrls].filter(
      (url) => !currentUrls.has(url),
    );

    removedUrls.forEach((url) => {
      deleteFile(url).catch((err) => {
        console.warn("Failed to delete file in storage:", url, err);
      });
    });
    trackedUrlsRef.current = currentUrls;

    getWords();

    onChange(JSON.stringify(editor.document, null, 2));
  };

  const handleCapture = (e: React.DragEvent) => {
    if (coverImage.isOpen) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editable || coverImage.isOpen) return;

    const blockEl = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-node-type='blockContainer']",
    );
    if (!blockEl) return;

    const blockId = blockEl.getAttribute("data-id");
    if (!blockId) return;

    const currentBlock = editor.getBlock(blockId);
    if (!currentBlock) return;
    const prevBlock = editor.getPrevBlock(blockId);
    if (!prevBlock) return;

    if (!MEDIA_BLOCK_TYPES.has(prevBlock?.type as string)) return;

    e.stopPropagation();

    const view = (editor as any)._tiptapEditor.view;
    const pos = view.posAtCoords({ left: e.clientX, top: e.clientY });

    if (pos) {
      view.dispatch(
        view.state.tr.setSelection(
          view.state.selection.constructor.near(
            view.state.doc.resolve(pos.pos),
          ),
        ),
      );
    }
    editor.focus();
  };

  const mentionModal = useMentionModal();

  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    // If the provider isn't wrapping this editor or is a dummy fallback, let user type '@' normally
    if (e.key === "@") {
      const mentionModalExt = mentionModal as any;
      if (mentionModalExt.isFallback) return;

      e.preventDefault();
      mentionModal.onOpen((item) => {
        const path = item.type === "page" ? `/documents/${item.id}` : item.type === "event" ? "/calendar" : "";
        const style = item.type === "person" ? { bold: true } : { italic: true };
        
        // Focus back to editor before inserting content
        editor.focus();
        editor.insertInlineContent([
          {
            type: "link",
            href: path || "#",
            content: [{ type: "text", text: `@${item.title}`, styles: style }],
          }
        ]);
      });
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="relative flex-1 shrink-0 px-0 pb-10"
      style={
        {
          "--editor-font": fontFamilies[editorFont as EditorFont],
          "--editor-font-size": smallText ? "15px" : "16px",
        } as React.CSSProperties
      }
      onKeyDown={handleEditorKeyDown}
      onDropCapture={handleCapture}
      onDragOverCapture={handleCapture}
      onMouseDown={handleMouseDown}
    >
      <BlockNoteView
        editable={editable && !coverImage.isOpen}
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={handleEditorChange}
        className="wrap-break-word"
      />
    </div>
  );
};

export default Editor;
