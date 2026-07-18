"use client";

import dynamic from "next/dynamic";
import { useMemo, use, useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { Cover } from "@/components/cover";
import { Toolbar } from "@/components/toolbar";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/lib/supabase-db";
import { Id } from "@/lib/supabase-db";
import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { BlockNoteEditor } from "@blocknote/core";
import { TableOfContents } from "@/components/table-of-contents";
import { useEditorFont } from "@/hooks/useEditorFont";
import { SubpagesList } from "@/components/subpages-list";
import { isDatabase } from "@/components/database/database-utils";
import { DatabaseView } from "@/components/database/DatabaseView";
import { TemplatesMenu } from "@/components/database/TemplatesMenu";
import { HistorySidebar } from "@/components/modals/HistorySidebar";
import { useRef } from "react";

interface DocumentIdPageProps {
  params:
    | Promise<{
        documentId: Id<"documents">;
      }>
    | {
        documentId: Id<"documents">;
      };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const resolvedParams =
    params && typeof (params as any).then === "function"
      ? use(params as Promise<any>)
      : (params as any);
  const { documentId } = resolvedParams;
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const { resolvedTheme } = useTheme();
  
  const lastSavedRef = useRef<number>(Date.now());

  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    [],
  );

  const doc = useQuery(api.documents.getById, {
    documentId: documentId,
  });

  const { editorFont, isFontLoading } = useEditorFont({ enabled: true });

  const update = useMutation(api.documents.update);

  useEffect(() => {
    if (!doc) return;

    const defaultFavicon =
      resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo.svg";

    window.document.title = `${doc.title || "Untitled"} | Zotion`;

    const link = window.document.querySelector(
      "link[rel~='icon']",
    ) as HTMLLinkElement;
    if (link) {
      link.href = doc.icon
        ? `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' font-size='100'>${doc.icon}</text></svg>`
        : defaultFavicon;
    }

    return () => {
      window.document.title = "Zotion";
      if (link) link.href = defaultFavicon;
    };
  }, [doc?.title, doc?.icon, resolvedTheme, documentId]);

  useEffect(() => {
    if (!doc) return;
    if (doc.editorFont === editorFont) return;

    update({
      id: documentId,
      editorFont,
    });
  }, [doc, editorFont, documentId, update]);

  const activeFont = doc?.editorFont ?? editorFont;
  const isFullWidth = doc?.fullWidth ?? true;
  const isSmallText = doc?.smallText ?? false;
  const showToc = doc?.showToc ?? true;

  const createVersion = useMutation(api.documents.createVersion);

  const onChange = (content: string) => {
    update({
      id: documentId,
      content,
    });

    const now = Date.now();
    if (now - lastSavedRef.current > 5 * 60 * 1000 && doc) {
      lastSavedRef.current = now;
      createVersion({
        documentId,
        title: doc.title,
        content,
        label: "Auto-save",
      }).catch((err) => console.error("Failed to auto-save page history:", err));
    }
  };

  if (doc === undefined || isFontLoading) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pt-4 pl-8">
            <Skeleton className="h-14 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
    );
  }

  if (doc === null) {
    return <div>Not found</div>;
  }

  const handleSelectTemplate = (type: "table" | "board" | "todo" | "document", content: string) => {
    update({
      id: documentId,
      content,
    });
  };

  const isDb = isDatabase(doc.content);
  const isEmpty = !doc.content || doc.content === "";

  return (
    <div className="pb-35">
      <Cover url={doc.coverImage} />
      <div
        className={`relative mx-auto md:w-[90%] ${
          !isFullWidth ? "max-w-200" : ""
        }`}
      >
        <Toolbar initialData={doc} editorFont={activeFont} />
        {isDb ? (
          <DatabaseView
            documentId={documentId}
            initialContent={doc.content}
          />
        ) : (
          <>
            {isEmpty && (
              <TemplatesMenu
                documentId={documentId}
                onSelect={handleSelectTemplate}
              />
            )}
            <Editor
              key={documentId}
              onChange={onChange}
              initialContent={doc.content}
              smallText={isSmallText}
              onEditorReady={setEditor}
              editorFont={activeFont}
            />
            {showToc && <TableOfContents editor={editor} />}
          </>
        )}
        <SubpagesList documentId={documentId} />
      </div>
      <HistorySidebar />
    </div>
  );
};
export default DocumentIdPage;
