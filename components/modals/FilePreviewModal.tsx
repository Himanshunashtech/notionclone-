"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFilePreview } from "@/hooks/useFilePreviewModal";
import { useQuery } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { Cover } from "@/components/cover";
import { ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export const FilePreviewModal = () => {
  const previewModal = useFilePreview();
  const router = useRouter();

  // Fetch document contents
  const document = useQuery(
    api.documents.getById,
    previewModal.documentId ? { documentId: previewModal.documentId } : "skip"
  );

  // Dynamically load the BlockNote editor (read-only)
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const handleOpenInWorkspace = () => {
    if (previewModal.documentId) {
      router.push(`/documents/${previewModal.documentId}`);
      previewModal.onClose();
    }
  };

  return (
    <Dialog open={previewModal.isOpen} onOpenChange={previewModal.onClose}>
      <DialogTitle hidden>
        {document?.title ? `Preview: ${document.title}` : "File Preview"}
      </DialogTitle>
      <DialogDescription className="sr-only">
        Read-only preview of the document contents.
      </DialogDescription>
      <DialogContent className="max-w-4xl p-0 overflow-hidden dark:bg-dark max-h-[85vh] flex flex-col">
        {document === undefined ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : document === null ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Document not found.
          </div>
        ) : (
          <>
            {/* Header controls */}
            <div className="absolute right-12 top-4 z-50">
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenInWorkspace}
                className="h-8 text-xs flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in Workspace
              </Button>
            </div>

            {/* Scrollable Preview Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Cover image if exists */}
              {document.coverImage && (
                <div className="h-[20vh] relative w-full">
                  <Cover url={document.coverImage} preview />
                </div>
              )}

              {/* Title & Icon Header */}
              <div className="px-14 pt-8 pb-4 space-y-4">
                <div className="flex items-center gap-2">
                  {document.icon && (
                    <span className="text-4xl leading-none">{document.icon}</span>
                  )}
                  <h2 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
                    {document.title || "Untitled"}
                  </h2>
                </div>
              </div>

              {/* Document Editor Content (Read-Only) */}
              <div className="px-14 pb-16">
                <Editor
                  editable={false}
                  onChange={() => {}}
                  initialContent={document.content}
                  editorFont={document.editorFont || "default"}
                  smallText={document.smallText}
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
